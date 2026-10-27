import fs from 'node:fs';
import path from 'node:path';
import { packageRoot } from './installer.js';

const SKILLS = ['unparalleled-ui', 'unparalleled-website'];

function onPath(command, context) {
  const separator = context.platform === 'win32' ? ';' : path.delimiter;
  const suffixes = context.platform === 'win32' ? ['', ...(context.env.PATHEXT || '.EXE;.CMD;.BAT').split(';')] : [''];
  for (const directory of (context.env.PATH || '').split(separator).filter(Boolean)) {
    for (const suffix of suffixes) if (fs.existsSync(path.join(directory, command + suffix))) return path.join(directory, command + suffix);
  }
  return null;
}

function readJSON(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return null; }
}

function skillLocations(context) {
  const home = context.homeDir;
  return [
    path.join(context.projectDir, '.agents/skills'),
    path.join(context.projectDir, '.claude/skills'),
    path.join(home, '.agents/skills'),
    path.join(home, '.claude/skills')
  ];
}

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? walk(path.join(dir, entry.name)) : [path.join(dir, entry.name)]);
}

/** Count package skill files that are missing or different in an installed copy. */
export function skillDrift(installedRoot, name) {
  const source = path.join(packageRoot, '.agents/skills', name);
  const target = path.join(installedRoot, name);
  if (path.resolve(source) === path.resolve(target)) return 0;
  let differing = 0;
  for (const file of walk(source)) {
    const copy = path.join(target, path.relative(source, file));
    if (!fs.existsSync(copy) || !fs.readFileSync(copy).equals(fs.readFileSync(file))) differing++;
  }
  return differing;
}

export function hookCommandFor(context) {
  for (const skill of ['unparalleled-website', 'unparalleled-ui']) {
    const relative = `.agents/skills/${skill}/scripts/structure-prompt.mjs`;
    if (fs.existsSync(path.join(context.projectDir, relative))) return `node ${relative} --hook`;
  }
  return null;
}

export function hookInstalled(context) {
  const files = [path.join(context.projectDir, '.claude/settings.json'), path.join(context.homeDir, '.claude/settings.json')];
  return files.some(file => /structure-prompt/.test(fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : ''));
}

/** Report what is ready on this machine and the exact step for anything missing. It changes nothing. */
export function diagnose(context) {
  const checks = [];
  const add = (id, label, status, detail, fix, required = false) => checks.push({ id, label, status, detail, ...(fix ? { fix } : {}), required });
  const major = Number(process.versions.node.split('.')[0]);
  add('node', 'Node.js 20 or newer', major >= 20 ? 'ok' : 'missing', `found ${process.versions.node}`, major >= 20 ? undefined : 'Install Node.js 20 or newer.', true);

  const locate = skill => skillLocations(context).find(base => fs.existsSync(path.join(base, skill, 'SKILL.md')));
  const anyInstalled = SKILLS.some(locate);
  for (const skill of SKILLS) {
    const where = locate(skill);
    if (!where) { add(skill, `${skill} skill installed`, anyInstalled ? 'optional' : 'missing', anyInstalled ? 'not installed (you installed the other skill only)' : 'not found in this project or your user folders', `npx unparalleled install ${skill.replace('unparalleled-', '')}   (or: npx unparalleled install all)`, !anyInstalled); continue; }
    const drift = skillDrift(where, skill);
    add(skill, `${skill} skill installed`, drift ? 'outdated' : 'ok', drift ? `${where} differs from this package in ${drift} file${drift === 1 ? '' : 's'}` : where, drift ? 'npx unparalleled update' : undefined);
  }

  const projectPlaywright = fs.existsSync(path.join(context.projectDir, 'node_modules/playwright'));
  const cacheBase = context.env.XDG_CACHE_HOME || path.join(context.homeDir, '.cache');
  const cachePlaywright = fs.existsSync(path.join(cacheBase, 'unparalleled/playwright/node_modules/playwright'));
  add('screenshots', 'Screenshots for the visual review loop', projectPlaywright || cachePlaywright ? 'ok' : 'missing',
    projectPlaywright ? 'Playwright found in this project (browser download not verified)' : cachePlaywright ? 'Playwright found in the Unparalleled cache (browser download not verified)' : 'no Playwright found; a Playwright MCP tool in your agent also works',
    projectPlaywright || cachePlaywright ? undefined : 'node .agents/skills/unparalleled-website/scripts/capture.mjs --install --url <page> --out <folder>');

  const blender = onPath('blender', context);
  add('blender', 'Blender for 3D work', blender ? 'unverified' : 'optional',
    blender ? `Blender found at ${blender}. Whether your agent can reach it through Blender MCP can only be checked from inside the agent (ask it for get_addon_status).` : 'Blender not found on PATH; only needed for scratch 3D modeling',
    blender ? undefined : 'Install Blender and add the Blender MCP add-on to your agent. Without it the skill pauses 3D production and asks.');

  const packageJson = readJSON(path.join(context.projectDir, 'package.json')) ?? {};
  const remotion = Boolean({ ...packageJson.dependencies, ...packageJson.devDependencies }.remotion);
  add('remotion', 'Remotion for motion and song-sync work', remotion ? 'ok' : 'optional', remotion ? 'remotion is a dependency of this project' : 'not a dependency of this project; only needed for video work', remotion ? undefined : 'npm install remotion react react-dom @remotion/cli');

  const hook = hookInstalled(context);
  add('hook', 'Automatic structured intake on every prompt', hook ? 'ok' : 'optional', hook ? 'a UserPromptSubmit hook runs structure-prompt' : 'not set up (Claude Code only; your agent can also run the script itself)', hook ? undefined : 'npx unparalleled hook --write');

  add('studio', 'Unparalleled Studio', 'ok', 'ships with this package', 'npx unparalleled studio --demo   (your own site: npx unparalleled studio --root ./my-site)');

  const missingRequired = checks.filter(check => check.required && check.status === 'missing');
  return { ok: missingRequired.length === 0, checks, optionalToSetUp: checks.filter(check => !check.required && ['missing', 'optional', 'unverified'].includes(check.status)).length, outdated: checks.filter(check => check.status === 'outdated').length };
}

export function formatDiagnosis(result) {
  const mark = { ok: 'ok         ', missing: 'MISSING    ', optional: 'not set up ', unverified: 'check      ', outdated: 'OUTDATED   ' };
  const lines = ['Unparalleled doctor', ''];
  for (const check of result.checks) {
    lines.push(`${mark[check.status]} ${check.label}: ${check.detail}`);
    if (check.fix) lines.push(`             fix: ${check.fix}`);
  }
  lines.push('', result.ok ? `Required pieces are ready${result.outdated ? ' but out of date; run: npx unparalleled update' : ''}. ${result.optionalToSetUp} optional feature${result.optionalToSetUp === 1 ? '' : 's'} not set up or not verified.` : 'Required pieces are missing; apply the fixes marked MISSING.');
  return lines.join('\n');
}

