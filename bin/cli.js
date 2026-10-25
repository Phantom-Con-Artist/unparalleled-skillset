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
║      Distinctive, High-Craft Agentic Skills for UI & Web     ║
╚══════════════════════════════════════════════════════════════╝${c.reset}
`);
}

function printHelp() {
  console.log(`
${c.bold}Usage:${c.reset}
  npx unparalleled-skillset [options]
  npx unparalleled-ui [options]
  npx unparalleled-website [options]

${c.bold}Options:${c.reset}
  ${c.green}--ui${c.reset}              Install unparalleled-ui (Software UI/UX & Dashboards)
  ${c.green}--website${c.reset}         Install unparalleled-website (Landing Pages & Web Craft)
  ${c.green}--all${c.reset}             Install both skillsets (default)
  ${c.green}--local${c.reset}           Install into current project .agents/skills/ (default)
  ${c.green}--global${c.reset}          Install globally into ~/.gemini/config/skills/
  ${c.green}--dest <path>${c.reset}     Specify custom installation directory
  ${c.green}--scaffold <kind>${c.reset}  Scaffold a complete demo project (ui | website)
  ${c.green}--help, -h${c.reset}        Show this help message

${c.bold}Examples:${c.reset}
  npx unparalleled-skillset --all --local
  npx unparalleled-skillset --ui --global
  npx unparalleled-website --scaffold website
`);
}

// Copy directory recursively
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

function prompt(rl, question) {
  return new Promise((resolve) => rl.question(question, resolve));
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

  // Determine skill selection
  let selectedSkills = [];
  if (binaryName.includes('unparalleled-ui') || args.includes('--ui')) {
    selectedSkills = ['unparalleled-ui'];
  } else if (binaryName.includes('unparalleled-website') || args.includes('--website')) {
    selectedSkills = ['unparalleled-website'];
  } else if (args.includes('--all')) {
    selectedSkills = ['unparalleled-ui', 'unparalleled-website'];
  }

  // Determine destination
  let destRoot = null;
  const destIndex = args.indexOf('--dest');
  if (destIndex !== -1 && args[destIndex + 1]) {
    destRoot = path.resolve(process.cwd(), args[destIndex + 1]);
  } else if (args.includes('--global')) {
    destRoot = path.join(os.homedir(), '.gemini', 'config', 'skills');
  } else if (args.includes('--local')) {
    destRoot = path.join(process.cwd(), '.agents', 'skills');
  }

  // Handle scaffolding flag
  const scaffoldIndex = args.indexOf('--scaffold');
  if (scaffoldIndex !== -1) {
    const kind = args[scaffoldIndex + 1] || 'website';
    const exampleDir = kind === 'ui' ? 'unparalleled-ui-demo' : 'unparalleled-website-demo';
    const srcExample = path.join(packageRoot, 'examples', exampleDir);
    const targetDir = path.join(process.cwd(), exampleDir);

    console.log(`${c.yellow}Scaffolding demo project:${c.reset} ${kind} -> ${targetDir}`);
    if (fs.existsSync(srcExample)) {
      copyDir(srcExample, targetDir);
      console.log(`${c.green}✔ Scaffolding complete!${c.reset} Created ${targetDir}\n`);
    } else {
      console.error(`${c.red}Error:${c.reset} Template ${exampleDir} not found.`);
    }
    process.exit(0);
  }

  // Interactive mode if options are not passed
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
        console.log(`  ${c.cyan}1)${c.reset} Local Project (.agents/skills/) — checked into Git for your repo`);
        console.log(`  ${c.cyan}2)${c.reset} Global (~/.gemini/config/skills/) — available across all workspaces`);
        console.log(`  ${c.cyan}3)${c.reset} Custom Directory`);
        const destChoice = (await prompt(rl, `\nSelect option [1-3] (Default: 1): `)).trim();

        if (destChoice === '2') {
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

  for (const skillName of selectedSkills) {
    const srcSkill = path.join(packageRoot, '.agents', 'skills', skillName);
    const targetSkill = path.join(destRoot, skillName);

    if (!fs.existsSync(srcSkill)) {
      console.error(`${c.red}❌ Source skill directory not found:${c.reset} ${srcSkill}`);
      continue;
    }

    console.log(`${c.blue}📦 Installing ${skillName}...${c.reset}`);
    copyDir(srcSkill, targetSkill);
    console.log(`${c.green}✔ ${skillName} installed successfully at ${targetSkill}${c.reset}`);
  }

  // If local installation, also setup workspace config files if not already present
  if (destRoot.includes('.agents')) {
    const workspaceRoot = path.dirname(destRoot);
    const agentsMdPath = path.join(process.cwd(), 'AGENTS.md');
    const geminiMdPath = path.join(process.cwd(), 'GEMINI.md');

    if (!fs.existsSync(agentsMdPath)) {
      const templateAgents = `# Workspace Agent Directives

1. Use \`.agents/skills/unparalleled-ui\` for software screens, dashboards, and application UI.
2. Use \`.agents/skills/unparalleled-website\` for landing pages, marketing sites, and public web layouts.
3. Anti-Slop: No generic templates, no centered 3-line boilerplate headlines, fluid clamp typography, WCAG AA compliance.
`;
      fs.writeFileSync(agentsMdPath, templateAgents, 'utf8');
      console.log(`${c.green}✔ Created AGENTS.md in project root${c.reset}`);
    }

    if (!fs.existsSync(geminiMdPath)) {
      const templateGemini = `# Gemini / Antigravity Rules

- **UI Skill**: \`.agents/skills/unparalleled-ui/SKILL.md\`
- **Website Skill**: \`.agents/skills/unparalleled-website/SKILL.md\`
`;
      fs.writeFileSync(geminiMdPath, templateGemini, 'utf8');
      console.log(`${c.green}✔ Created GEMINI.md in project root${c.reset}`);
    }
  }

  console.log(`
${c.green}${c.bold}✨ Installation Complete!${c.reset}

${c.bold}Next Steps:${c.reset}
1. In your AI agent (Antigravity, Gemini, Claude, Cursor), ask:
   ${c.cyan}"Design a new dashboard screen using /unparalleled-ui"${c.reset}
   or
   ${c.cyan}"Design an award-winning landing page using /unparalleled-website"${c.reset}
2. Customize your philosophy in:
   ${c.dim}${destRoot}/<skill>/references/philosophy-manifesto.md${c.reset}
`);
}

main().catch((err) => {
  console.error(`${c.red}Fatal error:${c.reset}`, err);
  process.exit(1);
});
