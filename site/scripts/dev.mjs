#!/usr/bin/env node
// Run the whole site locally with live reload: every app's Vite server at once.
// Open the root app's URL; it proxies the other apps' paths and serves the examples.
import { spawn } from 'node:child_process';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const site = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const APPS = [['poterie-celeste', '\x1b[35m', 5173], ['unparalleled', '\x1b[33m', 5174]];
const inUse = (port) => new Promise((done) => {
  const sock = net.connect({ port, host: 'localhost' }, () => { sock.destroy(); done(true); });
  sock.on('error', () => done(false));
});
const children = [];
for (const [app, color, port] of APPS) {
  if (await inUse(port)) { console.log(`${color}[${app}]\x1b[0m already running on ${port}, reusing it`); continue; }
  children.push(start(app, color));
}
function start(app, color) {
  const child = spawn('npm', ['run', 'dev', '--', '--strictPort'], { cwd: path.join(site, 'apps', app), env: { ...process.env, FORCE_COLOR: '1' } });
  const tag = `${color}[${app}]\x1b[0m `;
  for (const stream of [child.stdout, child.stderr]) stream.on('data', (d) => process.stdout.write(d.toString().replace(/^(?=.)/gm, tag)));
  child.on('exit', (code) => { if (code) { console.error(`${tag}exited with ${code}`); stop(code); } });
  return child;
}
setTimeout(() => console.log('\n  Whole site: \x1b[1mhttp://localhost:5174/\x1b[0m  (Poterie Céleste at /poterie-celeste/, examples at /hollow/ and /studio-desk/)\n'), 2500);
function stop(code = 0) { children.forEach((c) => c.kill('SIGTERM')); process.exit(code); }
process.on('SIGINT', () => stop());
process.on('SIGTERM', () => stop());
