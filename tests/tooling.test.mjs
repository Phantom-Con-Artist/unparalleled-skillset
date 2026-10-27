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
  test(`${skill}: capture script validates its arguments before touching a browser`, async t => {
    const dir = temporary(t);
    const capture = path.join(scripts, 'capture.mjs');
    const { parseArgs, resolveTarget } = await import(pathToFileURL(capture));
    assert.deepEqual(parseArgs(['--url', 'a.html', '--out', dir, '--viewports', 'phone,narrow']).viewports, ['phone', 'narrow']);
    assert.equal(parseArgs(['--install']).install, true);
    for (const bad of [[], ['--url', 'a.html'], ['--url', 'a.html', '--out', dir, '--round', '0'], ['--url', 'a.html', '--out', dir, '--viewports', 'watch'], ['--url', 'a.html', '--out', dir, '--zoom']]) {
      assert.throws(() => parseArgs(bad));
    }
    assert.equal(resolveTarget('http://localhost:5173/'), 'http://localhost:5173/');
    assert.throws(() => resolveTarget(path.join(dir, 'missing.html')));
    const page = path.join(dir, 'page.html');
    fs.writeFileSync(page, '<p>x</p>');
    assert.equal(resolveTarget(page), pathToFileURL(page).href);
    assert.equal(run(capture).status, 1);
  });
}

test('both skills ship the same capture script', () => {
  const [ui, website] = ['unparalleled-ui', 'unparalleled-website'].map(skill => fs.readFileSync(path.join(root, '.agents/skills', skill, 'scripts/capture.mjs'), 'utf8'));
  assert.equal(ui, website);
});

const playwrightCache = path.join(process.env.XDG_CACHE_HOME || path.join(os.homedir(), '.cache'), 'unparalleled/playwright/node_modules/playwright');
test('capture flags template tells in a rendered generic page', { skip: !fs.existsSync(playwrightCache) && 'Playwright not installed; run capture.mjs --install to enable' }, t => {
  const dir = temporary(t);
  const page = path.join(dir, 'generic.html');
  fs.writeFileSync(page, `<!doctype html><html><body style="margin:0;background:#11131a;color:#e5e7eb;font-family:Inter,sans-serif">
    <a style="display:inline-block;padding:14px 24px;border-radius:999px;background:#6366f1;color:#fff">Start free</a>
    <div style="display:grid;grid-template-columns:repeat(3,300px);gap:20px">${'<div style="border:1px solid #2a2f3d;border-radius:14px;padding:24px;min-height:120px">Feature</div>'.repeat(3)}</div>
  </body></html>`);
  const result = spawnSync(process.execPath, [path.join(root, '.agents/skills/unparalleled-website/scripts/capture.mjs'), '--url', page, '--out', dir, '--viewports', 'desktop'], { encoding: 'utf8', timeout: 90000 });
  assert.equal(result.status, 0, result.stderr);
  const report = JSON.parse(fs.readFileSync(path.join(dir, 'round-1/report.json'), 'utf8'));
  const kinds = report.viewports.desktop.findings.map(finding => finding.kind);
  for (const kind of ['pill-shape', 'card-grid', 'generic-type', 'saas-palette', 'dark-slate-neon']) assert.ok(kinds.includes(kind), `missing ${kind}`);
  assert.ok(fs.existsSync(report.viewports.desktop.screenshots.first));
});

test('rendered review distinguishes stock content and motion from ordinary consistent spacing', { skip: !fs.existsSync(playwrightCache) && 'Playwright not installed; run capture.mjs --install to enable' }, t => {
  const dir = temporary(t);
  const capture = path.join(root, '.agents/skills/unparalleled-website/scripts/capture.mjs');
  const signals = ['generic-copy', 'placeholder-copy', 'uniform-section-spacing', 'gradient-overuse', 'repeated-motion', 'reduced-motion-loop'];
  const pages = {
    generic: `<!doctype html><html><head><style>
      section { padding:80px; background:linear-gradient(#f8e2ce,#d79855); }
      .ornament { width:30px; height:30px; animation:float 10s linear infinite; }
      @keyframes float { from { transform:translateY(0); } to { transform:translateY(10px); } }
    </style></head><body><main><h1>Seamless all-in-one solutions</h1>
      ${Array.from({length:3}, (_, i) => `<section><h2>Section ${i + 1}</h2><p>Lorem ipsum</p><div class="ornament"></div></section>`).join('')}
    </main></body></html>`,
    functional: `<!doctype html><html><head><style>section { padding:16px; } label { display:block; margin-block:8px; }</style></head>
    <body><main><h1>Dispatch settings</h1>
      ${['Collection address', 'Packing notes', 'Return address'].map(label => `<section><h2>${label}</h2><p>Used on the printed dispatch label.</p><label>${label}<input></label></section>`).join('')}
    </main></body></html>`,
  };
  for (const [name, html] of Object.entries(pages)) {
    const page = path.join(dir, `${name}.html`);
    fs.writeFileSync(page, html);
    const out = path.join(dir, name);
    const result = run(capture, ['--url', page, '--out', out, '--viewports', 'desktop', '--reduced-motion']);
    assert.equal(result.status, 0, result.stderr);
    const report = JSON.parse(fs.readFileSync(path.join(out, 'round-1/report.json'), 'utf8'));
    assert.equal(report.reducedMotion, true);
    const kinds = report.viewports.desktop.findings.map(finding => finding.kind);
    for (const kind of signals) assert.equal(kinds.includes(kind), name === 'generic', `${name}: ${kind}`);
  }
});

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

test('each skill installs and validates independently with its complete craft resources', t => {
  const cli = path.join(root, 'bin/cli.js');
  for (const kind of ['ui', 'website']) {
    const dir = temporary(t);
    const name = `unparalleled-${kind}`;
    const result = run(cli, [`--${kind}`, '--local', '--claude'], dir);
    assert.equal(result.status, 0, result.stderr);
    for (const location of ['.agents/skills', '.claude/skills']) {
      const installed = path.join(dir, location, name);
      for (const resource of ['craft-foundation', 'source-methods', 'reference-intentions', 'asset-direction', 'rendered-review', 'framework-selection', 'pipeline-2d', 'pipeline-3d', 'pipeline-motion-graphics', 'image-generation-direction', 'anti-slop-invariants', 'design-collaboration']) {
        assert.ok(fs.existsSync(path.join(installed, 'references', `${resource}.md`)));
      }
      const validation = run(path.join(installed, 'scripts/validate-skill.mjs'), [], dir);
      assert.equal(validation.status, 0, validation.stderr);
      const sibling = kind === 'ui' ? 'unparalleled-website' : 'unparalleled-ui';
      assert.ok(!fs.existsSync(path.join(dir, location, sibling)), 'validation must work without the other skill');
    }
  }
});

for (const count of [1, 2, 5]) test(`specimen viewer supports ${count} direction(s) without a quota and switches accessibly`, () => {
  const html = fs.readFileSync(path.join(root, '.agents/skills/unparalleled-website/templates/design-specimens.html'), 'utf8');
  const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
  vm.runInNewContext(script, { document: { querySelectorAll: () => [] } });
  const sections = Array.from({ length: count }, (_, i) => ({
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
  assert.equal(buttons.length, count);
  assert.equal(buttons[0].attrs['aria-pressed'], 'true');
  assert.equal(status.textContent, 'Product direction 1');
  const selected = count - 1;
  assert.equal(buttons[selected].attrs['aria-controls'], sections[selected].id);
  buttons[selected].handlers.click();
  assert.equal(sections[selected].hidden, false);
  assert.equal(buttons[selected].attrs['aria-pressed'], 'true');
  if (count > 1) {
    assert.equal(sections[0].hidden, true);
    assert.equal(buttons[0].attrs['aria-pressed'], 'false');
  }
  assert.equal(status.textContent, `Product direction ${count}`);
  assert.equal(sections[selected].events.at(-1).detail.visible, true);
});
