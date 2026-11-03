"""Real SDK client/server stdio protocol, structured results, resources and persistence."""
import os
from pathlib import Path
import sys
import tempfile
import unittest
from mcp.client.session import ClientSession
from mcp.client.stdio import stdio_client, StdioServerParameters


class MCPStdioTests(unittest.IsolatedAsyncioTestCase):
    async def test_protocol_round_trip(self):
        with tempfile.TemporaryDirectory() as tmp:
            db = str(Path(tmp) / 'catalog.sqlite3')
            offline_server = '''
import sys
def block_network(event, args):
    if event in ('socket.connect', 'socket.bind', 'socket.getaddrinfo'):
        raise RuntimeError('Network prohibited by MCP integration test: ' + event)
sys.addaudithook(block_network)
from color_engine.mcp_server import main
main()
'''
            params = StdioServerParameters(command=sys.executable,
                args=['-c', offline_server, '--db', db], env={**os.environ})
            async with stdio_client(params) as (read, write):
                async with ClientSession(read, write) as client:
                    initialized = await client.initialize()
                    self.assertEqual(initialized.server_info.name, 'Color Intelligence Layer')
                    tools = await client.list_tools()
                    names = {tool.name for tool in tools.tools}
                    self.assertTrue({'generate_palette', 'analyze_palette', 'save_palette', 'record_aesthetic_review'} <= names)
                    self.assertTrue(all(tool.output_schema for tool in tools.tools))
                    result = await client.call_tool('generate_palette', {'tokens': {'calm': 2, 'cyberpunk': 1}, 'theme': 'dark'})
                    self.assertFalse(result.is_error)
                    data = result.structured_content['data']
                    self.assertEqual(data['status'], 'verified_declared_usages')
                    saved = await client.call_tool('save_palette', {'name': 'MCP round trip', 'roles': data['roles'], 'tags': ['calm']})
                    self.assertFalse(saved.is_error)
                    pid = saved.structured_content['data']['id']
                    review = await client.call_tool('record_aesthetic_review', {'palette_id': pid,
                        'reviewer': 'test-agent', 'actor': 'agent', 'decision': 'approve', 'notes': 'Automated fixture; no human judgment.'})
                    self.assertEqual(review.structured_content['data']['aesthetic_verification']['status'], 'provisional')
                    resources = await client.list_resources()
                    self.assertIn('color://vocabulary', {str(r.uri) for r in resources.resources})
                    self.assertTrue((await client.read_resource('color://vocabulary')).contents)
                    self.assertTrue((await client.read_resource('color://palette/' + pid)).contents)
                    self.assertEqual(len((await client.list_prompts()).prompts), 2)
                    self.assertTrue((await client.get_prompt('design_palette', {'brief': 'calm neon'})).messages)
                    invalid = await client.call_tool('generate_palette', {'tokens': {'unrecognized-made-up': 1}})
                    self.assertTrue(invalid.is_error)
            async with stdio_client(params) as (read, write):
                async with ClientSession(read, write) as client:
                    await client.initialize()
                    restored = await client.call_tool('get_palette', {'palette_id': pid})
                    self.assertEqual(len(restored.structured_content['data']['reviews']), 1)


if __name__ == '__main__':
    unittest.main()
