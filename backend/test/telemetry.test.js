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

test('oversized authenticated JSON returns 413 without state changes or broadcasts', { timeout: 10000 }, async t => {
  const base = await start(t, true);
  const ws = new WebSocket(base.replace('http:', 'ws:'));
  t.after(() => ws.terminate());
  await once(ws, 'message'); // Exclude initial snapshot.
  const messages = [];
  ws.on('message', data => messages.push(JSON.parse(data)));
  const initial = await (await fetch(base + '/api/office/status')).json();
  // Valid fields/types with JSON whitespace padding: only the byte limit can reject it.
  const oversized = JSON.stringify(payload) + ' '.repeat(16 * 1024);
  assert.ok(Buffer.byteLength(oversized) > 16 * 1024);
  const post = body => fetch(base + '/api/office/update', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer test-only-token' }, body });
  const response = await post(oversized);
  assert.equal(response.status, 413);
  await response.json();
  assert.deepEqual(await (await fetch(base + '/api/office/status')).json(), initial);
  await new Promise(resolve => setTimeout(resolve, 200));
  assert.deepEqual(messages, []);
  // Prove the same connection still receives accepted, under-limit telemetry.
  const valid = JSON.stringify(payload);
  assert.ok(Buffer.byteLength(valid) < 16 * 1024);
  const fresh = once(ws, 'message');
  assert.equal((await post(valid)).status, 200);
  assert.equal(JSON.parse((await fresh)[0]).data.temperature, payload.temperature);
  assert.equal(messages.length, 1);
});
