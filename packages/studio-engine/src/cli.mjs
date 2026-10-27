#!/usr/bin/env node
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startStudio } from './index.mjs';
export function parseArgs(args) {
  const options = {};
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--help' || arg === '-h') return { help: true };
    if (arg === '--demo') options.root = fileURLToPath(new URL('../../../examples/studio-demo/', import.meta.url));
    else if (['--root', '--port', '--skill'].includes(arg)) {
      const value = args[++i]; if (!value || value.startsWith('--')) throw new Error(`${arg} requires a value.`);
      options[arg.slice(2)] = arg === '--port' ? Number(value) : value;
    } else throw new Error(`Unknown option ${arg}. Use --help.`);
  }
  return options;
}
async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) return console.log('Unparalleled Studio\n\nServe static HTML with the in-page inspector:\n  unparalleled-studio --root ./my-site --port 4310\n  unparalleled-studio --demo\n\nFor Vite use @unparalleled/studio-adapters/vite instead.\nThe engine runs on loopback; agent credentials remain in the ignored connection file.');
  const studio = await startStudio(options);
  console.log(`Studio page: ${studio.url}\nAgent connection: ${studio.connectionFile}\nWaiting for page selections and your existing IDE agent. Press Ctrl+C to stop.`);
  let stopping = false;
  const stop = async () => { if (stopping) return; stopping = true; await studio.close(); };
  process.once('SIGINT', stop); process.once('SIGTERM', stop);
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main().catch(error => { console.error(`Studio: ${error.message}`); process.exitCode = 1; });
