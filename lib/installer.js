import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { AGENTS, detectAgents, environment, nativeSkillRoots } from './agents.js';

export const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const packageInfo = JSON.parse(fs.readFileSync(path.join(packageRoot, 'package.json'), 'utf8'));
export const skillNames = ['unparalleled-ui', 'unparalleled-website'];
const start = '<!-- unparalleled-skillset:start -->';
const end = '<!-- unparalleled-skillset:end -->';

export function skillPolicy(skills, skillsRoot) {
  const routes = skills.map(skill => `Read ${skillsRoot}/${skill}/SKILL.md for the complete ${skill} workflow.`).join('\n\n');
  return `# Unparalleled design routing\n\n${routes}\n\nFollow the user's brief and the full skill contract. A sufficient brief supports decisive end-to-end work without a forced interview or aesthetic vote. Use the standalone craft foundation to connect product truth, original composition, authored assets, useful signature behavior, and the complete working path. Preserve existing brand commitments, accessibility, and honest data. Use meaningful bespoke icons, distinctive readable type, and human writing. No emoji decoration, bullet-point marketing inventories, stock genre/palette recipes, generic sans defaults, buzzword slogans, or em-dash spam. No card grids, kanban lanes, pill shapes, generic SaaS color, or neon unless the user asks. Read "bespoke" and "handcrafted" as precise product-specific craft, not handwriting; honor a named 2D or 3D dimension. Run the skill's screenshot loop with a Playwright tool or its capture script, and fix what the screenshots show. Keep useful discreet imperfection and finish after concrete checks.\n`;
}

export function managedInstructions(existing, content, filePath = 'instructions') {
  const starts = existing.split(start).length - 1;
  const ends = existing.split(end).length - 1;
  const from = existing.indexOf(start), to = existing.indexOf(end);
  if (starts !== ends || starts > 1 || (starts && to < from)) throw new Error(`Malformed managed instruction block: ${filePath}`);
  const block = `${start}\n${content.trim()}\n${end}`;
  return starts
    ? existing.slice(0, from) + block + existing.slice(to + end.length)
    : existing + (existing && !existing.endsWith('\n\n') ? (existing.endsWith('\n') ? '\n' : '\n\n') : '') + block + '\n';
}

function readFile(file) {
  try { return fs.readFileSync(file); }
  catch (error) { if (error.code === 'ENOENT') return null; throw error; }
}
function contained(file, parent) {
  const relative = path.relative(parent, file);
  return relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative));
}
function assertWritePath(file, boundary) {
  // Do not follow an installed skill or instruction symlink outside its declared install scope.
  if (!contained(file, boundary)) throw new Error(`Destination is outside its declared scope: ${file}`);
  for (let current = file; ; current = path.dirname(current)) {
    try {
      if (fs.lstatSync(current).isSymbolicLink()) throw new Error(`Refusing to overwrite a linked destination: ${current}. Choose a real destination or remove the link explicitly.`);
    } catch (error) { if (error.code !== 'ENOENT') throw error; }
    if (current === boundary) break;
  }
}

function planBuilder() {
  const writes = new Map();
  function add(file, content, boundary) {
    writes.set(path.resolve(file), { content: Buffer.isBuffer(content) ? content : Buffer.from(content), boundary: path.resolve(boundary) });
  }
  function copyTree(source, destination, boundary) {
    if (!fs.statSync(source).isDirectory()) throw new Error(`Missing source directory: ${source}`);
    for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
      const from = path.join(source, entry.name), to = path.join(destination, entry.name);
      if (entry.isDirectory()) copyTree(from, to, boundary);
      else if (entry.isFile()) add(to, fs.readFileSync(from), boundary);
      else throw new Error(`Unexpected link or special file in packaged skill: ${from}`);
    }
  }
  function instructions(file, content, boundary, initial = '') {
    const existing = writes.get(file)?.content.toString('utf8') ?? readFile(file)?.toString('utf8') ?? initial;
    add(file, managedInstructions(existing, content, file), boundary);
  }
  function changes() {
    return [...writes].flatMap(([file, value]) => {
      assertWritePath(file, value.boundary);
      const previous = readFile(file);
      if (previous?.equals(value.content)) return [];
      return [{ file, ...value, previous }];
    });
  }
  return { add, copyTree, instructions, changes };
}

function commitPlan(changes, stateDir, dryRun) {
  if (dryRun) return { files: changes.map(({ file, previous }) => ({ path: file, action: previous ? 'update' : 'create' })), backupDir: null };
  const replacing = changes.filter(change => change.previous);
  let backupDir = null;
  if (replacing.length) {
    backupDir = path.join(stateDir, 'backups', `${Date.now()}-${crypto.randomBytes(4).toString('hex')}`);
    assertWritePath(backupDir, stateDir);
    fs.mkdirSync(backupDir, { recursive: true });
    const entries = [];
    replacing.forEach((change, i) => {
      const name = `${String(i).padStart(4, '0')}-${path.basename(change.file)}`;
      fs.writeFileSync(path.join(backupDir, name), change.previous);
      entries.push({ original: change.file, backup: name });
    });
    fs.writeFileSync(path.join(backupDir, 'manifest.json'), JSON.stringify(entries, null, 2) + '\n');
  }
  const applied = [];
  try {
    for (const change of changes) {
      fs.mkdirSync(path.dirname(change.file), { recursive: true });
      applied.push(change);
      fs.writeFileSync(change.file, change.content);
    }
  } catch (error) {
    for (const change of applied.reverse()) {
      if (change.previous) fs.writeFileSync(change.file, change.previous);
      else if (fs.existsSync(change.file)) fs.unlinkSync(change.file);
    }
    throw new Error(`Installation failed and changed files were rolled back: ${error.message}`);
  }
  return { files: changes.map(({ file, previous }) => ({ path: file, action: previous ? 'update' : 'create' })), backupDir };
}

export function install(options = {}, overrides = {}) {
  const context = environment(overrides);
  const global = Boolean(options.global);
  if (global && options.dest) throw new Error('--global and --dest cannot be combined.');
  const requested = options.skills ?? skillNames;
  if (!requested.length || requested.some(name => !skillNames.includes(name))) throw new Error('Choose ui, website, or all.');
  const stateBase = global ? context.homeDir : context.projectDir;
  const stateDir = path.join(stateBase, '.agents/unparalleled');
  const manifestFile = path.join(stateDir, 'install.json');
  const previous = readFile(manifestFile);
  let manifest = {};
  if (previous) {
    try { manifest = JSON.parse(previous.toString('utf8')); }
    catch { throw new Error(`Cannot read installation manifest: ${manifestFile}`); }
    if (manifest.schemaVersion !== 1 || !Array.isArray(manifest.skills)) throw new Error(`Unsupported installation manifest: ${manifestFile}`);
  }
  const canonicalRoot = options.dest ? path.resolve(context.projectDir, options.dest) : path.join(stateBase, '.agents/skills');
  const names = skillNames.filter(name => requested.includes(name) || manifest.skills?.includes(name) || fs.existsSync(path.join(canonicalRoot, name, 'SKILL.md')));
  const available = detectAgents(context);
  let selected;
  if (options.noConfig) selected = [];
  else if (options.allAgents) selected = available;
  else if (options.agents?.length) {
    for (const id of options.agents) if (!AGENTS.some(a => a.id === id)) throw new Error(`Unknown agent '${id}'. Run unparalleled agents for supported names.`);
    selected = available.filter(agent => options.agents.includes(agent.id));
  } else selected = available.filter(agent => agent.detected);
  const plan = planBuilder();
  const canonicalBoundary = options.dest ? canonicalRoot : stateBase;
  for (const name of names) plan.copyTree(path.join(packageRoot, '.agents/skills', name), path.join(canonicalRoot, name), canonicalBoundary);
  for (const agent of selected) {
    for (const destination of nativeSkillRoots(agent, global, context)) {
      if (path.resolve(destination) === canonicalRoot) continue;
      const nativeBoundary = global && !contained(destination, context.homeDir) ? context.configDir : stateBase;
      for (const name of names) plan.copyTree(path.join(packageRoot, '.agents/skills', name), path.join(destination, name), nativeBoundary);
    }
  }
  const instructionsRoot = path.relative(context.projectDir, canonicalRoot).split(path.sep).join('/') || '.';
  const policy = skillPolicy(names, instructionsRoot);
  if (!global && !options.noConfig) {
    plan.instructions(path.join(context.projectDir, 'AGENTS.md'), policy, stateBase);
    for (const agent of selected) {
      const files = { claude: ['CLAUDE.md'], gemini: ['GEMINI.md'], antigravity: ['GEMINI.md'], cursor: ['.cursorrules'], copilot: ['.github/copilot-instructions.md'], windsurf: ['.windsurfrules'] }[agent.id] || [];
      for (const file of files) plan.instructions(path.join(context.projectDir, file), policy, stateBase);
      if (agent.id === 'cursor') {
        for (const name of names) {
          const file = path.join(context.projectDir, '.cursor/rules', `${name}.mdc`);
          const frontmatter = `---\ndescription: ${name} design workflow\nglobs: **/*.{tsx,jsx,vue,svelte,html,css}\nalwaysApply: false\n---\n`;
          plan.instructions(file, skillPolicy([name], instructionsRoot), stateBase, frontmatter);
        }
      }
    }
  }
  const configuredAgents = [...new Set([...(Array.isArray(manifest.agents) ? manifest.agents : []), ...selected.map(agent => agent.id)])].sort();
  plan.add(manifestFile, JSON.stringify({ schemaVersion: 1, package: packageInfo.name, version: packageInfo.version, scope: global ? 'global' : 'project', canonicalRoot, skills: names, agents: configuredAgents }, null, 2) + '\n', stateBase);
  const changes = plan.changes();
  const result = commitPlan(changes, stateDir, options.dryRun);
  return { ...result, dryRun: Boolean(options.dryRun), scope: global ? 'global' : 'project', canonicalRoot, skills: names, agents: selected.map(({ id, name, detected, evidence }) => ({ id, name, detected, evidence })) };
}

export function scaffold(kind, options = {}, overrides = {}) {
  if (!['ui', 'website'].includes(kind)) throw new Error('Choose scaffold ui or scaffold website.');
  const context = environment(overrides);
  const name = `unparalleled-${kind}-demo`;
  const plan = planBuilder();
  plan.copyTree(path.join(packageRoot, 'examples', name), path.join(context.projectDir, name), context.projectDir);
  return { ...commitPlan(plan.changes(), path.join(context.projectDir, '.agents/unparalleled'), options.dryRun), destination: path.join(context.projectDir, name) };
}
