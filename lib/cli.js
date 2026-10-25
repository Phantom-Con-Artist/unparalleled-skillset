import path from 'node:path';
import { AGENTS, detectAgents, environment } from './agents.js';
import { install, scaffold, packageInfo } from './installer.js';

export const help = `Unparalleled ${packageInfo.version}

Usage:
  npx unparalleled install ui
  npx unparalleled install website
  npx unparalleled install all
  npx unparalleled agents
  npx unparalleled scaffold ui
  npx unparalleled scaffold website

Install configures supported agents detected from executable paths, app/config
folders, project settings, and editor extension directories. No agent commands
are executed and no API keys, trust settings, or permissions are changed.

Options:
  --global              Install across projects in user-level discovery paths
  --local               Install in this project (default)
  --project <path>      Choose the project directory
  --dest <path>         Custom canonical skill directory (project scope only)
  --agent <names>       Configure named agents, comma-separated or repeated
  --all-agents          Configure every supported integration, even if undetected
  --no-config           Copy only the shared skills; skip agent integrations
  --dry-run             Show the plan without writing files
  --json                Print machine-readable detection or installation results
  --yes, -y             Accepted for automation; installation never prompts
  --help, -h            Show help
  --version, -v         Show version

Legacy --ui, --website, --all, --claude, --codex, --cursor, --copilot,
--gemini, --antigravity, --windsurf, and --scaffold flags remain supported.

Supported agents:
  ${AGENTS.map(agent => agent.id).join(', ')}

Example:
  npx unparalleled install website --global
  npx unparalleled install ui --agent claude,codex
  npx unparalleled install all --dry-run

Website prompt:
  Build a website for a neighborhood ceramics studio using unparalleled-website.
  Tell its making story through purposeful 2D/3D interaction, bespoke marks,
  distinctive typography, and honest personal writing.
`;

export function parseArgs(args, binaryName = 'unparalleled') {
  const options = { agents: [] };
  const positionals = [];
  let action;
  const kinds = new Set();
  const choose = value => {
    const name = value === 'web' ? 'website' : value;
    if (['all', 'both'].includes(name)) { kinds.add('ui'); kinds.add('website'); }
    else if (['ui', 'website'].includes(name)) kinds.add(name);
    else throw new Error(`Unknown skill '${value}'. Choose ui, website, or all.`);
  };
  for (let i = 0; i < args.length; i++) {
    let arg = args[i];
    if (['--help', '-h'].includes(arg)) return { action: 'help', options };
    if (['--version', '-v'].includes(arg)) return { action: 'version', options };
    const equal = arg.indexOf('=');
    const flag = equal > 0 ? arg.slice(0, equal) : arg;
    if (['--agent', '--dest', '--project', '--scaffold'].includes(flag)) {
      const value = equal > 0 ? arg.slice(equal + 1) : args[++i];
      if (!value || value.startsWith('-')) throw new Error(`${flag} requires a value.`);
      if (flag === '--agent') {
        const names = value.split(',').map(v => v.trim()).filter(Boolean);
        if (!names.length) throw new Error('--agent requires at least one agent name.');
        options.agents.push(...names);
      }
      else if (flag === '--scaffold') { action = 'scaffold'; options.kind = value; }
      else options[flag.slice(2)] = value;
    } else if (['--global', '--local', '--dry-run', '--json', '--all-agents', '--no-config'].includes(arg)) {
      options[{ '--dry-run': 'dryRun', '--all-agents': 'allAgents', '--no-config': 'noConfig' }[arg] || arg.slice(2)] = true;
    } else if (['--yes', '-y'].includes(arg)) { /* Installation is noninteractive. */ }
    else if (['--ui', '--website', '--all'].includes(arg)) choose(arg.slice(2));
    else if (AGENTS.some(agent => arg === `--${agent.id}`)) options.agents.push(arg.slice(2));
    else if (arg.startsWith('-')) throw new Error(`Unknown option '${arg}'. Run unparalleled --help.`);
    else positionals.push(arg);
  }
  if (options.global && options.local) throw new Error('Choose either --local or --global.');
  if (options.global && options.dest) throw new Error('--global and --dest cannot be combined.');
  if (options.allAgents && options.agents.length) throw new Error('Use --all-agents or --agent, not both.');
  if (options.noConfig && (options.allAgents || options.agents.length)) throw new Error('--no-config cannot be combined with an agent selection.');
  if (!action && ['install', 'agents', 'scaffold'].includes(positionals[0])) action = positionals.shift();
  action ||= 'install';
  if (action === 'scaffold') {
    if (options.global || options.dest) throw new Error('Scaffolds are project-local; use --project to choose a directory.');
    options.kind ||= positionals.shift();
    if (!['ui', 'website'].includes(options.kind)) throw new Error('Choose scaffold ui or scaffold website.');
  } else if (action === 'install') {
    for (const value of positionals.splice(0)) choose(value);
    if (!kinds.size && binaryName.includes('unparalleled-ui')) choose('ui');
    if (!kinds.size && binaryName.includes('unparalleled-website')) choose('website');
    if (!kinds.size) choose('all');
    options.skills = ['ui', 'website'].filter(kind => kinds.has(kind)).map(kind => `unparalleled-${kind}`);
  }
  if (positionals.length) throw new Error(`Unexpected arguments: ${positionals.join(' ')}`);
  options.agents = [...new Set(options.agents)];
  for (const id of options.agents) if (!AGENTS.some(agent => agent.id === id)) throw new Error(`Unknown agent '${id}'. Run unparalleled agents for supported names.`);
  return { action, options };
}

export function runCLI(args = process.argv.slice(2), overrides = {}) {
  const log = overrides.log ?? console.log;
  const { action, options } = parseArgs(args, overrides.binaryName ?? path.basename(process.argv[1] || 'unparalleled'));
  const context = environment(overrides);
  if (options.project) context.projectDir = path.resolve(context.projectDir, options.project);
  if (action === 'help') return log(help);
  if (action === 'version') return log(packageInfo.version);
  if (action === 'agents') {
    const agents = detectAgents(context);
    if (options.json) log(JSON.stringify(agents.map(({ id, name, detected, evidence }) => ({ id, name, detected, evidence })), null, 2));
    else {
      log('Supported agents available or configured on this machine:');
      for (const agent of agents) log(`${agent.detected ? 'Detected' : 'Not detected'}: ${agent.name}${agent.detected ? ` (${agent.evidence.join('; ')})` : ''}`);
    }
    return agents;
  }
  const result = action === 'scaffold' ? scaffold(options.kind, options, context) : install(options, context);
  if (options.json) log(JSON.stringify(result, null, 2));
  else if (action === 'scaffold') log(`${options.dryRun ? 'Would create' : 'Created'} demo: ${result.destination}`);
  else {
    log(`${options.dryRun ? 'Plan' : 'Installed'}: ${result.skills.join(', ')} (${result.scope})`);
    log(`Shared skills: ${result.canonicalRoot}`);
    if (result.agents.length) for (const agent of result.agents) log(`${options.dryRun ? 'Would configure' : 'Configured'}: ${agent.name}${agent.detected ? '' : ' (explicit selection)'}`);
    else if (!options.noConfig) log('No supported agent detected. Shared skills and AGENTS.md are available; use --agent to target an integration explicitly.');
    if (result.backupDir) log(`Previous file contents backed up: ${result.backupDir}`);
    log(`${result.files.length} file${result.files.length === 1 ? '' : 's'} ${options.dryRun ? 'would change' : 'changed'}.`);
    if (!options.dryRun) log('Start a new agent session or refresh its skill list to discover the installed skills.');
  }
  if (options.dryRun && !options.json) for (const file of result.files) log(`${file.action}: ${file.path}`);
  return result;
}
