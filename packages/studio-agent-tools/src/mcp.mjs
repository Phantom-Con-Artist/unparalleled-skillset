#!/usr/bin/env node
// A dependency-free Model Context Protocol server over stdio. It exposes the same authenticated local tools as the
// agent CLI, so an MCP client can call them with structured arguments instead of shelling out and writing JSON files.
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { fileURLToPath } from 'node:url';
import { connectStudio } from './client.mjs';
import { capturePage } from './capture.mjs';
import { locateSource } from './locate.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const version = (() => { try { return JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')).version; } catch { return '0.0.0'; } })();
const ID = /^[a-f0-9-]+$/;
const text = (value, name) => { if (typeof value !== 'string' || !value) throw new Error(`${name} is required text.`); return value; };
const query = values => '?' + new URLSearchParams(Object.entries(values).filter(([, value]) => value !== undefined && value !== null && value !== ''));
const leased = args => { if (!ID.test(args.id ?? '')) throw new Error('id must be the request id returned by studio_next.'); text(args.leaseToken, 'leaseToken'); return args.id; };
const str = description => ({ type: 'string', description });

export const TOOLS = [
  { name: 'studio_status', description: 'Actual engine, browser and request state. Read it first; it also shows whether anything is waiting.', inputSchema: { type: 'object', properties: {}, additionalProperties: false }, run: (_, { call }) => call('/status') },
  { name: 'studio_context', description: 'Read the applicable Unparalleled skill. Pass reference (for example studio-requests) to read a supporting reference instead.', inputSchema: { type: 'object', properties: { reference: str('Reference name without a path, such as studio-requests or framework-selection.') }, additionalProperties: false }, run: (args, { call }) => call('/context' + query({ reference: args.reference })) },
  { name: 'studio_next', description: 'Claim one queued request with an exclusive lease. Waits up to waitMs (0 to 25000) for the user to send one. Returns request: null when none arrives. A claimed request is not permission to publish.', inputSchema: { type: 'object', properties: { waitMs: { type: 'integer', minimum: 0, maximum: 25000, description: 'How long to wait for a request. Default 0.' } }, additionalProperties: false }, run: (args, { call }) => call('/requests/claim', { waitMs: Math.min(25000, Math.max(0, Number(args.waitMs) || 0)) }) },
  { name: 'studio_inspect', description: 'Inspect an actual element on the connected page (text, html, computed styles, box). Defaults to the current selection. Fails if the page is not open.', inputSchema: { type: 'object', properties: { selector: str('CSS selector; defaults to the picked element.'), documentId: str('Page document id, if several pages are connected.') }, additionalProperties: false }, run: (args, { call }) => call('/inspect' + query({ selector: args.selector, documentId: args.documentId })) },
  { name: 'studio_locate', description: 'Find the source lines most likely to own an element, ranked with reasons, from its text, id, classes and data attributes. Give text, or a selector to inspect the live page. These are text matches, not framework knowledge: read the file before editing.', inputSchema: { type: 'object', properties: { text: str('Visible text of the element.'), selector: str('CSS selector of the element on the connected page.') }, additionalProperties: false }, run: async (args, { call, connection }) => locateSource(connection.root, args.text ? { text: args.text } : await call('/inspect' + query({ selector: args.selector }))) },
  { name: 'studio_read', description: 'Read a visible project source file and its content hash, which a patch must quote.', inputSchema: { type: 'object', properties: { file: str('Path relative to the project root.') }, required: ['file'], additionalProperties: false }, run: (args, { call }) => call('/source' + query({ file: text(args.file, 'file') })) },
  { name: 'studio_patch', description: 'Apply exact, hash-guarded edits for a leased request. Give files (1 to 12, each once) to change several files all-or-nothing, or file/expectedHash/edits for one. Every search must match exactly once. To create a file use create: true, expectedHash: null and content. The user then reviews and can undo.', inputSchema: { type: 'object', properties: { id: str('Request id from studio_next.'), leaseToken: str('Lease token from studio_next.'), summary: str('What changed, in plain words, shown to the user.'), files: { type: 'array', maxItems: 12, items: { type: 'object', properties: { file: { type: 'string' }, expectedHash: { type: ['string', 'null'] }, edits: { type: 'array', items: { type: 'object', properties: { search: { type: 'string' }, replace: { type: 'string' } }, required: ['search', 'replace'] } }, create: { type: 'boolean' }, content: { type: 'string' } }, required: ['file'] } }, file: { type: 'string' }, expectedHash: { type: ['string', 'null'] }, edits: { type: 'array', items: { type: 'object', properties: { search: { type: 'string' }, replace: { type: 'string' } }, required: ['search', 'replace'] } }, create: { type: 'boolean' }, content: { type: 'string' } }, required: ['id', 'leaseToken', 'summary'], additionalProperties: false }, run: (args, { call }) => { const id = leased(args); const { id: _id, ...body } = args; return call(`/requests/${id}/patch`, body); } },
  { name: 'studio_renew', description: 'Extend the lease on a request while you do longer work. Leases last five minutes.', inputSchema: { type: 'object', properties: { id: str('Request id.'), leaseToken: str('Lease token.') }, required: ['id', 'leaseToken'], additionalProperties: false }, run: (args, { call }) => call(`/requests/${leased(args)}/renew`, { leaseToken: args.leaseToken }) },
  { name: 'studio_reply', description: 'Report a result without a source edit: status review for something the user should look at, or failed with the real reason. A reply is not proof that anything was edited or verified.', inputSchema: { type: 'object', properties: { id: str('Request id.'), leaseToken: str('Lease token.'), status: { type: 'string', enum: ['review', 'failed'] }, message: str('A useful message for the user.') }, required: ['id', 'leaseToken', 'status', 'message'], additionalProperties: false }, run: (args, { call }) => call(`/requests/${leased(args)}/reply`, { leaseToken: args.leaseToken, status: args.status, message: text(args.message, 'message') }) },
  { name: 'studio_capture', description: 'Render the local page in a separate Playwright browser and save a screenshot. This is not the user\'s own tab. Needs Playwright.', inputSchema: { type: 'object', properties: { out: str('Where to write the PNG.') }, additionalProperties: false }, run: (args, { connection }) => capturePage(connection, { out: args.out }) },
];

export function createMcpServer({ project = process.cwd() } = {}) {
  const publicTools = TOOLS.map(({ name, description, inputSchema }) => ({ name, description, inputSchema }));
  async function callTool(name, args) {
    const tool = TOOLS.find(item => item.name === name);
    if (!tool) return { error: { code: -32602, message: `Unknown tool ${name}.` } };
    try {
      const studio = await connectStudio(project);
      const result = await tool.run(args ?? {}, studio);
      return { result: { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] } };
    } catch (error) {
      return { result: { isError: true, content: [{ type: 'text', text: JSON.stringify({ error: error.code || 'tool_failed', message: error.message }) }] } };
    }
  }
  /** Returns the JSON-RPC response for a request, or null for a notification. */
  async function handle(message) {
    if (!message || message.jsonrpc !== '2.0' || typeof message.method !== 'string') return message?.id === undefined ? null : { jsonrpc: '2.0', id: message.id, error: { code: -32600, message: 'Invalid request.' } };
    const respond = body => message.id === undefined ? null : { jsonrpc: '2.0', id: message.id, ...body };
    switch (message.method) {
      case 'initialize': return respond({ result: { protocolVersion: message.params?.protocolVersion || '2024-11-05', capabilities: { tools: {} }, serverInfo: { name: 'unparalleled-studio', version }, instructions: 'Call studio_status, then studio_context with reference studio-requests. Claim work with studio_next, locate and read the source, patch the smallest change, and reply honestly.' } });
      case 'ping': return respond({ result: {} });
      case 'tools/list': return respond({ result: { tools: publicTools } });
      case 'tools/call': return respond(await callTool(message.params?.name, message.params?.arguments));
      default: return message.method.startsWith('notifications/') ? null : respond({ error: { code: -32601, message: `Method ${message.method} is not supported.` } });
    }
  }
  return { handle, tools: publicTools };
}

export function serve({ project, input = process.stdin, output = process.stdout } = {}) {
  const server = createMcpServer({ project });
  const send = value => value && output.write(JSON.stringify(value) + '\n');
  const lines = readline.createInterface({ input });
  const pending = new Set();
  lines.on('line', line => {
    if (!line.trim()) return;
    let message;
    try { message = JSON.parse(line); } catch { return send({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error.' } }); }
    const work = Promise.all((Array.isArray(message) ? message : [message]).map(item => server.handle(item))).then(results => send(Array.isArray(message) ? results.filter(Boolean) : results[0])).finally(() => pending.delete(work));
    pending.add(work);
  });
  return new Promise(resolve => lines.on('close', () => Promise.all(pending).then(resolve)));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const index = process.argv.indexOf('--project');
  const project = index > -1 ? process.argv[index + 1] : process.env.STUDIO_PROJECT || process.cwd();
  serve({ project });
}
