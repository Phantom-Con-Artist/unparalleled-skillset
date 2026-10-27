import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const skills = ['unparalleled-ui', 'unparalleled-website'];

function sample(kind) {
  return {
    schema: 'unparalleled-contract/1', kind, scope: 'new-surface', revision: 'r3',
    objective: 'Let a dispatcher reassign a late delivery without losing the route they were reading.',
    intake: { request: 'Build a polished dispatcher screen for reassigning late deliveries.', named_dimension: 'none', pipelines_triggered: [], dismissed_pipelines: [], abstract_terms: ['polished'], waiver_phrases: [] },
    state: { phase: 'audit', milestone: 'reassign flow', next_action: 'final capture', blocked: [] },
    facts: [
      { id: 'F1', claim: 'Dispatchers compare three live routes before moving a stop.', observation: 'user-stated', status: 'verified', source: 'brief, paragraph 2' },
      { id: 'F2', claim: 'Moving a stop changes the arrival time of every later stop.', observation: 'source', status: 'verified', source: 'src/routes/eta.js' }
    ],
    gaps: [{ question: 'Are drivers notified by SMS?', impact: 'Changes the confirmation state.' }],
    premise: {
      statement: 'The route stays pinned while a stop is dragged, and the downstream arrival times redraw as the stop moves.',
      swap_test: 'Replace the product name with a CRM and the pinned route has nothing to pin.',
      invalidated_by: ['Dispatchers rarely compare more than one route'],
      counter_argument: 'A route list with an edit dialog is the default and works.',
      answer: 'The dialog hides the downstream effect that F2 says is the real decision.',
      status: 'supported', basis: ['F1', 'F2']
    },
    stack: { choice: 'React with the existing Vite setup', rationale: 'The product already ships on it.', alternative: 'Svelte', user_chosen: false },
    dimension: { value: '2d', user_named: false }, uses: [],
    rules: [{ id: 'R1', quality: 'Precise working interface', facts: ['F1', 'F2'], relationship: 'Moving a stop previews every later arrival.', rule: 'Preview updates before release and undo restores the route.', grounds: ['polished'], check: { kind: 'exercised', how: 'Drag a stop, release, undo, by keyboard and touch.' } }],
    approval: { state: 'approved', specimen_revision: 'spec-2', source: 'User message: "yes, build this one"', scope: 'Reassign flow and shell' },
    pipelines: {}, results: [], findings: [], limits: []
  };
}

function setup(mutate = () => {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'contract-'));
  const record = sample('ui');
  mutate(record, dir);
  const file = path.join(dir, 'design-contract.json');
  fs.writeFileSync(file, JSON.stringify(record, null, 2));
  return { dir, file };
}

function check(skill, file, gate, extra = []) {
  const script = path.join(root, '.agents/skills', skill, 'scripts/check-contract.mjs');
  const run = spawnSync(process.execPath, [script, '--contract', file, '--gate', gate, ...extra], { encoding: 'utf8' });
  return { status: run.status, out: run.stdout + run.stderr };
}

const passing = record => { record.results = [{ rule: 'R1', status: 'pass', revision: 'r3', evidence: ['Dragged by keyboard and touch; undo restored the route.'] }]; };

for (const skill of skills) {
  test(`${skill}: shipped pending template fails every gate`, () => {
    const template = path.join(root, '.agents/skills', skill, 'templates/design-contract.template.json');
    for (const gate of ['contract', 'execute', 'deliver']) assert.equal(check(skill, template, gate).status, 1, gate);
  });

  test(`${skill}: complete record passes contract and execute gates`, () => {
    const { file } = setup();
    assert.equal(check(skill, file, 'contract').status, 0);
    assert.equal(check(skill, file, 'execute').status, 0);
  });

  test(`${skill}: execute gate refuses pending approval, silence and an inherited new surface`, () => {
    const pending = setup(record => { record.approval.state = 'pending'; });
    assert.match(check(skill, pending.file, 'execute').out, /pending/);
    assert.equal(check(skill, pending.file, 'execute').status, 1);
    const silence = setup(record => { record.approval.source = 'silence'; });
    assert.equal(check(skill, silence.file, 'execute').status, 1);
    const inherited = setup(record => { record.approval = { state: 'inherited', source: 'existing identity' }; });
    assert.match(check(skill, inherited.file, 'execute').out, /local-fix/);
    const local = setup(record => { record.scope = 'local-fix'; record.approval = { state: 'inherited', source: 'existing React/Inter identity' }; });
    assert.equal(check(skill, local.file, 'execute').status, 0);
  });

  test(`${skill}: contract gate rejects inferred facts marked verified and rules citing unknown facts`, () => {
    const inferred = setup(record => { record.facts[0].observation = 'inferred'; });
    assert.match(check(skill, inferred.file, 'contract').out, /inference/);
    const unknown = setup(record => { record.rules[0].facts = ['F9']; });
    assert.match(check(skill, unknown.file, 'contract').out, /unknown fact F9/);
    const adjective = setup(record => { record.rules[0].check = { kind: 'vibes', how: 'feels premium' }; });
    assert.equal(check(skill, adjective.file, 'contract').status, 1);
  });

  test(`${skill}: deliver gate rejects missing, stale, unevidenced and failed results`, () => {
    assert.match(check(skill, setup().file, 'deliver').out, /no result recorded/);
    const stale = setup(record => { passing(record); record.results[0].revision = 'r2'; });
    assert.match(check(skill, stale.file, 'deliver').out, /retest the current build/);
    const bare = setup(record => { passing(record); record.results[0].evidence = []; });
    assert.match(check(skill, bare.file, 'deliver').out, /needs evidence/);
    const failed = setup(record => { passing(record); record.results[0].status = 'fail'; });
    assert.equal(check(skill, failed.file, 'deliver').status, 1);
    const missingFile = setup(record => { passing(record); record.results[0].evidence = ['file:captures/desktop.png']; });
    assert.match(check(skill, missingFile.file, 'deliver').out, /does not exist/);
  });

  test(`${skill}: deliver gate accepts real evidence files and rejects open blockers and unsupported dispositions`, () => {
    const ok = setup((record, dir) => {
      fs.mkdirSync(path.join(dir, 'captures'));
      fs.writeFileSync(path.join(dir, 'captures/desktop.png'), 'x');
      record.results = [{ rule: 'R1', status: 'pass', revision: 'r3', evidence: ['file:captures/desktop.png'] }];
      record.findings = [{ id: 'V1', severity: 'major', state: 'fixed', evidence: 'Label clipped at 320px', retest: 'Reopened phone capture, label wraps' }];
    });
    const result = check(skill, ok.file, 'deliver');
    assert.equal(result.status, 0, result.out);
    assert.match(result.out, /^PASS/);
    const open = setup(record => { passing(record); record.findings = [{ id: 'V1', severity: 'blocker', state: 'open', evidence: 'Primary action unreachable by keyboard' }]; });
    assert.match(check(skill, open.file, 'deliver').out, /blocker is still open/);
    const unretested = setup(record => { passing(record); record.findings = [{ id: 'V1', severity: 'minor', state: 'fixed', evidence: 'x' }]; });
    assert.match(check(skill, unretested.file, 'deliver').out, /without a recorded retest/);
    const excused = setup(record => { passing(record); record.findings = [{ id: 'V1', severity: 'major', state: 'justified', evidence: 'Pill radius' }]; });
    assert.match(check(skill, excused.file, 'deliver').out, /justification/);
  });

  test(`${skill}: intake consistency, named dimensions, dropped pipelines and ungrounded adjectives`, () => {
    const changed = setup(record => { record.intake.named_dimension = '3d'; });
    assert.match(check(skill, changed.file, 'contract').out, /user named 3d/);
    const honored = setup(record => { record.intake.named_dimension = '3d'; record.dimension = { value: '3d', user_named: true }; });
    assert.equal(check(skill, honored.file, 'contract').status, 0);
    const dropped = setup(record => { record.intake.pipelines_triggered = ['motion_audio']; });
    assert.match(check(skill, dropped.file, 'contract').out, /neither in uses nor dismissed/);
    const dismissed = setup(record => { record.intake.pipelines_triggered = ['motion_audio']; record.intake.dismissed_pipelines = [{ name: 'motion_audio', reason: 'The word kinetic described the brand voice; no video is requested.' }]; });
    assert.equal(check(skill, dismissed.file, 'contract').status, 0);
    const ungrounded = setup(record => { record.intake.abstract_terms = ['polished', 'premium']; });
    assert.match(check(skill, ungrounded.file, 'contract').out, /"premium" carries no instruction/);
    const noRequest = setup(record => { delete record.intake.request; });
    assert.equal(check(skill, noRequest.file, 'contract').status, 1);
  });

  test(`${skill}: intake script extracts explicit choices without inventing any`, () => {
    const script = path.join(root, '.agents/skills', skill, 'scripts/structure-prompt.mjs');
    const run = (...args) => spawnSync(process.execPath, [script, ...args], { encoding: 'utf8' });
    const rich = JSON.parse(run('--prompt', 'Build a premium landing page for our ceramics studio in Nuxt with a 3D vase. Skip the preview, just build it. Don\'t use stock icons.', '--json').stdout);
    assert.equal(rich.detected_kind, 'website');
    assert.equal(rich.named_dimension, '3d');
    assert.deepEqual(rich.named_stack, ['Nuxt']);
    assert.ok(rich.waiver_phrases.length);
    assert.deepEqual(rich.abstract_terms, ['premium']);
    assert.ok(rich.pipelines_triggered.includes('three_d'));
    const sparse = JSON.parse(run('--prompt', 'make something nice for my shop', '--json').stdout);
    assert.equal(sparse.detected_kind, 'none');
    assert.equal(sparse.named_dimension, 'none');
    assert.deepEqual(sparse.waiver_phrases, []);
    const local = run('--prompt', 'Fix the focus ring on the settings form button, keep our existing blue brand.').stdout;
    assert.match(local, /scope: local-fix/);
    assert.match(local, /existing blue brand/);
    assert.doesNotMatch(local, /No review waiver/);
  });

  test(`${skill}: prompt hook emits context for design work and nothing otherwise`, () => {
    const script = path.join(root, '.agents/skills', skill, 'scripts/structure-prompt.mjs');
    const hook = prompt => spawnSync(process.execPath, [script, '--hook'], { input: JSON.stringify({ prompt }), encoding: 'utf8' });
    const design = hook('Redesign the admin dashboard table');
    assert.equal(design.status, 0);
    const output = JSON.parse(design.stdout).hookSpecificOutput;
    assert.equal(output.hookEventName, 'UserPromptSubmit');
    assert.match(output.additionalContext, /<task_brief/);
    const other = hook('What is the capital of France?');
    assert.equal(other.status, 0);
    assert.equal(other.stdout, '');
    assert.equal(spawnSync(process.execPath, [script, '--hook'], { input: 'not json', encoding: 'utf8' }).status, 0);
  });

  test(`${skill}: a provisional premise passes the contract gate but never the execute gate`, () => {
    const provisional = setup(record => { record.premise.status = 'provisional'; });
    assert.equal(check(skill, provisional.file, 'contract').status, 0);
    const blocked = check(skill, provisional.file, 'execute');
    assert.equal(blocked.status, 1);
    assert.match(blocked.out, /premise is provisional/);
    const unsupported = setup(record => { record.facts[0].status = 'assumed'; record.facts[1].status = 'assumed'; });
    assert.match(check(skill, unsupported.file, 'contract').out, /no basis fact is verified/);
    const badBasis = setup(record => { record.premise.basis = ['F7']; });
    assert.match(check(skill, badBasis.file, 'contract').out, /unknown fact F7/);
  });

  test(`${skill}: stack is recorded with a reason unless the user chose it; local fixes need only the premise statement`, () => {
    const bare = setup(record => { record.stack = { choice: 'Next.js' }; });
    assert.match(check(skill, bare.file, 'contract').out, /stack\.rationale is missing/);
    const chosen = setup(record => { record.stack = { choice: 'Nuxt', user_chosen: true }; });
    assert.equal(check(skill, chosen.file, 'contract').status, 0);
    const local = setup(record => { record.scope = 'local-fix'; record.stack = { choice: 'existing' }; record.premise = { statement: 'outline:none on .btn:focus hides the ring; restore a focus-visible outline.', invalidated_by: ['ring still invisible in forced-colors mode'], status: 'supported', basis: ['F1'] }; });
    assert.equal(check(skill, local.file, 'contract').status, 0, check(skill, local.file, 'contract').out);
    const noCause = setup(record => { record.scope = 'local-fix'; record.stack = { choice: 'existing' }; record.premise = { status: 'supported', basis: ['F1'], invalidated_by: ['x'] }; });
    assert.match(check(skill, noCause.file, 'contract').out, /the cause and the change/);
  });

  test(`${skill}: intake maps a video request to a skill and lists sync words`, () => {
    const script = path.join(root, '.agents/skills', skill, 'scripts/structure-prompt.mjs');
    const out = JSON.parse(spawnSync(process.execPath, [script, '--prompt', 'Make a kinetic typography video for our song with Remotion, synced to the beat.', '--json'], { encoding: 'utf8' }).stdout);
    assert.equal(out.detected_kind, 'website');
    assert.ok(out.abstract_terms.includes('kinetic') && out.abstract_terms.includes('synced'));
    assert.ok(out.pipelines_triggered.includes('motion_audio'));
  });

  test(`${skill}: a provisional PASS says so, state.phase must be a real state, and the client-report template ships`, () => {
    const provisional = setup(record => { record.premise.status = 'provisional'; });
    const result = check(skill, provisional.file, 'contract');
    assert.equal(result.status, 0);
    assert.match(result.out, /not ready to build on/);
    const bad = setup(record => { record.state.phase = 'verify'; });
    assert.match(check(skill, bad.file, 'contract').out, /state\.phase must be one of/);
    assert.ok(fs.existsSync(path.join(root, '.agents/skills', skill, 'templates/client-report.template.md')));
  });

  test(`${skill}: a placeholder with an excuse after it still counts as missing`, () => {
    const excuse = setup(record => { record.uses = ['motion_audio']; record.pipelines.motion_audio = { source: 'pending: song not provided', clock: 'frame clock', cue_map: 'TBD - after audio arrives' }; });
    const result = check(skill, excuse.file, 'execute');
    assert.match(result.out, /pipelines\.motion_audio\.source is missing/);
    assert.match(result.out, /pipelines\.motion_audio\.cue_map is missing/);
    const real = setup(record => { record.objective = 'Pending deliveries are shown first.'; });
    assert.equal(check(skill, real.file, 'contract').status, 0);
  });

  test(`${skill}: unverified rules must be disclosed and deliver as PARTIAL`, () => {
    const hidden = setup(record => { record.results = [{ rule: 'R1', status: 'unverified', revision: 'r3', evidence: [] }]; });
    assert.match(check(skill, hidden.file, 'deliver').out, /no entry in limits/);
    const disclosed = setup(record => { record.results = [{ rule: 'R1', status: 'unverified', revision: 'r3', evidence: [] }]; record.limits = ['R1 not exercised: no browser tool was available.']; });
    const partial = check(skill, disclosed.file, 'deliver');
    assert.equal(partial.status, 0);
    assert.match(partial.out, /^PARTIAL/);
    assert.equal(check(skill, disclosed.file, 'deliver', ['--require-complete']).status, 1);
  });

  test(`${skill}: execute gate holds 3D, audio and generated-image prerequisites`, () => {
    const missing = setup(record => { record.uses = ['three_d', 'motion_audio', 'image_generation']; });
    assert.match(check(skill, missing.file, 'execute').out, /pipelines\.three_d is declared/);
    const blocked = setup(record => {
      record.uses = ['three_d'];
      record.pipelines.three_d = { open_model_research: [{ query: 'glazed ceramic vase', license: 'CC0', decision: 'adapt' }], references_viewed: ['studio photograph set'], blender: { status: 'pending' } };
    });
    assert.match(check(skill, blocked.file, 'execute').out, /Blender access is pending/);
    const ready = setup(record => {
      record.uses = ['three_d', 'motion_audio', 'image_generation'];
      record.pipelines = {
        three_d: { open_model_research: [{ query: 'glazed ceramic vase', license: 'CC0', decision: 'adapt' }], references_viewed: ['studio photograph set'], blender: { status: 'ready', readback: 'get_scene_info listed 4 objects' } },
        motion_audio: { source: 'track.wav', clock: 'frame clock at 30fps', cue_map: 'cues.json' },
        image_generation: { status_of_outputs: 'Look development only; not product evidence.' }
      };
    });
    assert.equal(check(skill, ready.file, 'execute').status, 0, check(skill, ready.file, 'execute').out);
  });
}

test('both skills ship byte-identical scripts so either installs standalone', () => {
  for (const name of ['check-contract.mjs', 'structure-prompt.mjs']) {
    const [ui, website] = skills.map(skill => fs.readFileSync(path.join(root, '.agents/skills', skill, 'scripts', name), 'utf8'));
    assert.equal(ui, website, name);
  }
});
