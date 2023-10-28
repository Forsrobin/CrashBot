;(() => {
  let mutationObserver
  let previousMoney = undefined
  let betAmount

  const getLatestCrashHistory = (numberOfGames) => {
    // Get all elemets based on attribue data-test="games-history"
    const gamesHistory = document.querySelectorAll('[data-test="games-history"]')
    // Get all values from elements
    const values = Array.from(gamesHistory).map((el) => {
      const formattedValue = el.innerText.replace(',', '')
      return parseFloat(formattedValue)
    })
    // Splice the array based on the number of games
    values.splice(numberOfGames, values.length)
    return values
  }

  const getAmountOfMoney = () => {
    const moneySpans = document.querySelectorAll('[data-test="value"]')
    const money = moneySpans[0].innerText
    return money
  }

  const bet = (betAmount) => {
    const buttonPlusOne = document.querySelectorAll('[data-test="plus-1"]')[1]

    console.log('Bet amount', betAmount)

    // Reset the input field
    document.querySelectorAll('[data-test="bet-amount-input-fields"]')[1].value = 0

    // console.log('Betting')
    for (let index = 0; index < betAmount; index++) {
      buttonPlusOne.focus()
      buttonPlusOne.click()
    }
  }

  const setupEventListeners = (numberOfGames, startBettingThreshold) => {
    // Setup a mutationObserver for data-test="place-queue-bet" to see if the button
    // is in a queue state or bet state
    const button = document.querySelector('[data-test="place-queue-bet"]')
    mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'disabled') {
          if (!mutation.target.disabled) {
            const latestCrashHistory = getLatestCrashHistory(numberOfGames)
            const maxCrash = Math.max(...latestCrashHistory)
            const shouldBet = maxCrash <= startBettingThreshold

            if (shouldBet) {
              if (previousMoney && getAmountOfMoney() < previousMoney) {
                console.log('Lost money, increasing bet amount by times 2')
                betAmount *= 2
              } else if (previousMoney && getAmountOfMoney() >= previousMoney) {
                console.log('Won money, resetting bet amount')
                betAmount = 2
              }

              previousMoney = getAmountOfMoney()

              bet(betAmount)
              return
            } else {
              console.log('Not betting becasue the max crash is', maxCrash, 'and the start betting threshold is', startBettingThreshold)
            }
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
    console.log('Message received', obj)
    if (type === 'PLAY') {
      betAmount = 2
      setupEventListeners(numberOfGames, startBettingThreshold)
    } else if (type === 'STOP') {
      removeEventListeners()
    } else if (type === 'ALREADY_PLAYING') {
      removeEventListeners()
      setupEventListeners(numberOfGames, startBettingThreshold)
    }
  })
})()
