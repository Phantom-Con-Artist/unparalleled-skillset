const $ = id => document.getElementById(id);
const settings = await chrome.storage.local.get(['studioUrl', 'referenceToken']);
$('url').value = settings.studioUrl || 'http://127.0.0.1:4310';
$('token').value = settings.referenceToken || '';
$('connection').open = !settings.referenceToken;
$('save').addEventListener('click', async () => {
  try {
    const url = new URL($('url').value);
    if (url.protocol !== 'http:' || !['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname) || url.username || url.password) throw new Error('Use a local Studio HTTP URL.');
    if (!/^[a-f0-9]{64}$/.test($('token').value.trim())) throw new Error('Paste the reference pairing key printed by Studio.');
    await chrome.storage.local.set({ studioUrl: url.origin, referenceToken: $('token').value.trim() });
    $('status').textContent = 'Connection saved.'; $('connection').open = false;
  } catch (error) { $('status').textContent = error.message; }
});
async function pick(wholePage) {
  const result = await chrome.runtime.sendMessage({ type: 'pick-reference', intent: $('intent').value, wholePage });
  if (result?.ok) window.close(); else $('status').textContent = result?.message || 'The picker could not attach to this page.';
}
$('pick').addEventListener('click', () => pick(false).catch(error => $('status').textContent = error.message));
$('page').addEventListener('click', () => pick(true).catch(error => $('status').textContent = error.message));
