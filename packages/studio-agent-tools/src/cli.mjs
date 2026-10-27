#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { connectStudio, tools } from './client.mjs';
import { capturePage, collectReference } from './capture.mjs';
import { locateSource } from './locate.mjs';
export function parseArgs(args) {
  const options = {}; let command;
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--help' || arg === '-h') return { command: 'help', options };
    if (['--project', '--input', '--file', '--selector', '--document', '--reference', '--wait', '--id', '--lease', '--out', '--url', '--intent', '--instruction', '--text'].includes(arg)) {
      const value = args[++i]; if (!value || value.startsWith('--')) throw new Error(`${arg} needs a value.`);
      options[arg.slice(2)] = value;
    } else if (!command && !arg.startsWith('-')) command = arg;
    else throw new Error(`Unexpected argument ${arg}. Use --help.`);
  }
  if (!command) command = 'help';
  if (!['help', 'tools', ...tools.map(tool => tool.name)].includes(command)) throw new Error(`Unknown Studio tool ${command}.`);
  return { command, options };
}
export async function run(args = process.argv.slice(2)) {
  const { command, options } = parseArgs(args);
  if (command === 'help') return { usage: 'unparalleled-studio-agent --project <app-root> <tool> [options]', tools, examples: ['next --wait 25000', 'inspect --selector "#heading"', 'locate --selector "#heading"', 'read --file index.html', 'patch --input /tmp/patch.json', 'reply --input /tmp/result.json', 'capture --out /tmp/page.png'] };
  if (command === 'tools') return { version: 1, tools, transport: 'authenticated local HTTP via this CLI, or the same tools over MCP (stdio) through unparalleled-studio-mcp' };
  const { call, connection } = await connectStudio(options.project);
  const query = values => '?' + new URLSearchParams(Object.entries(values).filter(([, value]) => value !== undefined));
  if (command === 'status') return call('/status');
  if (command === 'context') return call('/context' + query({ reference: options.reference }));
  if (command === 'next') return call('/requests/claim', { waitMs: Number(options.wait || 0) });
  if (command === 'inspect') return call('/inspect' + query({ selector: options.selector, documentId: options.document }));
  if (command === 'read') { if (!options.file) throw new Error('read requires --file.'); return call('/source' + query({ file: options.file })); }
  if (command === 'locate') return locateSource(connection.root, options.text ? { text: options.text } : await call('/inspect' + query({ selector: options.selector, documentId: options.document })));
  if (command === 'capture') return capturePage(connection, options);
  if (command === 'pair') return { studioUrl: connection.url, referenceToken: connection.referenceToken, purpose: 'Paste this project-scoped reference key into the browser companion. It persists with this local project.' };
  if (command === 'reference') {
    if (!options.url || !options.instruction) throw new Error('reference requires --url and --instruction.');
    const capture = await collectReference(connection, options);
    return call('/references', { ...capture, instruction: options.instruction, intent: options.intent || 'inspire' });
  }
  if (command === 'renew') { if (!options.id || !options.lease) throw new Error('renew requires --id and --lease.'); return call(`/requests/${options.id}/renew`, { leaseToken: options.lease }); }
  if (!options.input) throw new Error(`${command} requires --input with a JSON file; use real newlines in search/replacement text.`);
  const data = JSON.parse(await fs.readFile(options.input, 'utf8'));
  if (typeof data.id !== 'string' || !/^[a-f0-9-]+$/.test(data.id)) throw new Error('Input requires a valid request id.');
  return call(`/requests/${data.id}/${command}`, data);
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) run().then(value => console.log(JSON.stringify(value, null, 2))).catch(error => { console.error(JSON.stringify({ error: error.code || 'tool_failed', message: error.message })); process.exitCode = 1; });
