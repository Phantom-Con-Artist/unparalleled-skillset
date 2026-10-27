import { installReferencePicker } from './picker.mjs';
async function startPicker(intent = 'inspire', wholePage = false, tabId) {
  const tab = tabId ? await chrome.tabs.get(tabId) : (await chrome.tabs.query({ active: true, currentWindow: true }))[0];
  if (!tab?.id || !/^https?:\/\//.test(tab.url || '')) throw new Error('Open an ordinary HTTP or HTTPS page first. Browser-internal pages cannot be inspected.');
  const settings = await chrome.storage.local.get(['studioUrl', 'referenceToken']);
  if (!settings.studioUrl || !settings.referenceToken) throw new Error('Connect the browser companion to a running local Studio project first.');
  await chrome.scripting.executeScript({ target: { tabId: tab.id }, func: installReferencePicker, args: [intent, wholePage] });
  return { ok: true };
}
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({ id: 'unparalleled-reference', title: 'Use this page with Unparalleled Studio', contexts: ['page', 'selection', 'image'] });
});
chrome.contextMenus.onClicked.addListener((info, tab) => { if (info.menuItemId === 'unparalleled-reference') startPicker('inspire', false, tab.id).catch(error => console.error(error.message)); });
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (sender.id !== chrome.runtime.id) return false;
  const action = async () => {
    if (message.type === 'pick-reference') return startPicker(message.intent, message.wholePage);
    if (message.type !== 'submit-reference' || !sender.tab?.id) throw new Error('Unsupported browser companion action.');
    if (!['inspire', 'recreate', 'redesign'].includes(message.intent)) throw new Error('Choose a supported reference action.');
    const tab = await chrome.tabs.get(sender.tab.id);
    if (new URL(tab.url).href !== new URL(message.reference?.url).href) throw new Error('The reference tab navigated. Pick it again.');
    const active = (await chrome.tabs.query({ active: true, windowId: tab.windowId }))[0];
    if (active?.id !== tab.id) throw new Error('Return to the reference tab before capturing it.');
    const settings = await chrome.storage.local.get(['studioUrl', 'referenceToken']);
    const url = new URL(settings.studioUrl);
    if (url.protocol !== 'http:' || !['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname)) throw new Error('Connect to a local Studio origin.');
    let capture, captureWarning;
    try { capture = await chrome.tabs.captureVisibleTab(tab.windowId, { format: 'jpeg', quality: 70 }); }
    catch { captureWarning = 'Saved without an image. Open the picker from the browser extension button to grant screenshot access.'; }
    const stillActive = (await chrome.tabs.query({ active: true, windowId: tab.windowId }))[0];
    if (stillActive?.id !== tab.id || (await chrome.tabs.get(tab.id)).url !== tab.url) throw new Error('The active page changed during capture. Return to it and pick again.');
    const response = await fetch(`${url.origin}/.unparalleled-studio/references`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-studio-token': settings.referenceToken }, body: JSON.stringify({ instruction: message.instruction, intent: message.intent, reference: message.reference, capture, captureWarning, captureRuntime: 'user-tab-browser-companion' }) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Studio rejected the reference. Refresh the pairing key after restarting the engine.');
    return { ok: true, requestId: result.id, captureWarning };
  };
  action().then(sendResponse).catch(error => sendResponse({ ok: false, message: error.message }));
  return true;
});
