;(() => {
  let mutationObserver

  const getLatestCrashHistory = (numberOfGames) => {
    // Get all elemets based on attribue data-test="games-history"
    const gamesHistory = document.querySelectorAll('[data-test="games-history"]')
    // Get all values from elements
    const values = Array.from(gamesHistory).map((el) => el.innerText)
    // Splice the array based on the number of games
    values.splice(numberOfGames, values.length)
    return values
  }

  const bet = () => {
    const buttonPlusOne = document.querySelectorAll('[data-test="plus-1"]')[1]
    const numberOfTokens = 3

    console.log('BETTING TIME')

    // Reset the input field
    document.querySelectorAll('[data-test="bet-amount-input-fields"]')[1].value = 0

    // console.log('Betting')
    for (let index = 0; index < numberOfTokens; index++) {
      buttonPlusOne.focus()
      buttonPlusOne.click()
    }
  }

  const setupEventListeners = () => {
    // Setup a mutationObserver for data-test="place-queue-bet" to see if the button
    // is in a queue state or bet state
    const button = document.querySelector('[data-test="place-queue-bet"]')
    mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'disabled') {
          if (!mutation.target.disabled) {
            bet()
          }
        }
      })
    })

    mutationObserver.observe(button, { attributes: true })
  }

  const removeEventListeners = () => {
    mutationObserver.disconnect()
  }

  chrome.runtime.onMessage.addListener((obj, sender, response) => {
    const { type, numberOfGames, startBettingThreshold } = obj
    if (type === 'PLAY') {
      const latestCrashes = getLatestCrashHistory(numberOfGames || 10)
      const max = Math.max(...latestCrashes)
      setupEventListeners()
    } else if (type === 'STOP') {
      removeEventListeners()
    }
  })
})()
