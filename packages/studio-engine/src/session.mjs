import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { EventEmitter } from 'node:events';
import { Journal } from './journal.mjs';
import { readSource, preparePatch, prepareCreation, writeSource } from './workspace.mjs';
import { StudioError, requireString, validateSelection, validateReference, publicRequest } from '../../studio-protocol/src/index.mjs';
const MAX_FILES = 12;
const MAX_TOTAL_BYTES = 2 * 1024 * 1024;
/** A request's change is one file, or several under change.changes. Return them all in apply order. */
export const changeList = change => change?.changes ?? (change ? [change] : []);
async function hashesOf(root, changes) {
  return Promise.all(changes.map(item => readSource(root, item.file).then(source => source.hash, () => null)));
}
export class StudioSession extends EventEmitter {
  constructor(options) {
    super(); this.root = options.root; this.skill = options.skill || 'website';
    this.stateDir = options.stateDir || path.join(this.root, '.unparalleled/studio');
    this.journal = new Journal(path.join(this.stateDir, 'events.jsonl'));
    this.id = crypto.randomUUID(); this.agentToken = crypto.randomBytes(32).toString('hex');
    this.browserToken = crypto.randomBytes(32).toString('hex'); this.agentSeenAt = 0; this.waitingAgents = 0;
    this.referenceToken = crypto.randomBytes(32).toString('hex');
    this.selection = null; this.documents = new Set(); this.commands = new Map();
    this.pickedReferences = new Map(); this.picker = null;
  }
  async open() {
    this.root = await fs.realpath(this.root);
    await fs.mkdir(this.stateDir, { recursive: true, mode: 0o700 });
    await fs.writeFile(path.join(this.stateDir, '.gitignore'), '*\n', { mode: 0o600 });
    this.lockPath = path.join(this.stateDir, 'engine.lock');
    try { this.lock = await fs.open(this.lockPath, 'wx', 0o600); }
    catch (error) {
      if (error.code !== 'EEXIST') throw error;
      let previous;
      try { previous = JSON.parse(await fs.readFile(this.lockPath, 'utf8')); } catch { throw new StudioError('engine_locked', 'An incomplete engine lock needs manual recovery.', 409); }
      let alive = true;
      try { process.kill(previous.pid, 0); } catch (probe) { if (probe.code === 'ESRCH') alive = false; else throw probe; }
      if (alive) throw new StudioError('engine_running', 'Studio is already running for this app. Reuse its connection.json.', 409);
      await fs.unlink(this.lockPath);
      this.lock = await fs.open(this.lockPath, 'wx', 0o600);
    }
    try {
      await this.lock.writeFile(JSON.stringify({ id: this.id, pid: process.pid }));
      const referenceKeyFile = path.join(this.stateDir, 'reference-key');
      const referenceKey = await fs.readFile(referenceKeyFile, 'utf8').catch(error => { if (error.code === 'ENOENT') return null; throw error; });
      if (referenceKey) {
        if (!/^[a-f0-9]{64}$/.test(referenceKey.trim())) throw new Error('Studio reference pairing key is corrupt. Preserve the state directory for recovery.');
        this.referenceToken = referenceKey.trim();
      } else await fs.writeFile(referenceKeyFile, this.referenceToken + '\n', { mode: 0o600, flag: 'wx' });
      await this.journal.open();
      await this.recover();
      this.journal.on('change', record => this.emit('update', record));
      return this;
    } catch (error) { await this.close(); throw error; }
  }
  async close() {
    if (this.picker) await this.picker.close();
    for (const pending of this.commands.values()) pending.reject(new StudioError('engine_stopped', 'Studio stopped.', 503));
    this.commands.clear();
    await this.journal.tail;
    if (this.lock) { await this.lock.close(); this.lock = null; await fs.rm(this.lockPath, { force: true }); }
  }
  async recover() {
    for (const request of this.journal.requests()) {
      if (request.status === 'undoing') {
        const changes = changeList(request.change), hashes = await hashesOf(this.root, changes);
        const status = changes.every((item, i) => hashes[i] === item.beforeHash) ? 'undone' : changes.every((item, i) => hashes[i] === item.afterHash) ? 'review' : 'conflict';
        await this.journal.append('undo_recovered', { ...request, status, message: status === 'conflict' ? 'Interrupted undo conflicts with current source. Review it manually.' : 'Recovered interrupted undo.' });
      } else if (request.status === 'applying') {
        const changes = changeList(request.change), hashes = await hashesOf(this.root, changes);
        const status = changes.every((item, i) => hashes[i] === item.afterHash) ? 'review' : changes.every((item, i) => hashes[i] === item.beforeHash) ? 'queued' : 'conflict';
        await this.journal.append('recovered', { ...request, status, leaseToken: null, change: status === 'queued' ? null : request.change, message: status === 'conflict' ? 'Interrupted edit conflicts with current source. Review it manually.' : 'Recovered after an interrupted source edit.' });
      } else if (request.status === 'working') {
        await this.journal.append('requeued', { ...request, status: 'queued', leaseToken: null, leaseUntil: null, message: 'Agent connection restarted; request retained.' });
      }
    }
  }
  list() { return this.journal.requests().map(publicRequest); }
  get(id) {
    const request = this.journal.requests().find(item => item.id === id);
    if (!request) throw new StudioError('not_found', 'Request does not exist.', 404);
    return request;
  }
  async create(data) {
    return this.journal.serial(async () => {
      const instruction = requireString(data.instruction, 'instruction');
      const selection = data.selection ? validateSelection(data.selection) : null;
      const pageUrl = selection?.pageUrl || data.pageUrl || this.origin;
      let origin;
      try { origin = new URL(pageUrl).origin; } catch { throw new StudioError('invalid_url', 'Provide a valid development page URL.'); }
      if (!(this.allowedOrigins || new Set([this.origin])).has(origin)) throw new StudioError('page_mismatch', 'Selection belongs to another development origin.', 403);
      if (selection && !this.documents.has(selection.documentId)) throw new StudioError('stale_selection', 'The page reloaded. Pick the element again.', 409);
      let attached = {};
      if (data.referenceId !== undefined && data.referenceId !== null) {
        const picked = this.pickedReferences.get(data.referenceId);
        if (!picked) throw new StudioError('reference_missing', 'That reference component is no longer available. Pick it again.', 409);
        if (!['inspire', 'recreate', 'redesign'].includes(data.intent)) throw new StudioError('invalid_intent', 'Choose inspire, recreate or redesign.');
        attached = { reference: picked, intent: data.intent };
      }
      const request = await this.journal.append('created', { id: crypto.randomUUID(), status: 'queued', instruction, selection, pageUrl, createdAt: new Date().toISOString(), message: 'Waiting for your IDE agent.', change: null, ...attached });
      if (attached.reference) this.pickedReferences.delete(data.referenceId);
      return publicRequest(request);
    });
  }
  /** Keep a component the user picked on another site so they can attach it to a local element. Newest five only. */
  async addPickedReference({ reference, image, warning }) {
    const id = crypto.randomUUID();
    const stored = { ...reference, id };
    if (warning) stored.captureWarning = warning;
    if (image?.length) {
      const directory = path.join(this.stateDir, 'artifacts'); await fs.mkdir(directory, { recursive: true, mode: 0o700 });
      stored.captureFile = path.join(directory, `${id}.jpg`);
      await fs.writeFile(stored.captureFile, image, { mode: 0o600 });
      stored.captureRuntime = 'user-picked-in-browser-window';
    }
    this.pickedReferences.set(id, stored);
    while (this.pickedReferences.size > 5) this.pickedReferences.delete(this.pickedReferences.keys().next().value);
    this.emit('update', {});
    return id;
  }
  discardPickedReference(id) { const had = this.pickedReferences.delete(id); this.emit('update', {}); return had; }
  async createReference(data) {
    return this.journal.serial(async () => {
      if (!['inspire', 'recreate', 'redesign'].includes(data.intent)) throw new StudioError('invalid_intent', 'Choose inspire, recreate or redesign.');
      const reference = validateReference(data.reference);
      if (data.captureWarning) reference.captureWarning = String(data.captureWarning).slice(0, 500);
      const instruction = requireString(data.instruction, 'instruction');
      if (data.capture) {
        const match = /^data:image\/(png|jpeg);base64,([a-zA-Z0-9+/=]+)$/.exec(data.capture);
        if (!match) throw new StudioError('invalid_capture', 'Reference capture must be a PNG or JPEG data URL.');
        const image = Buffer.from(match[2], 'base64');
        if (image.length > 4 * 1024 * 1024 || image.length < 8) throw new StudioError('invalid_capture', 'Reference capture must be no larger than 4 MiB.');
        const valid = match[1] === 'png' ? image.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])) : image[0] === 255 && image[1] === 216 && image[2] === 255;
        if (!valid) throw new StudioError('invalid_capture', 'Capture does not match its declared image type.');
        const directory = path.join(this.stateDir, 'artifacts'); await fs.mkdir(directory, { recursive: true, mode: 0o700 });
        reference.captureFile = path.join(directory, `${crypto.randomUUID()}.${match[1] === 'png' ? 'png' : 'jpg'}`);
        await fs.writeFile(reference.captureFile, image, { mode: 0o600 });
        reference.captureRuntime = String(data.captureRuntime || 'provided-image').slice(0, 100);
      }
      return publicRequest(await this.journal.append('reference_created', { id: crypto.randomUUID(), kind: 'reference', intent: data.intent, status: 'queued', instruction, reference, selection: null, pageUrl: this.origin, createdAt: new Date().toISOString(), message: 'Reference saved for your local project. Waiting for your IDE agent.', change: null }));
    });
  }
  async claim() {
    this.agentSeenAt = Date.now();
    return this.journal.serial(async () => {
      for (const request of this.journal.requests()) {
        if (request.status === 'working' && request.leaseUntil < Date.now()) await this.journal.append('lease_expired', { ...request, status: 'queued', leaseToken: null });
      }
      const request = this.journal.requests().find(item => item.status === 'queued');
      if (!request) { this.emit('update', {}); return null; }
      return this.journal.append('claimed', { ...request, status: 'working', leaseToken: crypto.randomBytes(24).toString('hex'), leaseUntil: Date.now() + 5 * 60 * 1000, message: 'Your agent is working on this request.' });
    });
  }
  leased(id, token) {
    const request = this.get(id);
    if (request.status !== 'working' || !token || request.leaseToken !== token || request.leaseUntil < Date.now()) throw new StudioError('lease_invalid', 'Request is cancelled, expired or owned by another agent. Claim it again before editing.', 409);
    return request;
  }
  async renew(id, token) {
    return this.journal.serial(async () => this.journal.append('renewed', { ...this.leased(id, token), leaseUntil: Date.now() + 5 * 60 * 1000 }));
  }
  async patch(id, data) {
    return this.journal.serial(async () => {
      const request = this.leased(id, data.leaseToken);
      // One file at the top level, or several under files. Everything is validated before any file is written.
      const entries = Array.isArray(data.files) ? data.files : [data];
      if (!entries.length || entries.length > MAX_FILES) throw new StudioError('invalid_patch', `Provide 1–${MAX_FILES} files per request.`);
      const names = entries.map(entry => entry?.file);
      if (new Set(names).size !== names.length) throw new StudioError('invalid_patch', 'Each file may appear only once in a request.');
      const prepared = [];
      for (const entry of entries) prepared.push(entry?.create === true ? await prepareCreation(this.root, entry.file, entry.expectedHash, entry.content) : preparePatch(await readSource(this.root, entry?.file), entry?.expectedHash, entry?.edits));
      if (prepared.reduce((sum, item) => sum + Buffer.byteLength(item.after, 'utf8'), 0) > MAX_TOTAL_BYTES) throw new StudioError('unsupported_file', 'A request may change at most 2 MiB of source in total so it stays inspectable and undoable.');
      const summary = requireString(data.summary, 'change summary', 2000);
      const change = { ...prepared[0], summary, ...(prepared.length > 1 ? { changes: prepared } : {}) };
      const staged = { ...request, status: 'applying', change, message: 'Applying the source change.' };
      await this.journal.append('patch_prepared', staged);
      const written = [];
      try { for (const item of prepared) { await writeSource(this.root, item); written.push(item); } }
      catch (error) {
        // Put back the files already written so a failed request never leaves a half-applied change.
        let rollbackError = null;
        for (const item of written.reverse()) { try { await writeSource(this.root, item, 'undo'); } catch (failure) { rollbackError = failure; break; } }
        const message = rollbackError ? `${error.message} Restoring the earlier files also failed (${rollbackError.message}); review them manually.` : prepared.length > 1 ? `${error.message} No file was changed.` : error.message;
        await this.journal.append('patch_failed', { ...staged, status: 'conflict', message });
        throw error;
      }
      return publicRequest(await this.journal.append('patched', { ...staged, status: 'review', leaseToken: null, message: summary }));
    });
  }
  async reply(id, data) {
    return this.journal.serial(async () => {
      const request = this.leased(id, data.leaseToken);
      if (!['review', 'failed'].includes(data.status)) throw new StudioError('invalid_status', 'Reply status must be review or failed.');
      return publicRequest(await this.journal.append('replied', { ...request, status: data.status, leaseToken: null, message: requireString(data.message, 'message', 2000) }));
    });
  }
  async decide(id, action) {
    return this.journal.serial(async () => {
      const request = this.get(id);
      if (action === 'cancel' && ['queued', 'working'].includes(request.status)) return publicRequest(await this.journal.append('cancelled', { ...request, status: 'cancelled', leaseToken: null, message: 'Cancelled by you.' }));
      if (request.status !== 'review') throw new StudioError('invalid_transition', 'This request is not ready for review.', 409);
      if (action === 'undo' && request.change) {
        // The source guard prevents undo from erasing a later developer edit.
        const changes = changeList(request.change);
        if (changes.length > 1) {
          const hashes = await hashesOf(this.root, changes);
          if (!changes.every((item, i) => hashes[i] === item.afterHash)) throw new StudioError('source_changed', 'Source has newer edits. Studio will not overwrite them.', 409);
        }
        await this.journal.append('undo_prepared', { ...request, status: 'undoing' });
        try { for (const item of [...changes].reverse()) await writeSource(this.root, item, 'undo'); }
        catch (error) {
          if (changes.length > 1) await this.journal.append('undo_conflict', { ...request, status: 'conflict', message: 'Undo stopped after changing some files; review them manually.' });
          else await this.journal.append('undo_conflict', request);
          throw error;
        }
      }
      if (!['keep', 'undo'].includes(action)) throw new StudioError('invalid_action', 'Unknown decision.');
      const message = request.change ? action === 'keep' ? 'Source change kept.' : 'Original source restored.' : action === 'keep' ? 'Agent result acknowledged.' : 'Agent result dismissed.';
      return publicRequest(await this.journal.append(action, { ...request, status: action === 'keep' ? 'completed' : 'undone', message }));
    });
  }
  async inspect(selector, documentId) {
    const document = documentId || (this.documents.has(this.selection?.documentId) ? this.selection.documentId : [...this.documents].at(-1));
    if (!this.documents.has(document)) throw new StudioError('browser_unavailable', 'Open the app with Studio attached before inspecting.', 409);
    const id = crypto.randomUUID();
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => { this.commands.delete(id); reject(new StudioError('browser_timeout', 'The page did not answer. Reconnect it and try again.', 504)); }, 8000);
      this.commands.set(id, { resolve: value => { clearTimeout(timer); resolve(value); }, reject: error => { clearTimeout(timer); reject(error); }, documentId: document });
      this.emit('command', { id, type: 'inspect', documentId: document, selector: selector || this.selection?.selector });
    });
  }
  browserReply(data) {
    const pending = this.commands.get(data.id);
    if (!pending || pending.documentId !== data.documentId) throw new StudioError('command_expired', 'Inspection request expired.', 409);
    this.commands.delete(data.id);
    if (data.error) pending.reject(new StudioError('inspection_failed', String(data.error).slice(0, 2000), 409));
    else pending.resolve(validateSelection(data.selection));
    return { ok: true };
  }
}
