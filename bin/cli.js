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
  ${c.green}--scaffold <kind>${c.reset}  Scaffold a complete demo project (ui | website)
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

function configureAntigravityAndGemini(targetProjectRoot, skills) {
  const agentsMd = `# Unparalleled Agent Workspace Guidelines

This repository is powered by the **Unparalleled Skillset** for high-craft UI and web experiences.

## The Two Specialized Skills
1. **unparalleled-ui**: Located at \`.agents/skills/unparalleled-ui/SKILL.md\`. Use for SaaS dashboards, application screens, data tables, form validation, and 5-state complete components.
2. **unparalleled-website**: Located at \`.agents/skills/unparalleled-website/SKILL.md\`. Use for public landing pages, marketing sites, portfolios, fluid clamp typography, and asymmetric Bento layouts.

## Core Invariants
- Anti-Slop: Zero generic AI templates, no centered 3-line boilerplate headlines, no repetitive 3-card rows.
- Contrast: Strict WCAG 2.1 AA compliance (minimum 4.5:1 text contrast).
- Physicality: Physics-based spring micro-interactions (cubic-bezier(0.16, 1, 0.3, 1)).
`;

  const geminiMd = `# Antigravity & Gemini Workspace Rules

- **UI & Software Skill**: \`.agents/skills/unparalleled-ui/SKILL.md\`
- **Website & Landing Page Skill**: \`.agents/skills/unparalleled-website/SKILL.md\`
- **Design Philosophy**: Consult \`references/philosophy-manifesto.md\` in each skill before writing frontend code.
- **Rules**:
  1. No generic Tailwind/Bootstrap defaults or AI tropes.
  2. Fluid clamp typography for scales: clamp(min, preferred, max).
  3. Never use pure #000000 or #ffffff backgrounds; use nuanced perceptual values (oklch).
  4. Ensure all text passes WCAG AA contrast (minimum 4.5:1).
  5. State completeness: Every interactive element must define 5 states: default, hover, active, focus-visible, and disabled.
`;

  writeFileEnsureDir(path.join(targetProjectRoot, 'AGENTS.md'), agentsMd);
  writeFileEnsureDir(path.join(targetProjectRoot, 'GEMINI.md'), geminiMd);
  return 'Google Antigravity & Gemini (AGENTS.md, GEMINI.md)';
}

function configureClaudeCode(targetProjectRoot, skills) {
  const claudeMd = `# Claude Code Instructions — Unparalleled Skillset

This project is governed by the **Unparalleled Skillset** architecture for crafting high-fidelity digital interfaces without generic AI tropes.

## Available Agentic Skills

1. **\`unparalleled-ui\` (Software UI/UX & Dashboards)**:
   - Location: \`.agents/skills/unparalleled-ui/SKILL.md\` (or \`.claude/skills/unparalleled-ui/SKILL.md\`)
   - Use whenever designing or implementing software screens people work in: SaaS dashboards, cloud consoles, data tables, modals, settings, form validation, and complex component libraries.
   - Core Directives:
     - 5-state completeness on all interactive elements (\`default\`, \`hover\`, \`active\`, \`focus-visible\`, \`disabled\`).
     - Tabular numbers (\`font-variant-numeric: tabular-nums\`) for metrics, financial data, and timestamps.
     - Strict WCAG 2.1 AA accessibility (minimum 4.5:1 text contrast).
     - Semantic token contract (\`var(--surface-app-bg)\`, \`var(--text-primary)\`, etc.).

2. **\`unparalleled-website\` (Landing Pages & Web Craft)**:
   - Location: \`.agents/skills/unparalleled-website/SKILL.md\` (or \`.claude/skills/unparalleled-website/SKILL.md\`)
   - Use whenever building public-facing experiences: landing pages, marketing sites, brand portfolios, and editorial web experiences.
   - Core Directives:
     - Anti-Slop: No generic centered 3-line headlines over soft gradients; choose an intentional layout from \`references/hero-architectures.md\`.
     - No 3-card rows with tinted icon boxes; use asymmetric Bento grids.
     - Fluid clamp typography (\`clamp(min, preferred, max)\`) — no breakpoint font snapping.
     - Nuanced OKLCH color palettes with a single punch accent.

## Commands & Verification
- Check contrast compliance: \`npm run check-contrast\`
- Validate skill integrity: \`npm run validate-all\`
`;

  writeFileEnsureDir(path.join(targetProjectRoot, 'CLAUDE.md'), claudeMd);

  // Also symlink or copy to .claude/skills for Claude Code native discovery
  const claudeSkillsDir = path.join(targetProjectRoot, '.claude', 'skills');
  for (const skill of skills) {
    const src = path.join(targetProjectRoot, '.agents', 'skills', skill);
    const dest = path.join(claudeSkillsDir, skill);
    if (fs.existsSync(src)) {
      copyDir(src, dest);
    }
  }

  return 'Claude Code (CLAUDE.md, .claude/skills/)';
}

function configureCursor(targetProjectRoot, skills) {
  const uiRuleMdc = `---
description: Unparalleled UI/UX standards for software applications, dashboards, tables, and component systems
globs: **/*.{tsx,jsx,vue,svelte,html,css}
alwaysApply: false
---

# Unparalleled UI — Software Architecture Rules

When implementing web application screens, dashboards, admin views, data tables, or forms:

1. **State Completeness**:
   - Every button, row, and interactive element MUST implement 5 states: default, hover, active, focus-visible, and disabled.
   - Never remove focus outlines without providing a high-contrast :focus-visible ring.

2. **Data Density & Typography**:
   - Use tabular numerals (font-variant-numeric: tabular-nums) for metrics, timestamps, and currency.
   - Text columns align left; numeric columns align right.

3. **Accessibility (WCAG AA)**:
   - Minimum 4.5:1 contrast for body copy.
   - Use semantic tags (<button>, <a>, <dialog>, <nav>). Never <div onclick>.

4. **Tokens**:
   - Reference semantic variables from .agents/skills/unparalleled-ui/references/ui-tokens.md.
`;

  const websiteRuleMdc = `---
description: Unparalleled Website standards for landing pages, marketing sites, heroes, and Bento grids
globs: **/*.{tsx,jsx,vue,svelte,html,css}
alwaysApply: false
---

# Unparalleled Website — Web Craft Rules

When building landing pages, marketing sites, hero sections, portfolios, or Bento grids:

1. **Anti-Slop Invariants**:
   - Never generate centered 3-line headlines over soft gradients. Select an intentional hero architecture from .agents/skills/unparalleled-website/references/hero-architectures.md.
   - Never generate repetitive 3-card rows with tinted icon boxes. Use heterogeneous Bento grids.

2. **Fluid Clamp Typography**:
   - Scale typography continuously with clamp(min, preferred, max) — no breakpoint font snapping.
   - Tighten display tracking (-0.035em) on large headings.

3. **Color & Surface**:
   - Avoid pure #000000 or #ffffff backgrounds. Use nuanced OKLCH palettes with a single punch accent.
   - Use hairline borders (rgba(255, 255, 255, 0.08)) and spring physics transitions (cubic-bezier(0.16, 1, 0.3, 1)).
`;

  const cursorrules = `# Unparalleled Design Rules for Cursor

You are operating under the Unparalleled Skillset for UI and Web Design.

## Core Rules:
1. Software UI: Follow .agents/skills/unparalleled-ui/SKILL.md (5 interactive states, high data density, tabular numbers, WCAG AA contrast).
2. Websites: Follow .agents/skills/unparalleled-website/SKILL.md (Anti-slop: no generic centered 3-line heroes, no generic 3-card icon rows, fluid clamp typography, heterogeneous Bento grids).
3. Do not use pure #000000 or #ffffff for backgrounds; use nuanced OKLCH colors.
4. Ensure all buttons have explicit :focus-visible rings and spring physics transitions.
`;

  writeFileEnsureDir(path.join(targetProjectRoot, '.cursor', 'rules', 'unparalleled-ui.mdc'), uiRuleMdc);
  writeFileEnsureDir(path.join(targetProjectRoot, '.cursor', 'rules', 'unparalleled-website.mdc'), websiteRuleMdc);
  writeFileEnsureDir(path.join(targetProjectRoot, '.cursorrules'), cursorrules);

  return 'Cursor (.cursor/rules/*.mdc, .cursorrules)';
}

function configureGitHubCopilot(targetProjectRoot, skills) {
  const copilotInstructions = `# GitHub Copilot Instructions — Unparalleled Skillset

When generating frontend code, user interfaces, or web pages in this repository, follow these design system invariants:

## 1. Application UI & Dashboards (unparalleled-ui)
- For SaaS dashboards, telemetry consoles, and data tables:
  - Every interactive component must define 5 states: default, hover, active, focus-visible, and disabled.
  - Never remove :focus outlines without providing a visible high-contrast :focus-visible ring.
  - Use font-variant-numeric: tabular-nums for all metrics, currency, timestamps, and table numbers.
  - Adhere to WCAG 2.1 AA (minimum 4.5:1 text contrast).

## 2. Landing Pages & Marketing Sites (unparalleled-website)
- For landing pages, heroes, and marketing websites:
  - Never generate generic AI tropes: no centered 3-line headline over soft purple gradients; choose an intentional layout (Asymmetrical Split, Typographic Monument, Bento Mosaic).
  - Never create rows of 3 identical cards with tinted icon squares. Use heterogeneous Bento grids with 2-column or 2-row spans.
  - Always use fluid clamp typography (clamp(min, preferred, max)) — no breakpoint font snapping.
  - Use nuanced OKLCH colors; avoid pure #000000 or #ffffff backgrounds.
  - Motion must follow spring physics (cubic-bezier(0.16, 1, 0.3, 1)).
`;

  writeFileEnsureDir(path.join(targetProjectRoot, '.github', 'copilot-instructions.md'), copilotInstructions);
  return 'GitHub Copilot (.github/copilot-instructions.md)';
}

function configureWindsurfAndCodex(targetProjectRoot, skills) {
  const windsurfrules = `# Windsurf / Cascade Rules — Unparalleled Skillset

1. Software UI / Dashboards: Consult .agents/skills/unparalleled-ui/SKILL.md. Enforce 5 interaction states (default, hover, active, focus-visible, disabled), tabular numbers, WCAG AA compliance.
2. Websites / Landing Pages: Consult .agents/skills/unparalleled-website/SKILL.md. Avoid generic AI tropes: no centered 3-line headlines over purple gradients, no 3-card icon rows. Use fluid clamp typography and heterogeneous Bento grids.
3. Contrast: Minimum 4.5:1 text contrast ratio.
`;

  writeFileEnsureDir(path.join(targetProjectRoot, '.windsurfrules'), windsurfrules);
  return 'OpenAI Codex & Windsurf (.windsurfrules, AGENTS.md)';
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

    console.log(`${c.yellow}Scaffolding demo project:${c.reset} ${kind} -> ${targetDir}`);
    if (fs.existsSync(srcExample)) {
      copyDir(srcExample, targetDir);
      console.log(`${c.green}✔ Scaffolding complete!${c.reset} Created ${targetDir}\n`);
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
        console.log(`  ${c.cyan}2)${c.reset} Global (~/.gemini/config/skills/) — available across all workspaces`);
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
      console.error(`${c.red}❌ Source skill directory not found:${c.reset} ${srcSkill}`);
      continue;
    }

    console.log(`${c.blue}📦 Installing ${skillName}...${c.reset}`);
    copyDir(srcSkill, targetSkill);
    console.log(`${c.green}✔ ${skillName} installed at ${targetSkill}${c.reset}`);
  }

  // Hassle-free Universal AI configuration
  const targetProjectRoot = isGlobal ? null : (destRoot.includes('.agents') ? path.resolve(destRoot, '..', '..') : process.cwd());

  if (targetProjectRoot) {
    console.log(`\n${c.magenta}${c.bold}⚙️  Configuring AI Developer Assistants...${c.reset}`);

    const configured = [];
    const shouldConfigureAll = args.includes('--all-agents') || (!args.includes('--claude') && !args.includes('--cursor') && !args.includes('--copilot') && !args.includes('--gemini'));

    if (shouldConfigureAll || args.includes('--gemini') || args.includes('--antigravity')) {
      configured.push(configureAntigravityAndGemini(targetProjectRoot, selectedSkills));
    }
    if (shouldConfigureAll || args.includes('--claude')) {
      configured.push(configureClaudeCode(targetProjectRoot, selectedSkills));
    }
    if (shouldConfigureAll || args.includes('--cursor')) {
      configured.push(configureCursor(targetProjectRoot, selectedSkills));
    }
    if (shouldConfigureAll || args.includes('--copilot')) {
      configured.push(configureGitHubCopilot(targetProjectRoot, selectedSkills));
    }
    if (shouldConfigureAll || args.includes('--codex') || args.includes('--windsurf')) {
      configured.push(configureWindsurfAndCodex(targetProjectRoot, selectedSkills));
    }

    for (const item of configured) {
      console.log(`  ${c.green}✔ Configured for:${c.reset} ${item}`);
    }
  }

  console.log(`
${c.green}${c.bold}✨ Universal Installation Complete!${c.reset}

${c.bold}Your AI pair programmers are now configured hassle-free:${c.reset}
  • ${c.cyan}Google Antigravity & Gemini:${c.reset} Loaded automatically via AGENTS.md & GEMINI.md
  • ${c.cyan}Claude Code:${c.reset} Loaded automatically via CLAUDE.md & .claude/skills/
  • ${c.cyan}Cursor:${c.reset} Loaded via .cursor/rules/*.mdc & .cursorrules
  • ${c.cyan}GitHub Copilot:${c.reset} Loaded via .github/copilot-instructions.md
  • ${c.cyan}OpenAI Codex & Windsurf:${c.reset} Loaded via .windsurfrules & AGENTS.md

${c.bold}Try asking your agent:${c.reset}
  ${c.yellow}"Design a new dashboard screen using /unparalleled-ui"${c.reset}
  ${c.yellow}"Design an award-winning landing page using /unparalleled-website"${c.reset}
`);
}

main().catch((err) => {
  console.error(`${c.red}Fatal error:${c.reset}`, err);
  process.exit(1);
});
