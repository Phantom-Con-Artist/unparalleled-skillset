#!/usr/bin/env node
// Checks that a design contract record is complete, internally consistent and current
// before a phase transition. It reads a JSON record; it never renders, opens images,
// talks to the user or judges design. See references/execution-contract.md.
import fs from 'node:fs';
import path from 'node:path';
import { parseDesignTokens } from './check-design-sync.mjs';

// v3 gates follow the design flow: design (design.md + design.html ready for human review),
// build (design approved, development may start), deliver. v1/v2 names remain as aliases.
const GATE_ALIASES = { contract: 'design', execute: 'build' };
const GATES = ['design', 'build', 'deliver', ...Object.keys(GATE_ALIASES)];
const PHASES = ['intake', 'product', 'design', 'design-review', 'build', 'verify', 'human-review', 'deliver', 'reflect', 'blocked', 'discover', 'contract', 'specimen', 'execute', 'audit'];
const DESIGN_SECTIONS = ['premise', 'brand_personality', 'color', 'typography', 'spatial_layout', 'negative_space', 'visual_assets', 'components', 'ux_ia', 'responsive', 'motion', 'accessibility', 'conversion', 'stack_pipelines'];
const COLOR_MODES = ['mcp', 'cli', 'fallback'];
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
  console.log(`Usage: node scripts/check-contract.mjs --contract <file.json> --gate design|build|deliver [--require-complete] [--json]

design   prompt handoff, product.md with vocabulary, design.md with every section in the fixed order, design-tokens,
         Color Intelligence evidence, design.html and a current inner review are recorded (ready for human design review)
build    the design gate holds, the premise is supported and a human approved (or explicitly waived) the current design
         revision; pipeline prerequisites are recorded
deliver  the build gate holds, the built product passed design sync at the delivered revision, every rule has a current
         result, no open blocker or major, and the final human milestone matches the delivered revision
(contract and execute are accepted as aliases of design and build for v1/v2 records.)

Exit 0: the record satisfies the gate (a partial delivery with disclosed gaps is labeled PARTIAL).
Exit 1: the record is missing, malformed, stale or contradicts the gate.
Exit 2: usage error. --require-complete turns a PARTIAL delivery into exit 1.`);
  process.exit(args.includes('--help') ? 0 : 2);
}

const file = path.resolve(option('--contract'));
const gate = GATE_ALIASES[option('--gate')] ?? option('--gate');
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
  if (!['unparalleled-contract/1', 'unparalleled-contract/2', 'unparalleled-contract/3'].includes(record.schema)) fail('schema must be unparalleled-contract/3 (or a legacy /1 or /2 record).');
  if (record.schema === 'unparalleled-contract/1') notes.push('Legacy v1 record: prompt/kit/progressive reviews are not structurally checked. Use v3 for new surfaces and overhauls.');
  if (record.schema === 'unparalleled-contract/2') notes.push('Legacy v2 record: product.md, design.md order, Color Intelligence and design sync are not checked. Use v3 for new work.');
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
  oneOf(record.state?.phase, PHASES, 'state.phase');
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
  if (record.premise?.status === 'provisional') fail('premise is provisional: confirm it with the user or with evidence before building. A waiver of the design review does not make a premise true.');
  if (record.schema !== 'unparalleled-contract/3' || record.scope === 'local-fix') checkApproval();
  checkPipelines();
}

function checkApproval() {
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
}

function checkPipelines() {
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


const artifactPath = value => path.resolve(path.dirname(file), String(value).replace(/^file:/, '').split('#')[0]);
const artifactExists = (value, label) => {
  if (!text(value) || !fs.existsSync(artifactPath(value))) fail(`${label}: local artifact is missing.`);
};

function checkHandoff() {
  const handoff = record.prompt_handoff ?? {};
  oneOf(handoff.mode, ['subagent', 'main-agent-fallback'], 'prompt_handoff.mode');
  for (const key of ['agent', 'guidelines', 'artifact']) if (!text(handoff[key])) fail(`prompt_handoff.${key} is missing.`);
  if (handoff.fidelity_checked !== true) fail('prompt_handoff.fidelity_checked must confirm comparison with the original request.');
  if (handoff.mode === 'main-agent-fallback' && !text(handoff.fallback_reason)) fail('prompt_handoff.fallback_reason must disclose why delegation was unavailable.');
  artifactExists(handoff.artifact, 'prompt_handoff.artifact');
}

const slug = heading => heading.toLowerCase().replace(/<[^>]+>/g, '').replace(/[^\p{L}\p{N}\s-]/gu, '').trim().replace(/\s+/g, '-');
function headingIndex(markdown) {
  const index = new Map();
  for (const [i, m] of [...markdown.matchAll(/^#{1,6}\s+(.+?)\s*#*\s*$/gm)].entries()) if (!index.has(slug(m[1]))) index.set(slug(m[1]), i);
  return index;
}

function checkReviews(reviews, stages) {
  const ids = new Set();
  for (const review of reviews) {
    if (!text(review?.id) || ids.has(review.id)) fail('human_reviews: unique id required.');
    ids.add(review?.id);
    oneOf(review?.stage, stages, 'human_reviews.stage');
    oneOf(review?.status, ['pending', 'changes-requested', 'approved', 'waived'], 'human_reviews.status');
    for (const key of ['revision', 'artifact', 'scope']) if (!text(review?.[key])) fail(`human_reviews.${key} is missing.`);
    if (['approved', 'waived'].includes(review?.status)) {
      if (!text(review.source) || NOT_APPROVAL.test(review.source.trim())) fail('human_reviews.source must quote or locate the actual scoped human decision.');
      if (!list(review.inner_evidence).some(text)) fail('human_reviews.inner_evidence must record the inner review before outer approval/waiver.');
    }
    if (gate === 'deliver' && !['approved', 'waived'].includes(review?.status)) fail(`human review ${review?.id}: ${review?.status}; finish or obtain an explicit scoped waiver before delivery.`);
  }
}

function checkProgression(reviews) {
  const progression = record.progression ?? {};
  if (!text(progression.next_slice) || !Array.isArray(progression.depends_on)) fail('progression: name next_slice and its depends_on review ids.');
  for (const id of list(progression.depends_on)) {
    const dependency = reviews.find(r => r?.id === id);
    if (!dependency) fail(`progression.depends_on: unknown review ${id}.`);
    else if (gate !== 'design' && !['approved', 'waived'].includes(dependency.status)) fail(`progression: review ${id} blocks dependent slice ${progression.next_slice}.`);
  }
  if (gate === 'deliver') {
    const milestones = reviews.filter(r => r?.stage === 'milestone');
    const final = milestones[milestones.length - 1];
    if (!final || final.revision !== record.revision) fail('human_reviews: final complete-journey milestone must match the delivered revision.');
  }
}

function checkWorkflowV3() {
  checkHandoff();
  if (record.scope === 'local-fix') return;
  const product = record.product ?? {};
  artifactExists(product.artifact, 'product.artifact');
  if (text(product.artifact) && fs.existsSync(artifactPath(product.artifact))) {
    const md = fs.readFileSync(artifactPath(product.artifact), 'utf8');
    if (!/^#{1,6}\s+.*vocabulary/im.test(md)) fail('product.md needs a Vocabulary section (source -> term -> meaning -> design consequence -> check).');
  }

  const design = record.design ?? {};
  for (const key of ['revision', 'artifact', 'preview']) if (!text(design[key])) fail(`design.${key} is missing.`);
  artifactExists(design.artifact, 'design.artifact');
  if (text(design.preview) && !/^https?:\/\//.test(design.preview)) artifactExists(design.preview, 'design.preview');
  const designFile = text(design.artifact) && artifactPath(design.artifact);
  if (designFile && fs.existsSync(designFile)) {
    const md = fs.readFileSync(designFile, 'utf8');
    try { parseDesignTokens(md); } catch (error) { fail(`design.md tokens: ${error.message}`); }
    const headings = headingIndex(md);
    let previous = -1, previousKey = '';
    for (const key of DESIGN_SECTIONS) {
      const ref = design.sections?.[key];
      if (!text(ref)) { fail(`design.sections.${key} must locate the decision in design.md (for example "design.md#2-color").`); continue; }
      const anchor = String(ref).split('#')[1];
      if (!anchor) { fail(`design.sections.${key} needs a #heading anchor.`); continue; }
      const position = headings.get(anchor.toLowerCase());
      if (position === undefined) { fail(`design.sections.${key}: design.md has no heading for #${anchor}.`); continue; }
      if (position < previous) fail(`design.md order: ${key} appears before ${previousKey}; write sections in the fixed order (premise, brand personality, color, typography, spatial, negative space, assets, components, UX/IA, responsive, motion, accessibility, conversion, stack).`);
      previous = position; previousKey = key;
    }
  }
  const color = design.color_intelligence ?? {};
  oneOf(color.mode, COLOR_MODES, 'design.color_intelligence.mode');
  artifactExists(color.evidence, 'design.color_intelligence.evidence (saved engine output or fallback measurements)');
  if (color.mode === 'fallback' && !text(color.fallback_reason)) fail('design.color_intelligence.fallback_reason must say why the Color Intelligence Layer was unavailable.');
  if (design.inner_review?.revision !== design.revision) fail('design.inner_review is stale: run the design sync and captures on the current design revision.');
  if (!list(design.inner_review?.evidence).some(text)) fail('design.inner_review needs actual browser evidence (design sync report, opened captures, measured pairs).');
  for (const item of list(design.inner_review?.evidence)) if (typeof item === 'string' && item.startsWith('file:')) artifactExists(item, 'design inner review evidence');

  const reviews = list(record.human_reviews);
  checkReviews(reviews, ['design', 'design-choice', 'milestone']);
  for (const item of reviews.flatMap(r => list(r?.inner_evidence))) if (typeof item === 'string' && item.startsWith('file:')) artifactExists(item, 'inner review evidence');
  const approvedDesign = reviews.some(r => r?.stage === 'design' && r.revision === design.revision && ['approved', 'waived'].includes(r.status));
  if (!reviews.some(r => r?.stage === 'design')) fail('human_reviews: plan a design review row (stage "design") for design.html and design.md.');
  if (gate !== 'design' && !approvedDesign) fail('design: the current design revision needs explicit human approval or a scoped waiver before development (No -> refine the design and review again).');
  checkProgression(reviews);

  if (gate === 'deliver') {
    const verification = record.verification ?? {};
    if (verification.revision !== record.revision) fail('verification: run check-design-sync and captures against the delivered revision before human review.');
    artifactExists(verification.sync_report, 'verification.sync_report');
    if (text(verification.sync_report) && fs.existsSync(artifactPath(verification.sync_report))) {
      try {
        const report = JSON.parse(fs.readFileSync(artifactPath(verification.sync_report), 'utf8'));
        if (report.verdict !== 'PASS') fail('verification.sync_report: the built product does not match design.md (No -> refine and recheck).');
      } catch { fail('verification.sync_report must be the JSON written by check-design-sync.mjs --out.'); }
    }
  }
}

function checkWorkflow() {
  if (record.schema === 'unparalleled-contract/3') return checkWorkflowV3();
  if (record.schema !== 'unparalleled-contract/2') return;
  const handoff = record.prompt_handoff ?? {};
  oneOf(handoff.mode, ['subagent', 'main-agent-fallback'], 'prompt_handoff.mode');
  for (const key of ['agent', 'guidelines', 'artifact']) if (!text(handoff[key])) fail(`prompt_handoff.${key} is missing.`);
  if (handoff.fidelity_checked !== true) fail('prompt_handoff.fidelity_checked must confirm comparison with the original request.');
  if (handoff.mode === 'main-agent-fallback' && !text(handoff.fallback_reason)) fail('prompt_handoff.fallback_reason must disclose why delegation was unavailable.');
  const artifactExists = (value, label) => {
    if (!text(value) || !fs.existsSync(path.resolve(path.dirname(file), value))) fail(`${label}: local artifact is missing.`);
  };
  artifactExists(handoff.artifact, 'prompt_handoff.artifact');
  if (record.scope === 'local-fix') return;
  const kit = record.brand_kit ?? {};
  for (const key of ['revision', 'artifact', 'preview']) if (!text(kit[key])) fail(`brand_kit.${key} is missing.`);
  artifactExists(kit.artifact, 'brand_kit.artifact');
  if (text(kit.preview) && !/^https?:\/\//.test(kit.preview)) artifactExists(kit.preview, 'brand_kit.preview');
  for (const key of ['product_vocabulary', 'typography', 'color', 'geometry', 'layout_spacing', 'ux_states', 'assets', 'pipelines', 'motion', 'acceptance']) {
    if (!text(kit.decisions?.[key])) fail(`brand_kit.decisions.${key} must locate the actual rule in the canonical kit.`);
  }
  if (kit.inner_review?.revision !== kit.revision) fail('brand_kit.inner_review is stale: inspect the current kit preview.');
  if (!list(kit.inner_review?.evidence).some(text)) fail('brand_kit.inner_review needs actual browser inspection evidence.');
  const reviews = list(record.human_reviews);
  const ids = new Set();
  for (const review of reviews) {
    if (!text(review?.id) || ids.has(review.id)) fail('human_reviews: unique id required.');
    ids.add(review?.id);
    oneOf(review?.stage, ['brand-kit', 'design-choice', 'specimen', 'milestone'], 'human_reviews.stage');
    oneOf(review?.status, ['pending', 'changes-requested', 'approved', 'waived'], 'human_reviews.status');
    for (const key of ['revision', 'artifact', 'scope']) if (!text(review?.[key])) fail(`human_reviews.${key} is missing.`);
    if (['approved', 'waived'].includes(review?.status)) {
      if (!text(review.source) || NOT_APPROVAL.test(review.source.trim())) fail('human_reviews.source must quote or locate the actual scoped human decision.');
      if (!list(review.inner_evidence).some(text)) fail('human_reviews.inner_evidence must record the inner review before outer approval/waiver.');
    }
    if (gate === 'deliver' && !['approved', 'waived'].includes(review?.status)) fail(`human review ${review?.id}: ${review?.status}; finish or obtain an explicit scoped waiver before delivery.`);
  }
  if (!reviews.some(r => r?.stage === 'brand-kit' && r.revision === kit.revision && r.artifact === kit.artifact && ['approved', 'waived'].includes(r.status))) {
    fail('brand_kit: current kit needs explicit human review approval or a scoped waiver before the specimen.');
  }
  const progression = record.progression ?? {};
  if (!text(progression.next_slice) || !Array.isArray(progression.depends_on)) fail('progression: name next_slice and its depends_on review ids.');
  for (const id of list(progression.depends_on)) {
    const dependency = reviews.find(r => r?.id === id);
    if (!dependency) fail(`progression.depends_on: unknown review ${id}.`);
    else if (gate !== 'design' && !['approved', 'waived'].includes(dependency.status)) fail(`progression: review ${id} blocks dependent slice ${progression.next_slice}.`);
  }
  if (gate === 'deliver') {
    const milestones = reviews.filter(r => r?.stage === 'milestone');
    const final = milestones[milestones.length - 1];
    if (!final || final.revision !== record.revision) fail('human_reviews: final complete-journey milestone must match the delivered revision.');
  }
  const evidence = [...list(kit.inner_review?.evidence), ...reviews.flatMap(r => list(r?.inner_evidence))];
  for (const item of evidence) if (typeof item === 'string' && item.startsWith('file:')) artifactExists(item.slice(5), 'inner review evidence');
}

const { ruleIds } = checkContract();
checkWorkflow();
let unverified = [];
if (gate !== 'design') checkExecute();
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
