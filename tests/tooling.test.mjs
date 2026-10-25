import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
function temporary(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'unparalleled-test-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  return dir;
}
function run(script, args = [], cwd = root) {
  const result = spawnSync(process.execPath, [script, ...args], { cwd, encoding: 'utf8', timeout: 10000 });
  assert.ifError(result.error);
  return result;
}
function save(dir, name, value) {
  const location = path.join(dir, name);
  fs.writeFileSync(location, JSON.stringify(value));
  return location;
}
for (const skill of ['unparalleled-ui', 'unparalleled-website']) {
  const scripts = path.join(root, '.agents/skills', skill, 'scripts');
  test(`${skill}: token generation requires actual project input and preserves values`, t => {
    const dir = temporary(t);
    const generator = path.join(scripts, 'generate-tokens.mjs');
    assert.equal(run(generator).status, 1);
    const output = path.join(dir, 'nested/tokens.css');
    const input = save(dir, 'tokens.json', {
      '--pigment-product': 'oklch(0.42 0.08 62)',
      '--text-display': 'clamp(2.25rem, calc(1.25rem + 4.4444vw), 5.25rem)',
      '--font-brand': '"Provided Product Face", serif',
      '--surface-base': 'var(--pigment-product)',
    });
    assert.equal(run(generator, ['--input', input, '--output', output]).status, 0);
    const css = fs.readFileSync(output, 'utf8');
    assert.ok(css.includes('--surface-base: var(--pigment-product);'));
    assert.ok(css.includes('--font-brand: "Provided Product Face", serif;'));
    assert.equal(run(generator, ['--input', input, '--output', input]).status, 1);
    for (const bad of [{ color: 'red' }, { '--color': 'red; } body { display: none' }, [], {}]) {
      const invalid = save(dir, 'invalid.json', bad);
      assert.equal(run(generator, ['--input', invalid, '--output', output]).status, 1);
      assert.equal(fs.readFileSync(output, 'utf8'), css, 'invalid input must not replace existing output');
    }
  });
  test(`${skill}: actual contrast pairs pass, fail, and reject malformed input`, async t => {
    const dir = temporary(t);
    const checker = path.join(scripts, 'check-contrast.mjs');
    const { getContrastRatio } = await import(pathToFileURL(checker));
    assert.equal(getContrastRatio('#000', '#fff'), 21);
    assert.equal(getContrastRatio('#fff', '#000'), 21);
    assert.equal(getContrastRatio('#fff', '#fff'), 1);
    assert.throws(() => getContrastRatio('#not-a-color', '#fff'));
    const passing = save(dir, 'pass.json', [{ name: 'Real measurement', fg: '#222222', bg: '#ffffff', req: 4.5 }]);
    assert.equal(run(checker, ['--pairs', passing]).status, 0);
    const failing = save(dir, 'fail.json', [{ name: 'Low contrast caption', fg: '#999999', bg: '#ffffff', req: 4.5 }]);
    assert.equal(run(checker, ['--pairs', failing]).status, 1);
    for (const bad of [[], [{ name: 'Invalid threshold', fg: '#000', bg: '#fff', req: 1 }], [{ name: 'Bad color', fg: '#ggg', bg: '#fff', req: 4.5 }]]) {
      const invalid = save(dir, 'invalid.json', bad);
      assert.equal(run(checker, ['--pairs', invalid]).status, 1);
    }
  });
  test(`${skill}: validator rejects broken resource links and unclosed frontmatter`, t => {
    const dir = temporary(t);
    const copy = path.join(dir, skill);
    fs.cpSync(path.join(root, '.agents/skills', skill), copy, { recursive: true });
    const checker = path.join(copy, 'scripts/validate-skill.mjs');
    assert.equal(run(checker).status, 0);
    const entry = path.join(copy, 'SKILL.md');
    const original = fs.readFileSync(entry, 'utf8');
    fs.appendFileSync(entry, '\n[Missing guide](references/missing.md)\n');
    const broken = run(checker);
    assert.equal(broken.status, 1);
    assert.match(broken.stderr, /broken link/);
    fs.writeFileSync(entry, original.replace(/\n---\n/, '\n'));
    assert.equal(run(checker).status, 1);
  });
}

test('installer preserves project guidance and is idempotent across integrations', t => {
  const dir = temporary(t);
  const cli = path.join(root, 'bin/cli.js');
  const instructions = ['AGENTS.md', 'CLAUDE.md', 'GEMINI.md', '.cursorrules', '.windsurfrules', '.github/copilot-instructions.md'];
  for (const file of instructions) {
    fs.mkdirSync(path.dirname(path.join(dir, file)), { recursive: true });
    fs.writeFileSync(path.join(dir, file), `Existing project guidance: ${file}\n`);
  }
  const args = ['--all', '--local', '--all-agents'];
  const first = run(cli, args, dir);
  assert.equal(first.status, 0, first.stderr);
  const files = [...instructions, '.cursor/rules/unparalleled-ui.mdc', '.cursor/rules/unparalleled-website.mdc'];
  const before = files.map(file => fs.readFileSync(path.join(dir, file), 'utf8'));
  const second = run(cli, args, dir);
  assert.equal(second.status, 0, second.stderr);
  files.forEach((file, i) => assert.equal(fs.readFileSync(path.join(dir, file), 'utf8'), before[i]));
  instructions.forEach(file => {
    const text = fs.readFileSync(path.join(dir, file), 'utf8');
    assert.ok(text.startsWith(`Existing project guidance: ${file}\n`));
    assert.equal(text.split('<!-- unparalleled-skillset:start -->').length - 1, 1);
  });
  for (const skill of ['unparalleled-ui', 'unparalleled-website']) {
    for (const location of ['.agents/skills', '.claude/skills']) {
      assert.ok(fs.existsSync(path.join(dir, location, skill, 'references/human-writing.md')));
      assert.ok(fs.existsSync(path.join(dir, location, skill, 'references/bespoke-icons.md')));
    }
  }
});

test('custom installation routes selected skills to their actual location', t => {
  const dir = temporary(t);
  const cli = path.join(root, 'bin/cli.js');
  const result = run(cli, ['--website', '--dest', './custom-skills', '--claude'], dir);
  assert.equal(result.status, 0, result.stderr);
  assert.ok(fs.existsSync(path.join(dir, 'custom-skills/unparalleled-website/SKILL.md')));
  const guidance = fs.readFileSync(path.join(dir, 'CLAUDE.md'), 'utf8');
  assert.match(guidance, /custom-skills\/unparalleled-website\/SKILL.md/);
  assert.ok(!guidance.includes('unparalleled-ui/SKILL.md'));
  assert.ok(fs.existsSync(path.join(dir, '.claude/skills/unparalleled-website/references/human-writing.md')));
});

test('specimen viewer handles an empty shell and switches authored sections accessibly', () => {
  const html = fs.readFileSync(path.join(root, '.agents/skills/unparalleled-website/templates/design-specimens.html'), 'utf8');
  const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
  vm.runInNewContext(script, { document: { querySelectorAll: () => [] } });
  const sections = Array.from({ length: 5 }, (_, i) => ({
    id: '', dataset: { label: `Product direction ${i + 1}` }, hidden: false, events: [],
    dispatchEvent(event) { this.events.push(event); },
  }));
  const buttons = [];
  const controls = { hidden: true };
  const status = { textContent: '' };
  const empty = { removed: false, remove() { this.removed = true; } };
  const document = {
    querySelectorAll: () => sections,
    querySelector: () => controls,
    getElementById: id => ({ 'specimen-switcher': { append: button => buttons.push(button) }, 'selection-status': status, 'empty-state': empty })[id],
    createElement: () => ({ attrs: {}, handlers: {}, setAttribute(key, value) { this.attrs[key] = value; }, addEventListener(key, fn) { this.handlers[key] = fn; } }),
  };
  vm.runInNewContext(script, { document, CustomEvent: class { constructor(type, options) { this.type = type; this.detail = options.detail; } } });
  assert.equal(controls.hidden, false);
  assert.equal(empty.removed, true);
  assert.equal(buttons.length, 5);
  assert.equal(buttons[0].attrs['aria-pressed'], 'true');
  assert.equal(buttons[3].attrs['aria-controls'], sections[3].id);
  buttons[3].handlers.click();
  assert.equal(sections[3].hidden, false);
  assert.equal(sections[0].hidden, true);
  assert.equal(buttons[3].attrs['aria-pressed'], 'true');
  assert.equal(buttons[0].attrs['aria-pressed'], 'false');
  assert.equal(status.textContent, 'Product direction 4');
  assert.equal(sections[3].events.at(-1).detail.visible, true);
});
