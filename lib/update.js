import fs from 'node:fs';
import path from 'node:path';
import { install, packageInfo } from './installer.js';

function readManifest(base) {
  const file = path.join(base, '.agents/unparalleled/install.json');
  if (!fs.existsSync(file)) return null;
  try {
    const manifest = JSON.parse(fs.readFileSync(file, 'utf8'));
    return manifest.schemaVersion === 1 && Array.isArray(manifest.skills) ? manifest : null;
  } catch { return null; }
}

/** Refresh every Unparalleled installation recorded in this project and in the user folder from the package being run. */
export function update(options, context) {
  const found = [];
  for (const [scope, base] of [['project', context.projectDir], ['global', context.homeDir]]) {
    const manifest = readManifest(base);
    if (manifest) found.push({ scope, base, manifest });
  }
  if (!found.length) throw new Error('No Unparalleled installation found in this project or your user folder. Run: npx unparalleled install all');
  const results = found.map(({ scope, base, manifest }) => {
    const defaultRoot = path.join(base, '.agents/skills');
    const dest = scope === 'project' && manifest.canonicalRoot && path.resolve(manifest.canonicalRoot) !== defaultRoot ? manifest.canonicalRoot : undefined;
    const result = install({ skills: manifest.skills, agents: Array.isArray(manifest.agents) ? manifest.agents : [], global: scope === 'global', dest, dryRun: options.dryRun }, context);
    const changedFiles = result.files.filter(file => !file.path.endsWith('install.json'));
    return { scope, from: manifest.version, to: packageInfo.version, skills: result.skills, changed: changedFiles.length, upToDate: changedFiles.length === 0, files: result.files, backupDir: result.backupDir };
  });
  return { results, upToDate: results.every(item => item.upToDate) };
}
