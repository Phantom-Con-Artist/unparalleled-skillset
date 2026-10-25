import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { AGENTS, detectAgents, nativeSkillRoots, environment } from '../lib/agents.js';
import { install, managedInstructions } from '../lib/installer.js';
import { parseArgs, runCLI } from '../lib/cli.js';

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'unparalleled-install-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const context = { homeDir: path.join(root, 'home'), projectDir: path.join(root, 'project'), configDir: path.join(root, 'config'), platform: 'linux', env: { PATH: path.join(root, 'bin') } };
  for (const dir of [context.homeDir, context.projectDir, context.configDir, context.env.PATH]) fs.mkdirSync(dir, { recursive: true });
  return { root, ...context };
}
function executable(context, name) {
  const file = path.join(context.env.PATH, name);
  fs.writeFileSync(file, '#!/bin/sh\nexit 99\n', { mode: 0o755 });
}
const hasSkill = (base, kind) => fs.existsSync(path.join(base, `unparalleled-${kind}/SKILL.md`));

test('modern commands, aliases and invalid arguments are parsed without prompting', () => {
  assert.deepEqual(parseArgs(['install', 'ui']).options.skills, ['unparalleled-ui']);
  assert.deepEqual(parseArgs(['install', 'website']).options.skills, ['unparalleled-website']);
  assert.equal(parseArgs(['install', 'all']).options.skills.length, 2);
  assert.equal(parseArgs(['install', 'ui', '--agent=claude,codex']).options.agents.length, 2);
  assert.equal(parseArgs(['agents', '--json']).action, 'agents');
  assert.equal(parseArgs(['scaffold', 'ui']).options.kind, 'ui');
  assert.deepEqual(parseArgs([], 'unparalleled-website').options.skills, ['unparalleled-website']);
  for (const args of [['install','invalid'],['--agent'],['--agent',','],['--agent','unknown'],['--global','--dest','x'],['--global','--local'],['--all-agents','--claude'],['--no-config','--codex'],['--typo'],['scaffold','invalid'],['scaffold','ui','--global']]) {
    assert.throws(() => parseArgs(args), args.join(' '));
  }
});

test('agent detection uses executable, configuration and extension evidence without running commands', t => {
  const ctx = fixture(t);
  executable(ctx, 'claude');
  fs.mkdirSync(path.join(ctx.configDir, 'opencode'));
  fs.mkdirSync(path.join(ctx.homeDir, '.vscode/extensions/github.copilot-chat-1.0'), { recursive: true });
  fs.mkdirSync(path.join(ctx.projectDir, '.cursor'));
  const found = detectAgents(ctx).filter(a => a.detected).map(a => a.id);
  assert.deepEqual(found, ['claude', 'cursor', 'copilot', 'opencode']);
  const codeOnly = path.join(ctx.projectDir, '.github'); fs.mkdirSync(codeOnly);
  assert.ok(!detectAgents(ctx).find(a => a.id === 'gemini').detected);
});

test('Windows command suffixes and macOS user app bundles are detected', t => {
  const ctx = fixture(t);
  fs.writeFileSync(path.join(ctx.env.PATH, 'codex.CMD'), '@exit /b 99');
  assert.equal(detectAgents({ ...ctx, platform: 'win32', env: { PATH: ctx.env.PATH, PATHEXT: '.EXE;.CMD' } }).find(a => a.id === 'codex').detected, true);
  fs.mkdirSync(path.join(ctx.homeDir, 'Applications/Cursor.app'), { recursive: true });
  assert.equal(detectAgents({ ...ctx, platform: 'darwin' }).find(a => a.id === 'cursor').detected, true);
});

test('default installation configures detected agents only and always supplies shared discovery', t => {
  const ctx = fixture(t); executable(ctx, 'claude');
  const result = install({ skills: ['unparalleled-ui'] }, ctx);
  assert.deepEqual(result.agents.map(a => a.id), ['claude']);
  assert.ok(hasSkill(path.join(ctx.projectDir, '.agents/skills'), 'ui'));
  assert.ok(hasSkill(path.join(ctx.projectDir, '.claude/skills'), 'ui'));
  assert.ok(fs.existsSync(path.join(ctx.projectDir, 'AGENTS.md')));
  assert.ok(fs.existsSync(path.join(ctx.projectDir, 'CLAUDE.md')));
  assert.ok(!fs.existsSync(path.join(ctx.projectDir, '.gemini')));
  assert.deepEqual(fs.readdirSync(ctx.homeDir), []);
});

test('no-agent fallback, dry-run, and no-config do not invent integrations', t => {
  const ctx = fixture(t);
  const dry = install({ skills: ['unparalleled-website'], dryRun: true }, ctx);
  assert.ok(dry.files.length > 0); assert.deepEqual(fs.readdirSync(ctx.projectDir), []);
  const result = install({ skills: ['unparalleled-website'] }, ctx);
  assert.equal(result.agents.length, 0); assert.ok(fs.existsSync(path.join(ctx.projectDir, 'AGENTS.md')));
  const other = fixture(t);executable(other, 'claude');install({ skills: ['unparalleled-ui'], noConfig: true }, other);
  assert.ok(!fs.existsSync(path.join(other.projectDir, 'AGENTS.md')));
  assert.ok(!fs.existsSync(path.join(other.projectDir, '.claude')));
});

test('global installation uses native user paths for all integrations and never writes project files', t => {
  const ctx = fixture(t);
  const result = install({ skills: ['unparalleled-ui'], global: true, allAgents: true }, ctx);
  assert.equal(result.agents.length, AGENTS.length);
  assert.deepEqual(fs.readdirSync(ctx.projectDir), []);
  for (const agent of AGENTS) for (const destination of nativeSkillRoots(agent, true, environment(ctx))) assert.ok(hasSkill(destination, 'ui'), `${agent.id}: ${destination}`);
  assert.ok(!fs.existsSync(path.join(ctx.homeDir, 'AGENTS.md')));
  assert.ok(!fs.existsSync(path.join(ctx.homeDir, '.gemini/GEMINI.md')));
});

test('incremental installation retains prior skills, preserves instructions, and is idempotent', t => {
  const ctx = fixture(t); executable(ctx, 'claude');
  const file = path.join(ctx.projectDir, 'CLAUDE.md');
  const own = '# Existing project\nDo not change this guidance.\n'; fs.writeFileSync(file, own);
  install({ skills: ['unparalleled-ui'] }, ctx);
  const result = install({ skills: ['unparalleled-website'] }, ctx);
  assert.equal(result.skills.length, 2);
  const text = fs.readFileSync(file, 'utf8'); assert.ok(text.startsWith(own));
  assert.ok(text.includes('unparalleled-ui/SKILL.md'));assert.ok(text.includes('unparalleled-website/SKILL.md'));
  const again = install({ skills: ['unparalleled-website'] }, ctx);assert.equal(again.files.length, 0);assert.equal(again.backupDir, null);
  const backups = fs.readdirSync(path.join(ctx.projectDir, '.agents/unparalleled/backups'));
  assert.ok(backups.length >= 1);
});

test('malformed managed blocks fail before any install writes', t => {
  const ctx = fixture(t);
  fs.writeFileSync(path.join(ctx.projectDir, 'CLAUDE.md'), '<!-- unparalleled-skillset:start -->\nUnfinished block');
  assert.throws(() => install({ skills: ['unparalleled-ui'], agents: ['claude'] }, ctx), /Malformed/);
  assert.deepEqual(fs.readdirSync(ctx.projectDir), ['CLAUDE.md']);
  assert.throws(() => managedInstructions('<!-- unparalleled-skillset:end --><!-- unparalleled-skillset:start -->', 'test'), /Malformed/);
});

test('symlinked custom roots and external XDG skill paths are protected', t => {
  const ctx = fixture(t); const untouched = path.join(ctx.root, 'untouched'); fs.mkdirSync(untouched);
  const link = path.join(ctx.projectDir, 'linked-skills');fs.symlinkSync(untouched, link, 'dir');
  assert.throws(() => install({ skills: ['unparalleled-ui'], dest: link }, ctx), /linked destination/);
  assert.deepEqual(fs.readdirSync(untouched), []);
  fs.mkdirSync(path.join(ctx.configDir, 'opencode'));
  fs.symlinkSync(untouched, path.join(ctx.configDir, 'opencode/skills'), 'dir');
  assert.throws(() => install({ skills: ['unparalleled-ui'], global: true, agents: ['opencode'] }, ctx), /linked destination/);
  assert.ok(!fs.existsSync(path.join(ctx.homeDir, '.agents')));
});

test('JSON CLI reports a custom project plan without writing or using the actual user home', t => {
  const ctx = fixture(t); const lines = [];
  const result = runCLI(['install', 'website', '--agent', 'codex', '--project', 'nested', '--dry-run', '--json'], { ...ctx, log: message => lines.push(message) });
  assert.equal(result.dryRun, true);assert.ok(result.canonicalRoot.endsWith('nested/.agents/skills'));
  assert.equal(JSON.parse(lines[0]).agents[0].id, 'codex');
  assert.deepEqual(fs.readdirSync(ctx.projectDir), []);
});

test('a partially failed replacement restores the attempted file as well as earlier writes', t => {
  const ctx = fixture(t);
  const target = path.join(ctx.projectDir, '.agents/skills/unparalleled-ui/SKILL.md');
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, 'ORIGINAL CUSTOM CONTENT');
  const write = fs.writeFileSync;
  let failed = false;
  t.mock.method(fs, 'writeFileSync', (file, data, ...args) => {
    if (file === target && !failed) {
      failed = true;
      write(target, 'PARTIALLY WRITTEN');
      throw new Error('Injected disk write failure');
    }
    return write(file, data, ...args);
  });
  assert.throws(() => install({ skills: ['unparalleled-ui'], noConfig: true }, ctx), /rolled back/);
  assert.equal(fs.readFileSync(target, 'utf8'), 'ORIGINAL CUSTOM CONTENT');
  assert.ok(!fs.existsSync(path.join(ctx.projectDir, 'AGENTS.md')));
});
