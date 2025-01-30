chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

chrome.tabs.onUpdated.addListener(async (tabId, tab) => {
  if (!tab.url) return;
  if (tab.url.includes("console.aws.amazon.com")) {
    await chrome.sidePanel.setOptions({
      tabId,
      path: 'sidePanel.html',
      enabled: true
    });

  } else {
    // Disables the side panel on all other sites
    await chrome.sidePanel.setOptions({
      tabId,
      enabled: false
    });
  }
});

