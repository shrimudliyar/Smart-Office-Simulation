import os
import socket
import json
import urllib.request

COOJA_HOST = "127.0.0.1"
COOJA_PORT = 60002

# NODE_API — backend endpoint that receives sensor data from Cooja.
# Override with the NODE_API environment variable when running against
# the deployed backend (e.g. https://smart-office-backend.onrender.com/api/office/update).
# Falls back to localhost:5000 for local development.
NODE_API = os.environ.get(
    "NODE_API",
    "http://localhost:5000/api/office/update"
)

print("====================================")
print(" SMART OFFICE COOJA BRIDGE")
print("====================================")
print("Connecting to Cooja Gateway...")

sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
sock.connect((COOJA_HOST, COOJA_PORT))

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
                headers={"Content-Type": "application/json"},
                method="POST"
            )

            with urllib.request.urlopen(request, timeout=5) as response:
                print("Sent to Node.js:", response.status)

        except Exception as error:
            print("Bridge error:", error)
