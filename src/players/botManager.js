/**
 * Bot Manager
 * Handles bot decision execution in game loop
 */

import { makeDecision, shouldPlayCard, getReactionTime } from './botAI.js'
import { getCard } from '../cards/cardDatabase.js'

/**
 * Bot decision state tracker
 */
class BotDecisionTracker {
  constructor() {
    this.lastPlayTime = 0
    this.pendingDecision = null
    this.decisionTime = null
    this.isExecuting = false
  }

  makePending(decision, difficulty) {
    this.pendingDecision = decision
    this.decisionTime = Date.now()
    const reactionDelay = getReactionTime(difficulty)
    return reactionDelay
  }

  isPending() {
    return this.pendingDecision !== null
  }

  readyToExecute() {
    if (!this.pendingDecision) return false
    const elapsed = Date.now() - this.decisionTime
    const card = getCard(this.pendingDecision.cardId)
    const reactionTime = getReactionTime(this.difficulty)
    return elapsed > reactionTime
  }

  getAndClearPending() {
    const decision = this.pendingDecision
    this.pendingDecision = null
    this.decisionTime = null
    this.lastPlayTime = Date.now()
    return decision
  }

  reset() {
    this.pendingDecision = null
    this.decisionTime = null
    this.isExecuting = false
  }
}

// Global tracker for each difficulty
const decisionTrackers = {
  easy: new BotDecisionTracker(),
  medium: new BotDecisionTracker(),
  hard: new BotDecisionTracker(),
}

/**
 * Update bot AI for this frame
 * Returns pending decision or executable decision
 *
 * @param {Object} botState - Bot player state
 * @param {Object} playerState - Player state
 * @param {Object} gameState - Full game state
 * @param {string} difficulty - Bot difficulty
 * @returns {Object} { decision, canExecute, isReady }
 */
export const updateBotAI = (botState, playerState, gameState, difficulty = 'medium') => {
  const tracker = decisionTrackers[difficulty] || decisionTrackers.medium

  // Check if we have a pending decision ready to execute
  if (tracker.isPending() && tracker.readyToExecute()) {
    const decision = tracker.getAndClearPending()
    return {
      decision,
      canExecute: true,
      isReady: true,
    }
  }

  // Check if it's time to make a new decision
  if (!tracker.isPending() && shouldPlayCard(tracker.lastPlayTime, difficulty)) {
    const newDecision = makeDecision(botState, playerState, gameState, difficulty)

    if (newDecision) {
      tracker.difficulty = difficulty
      const reactionDelay = tracker.makePending(newDecision, difficulty)

      return {
        decision: newDecision,
        canExecute: false,
        isReady: false,
        reactionDelay,
      }
    }
  }

  return {
    decision: null,
    canExecute: false,
    isReady: false,
  }
}

/**
 * Execute bot decision (play card)
 *
 * @param {Object} decision - The AI decision
 * @param {Object} gameState - Game state
 * @param {Function} playCardFn - Function to play the card
 * @returns {boolean} Whether execution succeeded
 */
export const executeBotDecision = (decision, gameState, playCardFn) => {
  if (!decision) {
    return false
  }

  try {
    // Execute the card play
    const success = playCardFn(decision.cardId, decision.x, decision.y)
    return success
  } catch (error) {
    console.error('Bot decision execution failed:', error)
    return false
  }
}

/**
 * Get bot statistics for a difficulty
 */
export const getBotStats = (difficulty) => {
  const tracker = decisionTrackers[difficulty]
  if (!tracker) return null

  return {
    difficulty,
    lastPlayTime: tracker.lastPlayTime,
    hasPendingDecision: tracker.isPending(),
    timeSinceLastPlay: Date.now() - tracker.lastPlayTime,
  }
}

/**
 * Reset bot AI (for new game)
 */
export const resetBotAI = (difficulty) => {
  const tracker = decisionTrackers[difficulty]
  if (tracker) {
    tracker.reset()
    tracker.lastPlayTime = 0
  }
}

/**
 * Reset all bots
 */
export const resetAllBots = () => {
  Object.values(decisionTrackers).forEach(tracker => {
    tracker.reset()
    tracker.lastPlayTime = 0
  })
}

/**
 * Difficulty configuration (for UI selection)
 */
export const DIFFICULTY_CONFIG = {
  easy: {
    name: 'Easy',
    description: 'Beginner - Plays randomly, ~20% win rate',
    emoji: '🟢',
    playRate: '5-8 seconds',
    strategy: 'Random selection',
    reactionTime: '1.5-2.5 seconds',
  },
  medium: {
    name: 'Medium',
    description: 'Intermediate - Balanced play, ~50% win rate',
    emoji: '🟡',
    playRate: '3-5 seconds',
    strategy: '50% random, 50% strategic',
    reactionTime: '0.8-1.2 seconds',
  },
  hard: {
    name: 'Hard',
    description: 'Expert - Aggressive, ~70%+ win rate',
    emoji: '🔴',
    playRate: '2-3 seconds',
    strategy: 'Tactical counter-play',
    reactionTime: '0.2-0.5 seconds',
  },
}

export default {
  updateBotAI,
  executeBotDecision,
  getBotStats,
  resetBotAI,
  resetAllBots,
  DIFFICULTY_CONFIG,
}
