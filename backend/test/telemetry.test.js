const { test } = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const { once } = require('node:events');
const net = require('node:net');
const WebSocket = require('ws');
const { telemetryAuth } = require('../telemetry');
const payload = { temperature: 31, humidity: 62, light: 123, smoke: 18,
  occupancy: true, lightStatus: true, fanStatus: true, acStatus: false, alarmStatus: true };

test('production and Render fail closed without a token', () => {
  assert.throws(() => telemetryAuth({ NODE_ENV: 'production' }), /required/);
  assert.throws(() => telemetryAuth({ RENDER: 'true' }), /required/);
});

async function start(t, secure) {
  const reservation = net.createServer();
  reservation.listen(0, '127.0.0.1');
  await once(reservation, 'listening');
  const port = reservation.address().port;
  await new Promise(resolve => reservation.close(resolve));
  const child = spawn(process.execPath, ['server.js'], { cwd: require('node:path').join(__dirname, '..'),
    env: { ...process.env, PORT: String(port), NODE_ENV: secure ? 'production' : 'development',
      RENDER: '', TELEMETRY_API_TOKEN: secure ? 'test-only-token' : '' }, stdio: ['ignore', 'pipe', 'pipe'] });
  t.after(async () => { child.kill(); await once(child, 'exit'); });
  const base = `http://127.0.0.1:${port}`;
  for (let attempt = 0; attempt < 100; attempt++) {
    try { if ((await fetch(base + '/health')).ok) return base; } catch {}
    await new Promise(resolve => setTimeout(resolve, 30));
  }
  throw new Error('Test backend did not start');
}

test('authenticated HTTP validation, state and fresh WebSocket broadcast', { timeout: 10000 }, async t => {
  const base = await start(t, true);
  const post = (body, token = 'test-only-token') => fetch(base + '/api/office/update', {
    method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: typeof body === 'string' ? body : JSON.stringify(body) });
  const initial = await (await fetch(base + '/api/office/status')).json();
  assert.equal((await post(payload, '')).status, 401);
  assert.equal((await post(payload, 'incorrect')).status, 401);
  for (const invalid of [{}, [], null, { ...payload, temperature: '31' }, { ...payload, occupancy: 1 },
    { ...payload, extra: 1 }, { ...payload, smoke: null }, '{bad json']) {
    assert.equal((await post(invalid)).status, 400);
  }
  assert.deepEqual(await (await fetch(base + '/api/office/status')).json(), initial);
  const ws = new WebSocket(base.replace('http:', 'ws:'));
  t.after(() => ws.terminate());
  await once(ws, 'message'); // Initial snapshot is deliberately excluded from verification.
  const fresh = once(ws, 'message');
  assert.equal((await post(payload)).status, 200);
  const message = JSON.parse((await fresh)[0]);
  assert.equal(message.type, 'OFFICE_UPDATE');
  assert.equal(message.data.temperature, payload.temperature);
  assert.equal(message.data.devices.alarm, true);
  assert.notEqual(message.data.lastUpdated, initial.lastUpdated);
  assert.deepEqual(await (await fetch(base + '/api/office/status')).json(), message.data);
});

test('unconfigured local mode accepts original bridge payload', { timeout: 10000 }, async t => {
  const base = await start(t, false);
  const response = await fetch(base + '/api/office/update', { method: 'POST',
    headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  assert.equal(response.status, 200);
});
