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

  const updateInputValue = (element, value) => {
    var event = new Event('input', { bubbles: true })
    event.simulated = true
    element.value = value
    element.defaultValue = value
    element.dispatchEvent(event)
  }

  const bet = (betAmount) => {
    var coinInputElement = document.querySelectorAll('[data-test="bet-amount-input-fields"]')[1]
    var autoCashoutElement = document.querySelectorAll('[data-test="bet-amount-input-fields"]')[0]
    const button = document.querySelector('[data-test="place-queue-bet"]')

    updateInputValue(coinInputElement, betAmount)
    updateInputValue(autoCashoutElement, 2)

    // Disconnect the mutationObserver to prevent the button from being clicked
    mutationObserver.disconnect()
    // Click the button
    button.click()
    // Wait 2 second after clicking the button
    setTimeout(() => {
      // Start the mutationObserver again
      mutationObserver.observe(button, { attributes: true })
    }, 2000)
  }

  const setupEventListeners = (numberOfGames, startBettingThreshold, startBetAmount) => {
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
                betAmount = startBetAmount
              }

              // Update the previous money
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
    const { type, numberOfGames, startBettingThreshold, startBetAmount } = obj
    console.log('Message received', obj)
    if (type === 'PLAY') {
      betAmount = startBetAmount
      setupEventListeners(numberOfGames, startBettingThreshold, startBetAmount)
    } else if (type === 'STOP') {
      removeEventListeners()
    }
  })
})()
