chrome.tabs.onUpdated.addListener((tabId, tab) => {
  if (tab.url && tab.url.includes('csgoroll.com/en/crash')) {
    chrome.tabs.sendMessage(tabId, {
      type: 'NEW'
    })
  }
})
