/**
 * Bot AI
 * Main AI decision-making and strategy
 */

import { DIFFICULTY_LEVELS } from '../game/constants.js'
import { getCard } from '../cards/cardDatabase.js'

/**
 * Make a card play decision for bot
 * @param {Object} botState - Bot player state
 * @param {Object} playerState - Human player state
 * @param {Object} gameState - Current game state
 * @param {string} difficulty - 'easy', 'medium', 'hard'
 * @returns {AIDecision|null}
 */
export const makeDecision = (botState, playerState, gameState, difficulty = 'medium') => {
  // Check if bot can play any card
  const playableCards = botState.hand.filter(h => {
    const card = getCard(h.cardId)
    return card && botState.elixir >= card.elixirCost
  })

  if (playableCards.length === 0) {
    return null
  }

  // Strategy depends on difficulty
  switch (difficulty) {
    case DIFFICULTY_LEVELS.EASY:
      return easyStrategy(botState, playableCards, playerState, gameState)
    case DIFFICULTY_LEVELS.MEDIUM:
      return mediumStrategy(botState, playableCards, playerState, gameState)
    case DIFFICULTY_LEVELS.HARD:
      return hardStrategy(botState, playableCards, playerState, gameState)
    default:
      return mediumStrategy(botState, playableCards, playerState, gameState)
  }
}

/**
 * Easy Bot: Plays random cards, less strategic
 */
const easyStrategy = (botState, playableCards, playerState, gameState) => {
  const card = playableCards[Math.floor(Math.random() * playableCards.length)]
  return {
    shouldPlay: true,
    cardId: card.cardId,
    x: 150 + Math.random() * 300,
    y: 100 + Math.random() * 200,
  }
}

/**
 * Medium Bot: Balanced play, some strategy
 */
const mediumStrategy = (botState, playableCards, playerState, gameState) => {
  // Prefer higher value cards when elixir is high
  let selected = playableCards[0]

  if (botState.elixir >= 7) {
    const highValue = playableCards.filter(h => {
      const card = getCard(h.cardId)
      return card && card.elixirCost >= 4
    })

    if (highValue.length > 0) {
      selected = highValue[Math.floor(Math.random() * highValue.length)]
    }
  }

  return {
    shouldPlay: true,
    cardId: selected.cardId,
    x: 150 + Math.random() * 300,
    y: 100 + Math.random() * 200,
  }
}

/**
 * Hard Bot: Optimal play, counter strategies
 */
const hardStrategy = (botState, playableCards, playerState, gameState) => {
  // Analyze threats and counter
  const threats = analyzeThreats(playerState, gameState)

  // If many enemy units, play AOE spells
  if (threats.manyUnits) {
    const aoeCards = playableCards.filter(h => {
      const card = getCard(h.cardId)
      return card && card.stats.splashRadius > 0
    })

    if (aoeCards.length > 0) {
      const card = aoeCards[0]
      return {
        shouldPlay: true,
        cardId: card.cardId,
        x: 300,
        y: 300,
      }
    }
  }

  // If low health, play defensive
  if (threats.lowHealth) {
    const defensive = playableCards.filter(h => {
      const card = getCard(h.cardId)
      return card && card.type === 'building'
    })

    if (defensive.length > 0) {
      const card = defensive[0]
      return {
        shouldPlay: true,
        cardId: card.cardId,
        x: 300,
        y: 150,
      }
    }
  }

  // Otherwise play strongest card
  let strongest = playableCards[0]
  playableCards.forEach(h => {
    const card1 = getCard(strongest.cardId)
    const card2 = getCard(h.cardId)
    if (card2 && card1 && card2.elixirCost > card1.elixirCost) {
      strongest = h
    }
  })

  return {
    shouldPlay: true,
    cardId: strongest.cardId,
    x: 150 + Math.random() * 300,
    y: 100 + Math.random() * 200,
  }
}

/**
 * Analyze threats on board
 */
const analyzeThreats = (playerState, gameState) => {
  const threats = {
    manyUnits: (playerState.troops || []).length > 3,
    lowHealth: playerState.hp < playerState.maxHp * 0.5,
    kingInDanger: playerState.hp < 1000,
  }

  return threats
}

/**
 * Should bot play a card now?
 */
export const shouldPlayCard = (lastPlayTime, difficulty) => {
  const now = Date.now()

  // Minimum play interval based on difficulty
  const playIntervals = {
    [DIFFICULTY_LEVELS.EASY]: 5000,
    [DIFFICULTY_LEVELS.MEDIUM]: 3000,
    [DIFFICULTY_LEVELS.HARD]: 2000,
  }

  const interval = playIntervals[difficulty] || 3000

  return now - lastPlayTime > interval
}

/**
 * Get reaction time delay
 */
export const getReactionTime = difficulty => {
  const times = {
    [DIFFICULTY_LEVELS.EASY]: 2000,
    [DIFFICULTY_LEVELS.MEDIUM]: 1000,
    [DIFFICULTY_LEVELS.HARD]: 500,
  }

  return times[difficulty] || 1000
}

/**
 * Evaluate card value
 * (for prioritizing which card to play)
 */
export const evaluateCardValue = (cardId, botState, playerState) => {
  const card = getCard(cardId)

  if (!card) return 0

  let value = card.elixirCost

  // Bonus for offensive cards when ahead
  if (botState.elixir > playerState.elixir + 2) {
    if (card.type === 'troop' || card.type === 'spell') {
      value *= 1.2
    }
  }

  // Bonus for defensive cards when behind
  if (botState.hp < playerState.hp - 500) {
    if (card.type === 'building') {
      value *= 1.5
    }
  }

  return value
}
