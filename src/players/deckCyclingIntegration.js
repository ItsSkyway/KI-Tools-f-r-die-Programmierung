/**
 * deckCyclingIntegration.js
 * 
 * Helper functions to integrate deck cycling with game logic
 * Handles the connection between card plays and deck state updates
 */

import { playCardAndCycle, getCycleInfo } from './deckCycling.js'

/**
 * Handle card play with automatic deck cycling
 * 
 * When player plays a card:
 * 1. Remove from hand
 * 2. Draw next from remaining pool
 * 3. Advance cycle index
 * 4. Reshuffle if needed
 * 
 * @param {Object} playerState - Player's current state
 * @param {string} cardInstanceId - The card's instance ID (from hand)
 * @param {string} cardId - The card's ID (for validation)
 * @returns {Object} { success, updatedPlayer, cycleInfo, message }
 */
export const handleCardPlayWithCycling = (playerState, cardInstanceId, cardId) => {
  try {
    // Play card and get new cycling state
    const cycleResult = playCardAndCycle(playerState.deckCyclingState, cardInstanceId)

    if (!cycleResult.success) {
      return {
        success: false,
        error: cycleResult.error,
      }
    }

    // Update player state with new cycling state
    const updatedPlayer = {
      ...playerState,
      deckCyclingState: cycleResult.updatedState,
      hand: cycleResult.updatedState.hand,
      handIndex: cycleResult.updatedState.cycleIndex,
      totalCardsPlayed: cycleResult.updatedState.totalCardsPlayed,
    }

    // Get cycle info for UI update
    const cycleInfo = getCycleInfo(cycleResult.updatedState)

    return {
      success: true,
      updatedPlayer,
      cycleInfo,
      reshuffle: cycleResult.reshuffle,
      nextCardId: cycleResult.nextCardId,
      message: cycleResult.reshuffle
        ? 'Deck reshuffled!'
        : `Cycle: ${cycleInfo.positionDisplay}`,
    }
  } catch (error) {
    return {
      success: false,
      error: `Cycling error: ${error.message}`,
    }
  }
}

/**
 * Get current cycle info for display
 * @param {Object} playerState - Player's state
 * @returns {Object} Cycle info for UI
 */
export const getPlayerCycleInfo = (playerState) => {
  if (!playerState.deckCyclingState) {
    return {
      position: 0,
      positionDisplay: '0/8',
      totalCycles: 0,
      totalCardsPlayed: 0,
      nextCardId: null,
      isNearReshuffle: false,
    }
  }

  return getCycleInfo(playerState.deckCyclingState)
}

/**
 * Get bot cycle count (for partial visibility)
 * Player can infer bot's cycle position by counting plays
 * 
 * @param {Object} botState - Bot's state
 * @returns {Object} Cycle info (position hidden, but total plays visible)
 */
export const getBotCycleDisplay = (botState) => {
  if (!botState.deckCyclingState) {
    return {
      totalCardsPlayed: botState.totalCardsPlayed || 0,
      cardsUntilReshuffle: 8 - ((botState.totalCardsPlayed || 0) % 8),
    }
  }

  const cycleInfo = getCycleInfo(botState.deckCyclingState)
  return {
    totalCardsPlayed: cycleInfo.totalCardsPlayed,
    cardsUntilReshuffle: 8 - cycleInfo.position,
    approximateCycleCount: cycleInfo.totalCycles,
  }
}

/**
 * Initialize both players with fresh cycling states
 * @param {Object} playerState - Player state to initialize
 * @param {Object} botState - Bot state to initialize
 */
export const initializeBothPlayersForCycling = (playerState, botState) => {
  // Both already initialized by playerManager, but can be called to verify
  return {
    playerCycleInfo: getPlayerCycleInfo(playerState),
    botCycleDisplay: getBotCycleDisplay(botState),
  }
}

/**
 * Validate that both players have valid cycling states
 * @param {Object} playerState - Player state
 * @param {Object} botState - Bot state
 * @returns {Object} { isValid, errors }
 */
export const validateBothCyclingStates = (playerState, botState) => {
  const errors = []

  if (!playerState.deckCyclingState) {
    errors.push('Player cycling state not initialized')
  } else if (playerState.hand.length !== 4) {
    errors.push(`Player hand should have 4 cards, has ${playerState.hand.length}`)
  }

  if (!botState.deckCyclingState) {
    errors.push('Bot cycling state not initialized')
  } else if (botState.hand.length !== 4) {
    errors.push(`Bot hand should have 4 cards, has ${botState.hand.length}`)
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}
