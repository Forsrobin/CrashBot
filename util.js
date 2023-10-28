export async function getActiveTabURL() {
  const tabs = await chrome.tabs.query({
    currentWindow: true,
    active: true
  })

  return tabs[0]
}

export const changeChromeStorage = (key, state) => {
  chrome.storage.sync.set({
    [key]: state
  })
}

export const getChromeStorage = (key) => {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get([key], (data) => {
      resolve(data[key])
    })
  })
}
