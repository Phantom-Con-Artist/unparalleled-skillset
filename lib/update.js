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

/**
 * Refresh an Unparalleled installation from the package being run. It updates the project install when there is one,
 * otherwise the user-level install, and touches the user-level install alongside a project only when asked (--global).
 * It reinstalls exactly what the install record lists and never adds skills or agent integrations.
 */
export function update(options, context) {
  const found = [];
  const candidates = [['project', context.projectDir], ['global', context.homeDir]];
  const project = readManifest(context.projectDir);
  for (const [scope, base] of candidates) {
    if (options.global ? scope !== 'global' : scope === 'global' && project) continue;
    const manifest = scope === 'project' ? project : readManifest(base);
    if (manifest) found.push({ scope, base, manifest });
  }
  if (!found.length) throw new Error(`${options.global ? 'No user-level Unparalleled installation found.' : 'No Unparalleled installation found in this project or your user folder.'} Run: npx unparalleled install all`);
  const results = found.map(({ scope, base, manifest }) => {
    const defaultRoot = path.join(base, '.agents/skills');
    const dest = scope === 'project' && manifest.canonicalRoot && path.resolve(manifest.canonicalRoot) !== defaultRoot ? manifest.canonicalRoot : undefined;
    const result = install({ skills: manifest.skills, agents: Array.isArray(manifest.agents) ? manifest.agents : [], noConfig: !(Array.isArray(manifest.agents) && manifest.agents.length), global: scope === 'global', dest, dryRun: options.dryRun }, context);
    const changedFiles = result.files.filter(file => !file.path.endsWith('install.json'));
    return { scope, from: manifest.version, to: packageInfo.version, skills: result.skills, changed: changedFiles.length, upToDate: changedFiles.length === 0, files: result.files, backupDir: result.backupDir };
  });
  return { results, upToDate: results.every(item => item.upToDate) };
}
