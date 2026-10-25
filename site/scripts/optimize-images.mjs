#!/usr/bin/env node
// Convert a folder of source PNGs into responsive WebP files for a demo page. Needs ImageMagick 7 (`magick`).
// Usage: node scripts/optimize-images.mjs --src <dir> --out <dir> [--strip-prefix <text>] [--widths 640,1200,1920] [--quality 82]
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

export function parseArgs(argv) {
  const options = { widths: [640, 1200, 1920], quality: 82, stripPrefix: '' };
  for (let i = 0; i < argv.length; i++) {
    const flag = argv[i];
    const value = () => {
      const next = argv[++i];
      if (next === undefined || next.startsWith('--')) throw new Error(`${flag} needs a value`);
      return next;
    };
    if (flag === '--src') options.src = value();
    else if (flag === '--out') options.out = value();
    else if (flag === '--strip-prefix') options.stripPrefix = value();
    else if (flag === '--widths') options.widths = value().split(',').map(Number);
    else if (flag === '--quality') options.quality = Number(value());
    else throw new Error(`Unknown option: ${flag}`);
  }
  if (!options.src || !options.out) throw new Error('Both --src and --out are required.');
  if (options.widths.some(width => !Number.isInteger(width) || width < 1)) throw new Error('--widths must be positive integers.');
  return options;
}

function magick(args) {
  const result = spawnSync('magick', args, { encoding: 'utf8' });
  if (result.error) throw new Error('ImageMagick 7 (`magick`) is required.');
  if (result.status !== 0) throw new Error(result.stderr.trim());
  return result.stdout.trim();
}

// Sizes at or below the source width, plus the source width itself so the largest file is never upscaled.
export function targetWidths(sourceWidth, widths) {
  return [...new Set([...widths.filter(width => width < sourceWidth), Math.min(sourceWidth, Math.max(...widths))])].sort((a, b) => a - b);
}

export function run(options) {
  const sources = fs.readdirSync(options.src).filter(name => name.toLowerCase().endsWith('.png')).sort();
  if (!sources.length) throw new Error(`No PNG files in ${options.src}`);
  fs.mkdirSync(options.out, { recursive: true });
  const manifest = {};
  for (const name of sources) {
    const input = path.join(options.src, name);
    const [width, height] = magick(['identify', '-format', '%w %h', input]).split(' ').map(Number);
    const slug = path.basename(name, '.png').replace(options.stripPrefix, '');
    manifest[slug] = { width, height, files: {} };
    for (const target of targetWidths(width, options.widths)) {
      const file = `${slug}-${target}.webp`;
      magick([input, '-strip', '-resize', `${target}x`, '-quality', String(options.quality), '-define', 'webp:method=6', path.join(options.out, file)]);
      manifest[slug].files[target] = file;
    }
    const sizes = Object.values(manifest[slug].files).map(file => fs.statSync(path.join(options.out, file)).size);
    console.log(`${slug}: ${width}x${height} -> ${Object.keys(manifest[slug].files).join(', ')} (${Math.round(sizes.reduce((a, b) => a + b, 0) / 1024)} KB)`);
  }
  fs.writeFileSync(path.join(options.out, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  return manifest;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    run(parseArgs(process.argv.slice(2)));
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}
