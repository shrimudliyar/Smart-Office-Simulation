import io
import json
import os
from pathlib import Path
import runpy
import unittest
from contextlib import redirect_stdout
from unittest.mock import MagicMock, patch

BRIDGE = Path(__file__).resolve().parents[1] / 'cooja-bridge.py'

class BridgeTests(unittest.TestCase):
    def execute(self, env, failure=None):
        sock = MagicMock()
        sock.recv.side_effect = [b'DATA,31,62,123,1,18,1,1,0,1\n', b'']
        opener = MagicMock()
        if failure:
            opener.open.side_effect = failure
        else:
            opener.open.return_value.__enter__.return_value.status = 200
        with patch.dict(os.environ, env, clear=True), patch('socket.socket', return_value=sock), \
             patch('urllib.request.build_opener', return_value=opener), redirect_stdout(io.StringIO()):
            runpy.run_path(str(BRIDGE))
        sock.connect.assert_called_once_with(('127.0.0.1', 60002))
        return opener.open.call_args

    def test_default_local_payload(self):
        call = self.execute({})
        request = call.args[0]
        self.assertEqual(request.full_url, 'http://localhost:5000/api/office/update')
        self.assertIsNone(request.get_header('Authorization'))
        self.assertEqual(json.loads(request.data), dict(temperature=31, humidity=62, light=123,
            occupancy=True, smoke=18, lightStatus=True, fanStatus=True, acStatus=False, alarmStatus=True))
        self.assertEqual(call.kwargs['timeout'], 15)

    def test_cloud_header(self):
        url = 'https://smart-office-simulation.onrender.com/api/office/update'
        call = self.execute({'NODE_API_URL': url, 'TELEMETRY_API_TOKEN': 'test-only-token'})
        self.assertEqual(call.args[0].full_url, url)
        self.assertEqual(call.args[0].get_header('Authorization'), 'Bearer test-only-token')

    def test_cloud_requires_token_and_https(self):
        for env in [{'NODE_API_URL': 'https://example.com'},
                    {'NODE_API_URL': 'http://example.com', 'TELEMETRY_API_TOKEN': 'test'}]:
            with self.assertRaises(SystemExit):
                self.execute(env)

    def test_failure_is_explicit(self):
        with self.assertRaisesRegex(SystemExit, 'delivery/parsing failed'):
            self.execute({}, OSError('network unavailable'))

if __name__ == '__main__':
    unittest.main()
