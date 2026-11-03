#!/usr/bin/env node
// Builds the local Color Intelligence Layer runtime and registers its MCP server.
// Usage: node scripts/setup-color-intelligence.mjs [--python python3.11] [--no-mcp-json] [--check]
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pkg = path.join(root, 'packages/color-intelligence');
const venv = path.join(pkg, '.venv');
const bin = process.platform === 'win32' ? path.join(venv, 'Scripts') : path.join(venv, 'bin');
const exe = name => path.join(bin, process.platform === 'win32' ? `${name}.exe` : name);
const args = process.argv.slice(2);
const option = name => { const i = args.indexOf(name); return i === -1 ? undefined : args[i + 1]; };
const run = (cmd, argv, opts = {}) => {
  const result = spawnSync(cmd, argv, { stdio: 'inherit', ...opts });
  if (result.status !== 0) { console.error(`Failed: ${cmd} ${argv.join(' ')}`); process.exit(result.status ?? 1); }
  return result;
};

if (args.includes('--check')) {
  if (!fs.existsSync(exe('color-intelligence'))) { console.error('Color Intelligence is not installed. Run: npm run color:setup'); process.exit(1); }
  run(exe('color-intelligence'), ['doctor']);
  process.exit(0);
}

if (!fs.existsSync(exe('python'))) {
  const python = option('--python') ?? (process.platform === 'win32' ? 'python' : 'python3');
  const version = spawnSync(python, ['-c', 'import sys; print(sys.version_info >= (3, 11))'], { encoding: 'utf8' });
  if (version.stdout?.trim() !== 'True') { console.error(`${python} must be Python 3.11 or later (use --python <path>).`); process.exit(1); }
  run(python, ['-m', 'venv', venv]);
}
run(exe('python'), ['-m', 'pip', 'install', '--quiet', '--upgrade', 'pip']);
run(exe('python'), ['-m', 'pip', 'install', '--quiet', pkg]);
run(exe('color-intelligence'), ['doctor'], { stdio: ['ignore', 'ignore', 'inherit'] });

if (!args.includes('--no-mcp-json')) {
  const file = path.join(root, '.mcp.json');
  let config = { mcpServers: {} };
  if (fs.existsSync(file)) config = JSON.parse(fs.readFileSync(file, 'utf8'));
  config.mcpServers ??= {};
  config.mcpServers['color-intelligence'] = {
    command: exe('color-intelligence-mcp'),
    args: ['--db', path.join(pkg, 'local_data/catalog.sqlite3')],
  };
  fs.mkdirSync(path.join(pkg, 'local_data'), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(config, null, 2)}\n`);
  console.log(`Registered the color-intelligence MCP server in ${path.relative(root, file)}.`);
}
console.log(`Color Intelligence ready: ${path.relative(root, exe('color-intelligence'))} (CLI) and ${path.relative(root, exe('color-intelligence-mcp'))} (MCP).`);
