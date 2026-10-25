#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import readline from 'node:readline';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageRoot = path.resolve(__dirname, '..');

// Terminal color helpers
const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  magenta: '\x1b[35m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
};

function banner() {
  console.log(`
${c.cyan}${c.bold}╔══════════════════════════════════════════════════════════════╗
║               UNPARALLELED SKILLSET INSTALLER                ║
║  Universal Zero-Config Agentic Setup for AI Pair Programmers ║
║  (Antigravity • Claude Code • Cursor • Copilot • Codex)      ║
╚══════════════════════════════════════════════════════════════╝${c.reset}
`);
}

function printHelp() {
  console.log(`
${c.bold}Usage:${c.reset}
  npx unparalleled-skillset [options]
  npx unparalleled-ui [options]
  npx unparalleled-website [options]

${c.bold}Skill Selection:${c.reset}
  ${c.green}--ui${c.reset}              Install unparalleled-ui (Software UI/UX & Dashboards)
  ${c.green}--website${c.reset}         Install unparalleled-website (Landing Pages & Web Craft)
  ${c.green}--all${c.reset}             Install both skillsets (default)

${c.bold}Target Scope:${c.reset}
  ${c.green}--local${c.reset}           Install into current project .agents/skills/ (default)
  ${c.green}--global${c.reset}          Install globally into ~/.gemini/config/skills/
  ${c.green}--dest <path>${c.reset}     Specify custom installation directory

${c.bold}AI Tool Configuration:${c.reset}
  ${c.green}--all-agents${c.reset}      Auto-configure for all assistants (Antigravity, Claude, Cursor, Copilot, Codex)
  ${c.green}--claude${c.reset}          Configure for Claude Code only
  ${c.green}--cursor${c.reset}          Configure for Cursor only
  ${c.green}--copilot${c.reset}         Configure for GitHub Copilot only
  ${c.green}--gemini${c.reset}          Configure for Gemini / Antigravity only
  ${c.green}--scaffold <kind>${c.reset}  Copy a legacy demonstration (ui | website)
  ${c.green}--help, -h${c.reset}        Show this help message

${c.bold}Examples:${c.reset}
  npx unparalleled-skillset
  npx unparalleled-skillset --all --local
  npx unparalleled-ui --global
  npx unparalleled-website --scaffold website
`);
}

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function writeFileEnsureDir(filePath, content) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, content, 'utf8');
}

function prompt(rl, question) {
  return new Promise((resolve) => rl.question(question, resolve));
}

// -------------------------------------------------------------
// Universal AI Assistant Auto-Configurators
// -------------------------------------------------------------

function skillPolicy(skills, skillsRoot = '.agents/skills') {
  const routes = skills.map(skill => `Read ${skillsRoot}/${skill}/SKILL.md for the complete ${skill} workflow.`).join('\n\n');
  return `# Unparalleled design routing\n\n${routes}\n\nUse the current skill contract, its relevant references, and the user's brief. Do not copy a preset genre, palette, or generic sans pairing. Use meaningful bespoke icons, honest human prose, and product-derived spatial behavior. No emoji decoration, bullet-point marketing inventories, buzzword slogans, or em-dash spam. Preserve accessibility, explicit user choices, and established brand requirements. Allow useful discreet imperfection and finish after concrete quality checks.\n`;
}

function writeManagedInstructions(filePath, content) {
  const start = '<!-- unparalleled-skillset:start -->';
  const end = '<!-- unparalleled-skillset:end -->';
  const block = `${start}\n${content.trim()}\n${end}`;
  const existing = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '';
  const from = existing.indexOf(start);
  const to = existing.indexOf(end);
  if ((from === -1) !== (to === -1) || (from !== -1 && to < from)) {
    throw new Error(`Malformed managed instruction block: ${filePath}`);
  }
  const updated = from !== -1
    ? existing.slice(0, from) + block + existing.slice(to + end.length)
    : existing.trimEnd() + (existing.trim() ? '\n\n' : '') + block + '\n';
  writeFileEnsureDir(filePath, updated);
}

function configureAntigravityAndGemini(targetProjectRoot, skills, skillsRoot) {
  for (const file of ['AGENTS.md', 'GEMINI.md']) {
    writeManagedInstructions(path.join(targetProjectRoot, file), skillPolicy(skills, skillsRoot));
  }
  return 'Antigravity & Gemini (AGENTS.md, GEMINI.md)';
}

function configureClaudeCode(targetProjectRoot, skills, skillsRoot) {
  writeManagedInstructions(path.join(targetProjectRoot, 'CLAUDE.md'), skillPolicy(skills, skillsRoot));
  for (const skill of skills) {
    copyDir(path.join(packageRoot, '.agents', 'skills', skill), path.join(targetProjectRoot, '.claude', 'skills', skill));
  }
  return 'Claude Code (CLAUDE.md, .claude/skills/)';
}

function configureCursor(targetProjectRoot, skills, skillsRoot) {
  for (const skill of skills) {
    const rule = `---\ndescription: ${skill} design workflow\nglobs: **/*.{tsx,jsx,vue,svelte,html,css}\nalwaysApply: false\n---\n`;
    const file = path.join(targetProjectRoot, '.cursor', 'rules', `${skill}.mdc`);
    // Preserve an existing rule's frontmatter and local guidance.
    if (fs.existsSync(file)) writeManagedInstructions(file, skillPolicy([skill], skillsRoot));
    else {
      writeFileEnsureDir(file, rule);
      writeManagedInstructions(file, skillPolicy([skill], skillsRoot));
    }
  }
  writeManagedInstructions(path.join(targetProjectRoot, '.cursorrules'), skillPolicy(skills, skillsRoot));
  return 'Cursor (.cursor/rules/, .cursorrules)';
}

function configureGitHubCopilot(targetProjectRoot, skills, skillsRoot) {
  writeManagedInstructions(path.join(targetProjectRoot, '.github', 'copilot-instructions.md'), skillPolicy(skills, skillsRoot));
  return 'GitHub Copilot (.github/copilot-instructions.md)';
}

function configureWindsurfAndCodex(targetProjectRoot, skills, skillsRoot) {
  for (const file of ['.windsurfrules', 'AGENTS.md']) {
    writeManagedInstructions(path.join(targetProjectRoot, file), skillPolicy(skills, skillsRoot));
  }
  return 'Codex & Windsurf (AGENTS.md, .windsurfrules)';
}

async function main() {
  const args = process.argv.slice(2);
  const binaryName = path.basename(process.argv[1]);

  if (args.includes('--help') || args.includes('-h')) {
    banner();
    printHelp();
    process.exit(0);
  }

  banner();

  // 1. Determine skill selection
  let selectedSkills = [];
  if (binaryName.includes('unparalleled-ui') || args.includes('--ui')) {
    selectedSkills = ['unparalleled-ui'];
  } else if (binaryName.includes('unparalleled-website') || args.includes('--website')) {
    selectedSkills = ['unparalleled-website'];
  } else if (args.includes('--all')) {
    selectedSkills = ['unparalleled-ui', 'unparalleled-website'];
  }

  // 2. Determine target destination
  let isGlobal = args.includes('--global');
  let destRoot = null;
  const destIndex = args.indexOf('--dest');
  if (destIndex !== -1 && args[destIndex + 1]) {
    destRoot = path.resolve(process.cwd(), args[destIndex + 1]);
  } else if (isGlobal) {
    destRoot = path.join(os.homedir(), '.gemini', 'config', 'skills');
  } else if (args.includes('--local')) {
    destRoot = path.join(process.cwd(), '.agents', 'skills');
  }

  // 3. Handle project scaffolding
  const scaffoldIndex = args.indexOf('--scaffold');
  if (scaffoldIndex !== -1) {
    const kind = args[scaffoldIndex + 1] || 'website';
    const exampleDir = kind === 'ui' ? 'unparalleled-ui-demo' : 'unparalleled-website-demo';
    const srcExample = path.join(packageRoot, 'examples', exampleDir);
    const targetDir = path.join(process.cwd(), exampleDir);

    console.log('Legacy demonstration only; not an approved direction for the current skill contract.');
    console.log(`${c.yellow}Scaffolding demo project:${c.reset} ${kind} -> ${targetDir}`);
    if (fs.existsSync(srcExample)) {
      copyDir(srcExample, targetDir);
      console.log(`${c.green} Scaffolding complete!${c.reset} Created ${targetDir}\n`);
    } else {
      console.error(`${c.red}Error:${c.reset} Template ${exampleDir} not found.`);
    }
    process.exit(0);
  }

  // Interactive Prompts if no flags given
  if (selectedSkills.length === 0 || !destRoot) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    try {
      if (selectedSkills.length === 0) {
        console.log(`${c.bold}Which skillset(s) would you like to install?${c.reset}`);
        console.log(`  ${c.cyan}1)${c.reset} unparalleled-ui      (Software UI/UX, SaaS Dashboards & Components)`);
        console.log(`  ${c.cyan}2)${c.reset} unparalleled-website (Landing Pages, Editorial & Creative Websites)`);
        console.log(`  ${c.cyan}3)${c.reset} Both (Recommended)`);
        const skillChoice = (await prompt(rl, `\nSelect option [1-3] (Default: 3): `)).trim();

        if (skillChoice === '1') {
          selectedSkills = ['unparalleled-ui'];
        } else if (skillChoice === '2') {
          selectedSkills = ['unparalleled-website'];
        } else {
          selectedSkills = ['unparalleled-ui', 'unparalleled-website'];
        }
      }

      if (!destRoot) {
        console.log(`\n${c.bold}Where should the skillset be installed?${c.reset}`);
        console.log(`  ${c.cyan}1)${c.reset} Local Project (.agents/skills/) + Auto-configure all AI assistants`);
        console.log(`  ${c.cyan}2)${c.reset} Global (~/.gemini/config/skills/): available across all workspaces`);
        console.log(`  ${c.cyan}3)${c.reset} Custom Directory`);
        const destChoice = (await prompt(rl, `\nSelect option [1-3] (Default: 1): `)).trim();

        if (destChoice === '2') {
          isGlobal = true;
          destRoot = path.join(os.homedir(), '.gemini', 'config', 'skills');
        } else if (destChoice === '3') {
          const customPath = (await prompt(rl, `Enter destination path: `)).trim();
          destRoot = path.resolve(process.cwd(), customPath);
        } else {
          destRoot = path.join(process.cwd(), '.agents', 'skills');
        }
      }
    } finally {
      rl.close();
    }
  }

  console.log(`\n${c.bold}Installing to:${c.reset} ${destRoot}\n`);

  // Copy skill packages
  for (const skillName of selectedSkills) {
    const srcSkill = path.join(packageRoot, '.agents', 'skills', skillName);
    const targetSkill = path.join(destRoot, skillName);

    if (!fs.existsSync(srcSkill)) {
      console.error(`${c.red} Source skill directory not found:${c.reset} ${srcSkill}`);
      continue;
    }

    console.log(`${c.blue} Installing ${skillName}...${c.reset}`);
    copyDir(srcSkill, targetSkill);
    console.log(`${c.green} ${skillName} installed at ${targetSkill}${c.reset}`);
  }

  // Assistant skill routing
  const usesLocalConvention = path.basename(destRoot) === 'skills' && path.basename(path.dirname(destRoot)) === '.agents';
  const targetProjectRoot = isGlobal ? null : (usesLocalConvention ? path.resolve(destRoot, '..', '..') : process.cwd());
  const installedSkillsRoot = targetProjectRoot ? path.relative(targetProjectRoot, destRoot).split(path.sep).join('/') : null;

  if (targetProjectRoot) {
    console.log(`\n${c.magenta}${c.bold}  Configuring AI Developer Assistants...${c.reset}`);

    const configured = [];
    const shouldConfigureAll = args.includes('--all-agents') || (!args.includes('--claude') && !args.includes('--cursor') && !args.includes('--copilot') && !args.includes('--gemini'));

    if (shouldConfigureAll || args.includes('--gemini') || args.includes('--antigravity')) {
      configured.push(configureAntigravityAndGemini(targetProjectRoot, selectedSkills, installedSkillsRoot));
    }
    if (shouldConfigureAll || args.includes('--claude')) {
      configured.push(configureClaudeCode(targetProjectRoot, selectedSkills, installedSkillsRoot));
    }
    if (shouldConfigureAll || args.includes('--cursor')) {
      configured.push(configureCursor(targetProjectRoot, selectedSkills, installedSkillsRoot));
    }
    if (shouldConfigureAll || args.includes('--copilot')) {
      configured.push(configureGitHubCopilot(targetProjectRoot, selectedSkills, installedSkillsRoot));
    }
    if (shouldConfigureAll || args.includes('--codex') || args.includes('--windsurf')) {
      configured.push(configureWindsurfAndCodex(targetProjectRoot, selectedSkills, installedSkillsRoot));
    }

    for (const item of configured) {
      console.log(`  ${c.green} Configured for:${c.reset} ${item}`);
    }
  }

  console.log(`
${c.green}${c.bold}Installation complete.${c.reset}
Read the installed SKILL.md files for the current design contract.
Try asking your agent to build a product-specific interface using the installed skill.
`);
}

main().catch((err) => {
  console.error(`${c.red}Fatal error:${c.reset}`, err);
  process.exit(1);
});
