#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const skillDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const name = path.basename(skillDir);
const errors = [];
function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const location = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(location) : [location];
  });
}
try {
  const text = fs.readFileSync(path.join(skillDir, 'SKILL.md'), 'utf8');
  const frontmatter = text.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!frontmatter) errors.push('Missing or unclosed frontmatter.');
  else {
    if (!frontmatter[1].split(/\r?\n/).includes(`name: ${name}`)) errors.push('Frontmatter name must match the skill directory.');
    if (!/^description:\s*\S/m.test(frontmatter[1])) errors.push('Missing description.');
  }
  const required = ['references', 'workflows', 'templates', 'scripts'];
  for (const dir of required) {
    const location = path.join(skillDir, dir);
    if (!fs.existsSync(location) || !fs.statSync(location).isDirectory() || !fs.readdirSync(location).length) {
      errors.push(`Missing or empty required directory: ${dir}`);
    }
  }
  for (const file of walk(skillDir).filter(file => file.endsWith('.md'))) {
    const content = fs.readFileSync(file, 'utf8');
    for (const match of content.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
      const target = match[1].split('#')[0];
      if (!target || /^[a-z][a-z0-9+.-]*:/i.test(target)) continue;
      const location = path.resolve(path.dirname(file), decodeURIComponent(target));
      if (!fs.existsSync(location)) errors.push(`${path.relative(skillDir, file)}: broken link ${target}`);
    }
  }
} catch (error) { errors.push(error.message); }
if (errors.length) {
  console.error(`Skill validation failed: ${name}\n${errors.join('\n')}`);
  process.exitCode = 1;
} else {
  console.log(`Skill structure and local Markdown links passed: ${name}`);
  console.log('This check does not validate design quality, rendered accessibility, or full YAML schemas.');
}
