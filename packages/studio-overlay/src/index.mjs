import { inspectElement } from './inspector.mjs';
import { styles } from './styles.mjs';
export function mountStudio(config) {
  if (document.querySelector('unparalleled-studio')) return;
  // Chromium does not reliably register @font-face rules inside a shadow root.
  for (const [family, file] of [['StudioArchivo', 'archivo'], ['StudioMartian', 'martian']]) {
    const font = new FontFace(family, `url(${config.prefix}/assets/${file}.woff2)`, { weight: '100 900' });
    document.fonts.add(font); font.load().catch(() => {});
  }
  const documentId = crypto.randomUUID();
  const host = document.createElement('unparalleled-studio');
  const shadow = host.attachShadow({ mode: 'open' });
  const storageKey = `unparalleled-studio:${location.pathname}`;
  let saved = {};
  try { saved = JSON.parse(sessionStorage.getItem(storageKey) || '{}'); } catch { /* storage may be disabled */ }
  shadow.innerHTML = `<style>${styles(config.prefix)}</style>
    <div class="outline" hidden><span class="outline-label"></span></div>
    <section class="panel" aria-label="Unparalleled Studio inspector" hidden>
      <header><h2>Change this element</h2><button class="close" aria-label="Close inspector">×</button></header>
      <div class="scope"><div class="target">Choose an element on your page.</div><button class="parent" aria-label="Select parent" hidden>Parent</button></div>
      <div class="tabs" role="tablist" aria-label="Inspector view"><button role="tab" data-tab="change" aria-selected="true" id="studio-change-tab" aria-controls="studio-change">Change</button><button role="tab" data-tab="inspect" aria-selected="false" id="studio-inspect-tab" aria-controls="studio-inspect">Inspect</button><button role="tab" data-tab="activity" aria-selected="false" id="studio-activity-tab" aria-controls="studio-activity">Activity</button></div>
      <div class="content" id="studio-change" role="tabpanel" aria-labelledby="studio-change-tab"><form><div data-reference-fields hidden><label for="studio-reference-url">Reference page URL</label><input id="studio-reference-url" type="url" placeholder="https://example.com"><label for="studio-reference-intent">Use it to…</label><select id="studio-reference-intent"><option value="inspire">Inspire a new direction</option><option value="recreate">Recreate its structure</option><option value="redesign">Redesign it for my project</option></select></div><label for="studio-instruction">What should change?</label><textarea id="studio-instruction" placeholder="Describe the change and what should stay."></textarea><div class="actions"><button class="primary" type="submit">Send to agent</button></div></form></div>
      <div class="content" id="studio-inspect" role="tabpanel" aria-labelledby="studio-inspect-tab" hidden><label for="studio-selector">Select by CSS selector</label><input id="studio-selector" placeholder="#heading or a unique selector"><button data-select-selector>Select selector</button><p class="intro">Current computed styles and geometry.</p><dl class="facts"></dl><details hidden><summary>Rendered HTML</summary><pre></pre></details></div>
      <div class="content" id="studio-activity" role="tabpanel" aria-labelledby="studio-activity-tab" hidden><p class="intro">Requests stay with this project when the page or agent reconnects.</p><ol class="activity"></ol></div>
      <p class="notice" role="status" aria-live="polite">Connecting to the local engine…</p>
    </section>
    <nav class="bar" aria-label="Unparalleled Studio tools"><svg class="mark" aria-hidden="true" viewBox="0 0 28 28" fill="none"><path d="M10 3H3v7M18 25h7v-7M18 3h7v7M3 18v7h7" stroke="currentColor" stroke-width="1.6"/><path d="m10 9 9 5-5 1-1 5-3-11Z" fill="currentColor"/></svg><button data-pick aria-pressed="false">Pick</button><button data-page aria-pressed="false">Page</button><button data-reference aria-pressed="false">Reference</button><span class="divider"></span><button data-activity>Activity <span data-count>0</span></button><span class="state">Connecting</span></nav>`;
  document.documentElement.append(host);
  const $ = selector => shadow.querySelector(selector);
  const panel = $('.panel'), textarea = $('textarea'), notice = $('.notice'), outline = $('.outline');
  let selected = null, selection = null, picking = false, pageScope = saved.scope === 'page', referenceMode = saved.scope === 'reference', connected = false, submitting = false, tab = saved.tab || 'change';
  let state = { requests: [], agentListening: false };
  textarea.value = saved.draft || ''; $('#studio-reference-url').value = saved.referenceUrl || ''; $('#studio-reference-intent').value = saved.intent || 'inspire';
  const persist = () => { try { sessionStorage.setItem(storageKey, JSON.stringify({ draft: textarea.value, open: !panel.hidden, tab, scope: referenceMode ? 'reference' : pageScope ? 'page' : 'element', referenceUrl: $('#studio-reference-url').value, intent: $('#studio-reference-intent').value })); } catch { /* working without storage is supported */ } };
  function message(text, error = false) { notice.textContent = text; notice.classList.toggle('error', error); }
  async function api(route, data) {
    const response = await fetch(`${config.prefix}${route}`, { method: data === undefined ? 'GET' : 'POST', headers: { 'x-studio-token': config.token, ...(data === undefined ? {} : { 'Content-Type': 'application/json' }) }, ...(data === undefined ? {} : { body: JSON.stringify(data) }) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'The local engine could not complete this action.');
    return result;
  }
  function showTab(name, moveFocus = false) {
    tab = name;
    for (const button of shadow.querySelectorAll('[role=tab]')) { const active = button.dataset.tab === name; button.setAttribute('aria-selected', String(active)); button.tabIndex = active ? 0 : -1; if (active && moveFocus) button.focus(); }
    for (const element of shadow.querySelectorAll('[role=tabpanel]')) element.hidden = element.id !== `studio-${name}`;
    persist();
  }
  function placeComposer() {
    if (panel.hidden) return;
    const width = panel.offsetWidth, height = panel.offsetHeight, gutter = 10;
    const rect = selected?.isConnected ? selected.getBoundingClientRect() : null;
    let x = innerWidth - width - 18, y = innerHeight - height - 86;
    if (rect && rect.bottom > 0 && rect.top < innerHeight) {
      if (rect.right + width + 24 < innerWidth) { x = rect.right + 16; y = rect.top; }
      else if (rect.left - width - 24 > 0) { x = rect.left - width - 16; y = rect.top; }
      else { x = rect.left; y = rect.bottom + 14; if (y + height > innerHeight - 76 && rect.top - height - 14 > gutter) y = rect.top - height - 14; }
    }
    panel.style.left = `${Math.max(gutter, Math.min(x, innerWidth - width - gutter))}px`;
    panel.style.top = `${Math.max(gutter, Math.min(y, innerHeight - height - 76))}px`;
    panel.style.right = 'auto';
  }
  new ResizeObserver(placeComposer).observe(panel);
  function open(name = 'change') { panel.hidden = false; showTab(name); placeComposer(); persist(); }
  function setPicking(value) {
    picking = value; $('[data-pick]').setAttribute('aria-pressed', String(value));
    if (value) { referenceMode = false; $('[data-reference-fields]').hidden = true; $('[data-reference]').setAttribute('aria-pressed', 'false'); $('[for=studio-instruction]').textContent = 'What should change?'; pageScope = false; $('[data-page]').setAttribute('aria-pressed', 'false'); panel.hidden = true; $('.state').textContent = 'Choose an element'; message('Pick an element. Escape returns to normal interaction.'); }
    else { updateOutline(selected); $('.state').textContent = state.agentListening ? 'Agent listening' : 'Waiting for agent'; if (connected) message(state.agentListening ? 'Your IDE agent is listening.' : 'Waiting for your IDE agent.'); }
  }
  function updateOutline(element) {
    if (!element?.isConnected) { outline.hidden = true; return; }
    const rect = element.getBoundingClientRect();
    outline.hidden = rect.width === 0 || rect.height === 0 || rect.bottom < 0 || rect.top > innerHeight;
    Object.assign(outline.style, { left: `${rect.x}px`, top: `${rect.y}px`, width: `${rect.width}px`, height: `${rect.height}px` });
    $('.outline-label').textContent = `${element.localName} · ${Math.round(rect.width)} × ${Math.round(rect.height)}`;
  }
  function select(element) {
    selection = inspectElement(element, documentId); selected = element; pageScope = false; referenceMode = false; $('[data-reference-fields]').hidden = true; $('[data-reference]').setAttribute('aria-pressed', 'false'); $('[for=studio-instruction]').textContent = 'What should change?';
    $('.scope .target').textContent = selection.selector;
    $('#studio-selector').value = selection.selector;
    $('.parent').hidden = !element.parentElement || element.parentElement === document.documentElement;
    const facts = $('.facts'); facts.replaceChildren();
    for (const [name, value] of [['size', `${Math.round(selection.rect.width)} × ${Math.round(selection.rect.height)} px`], ...Object.entries(selection.styles), ['source hint', selection.sourceHint || 'Not mapped']]) {
      const dt = document.createElement('dt'), dd = document.createElement('dd'); dt.textContent = name; dd.textContent = value; facts.append(dt, dd);
    }
    $('details').hidden = false; $('pre').textContent = selection.html;
    $('[data-page]').setAttribute('aria-pressed', 'false');
    $('h2').textContent = 'Change this element';
    setPicking(false); open('change'); updateOutline(selected);
    api('/selection', selection).catch(error => message(error.message, true));
  }
  const outside = event => !event.composedPath().includes(host);
  document.addEventListener('pointermove', event => { if (picking && outside(event)) updateOutline(event.target); }, true);
  document.addEventListener('pointerdown', event => { if (picking && outside(event)) { event.preventDefault(); event.stopImmediatePropagation(); } }, true);
  document.addEventListener('click', event => {
    if (!picking || !outside(event)) return;
    event.preventDefault(); event.stopImmediatePropagation();
    try { select(event.target); textarea.focus(); } catch (error) { message(error.message, true); }
  }, true);
  document.addEventListener('keydown', event => {
    if (picking && event.key === 'Enter' && outside(event) && document.activeElement instanceof Element && document.activeElement !== document.body) {
      event.preventDefault(); event.stopImmediatePropagation(); select(document.activeElement); textarea.focus(); return;
    }
    if (event.key === 'Escape') {
      if (picking) { setPicking(false); event.preventDefault(); event.stopImmediatePropagation(); }
      else if (!panel.hidden && !outside(event)) { panel.hidden = true; $('[data-pick]').focus(); persist(); event.preventDefault(); event.stopImmediatePropagation(); }
    }
  }, true);
  addEventListener('scroll', () => { if (!picking) { updateOutline(selected); placeComposer(); } }, { passive: true, capture: true });
  addEventListener('resize', () => { updateOutline(selected); placeComposer(); }, { passive: true });
  $('[data-pick]').addEventListener('click', () => setPicking(!picking));
  $('[data-page]').addEventListener('click', () => { selected = null; selection = null; pageScope = true; referenceMode = false; $('[data-reference-fields]').hidden = true; $('[data-reference]').setAttribute('aria-pressed', 'false'); $('[for=studio-instruction]').textContent = 'What should change?'; setPicking(false); outline.hidden = true; $('h2').textContent = 'Steer this page'; $('.scope .target').textContent = `Whole page · ${location.pathname}`; $('.parent').hidden = true; $('[data-page]').setAttribute('aria-pressed', 'true'); open(); textarea.focus(); });
  $('.parent').addEventListener('click', () => { if (selected?.parentElement) select(selected.parentElement); });
  $('[data-select-selector]').addEventListener('click', () => {
    try {
      const matches = document.querySelectorAll($('#studio-selector').value);
      if (matches.length !== 1 || matches[0] === host || host.contains(matches[0])) throw new Error('Use a selector that identifies exactly one page element.');
      select(matches[0]); showTab('inspect');
    } catch (error) { message(error.message, true); }
  });
  function openReference() {
    selected = null; selection = null; pageScope = false; referenceMode = true; setPicking(false); outline.hidden = true;
    $('[data-reference-fields]').hidden = false; $('[data-reference]').setAttribute('aria-pressed', 'true'); $('[data-page]').setAttribute('aria-pressed', 'false');
    $('h2').textContent = 'Bring a reference'; $('.scope .target').textContent = 'Reference → this local project'; $('.parent').hidden = true;
    $('[for=studio-instruction]').textContent = 'What should the agent take from it?';
    open('change'); $('#studio-reference-url').focus();
  }
  $('[data-reference]').addEventListener('click', openReference);
  $('#studio-reference-url').addEventListener('input', persist); $('#studio-reference-intent').addEventListener('change', persist);
  $('[data-activity]').addEventListener('click', () => open('activity'));
  $('.close').addEventListener('click', () => { panel.hidden = true; $('[data-pick]').focus(); persist(); });
  for (const button of shadow.querySelectorAll('[role=tab]')) {
    button.addEventListener('click', () => showTab(button.dataset.tab));
    button.addEventListener('keydown', event => { if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return; event.preventDefault(); const names = ['change', 'inspect', 'activity']; const index = names.indexOf(tab); showTab(event.key === 'Home' ? names[0] : event.key === 'End' ? names[2] : names[(index + (event.key === 'ArrowRight' ? 1 : 2)) % 3], true); });
  }
  textarea.addEventListener('input', persist);
  $('form').addEventListener('submit', async event => {
    event.preventDefault();
    if (submitting) return;
    if (!connected) return message('The engine is disconnected. Your draft is saved on this page.', true);
    if (!pageScope && !referenceMode && (!selected?.isConnected || !selection)) return message('Pick an element, or choose Page to request a page-wide change.', true);
    if (!textarea.value.trim()) return message('Describe what you want to change first.', true);
    submitting = true; $('button[type=submit]').disabled = true;
    try {
      if (referenceMode) await api('/references', { instruction: textarea.value, intent: $('#studio-reference-intent').value, reference: { url: $('#studio-reference-url').value } });
      else await api('/requests', { instruction: textarea.value, pageUrl: location.href, selection: pageScope ? null : inspectElement(selected, documentId) });
      textarea.value = ''; persist(); showTab('activity'); message('Request saved. Waiting for your IDE agent.');
    } catch (error) { message(error.message, true); }
    finally { submitting = false; $('button[type=submit]').disabled = false; }
  });
  let renderedRequests = null;
  function renderState(next) {
    state = next; const requests = [...state.requests].reverse();
    $('[data-count]').textContent = requests.filter(item => !['completed', 'undone', 'cancelled', 'failed', 'conflict'].includes(item.status)).length;
    $('.state').textContent = state.agentListening ? 'Agent listening' : requests.some(request => request.status === 'working') ? 'Agent has request' : 'Waiting for agent';
    const signature = JSON.stringify(requests);
    if (signature === renderedRequests) return;
    renderedRequests = signature;
    const focusRequest = shadow.activeElement?.dataset.requestId, focusAction = shadow.activeElement?.dataset.action;
    const list = $('.activity'); list.replaceChildren();
    if (!requests.length) { const item = document.createElement('li'); item.textContent = 'No requests yet. Pick a page element to start.'; list.append(item); }
    for (const request of requests) {
      const item = document.createElement('li');
      const status = document.createElement('div'); status.className = 'status'; status.textContent = ({ queued: 'Waiting for agent', working: 'Agent working', applying: 'Applying source edit', review: 'Ready for your review', completed: 'Kept', undone: 'Undone', cancelled: 'Cancelled', failed: 'Needs attention', conflict: 'Source conflict', undoing: 'Restoring source' })[request.status] || request.status;
      const instruction = document.createElement('p'); instruction.textContent = request.instruction;
      const target = document.createElement('div'); target.className = 'target'; target.textContent = request.reference ? `${request.intent} · ${request.reference.url}` : request.selection?.selector || 'Whole page';
      const detail = document.createElement('p'); detail.textContent = request.message || '';
      item.append(status, instruction, target, detail);
      if (request.change) { const file = document.createElement('p'); file.className = 'target'; file.textContent = request.change.file; item.append(file); }
      const actions = document.createElement('div'); actions.className = 'actions';
      for (const [action, label] of request.status === 'review' ? [['keep', request.change ? 'Keep edit' : 'Acknowledge result'], ['undo', request.change ? 'Undo source edit' : 'Dismiss result']] : ['queued', 'working'].includes(request.status) ? [['cancel', 'Cancel request']] : []) {
        const button = document.createElement('button'); button.textContent = label;
        button.dataset.requestId = request.id; button.dataset.action = action;
        button.addEventListener('click', async () => { button.disabled = true; try { const result = await api(`/requests/${request.id}/${action}`, {}); message(result.message); } catch (error) { button.disabled = false; message(error.message, true); } }); actions.append(button);
      }
      item.append(actions); list.append(item);
    }
    if (focusRequest) (shadow.querySelector(`[data-request-id="${CSS.escape(focusRequest)}"][data-action="${CSS.escape(focusAction)}"]`) || $('[data-tab=activity]')).focus();
  }
  let recoveryTimer;
  async function checkRestart() {
    recoveryTimer = null;
    if (connected) return;
    try {
      const response = await fetch(`${config.prefix}/browser-session`, { cache: 'no-store' });
      if (response.ok && (await response.json()).sessionId !== config.sessionId) { persist(); location.reload(); return; }
    } catch { /* Keep the draft while the engine is offline. */ }
    recoveryTimer = setTimeout(checkRestart, 2500);
  }
  const events = new EventSource(`${config.prefix}/events?token=${encodeURIComponent(config.token)}&documentId=${documentId}`);
  events.onopen = () => { connected = true; clearTimeout(recoveryTimer); recoveryTimer = null; message('Connected. Pick an element or steer the page.'); };
  events.onerror = () => { connected = false; $('.state').textContent = 'Reconnecting'; message('Engine disconnected. Requests and your draft are retained.', true); if (!recoveryTimer) recoveryTimer = setTimeout(checkRestart, 1500); };
  events.addEventListener('state', event => { renderState(JSON.parse(event.data)); });
  events.addEventListener('source', () => { persist(); location.reload(); });
  events.addEventListener('command', async event => {
    const command = JSON.parse(event.data); if (command.documentId !== documentId) return;
    if (command.type !== 'inspect') return;
    try {
      const matches = command.selector ? document.querySelectorAll(command.selector) : selected ? [selected] : [];
      if (matches.length !== 1) throw new Error('The selector must identify exactly one connected element.');
      await api('/browser/reply', { id: command.id, documentId, selection: inspectElement(matches[0], documentId) });
    }
    catch (error) { api('/browser/reply', { id: command.id, documentId, error: error.message }).catch(() => {}); }
  });
  addEventListener('pagehide', () => { clearTimeout(recoveryTimer); events.close(); }, { once: true });
  showTab(tab); if (saved.open) { if (referenceMode) openReference(); else if (pageScope) $('[data-page]').click(); else open(tab); }
}
