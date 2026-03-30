/**
 * Player Manager
 * Player state initialization and management
 * 
 * Now integrates with new deckCycling system for proper 8-card cycling
 */

import { PLAYER_TYPES } from '../game/constants.js'
import { initializeTowers } from '../simulation/towers.js'
import { createDeckCyclingState, getRandomDeck, getRecommendedDeck } from './deckCycling.js'

/**
 * Create a player state object
 * @param {string} type - 'human' or 'bot'
 * @param {string[]} deck - Array of card IDs
 * @param {Object} options - Additional options
 * @returns {PlayerState}
 */
export const createPlayerState = (type, deck, options = {}) => {
  const defaultDeck = deck || getRandomDeck()

  // Create deck cycling state (handles shuffle, hand init, etc.)
  const deckCyclingState = createDeckCyclingState(defaultDeck)

  const playerState = {
    type,
    difficulty: options.difficulty || 'medium',
    hp: 3500,
    maxHp: 3500,
    elixir: 10,
    maxElixir: 10,
    
    // Deck cycling integration
    deck: deckCyclingState.deck,
    deckCyclingState, // Full cycling state with hand, cycle tracking, etc.
    hand: deckCyclingState.hand, // Reference to hand for compatibility
    handIndex: deckCyclingState.cycleIndex, // Keep for compatibility, but use deckCyclingState
    
    towers: initializeTowers(options.ownerType || 'player'),
    troops: [],
    buildings: [],
    lastCardPlayTime: 0,
    totalCardsPlayed: 0,
    totalDamageDealt: 0,
    totalDamageTaken: 0,
  }

  return playerState
}

/**
 * Initialize human player (with chosen deck)
 */
export const createHumanPlayer = deck => {
  return createPlayerState(PLAYER_TYPES.HUMAN, deck)
}

/**
 * Initialize bot player
 */
export const createBotPlayer = difficulty => {
  const defaultDeck = getRandomDeck()
  return createPlayerState(PLAYER_TYPES.BOT, defaultDeck, {
    difficulty,
    ownerType: 'enemy',
  })
}

/**
 * Reset player for new game
 */
export const resetPlayerState = playerState => {
  // Create fresh cycling state
  const deckCyclingState = createDeckCyclingState(playerState.deck)

  playerState.hp = playerState.maxHp
  playerState.elixir = 10
  
  // Reset deck cycling
  playerState.deckCyclingState = deckCyclingState
  playerState.hand = deckCyclingState.hand
  playerState.handIndex = deckCyclingState.cycleIndex
  
  playerState.troops = []
  playerState.buildings = []
  playerState.lastCardPlayTime = 0
  playerState.totalCardsPlayed = 0
  playerState.totalDamageDealt = 0
  playerState.totalDamageTaken = 0

  // Reset towers
  Object.entries(playerState.towers).forEach(([key, tower]) => {
    tower.hp = tower.maxHp
    tower.destroyed = false
  })
}

/**
 * Get player health percentage
 */
export const getHealthPercent = playerState => {
  return (playerState.hp / playerState.maxHp) * 100
}

/**
 * Get player status
 */
export const getPlayerStatus = playerState => {
  return {
    hp: playerState.hp,
    maxHp: playerState.maxHp,
    healthPercent: getHealthPercent(playerState),
    elixir: playerState.elixir,
    maxElixir: playerState.maxElixir,
    troops: playerState.troops.length,
    buildings: playerState.buildings.length,
    cardsPlayed: playerState.totalCardsPlayed,
  }
}

/**
 * Damage player (reduce king tower HP)
 */
export const damagePlayer = (playerState, damage) => {
  playerState.hp = Math.max(0, playerState.hp - damage)
  playerState.totalDamageTaken += damage

  return playerState.hp <= 0
}

/**
 * Deal damage to player (from combat)
 */
export const dealPlayerDamage = (playerState, damage) => {
  return damagePlayer(playerState, damage)
}

/**
 * Track damage dealt by player
 */
export const trackDamageDealt = (playerState, damage) => {
  playerState.totalDamageDealt += damage
}

/**
 * Check if player is alive
 */
export const isPlayerAlive = playerState => {
  return playerState.hp > 0
}

/**
 * Check if player won
 */
export const hasPlayerWon = (playerState, opponentState) => {
  return playerState.hp > 0 && opponentState.hp <= 0
}

/**
 * Get player summary for end screen
 */
export const getPlayerSummary = (playerState, opponent) => {
  return {
    type: playerState.type,
    finalHp: playerState.hp,
    damageDealt: playerState.totalDamageDealt,
    damageTaken: playerState.totalDamageTaken,
    cardsPlayed: playerState.totalCardsPlayed,
    elixirWasted: Math.max(0, playerState.elixir), // Unused elixir
    deckUsed: playerState.deck,
    opponentType: opponent.type,
  }
}

/**
 * Calculate player rating (simple ELO-like)
 */
export const calculatePlayerRating = (playerState, opponentState, won) => {
  const baseRating = 1600
  const k = 32

  if (won) {
    return baseRating + k
  } else {
    return baseRating - k
  }
}
