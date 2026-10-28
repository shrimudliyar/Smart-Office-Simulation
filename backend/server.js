const express = require("express");
const cors = require("cors");
const http = require("http");
const { WebSocketServer } = require("ws");
const { telemetryAuth, validateTelemetry } = require('./telemetry');

// Validate production configuration before opening any listening socket.
const authenticateTelemetry = telemetryAuth();

const app = express();

/* ------------------------------------------------------------------ *
 *  PORT                                                               *
 *  Reads process.env.PORT so hosting platforms (Render, Railway etc.) *
 *  can inject the assigned port at runtime.                          *
 *  Falls back to 5000 for local development.                         *
 * ------------------------------------------------------------------ */
const PORT = process.env.PORT || 5000;


/* ------------------------------------------------------------------ *
 *  CORS                                                               *
 *  FRONTEND_URL is set in the hosting dashboard for production.      *
 *  Multiple origins can be separated with a comma, e.g.:            *
 *    FRONTEND_URL=https://smart-office.vercel.app,https://custom.com *
 *  Falls back to localhost for local development.                    *
 * ------------------------------------------------------------------ */
const rawOrigins = process.env.FRONTEND_URL || "http://localhost:5173";
const allowedOrigins = rawOrigins.split(",").map(o => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (e.g. Python bridge, curl) and
    // any explicitly whitelisted origin.
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin '${origin}' not allowed`));
    }
  },
  methods: ["GET", "POST", "OPTIONS"],
  credentials: true,
}));

app.use('/api/office/update', authenticateTelemetry);
app.use(express.json({ limit: '16kb' }));
app.use((error, _req, res, next) => {
  if (error.type === 'entity.parse.failed' || error.type === 'entity.too.large') {
    return res.status(400).json({ error: 'Invalid JSON payload' });
  }
  next(error);
});


/* ------------------------------------------------------------------ *
 *  HTTP + WebSocket server                                            *
 *  WSS (secure WebSocket) is handled automatically by the hosting    *
 *  provider's TLS termination proxy. The server itself always uses   *
 *  a plain `ws://` upgrade on the same HTTP port; the proxy          *
 *  forwards the already-decrypted connection to this process.        *
 * ------------------------------------------------------------------ */
const server = http.createServer(app);
const wss = new WebSocketServer({ server });


/* ------------------------------------------------------------------ *
 *  Office state                                                       *
 * ------------------------------------------------------------------ */
let officeData = {
  roomId: "room-2",
  roomName: "Open Workspace",

  temperature: 25,
  humidity: 50,
  light: 400,
  occupancy: false,
  smoke: 0,

  devices: {
    light: false,
    fan: false,
    ac: false,
    alarm: false
  },

  lastUpdated: new Date()
};


/* ------------------------------------------------------------------ *
 *  WebSocket — broadcast to all connected dashboards                  *
 * ------------------------------------------------------------------ */
function broadcastOfficeData() {

  const message = JSON.stringify({
    type: "OFFICE_UPDATE",
    data: officeData
  });

  wss.clients.forEach(client => {
    if (client.readyState === 1) {   // WebSocket.OPEN
      client.send(message);
    }
  });
}


/* WebSocket connection */
wss.on("connection", socket => {

  console.log("Dashboard connected through WebSocket");

  // Send current state immediately on connect
  socket.send(JSON.stringify({
    type: "OFFICE_UPDATE",
    data: officeData
  }));

});


/* ------------------------------------------------------------------ *
 *  Health check — required by most hosting platforms                  *
 * ------------------------------------------------------------------ */
app.get("/health", (_req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});


/* ------------------------------------------------------------------ *
 *  REST API                                                           *
 * ------------------------------------------------------------------ */

/* Get current office status */
app.get("/api/office/status", (_req, res) => {
  res.json(officeData);
});


/* Receive sensor data from the Python bridge */
app.post("/api/office/update", validateTelemetry, (req, res) => {

  const data = req.body;

  officeData = {

    roomId: "room-2",
    roomName: "Open Workspace",

    temperature: Number(data.temperature),
    humidity: Number(data.humidity),
    light: Number(data.light),
    occupancy: Boolean(data.occupancy),
    smoke: Number(data.smoke),

    devices: {
      light: Boolean(data.lightStatus),
      fan: Boolean(data.fanStatus),
      ac: Boolean(data.acStatus),
      alarm: Boolean(data.alarmStatus)
    },

    lastUpdated: new Date()

  };

  console.log("\n================================");
  console.log(" SMART OFFICE DATA RECEIVED");
  console.log("================================");

  console.log("Temperature :", officeData.temperature);
  console.log("Humidity    :", officeData.humidity);
  console.log("Light       :", officeData.light);
  console.log("Occupancy   :", officeData.occupancy);
  console.log("Smoke       :", officeData.smoke);

  console.log("Light       :", officeData.devices.light);
  console.log("Fan         :", officeData.devices.fan);
  console.log("AC          :", officeData.devices.ac);
  console.log("Alarm       :", officeData.devices.alarm);

  /* Push new data to all connected dashboards */
  broadcastOfficeData();

  res.json({
    success: true,
    message: "Office data updated"
  });

});


/* ------------------------------------------------------------------ *
 *  Start server                                                       *
 * ------------------------------------------------------------------ */
server.listen(PORT, () => {

  console.log("--------------------------------");
  console.log(" SMART OFFICE BRIDGE RUNNING");
  console.log("--------------------------------");

  console.log(`REST API  : http://localhost:${PORT}`);
  console.log(`WebSocket : ws://localhost:${PORT}`);
  console.log(`Health    : http://localhost:${PORT}/health`);
  console.log(`CORS allow: ${allowedOrigins.join(", ")}`);

});
