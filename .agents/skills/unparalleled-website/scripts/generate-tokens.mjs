#!/usr/bin/env node
// Project-specific token generation. No palette or typography presets.
import fs from 'node:fs';
import path from 'node:path';

try {
  const args = process.argv.slice(2);
  if (args.includes('--help')) {
    console.log('Usage: node generate-tokens.mjs --input <tokens.json> --output <tokens.css>');
    process.exit(0);
  }
  if (args.length !== 4 || args[0] !== '--input' || args[2] !== '--output') {
    throw new Error('Provide --input <tokens.json> --output <tokens.css>. No default palette is supplied.');
  }
  const input = path.resolve(args[1]);
  const output = path.resolve(args[3]);
  if (input === output) throw new Error('Input and output must be different files.');
  const tokens = JSON.parse(fs.readFileSync(input, 'utf8'));
  if (!tokens || Array.isArray(tokens) || typeof tokens !== 'object' || !Object.keys(tokens).length) {
    throw new Error('Input must be a nonempty JSON object of CSS custom properties.');
  }
  for (const [name, value] of Object.entries(tokens)) {
    if (!/^--[a-z][a-z0-9-]*$/.test(name)) throw new Error(`Invalid token name: ${name}`);
    if (typeof value !== 'string' || !value.trim() || /[{};\n\r]/.test(value) || value.includes('/*')) {
      throw new Error(`Invalid CSS token value for ${name}`);
    }
  }
  const css = '/* Product-derived tokens. Verify actual rendered contrast and font availability. */\n:root {\n'
    + Object.entries(tokens).map(([name, value]) => `  ${name}: ${value};`).join('\n') + '\n}\n';
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, css);
  console.log(`Generated ${Object.keys(tokens).length} project tokens: ${output}`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
