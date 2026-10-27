import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { StudioError, requireString } from '../../studio-protocol/src/index.mjs';
export const hash = text => crypto.createHash('sha256').update(text).digest('hex');
export async function resolveFile(root, relative) {
  requireString(relative, 'file path', 2000);
  if (path.isAbsolute(relative) || /^[a-z][a-z0-9+.-]*:/i.test(relative) || relative.includes('\\') || relative.split('/').some(part => part === '..' || part.startsWith('.') || part === 'node_modules')) throw new StudioError('path_forbidden', 'Use a visible project file inside this app.', 403);
  const realRoot = await fs.realpath(root);
  const resolved = await fs.realpath(path.resolve(realRoot, relative)).catch(() => { throw new StudioError('not_found', 'Project file does not exist.', 404); });
  if (!resolved.startsWith(realRoot + path.sep)) throw new StudioError('path_forbidden', 'File resolves outside the app.', 403);
  if (path.relative(realRoot, resolved).split(path.sep).some(part => part.startsWith('.') || part === 'node_modules')) throw new StudioError('path_forbidden', 'Private project files are not available through Studio.', 403);
  return resolved;
}
export async function readSource(root, relative) {
  const file = await resolveFile(root, relative);
  const stat = await fs.stat(file);
  if (!stat.isFile() || stat.size > 512 * 1024) throw new StudioError('unsupported_file', 'Source inspection supports text files up to 512 KiB.');
  const bytes = await fs.readFile(file);
  const content = bytes.toString('utf8');
  if (content.includes('\0') || !Buffer.from(content).equals(bytes)) throw new StudioError('unsupported_file', 'This file is not UTF-8 text.');
  return { file: relative, content, hash: hash(content), mode: stat.mode & 0o777 };
}
export function preparePatch(source, expectedHash, edits) {
  if (source.hash !== expectedHash) throw new StudioError('source_changed', 'Source changed since inspection. Read it again before editing.', 409);
  if (!Array.isArray(edits) || !edits.length || edits.length > 30) throw new StudioError('invalid_patch', 'Provide 1–30 exact text edits.');
  let after = source.content;
  for (const edit of edits) {
    const search = requireString(edit?.search, 'search text', 256000);
    if (typeof edit.replace !== 'string' || edit.replace.length > 256000) throw new StudioError('invalid_patch', 'Replacement must be text of at most 256000 characters.');
    const first = after.indexOf(search);
    if (first < 0 || after.indexOf(search, first + 1) !== -1) throw new StudioError('ambiguous_edit', 'Each search must match exactly once. Include more surrounding source.', 409);
    after = after.slice(0, first) + edit.replace + after.slice(first + search.length);
  }
  if (after === source.content) throw new StudioError('empty_patch', 'This patch makes no change.');
  if (Buffer.byteLength(after, 'utf8') > 512 * 1024) throw new StudioError('unsupported_file', 'The resulting source must stay within 512 KiB so it remains inspectable and undoable.');
  return { file: source.file, before: source.content, after, beforeHash: source.hash, afterHash: hash(after), mode: source.mode };
}
export async function prepareCreation(root, relative, expectedHash, content) {
  requireString(relative, 'file path', 2000);
  requireString(content, 'new file content', 512 * 1024);
  if (Buffer.byteLength(content, 'utf8') > 512 * 1024) throw new StudioError('unsupported_file', 'New source must stay within 512 KiB so it remains inspectable and undoable.');
  if (expectedHash !== null) throw new StudioError('invalid_patch', 'New files require expectedHash: null.');
  if (path.isAbsolute(relative) || /^[a-z][a-z0-9+.-]*:/i.test(relative) || relative.includes('\\') || relative.split('/').some(part => part === '..' || part.startsWith('.') || part === 'node_modules')) throw new StudioError('path_forbidden', 'New files must be inside the visible app source.', 403);
  const target = path.resolve(await fs.realpath(root), relative);
  if (!target.startsWith((await fs.realpath(root)) + path.sep)) throw new StudioError('path_forbidden', 'File is outside the app.', 403);
  try { await fs.lstat(target); throw new StudioError('source_changed', 'This file already exists. Read and patch it instead.', 409); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  return { file: relative, before: null, after: content, beforeHash: null, afterHash: hash(content), mode: 0o644 };
}
export async function writeSource(root, change, direction = 'apply') {
  if (direction === 'apply' && change.before === null) {
    const realRoot = await fs.realpath(root);
    const target = path.resolve(realRoot, change.file);
    let parent = path.dirname(target);
    // Check the nearest existing ancestor before creating nested directories.
    while (true) {
      try {
        const real = await fs.realpath(parent);
        if (real !== realRoot && !real.startsWith(realRoot + path.sep)) throw new StudioError('path_forbidden', 'Parent resolves outside the app.', 403);
        if (path.relative(realRoot, real).split(path.sep).some(part => part.startsWith('.') && part !== '' || part === 'node_modules')) throw new StudioError('path_forbidden', 'Parent is not visible app source.', 403);
        break;
      }
      catch (error) { if (error.code !== 'ENOENT') throw error; parent = path.dirname(parent); }
    }
    await fs.mkdir(path.dirname(target), { recursive: true });
    const realParent = await fs.realpath(path.dirname(target));
    if (!realParent.startsWith(realRoot + path.sep) && realParent !== realRoot || path.relative(realRoot, realParent).split(path.sep).some(part => part.startsWith('.') && part !== '')) throw new StudioError('path_forbidden', 'Parent is not visible app source.', 403);
    try { await fs.writeFile(path.join(realParent, path.basename(target)), change.after, { flag: 'wx', mode: change.mode }); }
    catch (error) { if (error.code === 'EEXIST') throw new StudioError('source_changed', 'Another edit created this file first.', 409); throw error; }
    return;
  }
  const current = await readSource(root, change.file);
  const expected = direction === 'apply' ? change.beforeHash : change.afterHash;
  if (current.hash !== expected) throw new StudioError('source_changed', 'Source has newer edits. Studio will not overwrite them.', 409);
  const file = await resolveFile(root, change.file);
  if (direction === 'undo' && change.before === null) { await fs.unlink(file); return; }
  const temporary = path.join(path.dirname(file), `.studio-${crypto.randomUUID()}.tmp`);
  try {
    await fs.writeFile(temporary, direction === 'apply' ? change.after : change.before, { mode: current.mode, flag: 'wx' });
    // Recheck after preparing the replacement, before committing the rename.
    if ((await readSource(root, change.file)).hash !== expected) throw new StudioError('source_changed', 'Source changed while the patch was being prepared.', 409);
    await fs.rename(temporary, file);
  } finally { await fs.rm(temporary, { force: true }); }
}
