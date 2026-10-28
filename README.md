# Smart Office Automation

## Overview and actual scope

This source package contains a local Smart Office simulation and its telemetry dashboard:

Room mote --IPv6 multicast UDP 8765--> Gateway mote --Cooja serial TCP 60002-->
Python bridge --HTTP POST /api/office/update--> Node.js backend on 5000
--WebSocket OFFICE_UPDATE--> React dashboard.

The sensors are simulated by Contiki-NG code, not physical sensors. Only Open Workspace
(`room-2`) is connected to Cooja. Occupancy is binary presence (0 = Vacant, 1 = Occupied),
not a person count. Device states are simulated automatic states, not proof of physical
actuation. Other dashboard pages, rooms, statistics, controls and historical analytics
include mock data. The current Floor Map shows a compact Open Workspace panel with
read-only automatic device states and browser-session sensor charts. Other application
pages are retained unchanged and can contain mock controls/data. Deploying the frontend
alone DOES NOT provide live sensor readings. Backend initial values and frontend fallback
mock values are not evidence that Cooja telemetry is flowing.

## Technologies

React, TypeScript, Vite, Tailwind CSS, Framer Motion, Recharts and Lucide;
Node.js/CommonJS, Express, CORS and ws; Python 3 standard library;
Contiki-NG C, Cooja Java simulator, native GCC toolchain and Gradle wrapper.

## Folder structure

```
Smart-Office-Automation/
  frontend/                       React source, assets, configurations and npm lockfile
  backend/                        server.js, package.json and npm lockfile
  cooja-simulation/
    room-node.c
    gateway-node.c
    cooja-bridge.py
    smart-office-network.csc
    Makefile
    dependencies/
      rpl-border-router/          Source snapshot needed by the third mote
      CONTIKI-NG-LICENSE.md       Notice for the included dependency sources
  README.md                       This setup guide (use this over the Vite template README)
```

No node_modules, dist, compiled motes, caches, backups, logs or .env files are included.
Contiki-NG itself, Java, Gradle binaries and npm dependencies are external prerequisites,
not bundled runtimes. The border-router snapshot retains its original notices.

## Prerequisites and environment

- Node.js and npm. Express declares Node >=18. The local demonstration used Linux
  Node 24.22.1/npm 11.19.1 for the backend and Windows Node 25.8.2/npm 11.11.1 for Vite.
  These are recorded versions, not a newly tested compatibility matrix.
- Python 3 (bridge uses socket, json and urllib.request only; no pip packages required).
- Linux or WSL Ubuntu for the existing native Cooja mote workflow; GCC/G++, Make,
  binutils, C development headers, Git, and a working GUI display (WSLg or X11).
- Matching Contiki-NG/Cooja checkout. This checkout requires Java/JDK 25 and uses
  Gradle wrapper 9.6.1. Ant is not the launcher for this version.
- Internet access for initial dependency installation/Gradle resolution, unless all
  needed artifacts are already cached. No dependencies were installed while packaging.
- A browser on the machine that can reach the configured backend and frontend.

Install npm dependencies on the SAME operating system that will run each application.
Do not copy node_modules between Windows and Linux: esbuild/Rollup use native packages.
For the documented split WSL-backend/Windows-frontend setup, run backend npm ci in WSL
and frontend npm ci in Windows. Alternatively run both on one OS with fresh native installs.

## Backend installation and startup

From the extracted package root, in a Linux/WSL terminal:

```bash
cd backend
npm ci
node server.js
```

Expected banner: SMART OFFICE BRIDGE RUNNING, REST API and WebSocket on port 5000.
Keep this terminal running. Startup command is explicitly `node server.js`:
package.json has no npm start script and names index.js, while implementation is server.js.

Read-only verification in another terminal:

```bash
curl --noproxy '*' http://localhost:5000/api/office/status
```

API: GET /api/office/status returns latest in-memory snapshot;
POST /api/office/update accepts bridge telemetry. Do not mistake the initial snapshot
for live readings. Each accepted update refreshes lastUpdated and broadcasts OFFICE_UPDATE.
There is no database, persistent history or command endpoint back to Cooja.

## Frontend installation and startup

From the extracted package root in the intended frontend OS terminal:

```bash
cd frontend
npm ci
npm run dev -- --host 127.0.0.1 --port 5173 --strictPort
```

For Windows PowerShell, `npm.cmd` can be used in place of npm if PowerShell blocks npm.ps1.
Open http://localhost:5173/ in the Windows browser for a Windows Vite process.
Keep this terminal running. Select Floor Map to view Open Workspace.

The frontend connects directly to `ws://localhost:5000` in
`frontend/src/services/liveDataService.ts`; it does not use a Vite REST proxy.
The initial WebSocket snapshot can arrive before any simulation sample.
The development server is the demonstrated startup path, not a production deployment.

Known unresolved build issues: the packaged configuration retains TypeScript ~5.6.2
while tsconfig.app.json and tsconfig.node.json use erasableSyntaxOnly, unsupported by
installed TypeScript 5.6.3. Earlier explicit project checks also reported duplicate
IDataService export, missing sensor type, unused declarations, type-only import issues,
NodeJS namespace and chart typing issues. A clean production build is NOT verified.
The existing build script is `tsc && vite build`; plain root tsc does not by itself
prove referenced app/node projects were checked. No fixes are included in this archive.

## Contiki-NG and Cooja setup

Source revisions recorded from the original installation:

- Contiki-NG: 735e87c3e5060e9c427b214e55c372967f595c04
- Cooja: fabff3ee41eeeb6f3de7bd11f7c9cdf0a7d7dfc4

For a new machine, obtain the external source (these commands require network access):

```bash
git clone https://github.com/contiki-ng/contiki-ng.git "$HOME/contiki-ng"
cd "$HOME/contiki-ng"
git checkout 735e87c3e5060e9c427b214e55c372967f595c04
git submodule update --init --recursive
```

Verify the Cooja revision with `git -C tools/cooja rev-parse HEAD`. If necessary on a
fresh installation, fetch/check out the recorded Cooja revision in tools/cooja.
Install system prerequisites separately using the supported instructions for your OS;
this package does not include a package installer or container configuration.

The application Makefile sets CONTIKI=../.. and the saved simulation references
[CONFIG_DIR]/../rpl-border-router/border-router.c. Therefore do NOT attempt to build
cooja-simulation as a standalone folder in the extracted ZIP. Copy it into examples:

```bash
# Set PROJECT_ROOT to the actual extracted package directory on your machine.
PROJECT_ROOT="/absolute/path/to/Smart-Office-Automation"
CONTIKI_ROOT="$HOME/contiki-ng"
mkdir -p "$CONTIKI_ROOT/examples/smart-office"
cp -a "$PROJECT_ROOT/cooja-simulation/." "$CONTIKI_ROOT/examples/smart-office/"
```

The matching Contiki-NG checkout already provides examples/rpl-border-router. Check
that its border-router.c, Makefile, project-conf.h and webserver/ files exist.
The dependency snapshot in cooja-simulation/dependencies/rpl-border-router is included
for completeness/reference. If using an installation missing this example, restore
that snapshot into `$CONTIKI_ROOT/examples/rpl-border-router/`, not into the smart-office
folder's root. Compare existing files before replacing anything.

Launch Cooja and load the saved simulation:

```bash
cd "$CONTIKI_ROOT/tools/cooja"
./gradlew --no-daemon run --args="--contiki=$CONTIKI_ROOT $CONTIKI_ROOT/examples/smart-office/smart-office-network.csc"
```

On first launch Gradle may download required artifacts; later add `--offline` when all
required artifacts are cached. Loading the simulation generates native mote artifacts
under examples/smart-office/build/ and examples/rpl-border-router/build/.
If the file was not loaded automatically: File > Open simulation > Browse..., select
examples/smart-office/smart-office-network.csc. If compile dialogs appear, retain saved
sources/settings, click Compile, then Create. Do not change thresholds or mote sources.
Confirm mote IDs 1 (room), 2 (gateway) and 3 (border router).

Gateway Serial Socket Server is configured for TCP 60002 (zero-based mote index 1).
Border-router serial port 60003 is saved unbound and is not used by the Python telemetry
bridge. The application forwards serial output, not host traffic via a TUN border router.

Before starting Python, verify the gateway socket is listening:

```bash
ss -ltn 'sport = :60002'
```

## Python bridge startup and simulation start

Run Python in the SAME Linux/WSL network environment as Cooja. For the unchanged bridge
URL, the Node backend must also be reachable through localhost from that environment.
In another WSL/Linux terminal:

```bash
cd "$HOME/contiki-ng/examples/smart-office"
python3 -u cooja-bridge.py
```

Expected: Connected to Cooja Gateway! Then press Start in the Cooja simulation if paused.
The room generates readings every five simulation seconds, multicasts UDP to the gateway,
and the gateway prints DATA records. The Python bridge reads complete lines from TCP
127.0.0.1:60002 and posts JSON to http://localhost:5000/api/office/update.
Expected bridge output: Received: DATA,... followed by Sent to Node.js: 200.

The bridge has no TCP reconnect loop or failed-POST queue. If Cooja closes the serial
socket, restore Cooja/socket first, then restart only the bridge. Connection refused at
startup means 60002 is not yet listening; HTTP failure means backend reachability failed.

## Required ports

| Port | Protocol / role |
|---|---|
| 5173 | HTTP: Vite development server, bound to 127.0.0.1 by the documented command |
| 5000 | HTTP API and WebSocket: Node backend |
| 60002 | TCP: Cooja gateway serial output consumed by Python |
| 60003 | Optional border-router serial socket, saved unbound, unused by this bridge |
| 8765 | UDP inside the simulated IPv6 network, room-to-gateway telemetry |

Do not expose the Cooja serial socket publicly. UDP 8765 is simulated traffic and does
not require a host UDP forwarding service for this implementation.

## Verify live readings and automatic states

1. Confirm the simulation clock is advancing and the gateway (not just the room mote)
   prints DATA records in Mote Output/Log Listener.
2. Observe at least three consecutive bridge records followed by HTTP 200 responses.
3. Repeat the GET status request; confirm changing values and advancing lastUpdated.
4. Browser DevTools > Network > WS: inspect ws://localhost:5000 for OFFICE_UPDATE frames.
   Compare values with the backend and gateway record; allow for a newer sample arriving
   between checks. Browser console logs LIVE COOJA DATA when frames are received.
5. In Floor Map/Open Workspace, compare four sensor readings, binary occupancy, device
   states and smoke alerts against the same frame. Check charts after several updates.
6. Verify existing rules without sending synthetic data or changing thresholds:
   light = occupancy AND light < 300; fan = occupancy AND temperature > 28;
   AC = occupancy AND temperature > 32; alarm = smoke > 15.
   Rules reset each sample. Random inputs may take time to exercise all branches.

Smoke is a simulated level, not a calibrated physical concentration. Chart history is
collected in memory while the component is mounted, keeps up to 20 changed readings,
and is not a persisted historical database. lastUpdated is backend receipt time, not
Cooja simulation time. Static online labels elsewhere in the UI do not prove freshness.

## Configuration audit and remote deployment considerations

| File / setting | Current value | Action for teammate |
|---|---|---|
| frontend/src/services/liveDataService.ts | ws://localhost:5000 | Local browser/backend: keep. Remote hosting: replace in your deployment copy with reachable backend WS/WSS URL. No environment-variable URL configuration currently exists. |
| cooja-simulation/cooja-bridge.py COOJA_HOST / COOJA_PORT | 127.0.0.1 / 60002 | Keep when bridge and Cooja share host/network namespace; otherwise configure a reachable private address and restrict access. |
| cooja-simulation/cooja-bridge.py NODE_API | http://localhost:5000/api/office/update | Keep for same-environment backend; otherwise configure reachable backend address and scheme. |
| backend/server.js PORT | 5000 | Hardcoded. If changed, coordinate bridge and frontend URLs. Startup log localhost is informational; listen() does not explicitly restrict binding to loopback. |
| cooja-simulation/Makefile | CONTIKI=../.. | Place under Contiki-NG examples/smart-office, or intentionally adapt paths in your deployment copy. |
| smart-office-network.csc | [CONFIG_DIR] relative room/gateway and sibling border-router sources | Preserve the documented Contiki examples layout. No original-machine absolute path was found in this simulation configuration. |

Localhost is relative to each process: browser localhost, WSL localhost, container
localhost and remote-server localhost may be different machines/namespaces. The original
Windows browser could reach the WSL backend via localhost; verify forwarding/firewall
settings on a new laptop. Windows Vite localhost need not be reachable as WSL localhost.
No obsolete 172.25.224.1 endpoint was found in the packaged application sources.

This archive is source, not a complete production deployment. No Docker files, reverse
proxy, TLS, authentication, service supervisor, CI/CD or cloud deployment configuration
has been invented or added. A remote demo needs the Cooja/bridge/backend chain running
continuously as well as a reachable frontend. HTTPS pages require WSS for WebSocket
connections; a ws:// URL on an HTTPS page can be blocked as mixed content. Firewall and
reverse proxy settings must permit WebSocket upgrade traffic. Existing backend CORS is
permissive and there is no API authentication; review exposure before public deployment.
Do not publish unauthenticated telemetry update or serial ports to the internet.

Resolve production type/build issues and validate a fresh installation before claiming
production readiness. No clean-machine install, production build or browser validation
was performed as part of packaging. Original working source files were copied unchanged.

## Secure Cooja telemetry (deployment pending approval)

Baseline deployed commit: `898e11e45a6c81813f296e99218f904265194946`.
The dashboard already connects to Render; the original Python bridge posted only
into local Node. Cloud integration changes the ingestion destination, not the UI,
sensor mappings, thresholds, Cooja socket, or OFFICE_UPDATE structure.

### Local workflow

```bash
cd backend
npm ci
npm start
# In another terminal, in the existing Cooja environment:
cd /home/parag/contiki-ng/examples/smart-office
python3 -u cooja-bridge.py
```

Use the existing Cooja launch/simulation workflow. The bridge still reads
127.0.0.1:60002. No token is needed for an unconfigured development backend.
Unset NODE_API_URL, NODE_API, and TELEMETRY_API_TOKEN to return to that mode.
Production (`NODE_ENV=production` or Render's `RENDER=true`) refuses startup
without TELEMETRY_API_TOKEN. When a token is configured in any mode, it is required.

### Environment variables and authentication

- `NODE_API_URL`: bridge destination; defaults to http://localhost:5000/api/office/update.
- `NODE_API`: legacy bridge destination fallback; NODE_API_URL takes precedence.
- `TELEMETRY_API_TOKEN`: shared backend/bridge secret. Never set it in React or VITE_*.
- `TELEMETRY_HTTP_TIMEOUT`: bridge timeout in seconds; default 15, greater than 0 and at most 120.
- `NODE_ENV=production`: explicitly enforce production authentication.
- `FRONTEND_URL`: preserve https://smart-office-simulation.vercel.app.
- `PORT`: injected by Render, with local fallback 5000; do not change it for this integration.

POST authentication uses `Authorization: Bearer <token>` and compares SHA-256
digests using a constant-time comparison. Missing/wrong credentials return 401.
The payload must contain exactly temperature, humidity, light, smoke (finite
JSON numbers) and occupancy, lightStatus, fanStatus, acStatus, alarmStatus
(JSON booleans). Missing/extra fields, incorrect types, invalid JSON and oversized
JSON return 400. Validation does not alter simulation thresholds. GET and WS
remain public read interfaces; HTTP CORS is not writer authentication.

### Deployment procedure — requires approval

1. Review the feature branch and tests; do not push or merge without approval.
2. Confirm an operator can set Render secrets. Use a password manager to create a
   strong random token only as part of the approved deployment procedure.
3. Set TELEMETRY_API_TOKEN and NODE_ENV=production in Render. Keep existing
   FRONTEND_URL, root backend/, build npm install, start npm start. Saving Render
   environment changes may redeploy/restart the service: this is a production action.
4. Deploy the reviewed commit through the approved PR/merge process. On-Commit
   Auto-Deploy means a main push/merge triggers deployment. Confirm the deployed SHA
   and healthy startup. The old backend does not enforce the token until upgraded.
5. Install the reviewed repository cooja-simulation/cooja-bridge.py into the original
   Cooja project only after backing up that external file. This repository copy is
   included in the PR; /home/parag/... is outside Git and is a separate installation.
6. Set the same secret in the bridge terminal using hidden input, not a literal
   shell command or committed file:

```bash
cd /home/parag/contiki-ng/examples/smart-office
read -rsp 'Telemetry token: ' TELEMETRY_API_TOKEN; echo
export TELEMETRY_API_TOKEN
export NODE_API_URL=https://smart-office-simulation.onrender.com/api/office/update
export TELEMETRY_HTTP_TIMEOUT=30
python3 -u cooja-bridge.py
# After stopping this bridge intentionally:
unset TELEMETRY_API_TOKEN NODE_API_URL TELEMETRY_HTTP_TIMEOUT
```

Do not start a second bridge while the original owns the Cooja serial connection.
Coordinate an approved bridge switch; do not stop Cooja or change its configuration.
The frontend already uses Render WSS and needs no Vercel changes or secrets.

### Verification and troubleshooting

```bash
cd backend
npm test
cd ..
python3 -m unittest discover -s cooja-simulation/tests -v
```

Tests use temporary local backends and mocked Python I/O; never send test payloads
to Render. After approved deployment, compare at least three genuine Cooja DATA
records with bridge accepted logs, advancing Render GET /api/office/status
lastUpdated values, matching sensor values and fresh OFFICE_UPDATE frames in
Vercel browser DevTools. Verify Open Workspace room-2 changes. An initial snapshot
or HTTP 200 alone does not prove the entire chain. Analytics/history remain mock.

401 means credentials are missing/wrong. 400 means invalid fields/types/JSON.
Startup configuration errors mean the production token is absent. Connection errors
can mean Cooja serial socket availability, Render startup delay, or network failure.
The bridge stops explicitly on failed delivery/parsing; it does not silently continue
or automatically replay. A timeout may occur after acceptance: inspect the timestamp
before restarting. No durable queue is provided. Remote destinations require HTTPS
and a token; redirects are refused to avoid credential forwarding. The token is an
environment secret and must be kept out of logs, shell history, and source control.

### Rollback

Before production, keep the prior Render commit ID and original bridge backup.
This preparation's original bridge backup is outside Git at
/mnt/c/Users/panai/smart-office-backups/pre-live-cooja/cooja-bridge.py.
A local Git tag backup/pre-live-cooja-898e11e preserves the baseline commit.
Restore the external bridge from that backup and unset cloud variables for local
mode; coordinate stopping/restarting the bridge separately. No simulation changes
need reverting. To roll back production, use the approved Render rollback process
or a reviewed Git revert; coordinate Auto-Deploy so it does not overwrite rollback.
The old backend is unauthenticated: rolling it back reopens ingestion. Prefer a
forward fix or disable public ingestion rather than restoring an insecure writer.
Revoke/rotate the telemetry secret if exposure is suspected. Backend state is
in-memory and resets on restart.
