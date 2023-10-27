import { getActiveTabURL } from './util.js'

let numberOfGames = 10
let startBettingThreshold = 2

const changeChromeStorage = (key, state) => {
  console.log('Changing chrome storage')
  console.log(key, state)
  chrome.storage.sync.set({
    [key]: state
  })
}

const getChromeStorage = (key) => {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get([key], (data) => {
      resolve(data[key])
    })
  })
}

const setButtonState = (state) => {
  const button = document.getElementById('jklfsdy8934rhu894r3nuiveryh789')
  button.className = state
}

const changeButtonState = () => {
  const button = document.getElementById('jklfsdy8934rhu894r3nuiveryh789')
  if (button.className === 'start') {
    button.className = 'stop'
    changeChromeStorage('playing', true)
    return 'start'
  } else if (button.className == 'stop') {
    button.className = 'start'
    changeChromeStorage('playing', false)
    return 'stop'
  }
}

const sendChromeMessage = (tabId, data) => {
  chrome.tabs.sendMessage(tabId, data)
}

const startBetting = async () => {
  const activeTab = await getActiveTabURL()
  sendChromeMessage(activeTab.id, {
    type: 'PLAY',
    numberOfGames: numberOfGames,
    startBettingThreshold: startBettingThreshold
  })
}

const stopBetting = async () => {
  const activeTab = await getActiveTabURL()
  sendChromeMessage(activeTab.id, {
    type: 'STOP'
  })
}

async function buttonClick() {
  const state = changeButtonState()
  if (state === 'start') {
    startBetting()
  } else if (state === 'stop') {
    stopBetting()
  }
}

const populateBox = async () => {
  const box = document.getElementById('gamble_box')
  box.innerHTML = `
    <div class="form-group">
      <label for="numberOfGames" id="numberOfGamesLabel">Number of games: ${numberOfGames}</label>
      <input type="number" min="1" max="10" class="form-control" id="numberOfGames" value="${numberOfGames}">
    </div>
    <div class="form-group">
      <label for="startBettingThreshold" id="startBettingThresholdLabel">Start betting threshold: ${startBettingThreshold}</label>
      <input type="number" class="form-control" id="startBettingThreshold" value="${startBettingThreshold}">
    </div>
  `
}

const setupEventListeners = () => {
  document.getElementById('numberOfGames').addEventListener('change', (e) => {
    numberOfGames = e.target.value
    // Update the label as well
    document.getElementById('numberOfGamesLabel').innerHTML = `Number of games: ${e.target.value}`
  })

  document.getElementById('startBettingThreshold').addEventListener('change', (e) => {
    startBettingThreshold = e.target.value
    // Update the label as well
    document.getElementById('startBettingThresholdLabel').innerHTML = `Start betting threshold: ${e.target.value})`
  })

  // Add eventlistener to button
  document.getElementById('jklfsdy8934rhu894r3nuiveryh789').addEventListener('click', buttonClick)
}

const initGame = async (alreadyPlaying) => {
  const state = alreadyPlaying ? 'stop' : 'start'
  setButtonState(state)

  if (alreadyPlaying) {
    startBetting()
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const activeTab = await getActiveTabURL()
  const alreadyPlaying = await getChromeStorage('playing')
  initGame(alreadyPlaying)

  if (activeTab.url.includes('csgoroll.com/en/crash')) {
    document.getElementById('test_header').innerHTML = 'CSGO roll crash site found!'
    await populateBox()
    setupEventListeners()
  } else {
    document.getElementById('test_header').innerHTML = 'CSGO roll crash site not found! Please go to the crash site and try again.'
    document.getElementById('gamble_box_container').style.display = 'none'
  }
})
