// Make clicking the toolbar icon open the side panel. This must be registered
// from lifecycle events (not just at top level) so it reliably takes effect in
// the published service worker; the setting then persists.
function openPanelOnActionClick(): void {
    chrome.sidePanel
        .setPanelBehavior({ openPanelOnActionClick: true })
        .catch((error) => console.error('[Fill It] sidePanel setup failed', error))
}

chrome.runtime.onInstalled.addListener(openPanelOnActionClick)
chrome.runtime.onStartup.addListener(openPanelOnActionClick)
