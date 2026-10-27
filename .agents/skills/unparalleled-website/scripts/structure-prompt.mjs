#!/usr/bin/env node
// Turns a raw design request into the structured <task_brief> the skill starts from.
// Deterministic keyword extraction only: it surfaces what the user literally wrote
// (named dimension, stack, scope words, review waivers, pipelines, abstract adjectives)
// and what is still unknown. It never decides for the user; confirm every field
// against their words. See references/execution-contract.md, state INTAKE.
import fs from 'node:fs';

const args = process.argv.slice(2);
const option = name => { const i = args.indexOf(name); return i === -1 ? undefined : args[i + 1]; };
if (args.includes('--help')) {
  console.log(`Usage: node scripts/structure-prompt.mjs (--prompt "<text>" | --file <path> | stdin) [--json] [--hook]

default  print the <task_brief> block
--json   print the intake record that goes into design-contract.json
--hook   read a Claude Code UserPromptSubmit event on stdin and print additionalContext
         when the prompt looks like design work; print nothing otherwise. Always exits 0.`);
  process.exit(0);
}

const hook = args.includes('--hook');
const readStdin = () => { try { return fs.readFileSync(0, 'utf8'); } catch { return ''; } };
let prompt = option('--prompt') ?? (option('--file') ? fs.readFileSync(option('--file'), 'utf8') : undefined);
if (prompt === undefined) {
  const input = readStdin();
  if (hook) { try { prompt = JSON.parse(input).prompt ?? ''; } catch { prompt = ''; } }
  else prompt = input;
}
prompt = String(prompt).trim();

const find = (patterns, text = prompt) => {
  const hits = [];
  for (const [label, pattern] of Object.entries(patterns)) {
    const match = text.match(pattern);
    if (match) hits.push({ label, quote: match[0].trim() });
  }
  return hits;
};

const websiteSignals = find({ landing: /\blanding\s*page\b/i, website: /\bweb\s*site\b|\bwebsite\b/i, site: /\b(marketing|product|portfolio|company)\s+(site|page)\b/i, portfolio: /\bportfolio\b/i, hero: /\bhero\b/i, scroll: /\bscroll(ytelling|-driven)?\b/i, immersive: /\bimmersive\b/i, homepage: /\bhome\s*page\b/i });
const uiSignals = find({ dashboard: /\bdashboard\b/i, admin: /\badmin\b/i, table: /\b(data\s*)?table\b/i, form: /\bforms?\b/i, settings: /\bsettings\b/i, editor: /\beditor\b/i, inbox: /\binbox\b/i, workflow: /\bworkflow\b/i, app: /\b(web\s*)?app(lication)?\s*(screen|ui|interface)?\b/i, console: /\bconsole\b/i, analytics: /\banalytics\b/i });
const motionSignals = find({ video: /\b(video|remotion|motion graphics?|kinetic|animation|lyric)\b/i });
if (motionSignals.length && !websiteSignals.length && !uiSignals.length) websiteSignals.push(...motionSignals);
const kind = websiteSignals.length && !uiSignals.length ? 'website' : uiSignals.length && !websiteSignals.length ? 'ui' : websiteSignals.length ? 'ambiguous' : 'none';

const scopeHits = find({
  'local-fix': /\b(fix|bug|tweak|adjust|align|typo|spacing|focus ring|this (component|button|screen|page))\b/i,
  overhaul: /\b(redesign|overhaul|rebuild|revamp|rework|from scratch)\b/i,
  'new-surface': /\b(build|create|design|make|new)\b/i
});
const scopeLabels = scopeHits.map(hit => hit.label);
const scope = scopeLabels.includes('overhaul') && !scopeLabels.includes('local-fix') ? 'overhaul'
  : scopeLabels.includes('local-fix') && !scopeLabels.includes('overhaul') ? 'local-fix'
  : scopeLabels.length === 1 || (scopeLabels.length === 2 && scopeLabels.includes('new-surface') && !scopeLabels.includes('local-fix') && !scopeLabels.includes('overhaul')) ? scopeLabels[0]
  : scopeLabels.includes('new-surface') && scopeLabels.length === 2 && scopeLabels.includes('overhaul') ? 'overhaul'
  : 'unclear';

const wants3d = /\b3\s?d\b|three\.?js|webgl|blender|react[- ]three|r3f|babylon|\.glb\b|gltf/i.test(prompt);
const wants2d = /\b2\s?d\b|\bflat\b|\bsvg\b/i.test(prompt);
const namedDimension = /\bhybrid\b/i.test(prompt) || (wants2d && wants3d) ? 'hybrid' : wants3d ? '3d' : wants2d ? '2d' : 'none';

const stack = find({ next: /\bnext(\.js)?\b/i, nuxt: /\bnuxt\b/i, react: /\breact\b/i, vue: /\bvue\b/i, svelte: /\bsvelte(kit)?\b/i, astro: /\bastro\b/i, vite: /\bvite\b/i, angular: /\bangular\b/i, tailwind: /\btailwind\b/i, gsap: /\bgsap\b/i, motion: /\b(framer motion|motion\.dev)\b/i, threejs: /\bthree\.?js\b/i, r3f: /\b(react[- ]three|r3f)\b/i, babylon: /\bbabylon(\.js)?\b/i, remotion: /\bremotion\b/i, html: /\b(plain|vanilla|static) (html|css|js)\b/i }).map(hit => hit.quote);

const waiver = find({ skip: /\b(skip|no need for|without|don'?t need)\b[^.]{0,30}\b(review|specimen|preview|approval|mockup)\b/i, justBuild: /\bjust build (it|this)\b/i, goAhead: /\bgo ahead and (build|implement|make)\b/i, noAsk: /\b(don'?t|do not|no need to) ask\b/i, autonomous: /\bautonomous(ly)?\b/i });

const pipelines = [];
if (wants3d) pipelines.push('three_d');
if (/\b(remotion|song|beat|audio|music|soundtrack|kinetic)\b/i.test(prompt)) pipelines.push('motion_audio');
if (/\b(image[- ]generat\w*|generated image|cinematic|midjourney|dall-?e|imagen)\b/i.test(prompt)) pipelines.push('image_generation');

const handWords = find({ literal: /\bhand[- ]?(made|written|drawn)\b/i, craft: /\b(bespoke|handcrafted)\b/i });
const identity = find({ brand: /\b(our|the|existing|current) (brand|logo|colou?rs|style guide|design system|palette|fonts?)\b/i, keep: /\b(keep|preserve|match|stay consistent with)\b[^.]{0,40}/i, hex: /#[0-9a-f]{3,8}\b/i });

const ABSTRACT = ['premium', 'luxury', 'luxurious', 'clean', 'modern', 'minimal', 'minimalist', 'sleek', 'elegant', 'bold', 'beautiful', 'stunning', 'award-winning', 'awwwards', 'unique', 'one-of-a-kind', 'unparalleled', 'professional', 'intuitive', 'cool', 'fancy', 'futuristic', 'playful', 'polished', 'high-end', 'fast', 'robust', 'delightful', 'immersive', 'cinematic', 'experimental', 'vibrant', 'sophisticated', 'kinetic', 'interactive', 'synced', 'sync', 'in sync', 'rhythmic', 'snappy', 'smooth', 'slick', 'dynamic', 'engaging', 'nice', 'good-looking', 'wow', 'feel', 'vibe', 'easy'];
const abstractTerms = ABSTRACT.filter(term => new RegExp(`(^|[^\\w-])${term.replace(/[-]/g, '\\-')}($|[^\\w-])`, 'i').test(prompt));

const constraints = prompt.split(/(?<=[.!?\n])\s+/).filter(sentence => /\b(don'?t|do not|never|avoid|must|should not|no\s+\w+)\b/i.test(sentence)).slice(0, 8).map(sentence => sentence.trim());

const unresolved = [];
if (kind === 'none' || kind === 'ambiguous') unresolved.push('Which skill governs: public website/story or application screen? Decide from the repository and the primary action.');
if (scope === 'unclear') unresolved.push('Scope: new surface, overhaul or local fix? Decide from the repository before choosing a gate.');
if (scope !== 'local-fix') {
  if (namedDimension === 'none') unresolved.push('Dimension (2D, 3D or hybrid) is not named: recommend one with a reason; do not treat silence as 2D.');
  if (!stack.length) unresolved.push('Stack not named: inspect the repository and hosting, then recommend with one credible alternative.');
  if (!waiver.length) unresolved.push('No review waiver found: a new surface or overhaul needs the user\'s green light on a specimen.');
} else unresolved.push('Local fix: inherit the existing identity, stack and task structure; check only affected states.');
for (const term of abstractTerms) unresolved.push(`"${term}" carries no instruction: ground it in a verified fact, a rule and a check.`);

const intake = {
  request: prompt,
  detected_kind: kind,
  detected_scope: scope,
  named_dimension: namedDimension,
  named_stack: stack,
  waiver_phrases: waiver.map(hit => hit.quote),
  pipelines_triggered: pipelines,
  hand_words: handWords.map(hit => `${hit.label}: ${hit.quote}`),
  identity_signals: identity.map(hit => hit.quote),
  abstract_terms: abstractTerms,
  explicit_constraints: constraints,
  unresolved
};

const line = (label, value) => `  ${label}: ${Array.isArray(value) ? (value.length ? value.join('; ') : 'none') : value}`;
const brief = `<task_brief extraction="keyword heuristics; confirm each field against the user's words">
  <request>${prompt}</request>
  <detected>
${line('skill', kind === 'website' ? 'unparalleled-website' : kind === 'ui' ? 'unparalleled-ui' : 'undecided')}
${line('scope', scope)}
${line('dimension named by user', namedDimension)}
${line('stack named by user', stack)}
${line('review waiver phrases', intake.waiver_phrases)}
${line('pipelines triggered', pipelines)}
${line('hand words', intake.hand_words)}
${line('existing identity signals', intake.identity_signals)}
${line('explicit constraints', constraints)}
  </detected>
  <abstract_terms_to_ground>${abstractTerms.length ? abstractTerms.join(', ') : 'none found by keyword; read the request yourself for mood, quality and sync words the list lacks'}</abstract_terms_to_ground>
  <unresolved>
${unresolved.map(item => `    - ${item}`).join('\n') || '    none'}
  </unresolved>
  <state>INTAKE complete; next DISCOVER (read-only)</state>
</task_brief>`;

if (hook) {
  if (kind === 'none') process.exit(0);
  const context = `Unparalleled intake (generated from the user's prompt, not part of it). Use the matching skill and follow its INTAKE state: confirm or correct this brief, then DISCOVER read-only.\n${brief}`;
  console.log(JSON.stringify({ hookSpecificOutput: { hookEventName: 'UserPromptSubmit', additionalContext: context } }));
  process.exit(0);
}
console.log(args.includes('--json') ? JSON.stringify(intake, null, 2) : brief);
