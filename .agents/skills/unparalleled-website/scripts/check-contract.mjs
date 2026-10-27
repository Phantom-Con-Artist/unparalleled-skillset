#!/usr/bin/env node
// Checks that a design contract record is complete, internally consistent and current
// before a phase transition. It reads a JSON record; it never renders, opens images,
// talks to the user or judges design. See references/execution-contract.md.
import fs from 'node:fs';
import path from 'node:path';

const GATES = ['contract', 'execute', 'deliver'];
const OBSERVATIONS = ['live', 'screenshot', 'creator-account', 'source', 'user-stated', 'inferred'];
const FACT_STATUS = ['verified', 'assumed', 'unknown'];
const CHECK_KINDS = ['measured', 'exercised', 'inspected', 'judged'];
const DIMENSIONS = ['2d', '3d', 'hybrid'];
const SCOPES = ['new-surface', 'overhaul', 'local-fix'];
const APPROVAL = ['pending', 'approved', 'waived', 'inherited'];
const RESULT_STATUS = ['pass', 'fail', 'unverified'];
const SEVERITY = ['blocker', 'major', 'minor'];
const FINDING_STATE = ['open', 'fixed', 'false-positive', 'justified'];
const PIPELINES = ['three_d', 'motion_audio', 'image_generation'];
const NAMED_DIMENSIONS = ['none', ...DIMENSIONS];
const MODEL_DECISIONS = ['reuse', 'adapt', 'scratch', 'reject'];
const READINESS = ['ready', 'pending', 'user-approved-alternative'];
const NOT_APPROVAL = /^(silence|none|n\/?a|implied|assumed|score|looks good|tbd|todo|pending)\b/i;

const args = process.argv.slice(2);
const option = name => { const i = args.indexOf(name); return i === -1 ? undefined : args[i + 1]; };
if (args.includes('--help') || !option('--contract') || !GATES.includes(option('--gate'))) {
  console.log(`Usage: node scripts/check-contract.mjs --contract <file.json> --gate ${GATES.join('|')} [--require-complete] [--json]

contract  facts, premise (with its basis), stack, dimension and testable rules are recorded before a specimen is built
execute   the contract holds, the premise is supported, and the specimen is approved, waived or an inherited local scope; pipeline prerequisites are recorded
deliver   the execute gate holds and every rule has a current result; no open blocker or major; unverified items are disclosed

Exit 0: the record satisfies the gate (a partial delivery with disclosed gaps is labeled PARTIAL).
Exit 1: the record is missing, malformed, stale or contradicts the gate.
Exit 2: usage error. --require-complete turns a PARTIAL delivery into exit 1.`);
  process.exit(args.includes('--help') ? 0 : 2);
}

const file = path.resolve(option('--contract'));
const gate = option('--gate');
const errors = [];
const notes = [];
const fail = message => errors.push(message);
const text = value => typeof value === 'string' && value.trim() !== '' && !/^(pending|todo|tbd|n\/a|\.{3})\s*([:;,(\[\-\u2013\u2014.]|$)/i.test(value.trim());
const list = value => Array.isArray(value) ? value : [];
const oneOf = (value, allowed, label) => { if (!allowed.includes(value)) fail(`${label} must be one of ${allowed.join(', ')} (found ${JSON.stringify(value)}).`); };

let record;
try { record = JSON.parse(fs.readFileSync(file, 'utf8')); }
catch (error) { console.error(`Cannot read contract ${file}: ${error.message}`); process.exit(1); }
if (!record || typeof record !== 'object' || Array.isArray(record)) { console.error('Contract must be a JSON object.'); process.exit(1); }

function checkContract() {
  if (record.schema !== 'unparalleled-contract/1') fail('schema must be "unparalleled-contract/1".');
  oneOf(record.kind, ['website', 'ui'], 'kind');
  oneOf(record.scope, SCOPES, 'scope');
  if (!text(record.revision)) fail('revision names the build being judged (commit, specimen number or build id).');
  if (!text(record.objective)) fail('objective is missing.');

  const facts = list(record.facts);
  const factIds = new Set();
  if (!facts.length) fail('facts: record at least one fact with its source; a design with no recorded evidence has no subject truth.');
  for (const fact of facts) {
    const label = `fact ${fact?.id ?? '?'}`;
    if (!text(fact?.id) || factIds.has(fact.id)) fail(`${label}: id must be unique and non-empty.`);
    factIds.add(fact?.id);
    if (!text(fact?.claim)) fail(`${label}: claim is missing.`);
    oneOf(fact?.observation, OBSERVATIONS, `${label} observation`);
    oneOf(fact?.status, FACT_STATUS, `${label} status`);
    if (!text(fact?.source)) fail(`${label}: source is missing (url, path, or who said it).`);
    if (fact?.status === 'verified' && fact?.observation === 'inferred') fail(`${label}: an inference cannot be marked verified; mark it assumed or obtain an observation.`);
  }
  if (facts.length && !facts.some(fact => fact?.status === 'verified')) fail('facts: none is verified; sparse evidence narrows the proposal but at least one observed fact must anchor it.');
  for (const gap of list(record.gaps)) if (!text(gap?.question) || !text(gap?.impact)) fail('gaps: each gap needs a question and the impact if it stays unanswered.');

  const premise = record.premise ?? {};
  const local = record.scope === 'local-fix';
  const premiseKeys = local ? ['statement'] : ['statement', 'swap_test', 'counter_argument', 'answer'];
  for (const key of premiseKeys) if (!text(premise[key])) fail(`premise.${key} is missing${local && key === 'statement' ? ' (for a local fix: the cause and the change)' : ''}.`);
  if (!list(premise.invalidated_by).some(text)) fail('premise.invalidated_by: name what evidence would show this direction is wrong.');
  oneOf(premise.status, ['supported', 'provisional'], 'premise.status');
  if (premise.status === 'provisional') notes.push('premise is provisional: this record is complete, not ready to build on.');
  oneOf(record.state?.phase, ['intake', 'discover', 'contract', 'specimen', 'execute', 'audit', 'reflect', 'blocked', 'deliver'], 'state.phase');
  const basis = list(premise.basis);
  if (!basis.length) fail('premise.basis: cite the fact ids the premise stands on.');
  for (const id of basis) if (!factIds.has(id)) fail(`premise.basis cites unknown fact ${id}.`);
  if (premise.status === 'supported' && !basis.some(id => facts.find(fact => fact?.id === id)?.status === 'verified')) fail('premise.status is supported but no basis fact is verified; mark it provisional.');
  const stack = record.stack ?? {};
  if (!text(stack.choice)) fail('stack.choice is missing (the framework or runtime, or "existing" for a local fix).');
  if (!local && stack.user_chosen !== true) for (const key of ['rationale', 'alternative']) if (!text(stack[key])) fail(`stack.${key} is missing: recommend with a reason and one credible alternative unless the user chose the stack.`);

  oneOf(record.dimension?.value, DIMENSIONS, 'dimension.value');
  if (typeof record.dimension?.user_named !== 'boolean') fail('dimension.user_named must be true or false; a dimension the user named is a constraint.');
  for (const name of list(record.uses)) oneOf(name, PIPELINES, 'uses entry');

  const intake = record.intake ?? {};
  if (!text(intake.request)) fail('intake.request must hold the user\'s request verbatim (run scripts/structure-prompt.mjs).');
  oneOf(intake.named_dimension, NAMED_DIMENSIONS, 'intake.named_dimension');
  if (DIMENSIONS.includes(intake.named_dimension)) {
    if (record.dimension?.value !== intake.named_dimension) fail(`dimension.value is ${JSON.stringify(record.dimension?.value)} but the user named ${intake.named_dimension}; a named dimension is a constraint and changing it needs the user's choice.`);
    if (record.dimension?.user_named !== true) fail('dimension.user_named must be true because the request names a dimension.');
  }
  const dismissed = new Map(list(intake.dismissed_pipelines).map(item => [item?.name, item?.reason]));
  for (const name of list(intake.pipelines_triggered)) {
    oneOf(name, PIPELINES, 'intake.pipelines_triggered entry');
    if (!list(record.uses).includes(name) && !text(dismissed.get(name))) fail(`intake triggered the ${name} pipeline but it is neither in uses nor dismissed with a reason in intake.dismissed_pipelines.`);
  }

  const rules = list(record.rules);
  if (!rules.length) fail('rules: record at least one testable rule derived from the facts.');
  const ruleIds = new Set();
  for (const rule of rules) {
    const label = `rule ${rule?.id ?? '?'}`;
    if (!text(rule?.id) || ruleIds.has(rule.id)) fail(`${label}: id must be unique and non-empty.`);
    ruleIds.add(rule?.id);
    for (const key of ['quality', 'relationship', 'rule']) if (!text(rule?.[key])) fail(`${label}: ${key} is missing.`);
    if (!list(rule?.facts).length) fail(`${label}: cite the fact ids it derives from.`);
    for (const id of list(rule?.facts)) if (!factIds.has(id)) fail(`${label}: cites unknown fact ${id}.`);
    oneOf(rule?.check?.kind, CHECK_KINDS, `${label} check.kind`);
    if (!text(rule?.check?.how)) fail(`${label}: check.how must say what will be measured, exercised or inspected.`);
  }
  const grounded = new Set(rules.flatMap(rule => list(rule?.grounds)).map(term => String(term).toLowerCase()));
  for (const term of list(intake.abstract_terms)) if (!grounded.has(String(term).toLowerCase())) fail(`intake term "${term}" carries no instruction: add a rule whose grounds lists "${term}" with the fact, relationship and check that make it observable.`);
  return { factIds, ruleIds };
}

function checkExecute() {
  if (record.premise?.status === 'provisional') fail('premise is provisional: confirm it with the user or with evidence before building. A waiver of the specimen review does not make a premise true.');
  const approval = record.approval ?? {};
  oneOf(approval.state, APPROVAL, 'approval.state');
  if (approval.state === 'pending') fail('approval is pending: the current specimen has not been approved or waived. Continue independent work only.');
  if (approval.state === 'approved' || approval.state === 'waived') {
    if (record.scope === 'local-fix' && approval.state === 'approved') notes.push('local-fix recorded as approved; inherited is normally enough.');
    if (!text(approval.source) || NOT_APPROVAL.test(approval.source.trim())) fail('approval.source must quote or locate the user\'s actual words. Silence, scores and elapsed time are not approval.');
    if (!text(approval.specimen_revision)) fail('approval.specimen_revision names the specimen revision the user saw.');
    if (!text(approval.scope)) fail('approval.scope states what the approval covers.');
  }
  if (approval.state === 'inherited') {
    if (record.scope !== 'local-fix') fail('inherited approval is only valid for a local-fix scope; a new surface or overhaul needs approval or an explicit waiver.');
    if (!text(approval.source)) fail('approval.source must identify the existing identity being inherited.');
  }
  const uses = list(record.uses);
  const pipelines = record.pipelines ?? {};
  for (const name of uses) if (!pipelines[name]) fail(`pipelines.${name} is declared in uses but has no record.`);
  if (uses.includes('three_d') && pipelines.three_d) {
    const model = pipelines.three_d;
    const candidates = list(model.open_model_research);
    if (!candidates.length) fail('pipelines.three_d.open_model_research: record the open models searched, their licenses and a decision before scratch modeling.');
    for (const entry of candidates) {
      if (!text(entry?.query) || !text(entry?.license)) fail('pipelines.three_d.open_model_research: each entry needs query and license (or "none found").');
      oneOf(entry?.decision, MODEL_DECISIONS, 'pipelines.three_d decision');
    }
    if (!list(model.references_viewed).some(text)) fail('pipelines.three_d.references_viewed: name the product references actually inspected.');
    oneOf(model.blender?.status, READINESS, 'pipelines.three_d.blender.status');
    if (model.blender?.status === 'ready' && !text(model.blender?.readback)) fail('pipelines.three_d.blender.readback: record the scene readback that proved the connection.');
    if (model.blender?.status === 'pending') fail('Blender access is pending: dependent modeling is blocked. Request the exact setup step and continue independent work.');
    if (model.blender?.status === 'user-approved-alternative' && !text(model.blender?.alternative_source)) fail('pipelines.three_d.blender.alternative_source: quote the user\'s approval of the alternative.');
  }
  if (uses.includes('motion_audio') && pipelines.motion_audio) {
    const audio = pipelines.motion_audio;
    for (const key of ['source', 'clock', 'cue_map']) if (!text(audio[key])) fail(`pipelines.motion_audio.${key} is missing; inspect the actual audio and record the cue map before synchronizing.`);
  }
  if (uses.includes('image_generation') && pipelines.image_generation) {
    if (!text(pipelines.image_generation.status_of_outputs)) fail('pipelines.image_generation.status_of_outputs: state that generated images are look-development, not product evidence.');
  }
}

function checkDeliver(ruleIds) {
  const results = list(record.results);
  const unverified = [];
  const limits = list(record.limits).filter(text).join('\n');
  for (const id of ruleIds) {
    const entry = results.filter(result => result?.rule === id);
    if (!entry.length) { fail(`rule ${id}: no result recorded.`); continue; }
    const latest = entry[entry.length - 1];
    oneOf(latest.status, RESULT_STATUS, `rule ${id} result.status`);
    if (latest.revision !== record.revision) fail(`rule ${id}: result is for revision ${JSON.stringify(latest.revision)} but the record is at ${JSON.stringify(record.revision)}; retest the current build.`);
    if (latest.status === 'fail') fail(`rule ${id}: latest result is a failure.`);
    if (latest.status === 'pass') {
      if (!list(latest.evidence).some(text)) fail(`rule ${id}: a pass needs evidence. Use "file:<path>" for captures, reports or logs, or a note describing what was exercised.`);
      for (const item of list(latest.evidence)) {
        if (typeof item === 'string' && item.startsWith('file:') && !fs.existsSync(path.resolve(path.dirname(file), item.slice(5)))) fail(`rule ${id}: evidence file ${item.slice(5)} does not exist.`);
      }
    }
    if (latest.status === 'unverified') {
      unverified.push(id);
      if (!limits.includes(id)) fail(`rule ${id}: unverified, but no entry in limits mentions ${id}. Disclose what was not checked and why.`);
    }
  }
  for (const result of results) if (result?.rule && !ruleIds.has(result.rule)) fail(`result cites unknown rule ${result.rule}.`);
  const seen = new Set();
  for (const finding of list(record.findings)) {
    const label = `finding ${finding?.id ?? '?'}`;
    if (!text(finding?.id) || seen.has(finding.id)) fail(`${label}: id must be unique and non-empty.`);
    seen.add(finding?.id);
    oneOf(finding?.severity, SEVERITY, `${label} severity`);
    oneOf(finding?.state, FINDING_STATE, `${label} state`);
    if (!text(finding?.evidence)) fail(`${label}: evidence is missing.`);
    if (finding?.state === 'open' && ['blocker', 'major'].includes(finding?.severity)) fail(`${label}: ${finding.severity} is still open.`);
    if (finding?.state === 'fixed' && !text(finding?.retest)) fail(`${label}: marked fixed without a recorded retest.`);
    if (['false-positive', 'justified'].includes(finding?.state) && !text(finding?.justification)) fail(`${label}: ${finding.state} needs a justification tied to evidence or an explicit user/brand requirement.`);
  }
  return unverified;
}

const { ruleIds } = checkContract();
let unverified = [];
if (gate !== 'contract') checkExecute();
if (gate === 'deliver') unverified = checkDeliver(ruleIds);

const verdict = errors.length ? 'FAIL' : unverified.length ? 'PARTIAL' : 'PASS';
if (args.includes('--json')) console.log(JSON.stringify({ gate, verdict, errors, unverified, notes }, null, 2));
else {
  console.log(`${verdict} ${gate} gate: ${file}`);
  for (const error of errors) console.log(`  - ${error}`);
  for (const id of unverified) console.log(`  ~ ${id} unverified and disclosed`);
  for (const note of notes) console.log(`  note: ${note}`);
  console.log('This checks record completeness and currency only. It does not prove the user approved, that any image was opened, or that the design is good.');
}
process.exit(verdict === 'FAIL' || (verdict === 'PARTIAL' && args.includes('--require-complete')) ? 1 : 0);
