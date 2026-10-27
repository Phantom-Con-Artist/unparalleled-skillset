// This function is injected by chrome.scripting. Keep all helpers inside it.
export function installReferencePicker(initialIntent = 'inspire', wholePage = false) {
  globalThis.__unparalleledReferenceCleanup?.();
  document.querySelector('unparalleled-reference-picker')?.remove();
  const host = document.createElement('unparalleled-reference-picker');
  const shadow = host.attachShadow({ mode: 'open' });
  const font = new FontFace('UnparalleledReferenceArchivo', `url(${chrome.runtime.getURL('assets/archivo.woff2')})`, { weight: '100 900' });
  document.fonts.add(font); font.load().catch(() => {});
  const extensionAPI = chrome.runtime;
  let target = null, picking = !wholePage;
  const controller = new AbortController();
  shadow.innerHTML = `<style>
:host{all:initial;position:fixed;inset:0;z-index:2147483647;pointer-events:none;font:14px/1.5 UnparalleledReferenceArchivo,Arial,sans-serif;color:#252622}*{box-sizing:border-box}[hidden]{display:none!important}button,input,textarea,select{font:inherit}button{border:1px solid #85887e;background:#f2f2ed;color:#252622;border-radius:2px;padding:8px 11px;min-height:36px;cursor:pointer}button:focus-visible,select:focus-visible,textarea:focus-visible{outline:2px solid #aa341e;outline-offset:3px}button:hover{background:#e0e2d8}.primary{background:#aa341e;border-color:#aa341e;color:white}.primary:hover{background:#872715}button:disabled{opacity:.6;cursor:default}.hint{pointer-events:auto;position:absolute;left:50%;bottom:18px;transform:translateX(-50%);padding:10px 14px;background:#242724;color:#f2f2ed;max-width:calc(100vw - 20px);box-shadow:0 4px 16px #0003;font-size:13px}.hint button{margin-left:8px;background:transparent;color:white;border-color:#85887e}.outline{position:absolute;border:2px solid #aa341e;outline:1px solid white}.composer{pointer-events:auto;position:absolute;width:330px;max-width:calc(100vw - 20px);max-height:70vh;overflow:auto;background:#f2f2ed;border:1px solid #85887e;box-shadow:0 4px 18px #0003;padding:14px}header{display:flex;gap:10px;align-items:center;margin-bottom:10px}h2{font-size:16px;margin:0;flex:1}.close{border:0;padding:4px;font-size:20px}label{display:block;margin:10px 0 6px;font-weight:600;font-size:13px}select,textarea{width:100%;border:1px solid #85887e;background:#fff;color:#252622;padding:9px;border-radius:0}textarea{min-height:90px;resize:vertical}p{font-size:12px;overflow-wrap:anywhere;margin:7px 0}.source{color:#55574e}.actions{display:flex;gap:8px;margin-top:12px}.notice{color:#55574e}.error{color:#8b2b17}
</style><div class="outline" hidden></div><div class="hint">Pick a reference element. Escape exits.<button data-exit>Exit</button></div><section class="composer" aria-label="Reference composer" hidden><header><h2>Use as a reference</h2><button class="close" aria-label="Close reference picker">×</button></header><p class="source"></p><p class="target"></p><label for="reference-intent">How should the agent use it?</label><select id="reference-intent"><option value="inspire">Inspire a new direction</option><option value="recreate">Recreate the selected structure</option><option value="redesign">Redesign it for my project</option></select><label for="reference-instruction">What should the agent do?</label><textarea id="reference-instruction" placeholder="Describe what to borrow, change, or build."></textarea><div class="actions"><button class="primary" data-send>Send reference</button><button data-parent>Select parent</button></div><p class="notice" role="status">This goes to your local project. The reference site's source is not edited.</p></section>`;
  document.documentElement.append(host);
  const $ = selector => shadow.querySelector(selector);
  $('#reference-intent').value = ['inspire', 'recreate', 'redesign'].includes(initialIntent) ? initialIntent : 'inspire';
  function close() { controller.abort(); host.remove(); }
  globalThis.__unparalleledReferenceCleanup = close;
  function selector(element) {
    if (element.id && document.querySelectorAll('#' + CSS.escape(element.id)).length === 1) return '#' + CSS.escape(element.id);
    const parts = [];
    for (let node = element; node && node !== document.documentElement; node = node.parentElement) {
      const siblings = node.parentElement ? [...node.parentElement.children].filter(child => child.localName === node.localName) : [];
      parts.unshift(node.localName + (siblings.length > 1 ? `:nth-of-type(${siblings.indexOf(node) + 1})` : ''));
      if (document.querySelectorAll(parts.join(' > ')).length === 1) return parts.join(' > ');
    }
    return 'html';
  }
  function outline(element) {
    const r = element.getBoundingClientRect(); $('.outline').hidden = false;
    Object.assign($('.outline').style, { left: r.x + 'px', top: r.y + 'px', width: r.width + 'px', height: r.height + 'px' });
  }
  function choose(element) {
    target = element; picking = false; outline(element); $('.hint').hidden = true;
    $('.source').textContent = new URL(location.href).host;
    $('.target').textContent = wholePage ? 'Entire page' : selector(element);
    const composer = $('.composer'); composer.hidden = false;
    const r = element.getBoundingClientRect(); const width = composer.offsetWidth, height = composer.offsetHeight;
    const x = r.right + width + 20 < innerWidth ? r.right + 12 : r.left - width - 20 > 0 ? r.left - width - 12 : r.left;
    const y = r.right + width + 20 < innerWidth ? r.top : r.bottom + 12;
    Object.assign(composer.style, { left: Math.max(10, Math.min(x, innerWidth - width - 10)) + 'px', top: Math.max(10, Math.min(y, innerHeight - height - 12)) + 'px' });
    $('[data-parent]').hidden = wholePage || !element.parentElement;
    $('#reference-instruction').focus();
  }
  for (const button of shadow.querySelectorAll('[data-exit],.close')) button.addEventListener('click', close);
  document.addEventListener('pointermove', event => { if (picking && !event.composedPath().includes(host)) outline(event.target); }, { capture: true, signal: controller.signal });
  document.addEventListener('pointerdown', event => { if (picking && !event.composedPath().includes(host)) { event.preventDefault(); event.stopImmediatePropagation(); } }, { capture: true, signal: controller.signal });
  document.addEventListener('click', event => { if (picking && !event.composedPath().includes(host)) { event.preventDefault(); event.stopImmediatePropagation(); choose(event.target); } }, { capture: true, signal: controller.signal });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') close(); else if (picking && event.key === 'Enter' && !event.composedPath().includes(host) && document.activeElement !== document.body) { event.preventDefault(); choose(document.activeElement); } }, { capture: true, signal: controller.signal });
  $('[data-parent]').addEventListener('click', () => { if (target?.parentElement) choose(target.parentElement); });
  $('[data-send]').addEventListener('click', async () => {
    const instruction = $('#reference-instruction').value.trim();
    const notice = $('.notice'); notice.classList.remove('error');
    if (!instruction) { notice.textContent = 'Describe what you want your agent to do with this reference.'; return; }
    if (!target?.isConnected) { notice.textContent = 'The page changed. Pick the reference again.'; return; }
    const reference = { url: location.href, title: document.title, selector: wholePage ? 'html' : selector(target), text: (target.textContent || '').trim().slice(0, 8000), html: target.outerHTML.slice(0, 24000) };
    $('[data-send]').disabled = true;
    host.style.visibility = 'hidden';
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    try {
      const result = await extensionAPI.sendMessage({ type: 'submit-reference', instruction, intent: $('#reference-intent').value, reference });
      if (!result?.ok) throw new Error(result?.message || 'Could not send the reference.');
      notice.textContent = result.captureWarning || 'Reference saved. Your IDE agent can pick it up in the local project.';
    } catch (error) { notice.textContent = error.message; notice.classList.add('error'); }
    finally { host.style.visibility = ''; $('[data-send]').disabled = false; }
  });
  if (wholePage) choose(document.body);
}
