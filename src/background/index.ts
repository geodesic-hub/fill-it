// Open the side panel when the toolbar icon is clicked, instead of a popup
// that would close the moment you click into the page to fill a form.
chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => console.error('[Fill It] sidePanel setup failed', error))