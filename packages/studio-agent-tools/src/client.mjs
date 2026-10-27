import fs from 'node:fs/promises';
import path from 'node:path';
export async function connectStudio(project = process.cwd()) {
  const file = path.join(path.resolve(project), '.unparalleled/studio/connection.json');
  let connection;
  try { connection = JSON.parse(await fs.readFile(file, 'utf8')); }
  catch { throw new Error(`No running Studio connection at ${file}. Start Studio for this app first.`); }
  const url = new URL(connection.url);
  if (url.protocol !== 'http:' || !['localhost', '127.0.0.1', '[::1]'].includes(url.hostname) || url.username || url.password || url.pathname !== '/' || url.search || url.hash) throw new Error('Studio connection must use a local HTTP origin.');
  if (connection.version !== 1 || typeof connection.token !== 'string' || !connection.token) throw new Error('Unsupported or incomplete Studio connection.');
  async function call(route, data) {
    const response = await fetch(`${url.origin}/.unparalleled-studio${route}`, {
      method: data === undefined ? 'GET' : 'POST',
      headers: { 'x-studio-token': connection.token, ...(data === undefined ? {} : { 'Content-Type': 'application/json' }) },
      ...(data === undefined ? {} : { body: JSON.stringify(data) }), signal: AbortSignal.timeout(35000),
    });
    const result = await response.json();
    if (!response.ok) throw Object.assign(new Error(result.message), { code: result.error, status: response.status });
    return result;
  }
  return { call, connection, file };
}
export const tools = [
  { name: 'pair', purpose: 'Read the browser companion reference-only pairing key; this does not expose source-edit credentials.' },
  { name: 'reference', purpose: 'Collect one rendered element or page from a URL for inspire/recreate/redesign in this local project; --url and --instruction are required.' },
  { name: 'status', purpose: 'Read actual engine, browser and request state.' },
  { name: 'context', purpose: 'Read the applicable full Unparalleled skill; --reference reads a supporting reference.' },
  { name: 'next', purpose: 'Claim one durable request with a lease; --wait is bounded to 25000 milliseconds.' },
  { name: 'inspect', purpose: 'Inspect an actual connected page element through the page bridge; stale targets fail.' },
  { name: 'read', purpose: 'Read a project source file and its expected-content hash.' },
  { name: 'patch', purpose: 'Apply one exact, hash-guarded source patch for a leased request using --input JSON.' },
  { name: 'renew', purpose: 'Extend a request lease while doing multi-step work.' },
  { name: 'reply', purpose: 'Report a review-ready result or a real failure using --input JSON.' },
  { name: 'capture', purpose: 'Capture a separate Playwright rendering of the local page; this is explicitly not the user tab.' },
];
