import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { agentInstruction } from '../../packages/studio-engine/src/cli.mjs';

test('the startup hint gives an agent absolute, quoted commands that point at real files', () => {
  const text = agentInstruction('./my site');
  const quoted = [...text.matchAll(/node "([^"]+)" --project "([^"]+)"/g)];
  assert.ok(quoted.length >= 2, 'both the context and next commands are spelled out');
  for (const [, cli, project] of quoted) {
    assert.ok(path.isAbsolute(cli) && fs.existsSync(cli), 'agent CLI path exists');
    assert.ok(path.isAbsolute(project), 'project path is absolute');
    assert.ok(project.endsWith('my site'), 'a path with a space stays one quoted argument');
  }
  assert.match(text, /next --wait 25000/);
  assert.match(text, /context/);
});

import os from 'node:os';
import { startStudio } from '../../packages/studio-engine/src/index.mjs';

test('the engine serves the agent instruction to the page, never to the reference-only key', async t => {
  const root = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'studio-hint-'));
  await fs.promises.writeFile(path.join(root, 'index.html'), '<!doctype html><title>x</title>');
  const studio = await startStudio({ root });
  t.after(async () => { await studio.close(); await fs.promises.rm(root, { recursive: true, force: true }); });
  const get = token => fetch(`${studio.url}/.unparalleled-studio/agent-instruction`, { headers: { 'x-studio-token': token } });
  const ok = await get(studio.session.browserToken);
  assert.equal(ok.status, 200);
  const body = await ok.json();
  assert.match(body.text, /context --reference studio-requests/);
  assert.match(body.mcp.claudeCode, /^claude mcp add unparalleled-studio -- node "/);
  assert.ok(!JSON.stringify(body).includes(studio.session.agentToken), 'no credential is in the instruction');
  assert.equal((await get(studio.session.referenceToken)).status, 403);
  assert.equal((await get('wrong')).status, 401);
});
