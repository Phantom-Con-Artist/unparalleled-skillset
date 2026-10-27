const properties = ['display', 'color', 'backgroundColor', 'fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing', 'padding', 'margin', 'gap', 'borderRadius', 'width', 'height'];
export function selectorFor(element) {
  if (element.id && document.querySelectorAll(`#${CSS.escape(element.id)}`).length === 1) return `#${CSS.escape(element.id)}`;
  const parts = [];
  for (let node = element; node && node !== document.documentElement; node = node.parentElement) {
    let part = node.localName;
    const siblings = node.parentElement ? [...node.parentElement.children].filter(child => child.localName === node.localName) : [];
    if (siblings.length > 1) part += `:nth-of-type(${siblings.indexOf(node) + 1})`;
    parts.unshift(part);
    const selector = parts.join(' > ');
    if (document.querySelectorAll(selector).length === 1) return selector;
  }
  return 'html';
}
export function inspectElement(element, documentId) {
  if (!(element instanceof Element) || !element.isConnected) throw new Error('The target changed. Pick it again.');
  const computed = getComputedStyle(element);
  const rect = element.getBoundingClientRect();
  return {
    selector: selectorFor(element), documentId, pageUrl: location.href,
    tag: element.localName, text: (element.textContent || '').trim().slice(0, 2000),
    html: element.outerHTML.slice(0, 16000),
    sourceHint: element.closest('[data-studio-source]')?.getAttribute('data-studio-source') || null,
    styles: Object.fromEntries(properties.map(property => [property, computed[property]])),
    rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
  };
}
