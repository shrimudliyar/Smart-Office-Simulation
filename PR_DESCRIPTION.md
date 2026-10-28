# Connect local Cooja telemetry to Render securely

The Vercel dashboard connects to Render, but the original Python bridge sends
sensor data only to localhost. This change lets the bridge select Render over
HTTPS and authenticates ingestion without changing the frontend or simulation.

- Backend: bearer-token authentication with constant-time digest comparison,
  production fail-closed startup, strict field/type validation and bounded JSON.
- Bridge: NODE_API_URL, legacy NODE_API fallback, optional local auth, required
  remote HTTPS/auth, configurable timeout, redirect refusal and explicit failures.
- Tests/documentation: backend integration tests, mocked bridge tests, deployment,
  verification, troubleshooting and rollback instructions. Secrets remain external.

Baseline: 898e11e45a6c81813f296e99218f904265194946.
Base: main. Head: feature/live-cooja-telemetry.

Validation: 3 Node tests and 4 Python tests pass. Tests check missing/incorrect
credentials, invalid payloads, state updates, fresh WebSocket broadcasts, original
payload compatibility and unauthenticated local development. No public POSTs.

Render: set TELEMETRY_API_TOKEN and NODE_ENV=production through an approved
production procedure, preserve FRONTEND_URL and PORT, then deploy the reviewed
commit. The same token and NODE_API_URL=https://smart-office-simulation.onrender.com/api/office/update
must be set in the local bridge terminal. See README for hidden token input.

The repository bridge is included; the installed /home/parag/contiki-ng/examples/
smart-office/cooja-bridge.py is outside Git and requires separate installation.

Risks: missing production token prevents startup; strict validation rejects older
incompatible writers; failed bridge delivery stops ingestion until corrected and
restarted. There is no durable retry queue. State resets on backend restart.
Production live verification and an approved bridge process switch remain pending.

Rollback: restore the backed-up external bridge and local environment. Coordinate
Render rollback/revert with Auto-Deploy. The baseline backend has unauthenticated
ingestion, so prefer a forward fix or disabling ingestion over insecure rollback.

Do not merge/deploy until the owner approves the production procedure.
