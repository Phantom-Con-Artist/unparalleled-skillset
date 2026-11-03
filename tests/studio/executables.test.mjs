import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
const root = fileURLToPath(new URL('../../', import.meta.url));
for (const [name, file, args, input] of [
  ['studio', 'packages/studio-engine/src/cli.mjs', ['--help'], undefined],
  ['agent', 'packages/studio-agent-tools/src/cli.mjs', ['--help'], undefined],
  ['mcp', 'packages/studio-agent-tools/src/mcp.mjs', [], JSON.stringify({jsonrpc:'2.0',id:1,method:'initialize',params:{protocolVersion:'2024-11-05',capabilities:{},clientInfo:{name:'entrypoint-test',version:'1'}}})+'\n'],
]) test(`${name}: npm-style symlink runs the actual executable`, t => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'unparalleled-bin-'));
  t.after(() => fs.rmSync(dir, {recursive:true,force:true}));
  const link = path.join(dir, `unparalleled-${name}`);
  fs.symlinkSync(path.join(root, file), link);
  const run = spawnSync(process.execPath, [link, ...args], {input,encoding:'utf8',timeout:10000});
  assert.ifError(run.error);
  assert.equal(run.status, 0, run.stderr);
  if (name === 'studio') assert.match(run.stdout, /Unparalleled Studio/);
  if (name === 'agent') assert.match(JSON.parse(run.stdout).usage, /unparalleled-studio-agent/);
  if (name === 'mcp') assert.equal(JSON.parse(run.stdout.trim()).result.serverInfo.name, 'unparalleled-studio');
});
