import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

// Native discovery locations, verified against vendor documentation in docs/installation.md.
export const AGENTS = [
  { id: 'codex', name: 'Codex', commands: ['codex'], markers: ['.codex'], project: '.agents/skills', global: ['.agents/skills'] },
  { id: 'claude', name: 'Claude Code', commands: ['claude'], markers: ['.claude'], project: '.claude/skills', global: ['.claude/skills'] },
  { id: 'cursor', name: 'Cursor', commands: ['cursor', 'cursor-agent'], markers: ['.cursor'], app: 'Cursor', project: '.cursor/skills', global: ['.cursor/skills'] },
  { id: 'copilot', name: 'GitHub Copilot', commands: ['copilot'], markers: ['.copilot'], extensions: ['github.copilot', 'github.copilot-chat'], project: '.github/skills', global: ['.copilot/skills'] },
  { id: 'gemini', name: 'Gemini CLI', commands: ['gemini'], markers: ['.gemini'], project: '.gemini/skills', global: ['.gemini/skills'] },
  { id: 'antigravity', name: 'Antigravity', commands: ['antigravity', 'agy'], markers: ['.antigravity'], app: 'Antigravity', project: '.agents/skills', global: ['.gemini/config/skills', '.gemini/antigravity-cli/skills'] },
  { id: 'windsurf', name: 'Windsurf', commands: ['windsurf'], markers: ['.windsurf', '.codeium/windsurf'], app: 'Windsurf', project: '.windsurf/skills', global: ['.codeium/windsurf/skills'] },
  { id: 'devin', name: 'Devin', commands: ['devin'], markers: ['.devin'], config: 'devin', app: 'Devin', project: '.devin/skills', globalConfig: 'devin/skills' },
  { id: 'opencode', name: 'OpenCode', commands: ['opencode'], markers: ['.opencode'], config: 'opencode', project: '.opencode/skills', globalConfig: 'opencode/skills' },
  { id: 'cline', name: 'Cline', commands: ['cline'], markers: ['.cline', '.clinerules'], extensions: ['saoudrizwan.claude-dev'], project: '.cline/skills', global: ['.cline/skills'] },
  { id: 'roo', name: 'Roo Code', commands: ['roo'], markers: ['.roo'], extensions: ['rooveterinaryinc.roo-cline'], project: '.roo/skills', global: ['.roo/skills'] },
  { id: 'kiro', name: 'Kiro', commands: ['kiro', 'kiro-cli'], markers: ['.kiro'], app: 'Kiro', project: '.kiro/skills', global: ['.kiro/skills'] },
];

export function environment(overrides = {}) {
  const env = overrides.env ?? process.env;
  const homeDir = path.resolve(overrides.homeDir ?? os.homedir());
  return {
    env, homeDir,
    projectDir: path.resolve(overrides.projectDir ?? process.cwd()),
    platform: overrides.platform ?? process.platform,
    configDir: path.resolve(overrides.configDir ?? env.XDG_CONFIG_HOME ?? path.join(homeDir, '.config')),
  };
}

function exists(location) { return fs.existsSync(location); }
function executable(command, context) {
  const separator = context.platform === 'win32' ? ';' : path.delimiter;
  const suffixes = context.platform === 'win32'
    ? ['', ...(context.env.PATHEXT || '.EXE;.CMD;.BAT').split(';')]
    : [''];
  for (const directory of (context.env.PATH || '').split(separator).filter(Boolean)) {
    for (const suffix of suffixes) {
      for (const ending of new Set([suffix, suffix.toLowerCase()])) {
        const file = path.join(directory.replace(/^"|"$/g, ''), command + ending);
        try {
          if (!fs.statSync(file).isFile()) continue;
          fs.accessSync(file, context.platform === 'win32' ? fs.constants.F_OK : fs.constants.X_OK);
          return file;
        } catch { /* A command not on PATH is not a detection failure. */ }
      }
    }
  }
}

export function detectAgents(overrides = {}) {
  const context = environment(overrides);
  const extensionRoots = ['.vscode/extensions', '.vscode-insiders/extensions', '.cursor/extensions', '.windsurf/extensions', '.antigravity/extensions']
    .map(dir => path.join(context.homeDir, dir));
  const extensionNames = extensionRoots.flatMap(dir => {
    try { return fs.readdirSync(dir).map(name => ({ dir, name: name.toLowerCase() })); } catch { return []; }
  });
  return AGENTS.map(agent => {
    const evidence = [];
    for (const command of agent.commands) {
      const location = executable(command, context);
      if (location) { evidence.push(`executable: ${location}`); break; }
    }
    for (const marker of agent.markers) {
      for (const base of [context.homeDir, context.projectDir]) {
        const location = path.join(base, marker);
        if (exists(location)) evidence.push(`configuration: ${location}`);
      }
    }
    if (agent.config && exists(path.join(context.configDir, agent.config))) evidence.push(`configuration: ${path.join(context.configDir, agent.config)}`);
    if (agent.id === 'codex' && context.env.CODEX_HOME && exists(context.env.CODEX_HOME)) evidence.push(`CODEX_HOME: ${context.env.CODEX_HOME}`);
    if (agent.id === 'antigravity') {
      for (const marker of ['.gemini/antigravity', '.gemini/antigravity-cli']) {
        if (exists(path.join(context.homeDir, marker))) evidence.push(`configuration: ${path.join(context.homeDir, marker)}`);
      }
    }
    if (agent.id === 'copilot') {
      const existing = path.join(context.projectDir, '.github/copilot-instructions.md');
      if (exists(existing)) evidence.push(`project instructions: ${existing}`);
    }
    if (agent.extensions) {
      const extension = extensionNames.find(entry => agent.extensions.some(prefix => entry.name === prefix || entry.name.startsWith(`${prefix}-`)));
      if (extension) evidence.push(`editor extension: ${path.join(extension.dir, extension.name)}`);
    }
    if (agent.app) {
      const locations = context.platform === 'darwin'
        ? [path.join('/Applications', `${agent.app}.app`), path.join(context.homeDir, 'Applications', `${agent.app}.app`)]
        : context.platform === 'win32'
          ? [context.env.LOCALAPPDATA, context.env.ProgramFiles, context.env['ProgramFiles(x86)']].filter(Boolean)
            .flatMap(base => [path.join(base, 'Programs', agent.app, `${agent.app}.exe`), path.join(base, agent.app, `${agent.app}.exe`)])
          : [path.join(context.configDir, agent.app), path.join(context.configDir, agent.app.toLowerCase())];
      for (const location of locations) if (exists(location)) evidence.push(`application: ${location}`);
    }
    return { ...agent, detected: evidence.length > 0, evidence: [...new Set(evidence)] };
  });
}

export function nativeSkillRoots(agent, global, context) {
  if (!global) return [path.join(context.projectDir, agent.project)];
  return agent.globalConfig
    ? [path.join(context.configDir, agent.globalConfig)]
    : agent.global.map(dir => path.join(context.homeDir, dir));
}
