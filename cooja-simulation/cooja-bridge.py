import os
import socket
import json
import urllib.request
import urllib.error
from urllib.parse import urlsplit

COOJA_HOST = "127.0.0.1"
COOJA_PORT = 60002

# NODE_API — backend endpoint that receives sensor data from Cooja.
# Override with the NODE_API environment variable when running against
# the deployed backend (e.g. https://smart-office-backend.onrender.com/api/office/update).
# Falls back to localhost:5000 for local development.
NODE_API = os.environ.get('NODE_API_URL') or os.environ.get(
    'NODE_API', 'http://localhost:5000/api/office/update')
TOKEN = os.environ.get('TELEMETRY_API_TOKEN', '')
HTTP_TIMEOUT = float(os.environ.get('TELEMETRY_HTTP_TIMEOUT', '15'))
if not 0 < HTTP_TIMEOUT <= 120:
    raise SystemExit('TELEMETRY_HTTP_TIMEOUT must be between 0 and 120 seconds')
destination = urlsplit(NODE_API)
if destination.username or destination.password or destination.query or destination.fragment:
    raise SystemExit('API URL must not contain credentials, query, or fragment')
local = destination.hostname in ('localhost', '127.0.0.1', '::1')
if destination.scheme not in ('http', 'https') or not destination.hostname:
    raise SystemExit('API URL must be HTTP or HTTPS')
if not local and (destination.scheme != 'https' or not TOKEN):
    raise SystemExit('Remote telemetry requires HTTPS and TELEMETRY_API_TOKEN')

class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None  # Never forward the bearer credential to another endpoint.

opener = urllib.request.build_opener(NoRedirect)

print("====================================")
print(" SMART OFFICE COOJA BRIDGE")
print("====================================")
print("Connecting to Cooja Gateway...")

sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
try:
    sock.connect((COOJA_HOST, COOJA_PORT))
except OSError:
    raise SystemExit('Cannot connect to Cooja at 127.0.0.1:60002; check the serial socket')

print("Connected to Cooja Gateway!")
print("Waiting for sensor data...\n")

buffer = ""

while True:

    data = sock.recv(1024)

    if not data:
        print("Cooja connection closed.")
        break

    buffer += data.decode("utf-8", errors="ignore")

    while "\n" in buffer:

        line, buffer = buffer.split("\n", 1)
        line = line.strip()

        if not line.startswith("DATA,"):
            continue

        print("Received:", line)

        try:

            values = line.split(",")

            if len(values) != 10:
                print("Invalid DATA packet")
                continue

            payload = {
                "temperature": int(values[1]),
                "humidity": int(values[2]),
                "light": int(values[3]),
                "occupancy": bool(int(values[4])),
                "smoke": int(values[5]),
                "lightStatus": bool(int(values[6])),
                "fanStatus": bool(int(values[7])),
                "acStatus": bool(int(values[8])),
                "alarmStatus": bool(int(values[9]))
            }

            body = json.dumps(payload).encode("utf-8")

            request = urllib.request.Request(
                NODE_API,
                data=body,
                headers={"Content-Type": "application/json",
                         **({'Authorization': 'Bearer ' + TOKEN} if TOKEN else {})},
                method="POST"
            )

            with opener.open(request, timeout=HTTP_TIMEOUT) as response:
                if response.status != 200:
                    raise SystemExit('Unexpected telemetry response; delivery not confirmed')
                print('Telemetry accepted:', response.status, flush=True)

        except urllib.error.HTTPError as error:
            raise SystemExit(f'Telemetry rejected (HTTP {error.code}); bridge stopped. Fix authentication/payload before restarting.')
        except (OSError, ValueError):
            raise SystemExit('Telemetry delivery/parsing failed; bridge stopped. Delivery may be uncertain; check connectivity and restart. No automatic replay.')
