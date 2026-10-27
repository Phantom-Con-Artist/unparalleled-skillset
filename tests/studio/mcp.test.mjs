import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { startStudio } from '../../packages/studio-engine/src/index.mjs';
import { createMcpServer, TOOLS } from '../../packages/studio-agent-tools/src/mcp.mjs';

const script = fileURLToPath(new URL('../../packages/studio-agent-tools/src/mcp.mjs', import.meta.url));
async function project(t, { start = true } = {}) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'studio-mcp-'));
  await fs.writeFile(path.join(root, 'index.html'), '<!doctype html><html><body><h1 id="heading">A precise observation.</h1></body></html>');
  await fs.writeFile(path.join(root, 'styles.css'), 'h1 { color: #222; }\n');
  const studio = start ? await startStudio({ root }) : null;
  t.after(async () => { if (studio) await studio.close(); await fs.rm(root, { recursive: true, force: true }); });
  return { root, studio };
}
const call = (server, name, args = {}, id = 1) => server.handle({ jsonrpc: '2.0', id, method: 'tools/call', params: { name, arguments: args } });
const payload = response => JSON.parse(response.result.content[0].text);

test('the server speaks the protocol: initialize, list tools, ping, notifications and unknown methods', async () => {
  const server = createMcpServer({ project: os.tmpdir() });
  const init = await server.handle({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2025-03-26' } });
  assert.equal(init.result.protocolVersion, '2025-03-26');
  assert.equal(init.result.serverInfo.name, 'unparalleled-studio');
  assert.deepEqual(init.result.capabilities, { tools: {} });
  assert.equal(await server.handle({ jsonrpc: '2.0', method: 'notifications/initialized' }), null, 'notifications get no reply');
  const list = await server.handle({ jsonrpc: '2.0', id: 2, method: 'tools/list' });
  assert.deepEqual(list.result.tools.map(tool => tool.name), TOOLS.map(tool => tool.name));
  for (const tool of list.result.tools) { assert.equal(tool.inputSchema.type, 'object'); assert.ok(tool.description.length > 20); assert.equal(tool.run, undefined, 'handlers are not exposed'); }
  assert.deepEqual((await server.handle({ jsonrpc: '2.0', id: 3, method: 'ping' })).result, {});
  assert.equal((await server.handle({ jsonrpc: '2.0', id: 4, method: 'resources/list' })).error.code, -32601);
  assert.equal((await call(server, 'nope', {}, 5)).error.code, -32602);
  assert.equal((await server.handle({ id: 6, method: 'tools/list' })).error.code, -32600);
});

test('without a running Studio a tool reports a clear tool error and the server keeps working', async t => {
  const { root } = await project(t, { start: false });
  const server = createMcpServer({ project: root });
  const response = await call(server, 'studio_status');
  assert.equal(response.result.isError, true);
  assert.match(payload(response).message, /No running Studio connection/);
  assert.equal((await server.handle({ jsonrpc: '2.0', id: 9, method: 'ping' })).result !== undefined, true);
});

test('an agent can claim, locate, read, patch several files, and reply through the tools alone', async t => {
  const { root, studio } = await project(t);
  const server = createMcpServer({ project: root });
  assert.equal(payload(await call(server, 'studio_status')).project, path.basename(root));
  assert.equal(payload(await call(server, 'studio_next', { waitMs: 0 })).request, null, 'an empty queue returns null');
  await studio.session.create({ instruction: 'Rename the heading and recolour it.' });
  const { request } = payload(await call(server, 'studio_next', { waitMs: 500 }));
  assert.equal(request.instruction, 'Rename the heading and recolour it.');
  assert.ok(request.leaseToken);
  assert.equal(payload(await call(server, 'studio_locate', { text: 'A precise observation.' })).candidates[0].file, 'index.html');
  const html = payload(await call(server, 'studio_read', { file: 'index.html' }));
  const css = payload(await call(server, 'studio_read', { file: 'styles.css' }));
  const bad = await call(server, 'studio_patch', { id: request.id, leaseToken: 'wrong', summary: 'x', file: 'index.html', expectedHash: html.hash, edits: [{ search: 'A precise', replace: 'B' }] });
  assert.equal(bad.result.isError, true, 'a wrong lease is refused');
  const patched = payload(await call(server, 'studio_patch', { id: request.id, leaseToken: request.leaseToken, summary: 'Renamed the heading and recoloured it.', files: [
    { file: 'index.html', expectedHash: html.hash, edits: [{ search: 'A precise observation.', replace: 'A field record.' }] },
    { file: 'styles.css', expectedHash: css.hash, edits: [{ search: '#222', replace: '#1d3a2f' }] }
  ] }));
  assert.equal(patched.status, 'review');
  assert.equal(patched.change.files.length, 2);
  assert.match(await fs.readFile(path.join(root, 'index.html'), 'utf8'), /A field record\./);
  assert.match(await fs.readFile(path.join(root, 'styles.css'), 'utf8'), /#1d3a2f/);
  await studio.session.create({ instruction: 'Nothing to change here.' });
  const second = payload(await call(server, 'studio_next', { waitMs: 500 })).request;
  const replied = payload(await call(server, 'studio_reply', { id: second.id, leaseToken: second.leaseToken, status: 'review', message: 'Looked at it; no source change is needed.' }));
  assert.equal(replied.status, 'review');
  assert.equal(replied.change, null, 'a reply is not presented as an edit');
  assert.equal((await call(server, 'studio_renew', { id: 'not valid!', leaseToken: 'x' })).result.isError, true);
});

test('over real stdio the server frames responses as one JSON message per line', async t => {
  const { root } = await project(t, { start: false });
  const child = spawn(process.execPath, [script, '--project', root], { stdio: ['pipe', 'pipe', 'inherit'] });
  t.after(() => child.kill());
  const lines = []; let buffer = '';
  const done = new Promise(resolve => child.stdout.on('data', chunk => { buffer += chunk; let index; while ((index = buffer.indexOf('\n')) >= 0) { lines.push(JSON.parse(buffer.slice(0, index))); buffer = buffer.slice(index + 1); if (lines.length === 3) resolve(); } }));
  child.stdin.write(JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'initialize', params: {} }) + '\n');
  child.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) + '\n');
  child.stdin.write('not json\n');
  child.stdin.write(JSON.stringify({ jsonrpc: '2.0', id: 2, method: 'tools/list' }) + '\n');
  await done;
  assert.equal(lines.find(item => item.id === 1).result.serverInfo.name, 'unparalleled-studio');
  assert.equal(lines.find(item => item.id === null).error.code, -32700, 'bad input gets a parse error, not a crash');
  assert.ok(lines.find(item => item.id === 2).result.tools.length >= 9);
});
