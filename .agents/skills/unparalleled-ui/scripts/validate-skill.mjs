#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const skillDir = path.resolve(__dirname, '..');

console.log('\n🔍 Validating Skill:', path.basename(skillDir));
console.log('------------------------------------------------------------');

let hasErrors = false;

// 1. Verify SKILL.md exists
const skillMdPath = path.join(skillDir, 'SKILL.md');
if (!fs.existsSync(skillMdPath)) {
  console.error('❌ Missing required file: SKILL.md');
  hasErrors = true;
} else {
  const content = fs.readFileSync(skillMdPath, 'utf8');
  if (!content.startsWith('---')) {
    console.error('❌ SKILL.md missing opening YAML frontmatter (---)');
    hasErrors = true;
  } else if (!content.includes('name:') || !content.includes('description:')) {
    console.error('❌ SKILL.md missing name or description in YAML frontmatter');
    hasErrors = true;
  } else {
    console.log('✅ SKILL.md with valid YAML frontmatter found');
  }
}

// 2. Verify references directory exists and has files
const refDir = path.join(skillDir, 'references');
if (!fs.existsSync(refDir)) {
  console.error('❌ Missing references/ directory');
  hasErrors = true;
} else {
  const files = fs.readdirSync(refDir);
  console.log(`✅ references/ directory found (${files.length} reference files)`);
}

// 3. Verify workflows directory exists
const workDir = path.join(skillDir, 'workflows');
if (!fs.existsSync(workDir)) {
  console.error('❌ Missing workflows/ directory');
  hasErrors = true;
} else {
  const files = fs.readdirSync(workDir);
  console.log(`✅ workflows/ directory found (${files.length} workflow files)`);
}

// 4. Verify scripts directory
const scriptDir = path.join(skillDir, 'scripts');
if (fs.existsSync(scriptDir)) {
  const files = fs.readdirSync(scriptDir);
  console.log(`✅ scripts/ directory found (${files.length} helper scripts)`);
}

console.log('------------------------------------------------------------');
if (!hasErrors) {
  console.log('✨ Skill validation passed successfully!\n');
  process.exit(0);
} else {
  console.error('💥 Skill validation failed.\n');
  process.exit(1);
}
