import fs from 'node:fs/promises';
import path from 'node:path';

const EXTENSIONS = new Set(['.html', '.htm', '.css', '.scss', '.sass', '.less', '.js', '.jsx', '.mjs', '.cjs', '.ts', '.tsx', '.vue', '.svelte', '.astro', '.md', '.mdx', '.njk', '.liquid', '.hbs', '.erb', '.php']);
const SKIP = new Set(['node_modules', 'dist', 'build', 'out', 'coverage', 'vendor', 'target']);
const MAX_FILES = 3000;
const MAX_BYTES = 512 * 1024;
const escape = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** What to search for, taken from what Studio recorded about the picked element. */
export function termsFor(selection = {}) {
  const html = String(selection.html || '');
  const opening = (/^\s*<[^>]+>/.exec(html) || [''])[0];
  const attribute = name => (new RegExp(`\\b${name}=["']([^"']+)["']`).exec(opening) || [])[1];
  const selector = String(selection.selector || '');
  const id = (/#([A-Za-z][\w-]*)/.exec(selector) || [])[1] || attribute('id');
  const classes = (attribute('class') || '').split(/\s+/).filter(name => /^[A-Za-z_][\w-]*$/.test(name) && name.length > 2).slice(0, 3);
  const data = ['data-testid', 'data-test', 'data-id', 'data-component'].map(attribute).filter(Boolean);
  const text = String(selection.text || '').replace(/\s+/g, ' ').trim();
  return { id: id || null, classes, data, text: text.length >= 4 ? text.slice(0, 60) : null };
}

async function* walk(directory, state) {
  let entries;
  try { entries = await fs.readdir(directory, { withFileTypes: true }); } catch { return; }
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    if (entry.name.startsWith('.') || SKIP.has(entry.name) || entry.isSymbolicLink()) continue;
    const location = path.join(directory, entry.name);
    if (entry.isDirectory()) yield* walk(location, state);
    else if (EXTENSIONS.has(path.extname(entry.name)) && state.count++ < MAX_FILES) yield location;
  }
}

/**
 * Rank the lines of the project's visible source that most likely own a picked element. This is a text search with
 * labelled reasons, not an understanding of the framework: the agent still reads the file before it edits.
 */
export async function locateSource(root, selection, { limit = 12 } = {}) {
  const terms = termsFor(selection);
  if (!terms.id && !terms.classes.length && !terms.data.length && !terms.text) return { terms, candidates: [], note: 'Nothing distinctive to search for: the element has no id, class, data attribute or text of four or more characters.' };
  const realRoot = await fs.realpath(root);
  const patterns = {
    id: terms.id && new RegExp(`(\\bid=["'{][^"'}]*\\b${escape(terms.id)}\\b|#${escape(terms.id)}\\b)`),
    classes: terms.classes.map(name => [name, new RegExp(`(class(Name)?=[^>]*\\b${escape(name)}\\b|\\.${escape(name)}\\b)`)]),
  };
  const found = [];
  const state = { count: 0 };
  for await (const file of walk(realRoot, state)) {
    let content;
    try { const stat = await fs.stat(file); if (stat.size > MAX_BYTES) continue; content = await fs.readFile(file, 'utf8'); } catch { continue; }
    if (content.includes('\0')) continue;
    const lines = content.split('\n');
    const matches = [];
    lines.forEach((line, index) => {
      const reasons = []; let score = 0;
      if (terms.text && line.includes(terms.text)) { score += 6; reasons.push('contains the element text'); }
      else if (terms.text && terms.text.length > 24 && line.includes(terms.text.slice(0, 24))) { score += 3; reasons.push('contains the start of the element text'); }
      if (patterns.id && patterns.id.test(line)) { score += 5; reasons.push(`mentions id ${terms.id}`); }
      for (const [name, pattern] of patterns.classes) if (pattern.test(line)) { score += 2; reasons.push(`mentions class ${name}`); }
      for (const value of terms.data) if (line.includes(value)) { score += 4; reasons.push(`mentions ${value}`); }
      if (score) matches.push({ file: path.relative(realRoot, file).split(path.sep).join('/'), line: index + 1, score, reasons, snippet: line.trim().slice(0, 160) });
    });
    found.push(...matches.sort((a, b) => b.score - a.score).slice(0, 3));
  }
  found.sort((a, b) => b.score - a.score || a.file.localeCompare(b.file) || a.line - b.line);
  return { terms, candidates: found.slice(0, limit), note: 'Ranked text matches, not framework knowledge. Read the file and confirm the element lives there before editing.', scannedFiles: state.count };
}
