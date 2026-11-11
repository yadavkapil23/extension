const openTabs = new Map();
const now = () => Date.now();
async function seed() { for (const tab of await chrome.tabs.query({})) if (tab.id != null) openTabs.set(tab.id, { title: tab.title || 'Untitled tab', url: tab.url || '', openedAt: now() }); }
chrome.runtime.onInstalled.addListener(seed); chrome.runtime.onStartup.addListener(seed);
chrome.tabs.onCreated.addListener(tab => { if (tab.id != null) openTabs.set(tab.id, { title: tab.title || 'New tab', url: tab.url || '', openedAt: now() }); });
chrome.tabs.onUpdated.addListener((id, change, tab) => { const item = openTabs.get(id) || { openedAt: now() }; item.title = tab.title || item.title || 'Untitled tab'; item.url = tab.url || item.url || ''; openTabs.set(id, item); });
chrome.tabs.onRemoved.addListener(async (id, info) => { const tab = openTabs.get(id); openTabs.delete(id); if (!tab) return; const { memorials = [] } = await chrome.storage.local.get('memorials'); memorials.unshift({ ...tab, closedAt: now(), windowId: info.windowId, id: crypto.randomUUID() }); await chrome.storage.local.set({ memorials: memorials.slice(0, 200) }); });
async function openGraveyard() { const url = chrome.runtime.getURL('graveyard.html'); const tabs = await chrome.tabs.query({ url }); if (tabs[0]?.id) return chrome.tabs.update(tabs[0].id, { active: true }); chrome.tabs.create({ url }); }
chrome.action.onClicked.addListener(openGraveyard); chrome.commands.onCommand.addListener(c => { if (c === 'open-graveyard') openGraveyard(); }); seed();
