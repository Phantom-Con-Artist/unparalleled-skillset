import fs from 'node:fs';
import path from 'node:path';
import { hookCommandFor } from './doctor.js';

/**
 * Prepare the optional Claude Code UserPromptSubmit hook that adds a structured task brief to design prompts.
 * Without write it only reports the snippet. With write it merges one entry into the project's own
 * .claude/settings.json, keeping everything else, and refuses to touch a file it cannot parse.
 */
export function prepareHook(options, context) {
  const command = hookCommandFor(context);
  if (!command) throw new Error('No installed Unparalleled skill found in this project. Run: npx unparalleled install all');
  const entry = { hooks: [{ type: 'command', command }] };
  const settingsPath = path.join(context.projectDir, '.claude/settings.json');
  const result = { command, settingsPath, snippet: { hooks: { UserPromptSubmit: [entry] } }, written: false, alreadyPresent: false };
  if (!options.write) return result;

  let settings = {};
  if (fs.existsSync(settingsPath)) {
    try { settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8')); }
    catch { throw new Error(`${settingsPath} is not valid JSON; fix it or add the hook by hand. Nothing was changed.`); }
    if (!settings || typeof settings !== 'object' || Array.isArray(settings)) throw new Error(`${settingsPath} is not a JSON object. Nothing was changed.`);
  }
  settings.hooks ??= {};
  const list = settings.hooks.UserPromptSubmit ??= [];
  if (!Array.isArray(list)) throw new Error(`${settingsPath} has a hooks.UserPromptSubmit value that is not a list. Nothing was changed.`);
  result.alreadyPresent = list.some(item => (item?.hooks ?? []).some(hook => /structure-prompt/.test(hook?.command ?? '')));
  if (result.alreadyPresent || options.dryRun) return result;
  list.push(entry);
  fs.mkdirSync(path.dirname(settingsPath), { recursive: true });
  fs.writeFileSync(settingsPath, `${JSON.stringify(settings, null, 2)}\n`);
  result.written = true;
  return result;
}
