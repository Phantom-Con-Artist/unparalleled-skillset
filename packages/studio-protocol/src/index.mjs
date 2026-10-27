export const VERSION = 1;
export const PREFIX = '/.unparalleled-studio';
export class StudioError extends Error {
  constructor(code, message, status = 400) { super(message); this.name = 'StudioError'; this.code = code; this.status = status; }
}
export function requireString(value, name, max = 4000) {
  if (typeof value !== 'string' || !value.trim() || value.length > max) throw new StudioError('invalid_input', `${name} must be nonempty text of at most ${max} characters.`);
  return value;
}
export function validateSelection(value) {
  if (!value || typeof value !== 'object') throw new StudioError('invalid_selection', 'Pick an element first.');
  const selector = requireString(value.selector, 'selector', 2000);
  const pageUrl = requireString(value.pageUrl, 'page URL', 4000);
  const documentId = requireString(value.documentId, 'document identity', 100);
  return {
    selector, pageUrl, documentId,
    tag: String(value.tag || '').slice(0, 100),
    text: String(value.text || '').slice(0, 2000),
    html: String(value.html || '').slice(0, 16000),
    sourceHint: typeof value.sourceHint === 'string' ? value.sourceHint.slice(0, 1000) : null,
    styles: Object.fromEntries(Object.entries(value.styles || {}).slice(0, 30).map(([k, v]) => [String(k).slice(0, 80), String(v).slice(0, 500)])),
    rect: Object.fromEntries(['x', 'y', 'width', 'height'].map(key => [key, Number.isFinite(value.rect?.[key]) ? value.rect[key] : 0])),
    capturedAt: new Date().toISOString(),
  };
}
export function publicRequest(request) {
  const { leaseToken, change, ...rest } = request;
  return { ...rest, change: change ? { file: change.file, beforeHash: change.beforeHash, afterHash: change.afterHash, summary: change.summary, ...(change.changes ? { files: change.changes.map(item => ({ file: item.file, beforeHash: item.beforeHash, afterHash: item.afterHash })) } : {}) } : null };
}
export function validateReference(value) {
  if (!value || typeof value !== 'object') throw new StudioError('invalid_reference', 'Provide a reference page.');
  let url;
  try { url = new URL(requireString(value.url, 'reference URL', 4000)); } catch { throw new StudioError('invalid_reference', 'Use a valid HTTP or HTTPS reference URL.'); }
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) throw new StudioError('invalid_reference', 'Use an HTTP or HTTPS page without embedded credentials.');
  return { url: url.href, title: String(value.title || '').slice(0, 500), selector: String(value.selector || 'html').slice(0, 2000), text: String(value.text || '').slice(0, 8000), html: String(value.html || '').slice(0, 24000), ...(value.styles && typeof value.styles === 'object' ? { styles: Object.fromEntries(Object.entries(value.styles).slice(0, 30).map(([k, v]) => [String(k).slice(0, 80), String(v).slice(0, 500)])) } : {}), capturedAt: new Date().toISOString(), authority: 'untrusted-reference-material' };
}
export const TERMINAL = new Set(['completed', 'undone', 'cancelled', 'failed', 'conflict']);
