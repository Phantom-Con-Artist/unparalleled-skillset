import json
import os
import subprocess
import sys
import unittest

from color_engine.agent_tools import get_tool_definitions


class AgentTransportTests(unittest.TestCase):
    def invoke(self, payload, *args):
        process = subprocess.run([sys.executable, '-m', 'color_engine', *args], input=payload,
                                 capture_output=True, text=True, env={**os.environ, 'MPLCONFIGDIR': '/tmp/color-engine-mpl'})
        return process, json.loads(process.stdout)

    def test_schemas_are_discoverable_and_isolated(self):
        process, result = self.invoke('', '--describe')
        self.assertEqual(process.returncode, 0)
        self.assertEqual(len(result['tools']), 5)
        first = get_tool_definitions()
        first[0]['parameters']['properties'].clear()
        self.assertIn('hex_colors', get_tool_definitions()[0]['parameters']['properties'])

    def test_json_request_returns_usable_theme(self):
        process, result = self.invoke(json.dumps({'method': 'generate_ui_design_system', 'arguments': {'seed_hex': '#2563EB'}}))
        self.assertEqual(process.returncode, 0, process.stderr)
        self.assertTrue(result['ok'])
        self.assertTrue(result['result']['dark_theme']['accessibility_verification']['muted_text_on_canvas']['passes_wcag_aa'])

    def test_bad_requests_return_machine_readable_errors(self):
        for payload in ['{', '[]', '{"method":"__dict__","arguments":{}}',
                        '{"method":"mix_palette_by_token","arguments":{"token":"unknown"}}',
                        '{"method":"mix_palette_by_token","arguments":{"token":"Modern_Tech","variance":NaN}}',
                        '{"method":"generate_ui_design_system","arguments":{"unexpected":true}}',
                        '{"method":"generate_tonal_ramp","arguments":{"seed_hex":null}}',
                        '{"method":"generate_palette","arguments":{"seed_hex":123}}',
                        '{"method":"generate_palette","arguments":{"seed_hex":"#2563EB","scheme_type":null}}']:
            with self.subTest(payload=payload):
                process, result = self.invoke(payload)
                self.assertEqual(process.returncode, 2, process.stderr)
                self.assertFalse(result['ok'])
                self.assertEqual(result['error']['code'], 'invalid_request')
