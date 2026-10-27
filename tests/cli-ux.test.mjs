import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { runCLI } from '../lib/cli.js';

function sandbox() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'unparalleled-ux-'));
  const projectDir = path.join(root, 'project');
  const homeDir = path.join(root, 'home');
  fs.mkdirSync(projectDir, { recursive: true });
  fs.mkdirSync(homeDir, { recursive: true });
  const lines = [];
  const overrides = { projectDir, homeDir, env: { PATH: '' }, log: line => lines.push(line) };
  const run = (...args) => runCLI(args, overrides);
  return { projectDir, homeDir, lines, run, text: () => lines.join('\n') };
}

test('doctor reports missing skills, then ready once installed, with an exact fix for each gap', () => {
  const box = sandbox();
  const before = box.run('doctor');
  assert.equal(before.ok, false);
  assert.match(box.text(), /MISSING .*unparalleled-ui/);
  assert.match(box.text(), /fix: npx unparalleled install/);
  box.run('install', 'all', '--no-config');
  const after = box.run('doctor', '--json');
  assert.equal(after.ok, true);
  assert.equal(after.checks.find(check => check.id === 'unparalleled-website').status, 'ok');
  const optional = Object.fromEntries(after.checks.map(check => [check.id, check.status]));
  assert.equal(optional.blender, 'optional');
  assert.equal(optional.hook, 'optional');
  assert.equal(optional.screenshots, 'missing');
});

test('doctor flags a drifted install as outdated and update repairs it, then reports up to date', () => {
  const box = sandbox();
  box.run('install', 'website', '--no-config');
  const skillFile = path.join(box.projectDir, '.agents/skills/unparalleled-website/SKILL.md');
  fs.writeFileSync(skillFile, 'stale copy\n');
  const stale = box.run('doctor', '--json');
  assert.equal(stale.checks.find(check => check.id === 'unparalleled-website').status, 'outdated');
  assert.equal(stale.ok, true, 'an outdated install still works; it is a warning');
  const dry = box.run('update', '--dry-run', '--json');
  assert.equal(dry.upToDate, false);
  assert.equal(fs.readFileSync(skillFile, 'utf8'), 'stale copy\n', 'dry run changes nothing');
  const updated = box.run('update', '--json');
  assert.equal(updated.upToDate, false);
  assert.notEqual(fs.readFileSync(skillFile, 'utf8'), 'stale copy\n');
  assert.ok(updated.results[0].backupDir, 'overwritten content is backed up');
  const again = box.run('update', '--json');
  assert.equal(again.upToDate, true);
});

test('update refuses when nothing is installed and keeps the recorded skill selection', () => {
  const box = sandbox();
  assert.throws(() => box.run('update'), /No Unparalleled installation found/);
  box.run('install', 'ui', '--no-config');
  const result = box.run('update', '--json');
  assert.deepEqual(result.results[0].skills, ['unparalleled-ui']);
  assert.ok(!fs.existsSync(path.join(box.projectDir, '.agents/skills/unparalleled-website')), 'update does not add skills the user did not install');
});

test('hook prints by default, writes only with --write, preserves settings, and is idempotent', () => {
  const box = sandbox();
  assert.throws(() => box.run('hook'), /No installed Unparalleled skill/);
  box.run('install', 'website', '--no-config');
  const settings = path.join(box.projectDir, '.claude/settings.json');
  const printed = box.run('hook');
  assert.equal(printed.written, false);
  assert.ok(!fs.existsSync(settings));
  assert.match(printed.command, /structure-prompt\.mjs --hook$/);
  fs.mkdirSync(path.dirname(settings), { recursive: true });
  fs.writeFileSync(settings, JSON.stringify({ model: 'keep-me', hooks: { UserPromptSubmit: [{ hooks: [{ type: 'command', command: 'echo existing' }] }] } }));
  const written = box.run('hook', '--write');
  assert.equal(written.written, true);
  const saved = JSON.parse(fs.readFileSync(settings, 'utf8'));
  assert.equal(saved.model, 'keep-me');
  assert.equal(saved.hooks.UserPromptSubmit.length, 2);
  const repeat = box.run('hook', '--write');
  assert.equal(repeat.alreadyPresent, true);
  assert.equal(JSON.parse(fs.readFileSync(settings, 'utf8')).hooks.UserPromptSubmit.length, 2);
  assert.equal(box.run('doctor', '--json').checks.find(check => check.id === 'hook').status, 'ok');
});

test('hook refuses to touch settings it cannot parse', () => {
  const box = sandbox();
  box.run('install', 'website', '--no-config');
  const settings = path.join(box.projectDir, '.claude/settings.json');
  fs.mkdirSync(path.dirname(settings), { recursive: true });
  fs.writeFileSync(settings, '{ not json');
  assert.throws(() => box.run('hook', '--write'), /not valid JSON/);
  assert.equal(fs.readFileSync(settings, 'utf8'), '{ not json');
});

test('setup installs, optionally adds the hook, and ends with the doctor report', () => {
  const box = sandbox();
  box.run('setup', '--no-config', '--hook');
  assert.ok(fs.existsSync(path.join(box.projectDir, '.agents/skills/unparalleled-ui/SKILL.md')));
  assert.ok(fs.existsSync(path.join(box.projectDir, '.agents/skills/unparalleled-website/scripts/check-contract.mjs')));
  assert.match(fs.readFileSync(path.join(box.projectDir, '.claude/settings.json'), 'utf8'), /structure-prompt/);
  assert.match(box.text(), /Unparalleled doctor/);
});

test('studio passes through to the engine and its agent tools', () => {
  const calls = [];
  const spawn = (command, args, options) => { calls.push({ command, args, options }); return { status: 0 }; };
  assert.deepEqual(runCLI(['studio', '--demo', '--port', '4311'], { spawn }), { status: 0 });
  assert.match(calls[0].args[0], /packages[\\/]studio-engine[\\/]src[\\/]cli\.mjs$/);
  assert.deepEqual(calls[0].args.slice(1), ['--demo', '--port', '4311']);
  runCLI(['studio', 'agent', '--project', '/x', 'status'], { spawn });
  assert.match(calls[1].args[0], /studio-agent-tools[\\/]src[\\/]cli\.mjs$/);
  assert.deepEqual(calls[1].args.slice(1), ['--project', '/x', 'status']);
  assert.equal(calls[1].options.stdio, 'inherit');
});
