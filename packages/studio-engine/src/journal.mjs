import fs from 'node:fs/promises';
import path from 'node:path';
import { EventEmitter } from 'node:events';
export class Journal extends EventEmitter {
  constructor(file) { super(); this.file = file; this.records = []; this.tail = Promise.resolve(); }
  async open() {
    await fs.mkdir(path.dirname(this.file), { recursive: true, mode: 0o700 });
    const bytes = await fs.readFile(this.file).catch(error => { if (error.code === 'ENOENT') return Buffer.alloc(0); throw error; });
    const end = bytes.lastIndexOf(10) + 1;
    const complete = bytes.subarray(0, end).toString('utf8');
    this.records = complete.split('\n').filter(Boolean).map((line, index) => {
      let record;
      try { record = JSON.parse(line); } catch { throw new Error(`Studio journal is corrupt at line ${index + 1}; preserve it for recovery.`); }
      if (record.seq !== index + 1 || !record.request?.id) throw new Error(`Studio journal has an invalid entry at line ${index + 1}.`);
      return record;
    });
    // Only a final incomplete record is recoverable automatically.
    if (end !== bytes.length) await fs.truncate(this.file, end);
    return this;
  }
  serial(action) {
    const next = this.tail.then(action);
    this.tail = next.catch(() => {});
    return next;
  }
  async append(type, request) {
    const record = { seq: this.records.length + 1, type, at: new Date().toISOString(), request: structuredClone(request) };
    const handle = await fs.open(this.file, 'a', 0o600);
    try { await handle.writeFile(JSON.stringify(record) + '\n'); await handle.sync(); } finally { await handle.close(); }
    this.records.push(record);
    this.emit('change', record);
    return request;
  }
  requests() {
    const requests = new Map();
    for (const record of this.records) requests.set(record.request.id, record.request);
    return [...requests.values()].map(request => structuredClone(request));
  }
}
