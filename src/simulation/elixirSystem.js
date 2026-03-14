/**
 * Elixir System
 * Manages elixir regeneration and spending
 */

import { MAX_ELIXIR, ELIXIR_REGENERATION_RATE, ELIXIR_REGENERATION_RATE_DOUBLE } from '../game/constants.js'

/**
 * Update elixir (regenerate over time)
 * @param {Object} playerState
 * @param {number} deltaMs - Time passed in ms
 * @param {boolean} isDoubleElixir - Is double elixir active
 */
export const updateElixir = (playerState, deltaMs, isDoubleElixir = false) => {
  const rate = isDoubleElixir ? ELIXIR_REGENERATION_RATE_DOUBLE : ELIXIR_REGENERATION_RATE
  const regenAmount = (rate * deltaMs) / 1000

  playerState.elixir = Math.min(MAX_ELIXIR, playerState.elixir + regenAmount)
}

/**
 * Spend elixir for card play
 * @param {Object} playerState
 * @param {number} cost
 * @returns {boolean} - true if spent successfully
 */
export const spendElixir = (playerState, cost) => {
  if (playerState.elixir >= cost) {
    playerState.elixir -= cost
    return true
  }
  return false
}

/**
 * Get current elixir (rounded for UI)
 */
export const getDisplayElixir = elixir => {
  return Math.floor(elixir * 10) / 10
}

/**
 * Check if enough elixir to play card
 */
export const hasEnoughElixir = (playerState, cost) => {
  return playerState.elixir >= cost
}

/**
 * Reset elixir at game start
 */
export const resetElixir = playerState => {
  playerState.elixir = 10
  playerState.maxElixir = 10
}

/**
 * Boost elixir (spell effect)
 */
export const boostElixir = (playerState, amount) => {
  playerState.elixir = Math.min(MAX_ELIXIR, playerState.elixir + amount)
}

/**
 * Drain elixir (opponent spell effect)
 */
export const drainElixir = (playerState, amount) => {
  playerState.elixir = Math.max(0, playerState.elixir - amount)
}
