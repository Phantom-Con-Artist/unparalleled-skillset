#!/usr/bin/env node
// Assemble the Cloudflare Pages output: every app builds into its own folder under site/public.
// site/public is generated; edit the apps, then run `npm run site:build` from the repo root.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const site = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const out = path.join(site, 'public');
// The root app owns '/', every other app owns '/<name>/'. Order matters: the root build empties public/.
const APPS = ['unparalleled', 'poterie-celeste', 'soveriegn-quantum'];
// Single-file demos kept as they were made, published at /<name>/.
export const STATIC_DEMOS = [['claude', 'site/demos/claude/index.html']];

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
// site/ is the npm workspace root for every app, with one lockfile.
if (!fs.existsSync(path.join(site, 'node_modules'))) run('npm', ['ci'], site);
for (const app of APPS) {
  const dir = path.join(site, 'apps', app);
  if (!fs.existsSync(path.join(dir, 'package.json'))) { console.warn(`skip ${app}: no package.json`); continue; }
  run('npm', ['run', 'build'], dir);
}
for (const [name, file] of STATIC_DEMOS) {
  fs.mkdirSync(path.join(out, name), { recursive: true });
  fs.copyFileSync(path.join(site, '..', file), path.join(out, name, 'index.html'));
}
fs.copyFileSync(path.join(site, 'routes', '_redirects'), path.join(out, '_redirects'));
console.log(`Pages output ready in ${path.relative(process.cwd(), out) || '.'}`);

function run(cmd, args, cwd) {
  const r = spawnSync(cmd, args, { cwd, stdio: 'inherit' });
  if (r.status !== 0) process.exit(r.status ?? 1);
}
