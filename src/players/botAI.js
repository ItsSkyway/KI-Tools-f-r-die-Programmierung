/**
 * Bot AI v2 - Advanced Decision Making System
 * Three difficulty levels with sophisticated strategies
 *
 * EASY: Random play, passive defense, ~20% win rate
 * MEDIUM: Balanced offense/defense, ~50% win rate
 * HARD: Aggressive counter-play, deck knowledge, ~70%+ win rate
 */

import { DIFFICULTY_LEVELS } from '../game/constants.js'
import { getCard, getCardsByType } from '../cards/cardDatabase.js'

// ============================================================================
// BOT STATE MACHINE
// ============================================================================

const BOT_STATES = {
  OFFENSIVE: 'OFFENSIVE',    // Push opponent
  DEFENSIVE: 'DEFENSIVE',    // Defend against threat
  CYCLING: 'CYCLING',        // Cycle low-elixir cards for rotation
  WAITING: 'WAITING',        // Wait for elixir/opportunity
}

/**
 * AI Decision Memory: Tracks last 10 plays for context
 */
class BotMemory {
  constructor() {
    this.playHistory = []
    this.lastThreats = []
    this.state = BOT_STATES.CYCLING
    this.stateChangeTime = Date.now()
  }

  recordPlay(cardId, position) {
    this.playHistory.push({
      cardId,
      position,
      time: Date.now(),
    })
    if (this.playHistory.length > 10) {
      this.playHistory.shift()
    }
  }

  setState(newState) {
    if (newState !== this.state) {
      this.state = newState
      this.stateChangeTime = Date.now()
    }
  }

  getState() {
    return this.state
  }

  getTimeInState() {
    return Date.now() - this.stateChangeTime
  }
}

// Global memory for each bot instance (keyed by difficulty)
const botMemory = {
  easy: new BotMemory(),
  medium: new BotMemory(),
  hard: new BotMemory(),
}

/**
 * Main decision maker
 * @param {Object} botState - Bot hand, elixir, HP
 * @param {Object} playerState - Player hand, elixir, HP, troops
 * @param {Object} gameState - Full game state with all units
 * @param {string} difficulty - 'easy', 'medium', 'hard'
 * @returns {AIDecision|null}
 */
export const makeDecision = (botState, playerState, gameState, difficulty = 'medium') => {
  // Validate playable cards
  const playableCards = getPlayableCards(botState)
  if (playableCards.length === 0) {
    return null
  }

  const memory = botMemory[difficulty] || botMemory.medium

  // Route to difficulty-specific strategy
  let decision = null
  switch (difficulty) {
    case DIFFICULTY_LEVELS.EASY:
      decision = easyBotDecision(botState, playerState, gameState, playableCards, memory)
      break
    case DIFFICULTY_LEVELS.MEDIUM:
      decision = mediumBotDecision(botState, playerState, gameState, playableCards, memory)
      break
    case DIFFICULTY_LEVELS.HARD:
      decision = hardBotDecision(botState, playerState, gameState, playableCards, memory)
      break
    default:
      decision = mediumBotDecision(botState, playerState, gameState, playableCards, memory)
  }

  if (decision) {
    memory.recordPlay(decision.cardId, { x: decision.x, y: decision.y })
  }

  return decision
}

// ============================================================================
// DIFFICULTY: EASY (20% Win Rate)
// ============================================================================

const easyBotDecision = (botState, playerState, gameState, playableCards, memory) => {
  const random = Math.random()

  // 20% chance bot sleeps (waits 10 seconds)
  if (random < 0.2 && memory.getTimeInState() > 5000) {
    memory.setState(BOT_STATES.WAITING)
    return null
  }

  // Reset waiting state
  if (memory.getState() === BOT_STATES.WAITING && random > 0.5) {
    memory.setState(BOT_STATES.CYCLING)
  }

  // 80% of the time: Pure random selection
  const selectedCard = playableCards[Math.floor(Math.random() * playableCards.length)]

  return {
    shouldPlay: true,
    cardId: selectedCard.cardId,
    x: 150 + Math.random() * 300,   // Random X in playable area
    y: 100 + Math.random() * 200,   // Random Y in playable area
  }
}

// ============================================================================
// DIFFICULTY: MEDIUM (50% Win Rate)
// ============================================================================

const mediumBotDecision = (botState, playerState, gameState, playableCards, memory) => {
  const threats = analyzeBoardState(botState, playerState, gameState)
  const elixirDiff = botState.elixir - playerState.elixir

  // State transitions
  if (threats.underHeavyAttack && botState.elixir >= 5) {
    memory.setState(BOT_STATES.DEFENSIVE)
  } else if (elixirDiff > 2 && !threats.underHeavyAttack) {
    memory.setState(BOT_STATES.OFFENSIVE)
  } else {
    memory.setState(BOT_STATES.CYCLING)
  }

  let selectedCard = null

  switch (memory.getState()) {
    case BOT_STATES.DEFENSIVE:
      selectedCard = selectDefensiveCard(botState, playableCards, threats)
      break

    case BOT_STATES.OFFENSIVE:
      selectedCard = selectOffensiveCard(botState, playableCards, threats)
      break

    case BOT_STATES.CYCLING:
      // 50/50: Random or Strategically high-value
      if (Math.random() < 0.5) {
        selectedCard = playableCards[Math.floor(Math.random() * playableCards.length)]
      } else {
        selectedCard = selectHighValueCard(botState, playableCards)
      }
      break
  }

  if (!selectedCard) {
    selectedCard = playableCards[0]
  }

  // Medium positioning: Slightly strategic
  const position = getPositioningForCard(selectedCard, threats)

  return {
    shouldPlay: true,
    cardId: selectedCard.cardId,
    ...position,
  }
}

// ============================================================================
// DIFFICULTY: HARD (70%+ Win Rate)
// ============================================================================

const hardBotDecision = (botState, playerState, gameState, playableCards, memory) => {
  const threats = analyzeBoardState(botState, playerState, gameState)
  const gamePhase = getGamePhase(gameState)
  const elixirDiff = botState.elixir - playerState.elixir

  // Hard bot has deck knowledge: knows all 8 cards
  const knownCards = analyzePlayerDeck(playerState)

  // State machine with phase awareness
  if (threats.immediateKingThreat) {
    memory.setState(BOT_STATES.DEFENSIVE)
  } else if (gamePhase === 'FINISHING' && elixirDiff > 0) {
    memory.setState(BOT_STATES.OFFENSIVE)
  } else if (threats.opponentBuiltUp && botState.elixir >= 8) {
    memory.setState(BOT_STATES.OFFENSIVE)
  } else if (botState.elixir > 6 && !threats.underHeavyAttack) {
    memory.setState(BOT_STATES.OFFENSIVE)
  } else {
    memory.setState(BOT_STATES.DEFENSIVE)
  }

  let selectedCard = null

  // Active counter-strategies
  if (threats.manyEnemyUnits) {
    selectedCard = selectAOECard(botState, playableCards, threats)
  } else if (threats.immediateKingThreat) {
    selectedCard = selectDefensiveCard(botState, playableCards, threats)
  } else if (memory.getState() === BOT_STATES.OFFENSIVE) {
    selectedCard = selectOffensiveCard(botState, playableCards, threats)
  } else {
    selectedCard = selectHighValueCard(botState, playableCards)
  }

  if (!selectedCard) {
    selectedCard = playableCards[0]
  }

  // Hard positioning: Optimal tactical placement
  const position = getHardBotPositioning(selectedCard, threats, botState, playerState)

  return {
    shouldPlay: true,
    cardId: selectedCard.cardId,
    ...position,
  }
}

// ============================================================================
// BOARD ANALYSIS FUNCTIONS
// ============================================================================

/**
 * Comprehensive board state analysis
 */
const analyzeBoardState = (botState, playerState, gameState) => {
  const playerTroops = gameState.playerTroops || []
  const botTroops = gameState.enemyTroops || []
  const playerBuildings = gameState.playerBuildings || []
  const botBuildings = gameState.enemyBuildings || []

  const totalEnemyUnits = playerTroops.length
  const totalFriendlyUnits = botTroops.length

  // Tower health analysis
  const playerTowerHP = getTotalTowerHP(playerState)
  const botTowerHP = botState.hp || 3500

  return {
    // Unit threats
    manyEnemyUnits: totalEnemyUnits > 4,
    underHeavyAttack: totalEnemyUnits > 3 && botTowerHP < 2500,
    enemyHasBuildings: playerBuildings.length > 0,

    // King tower threat
    immediateKingThreat: botTowerHP < 1500,
    kingTowerCritical: botTowerHP < 1000,
    playerKingWeak: playerTowerHP < 1500,

    // Elixir advantage
    elixirLead: botState.elixir > playerState.elixir + 2,
    elixirBehind: botState.elixir < playerState.elixir - 2,

    // Positioning
    playerHasFrontLine: totalEnemyUnits > 2,
    ownTroopsCount: totalFriendlyUnits,
  }
}

/**
 * Determine game phase (early/mid/late)
 */
const getGamePhase = gameState => {
  const gameTime = gameState.gameTime || 180000
  const remainingSeconds = gameTime / 1000

  if (remainingSeconds > 120) return 'EARLY'
  if (remainingSeconds > 60) return 'MID'
  return 'FINISHING'
}

/**
 * Analyze opponent's known deck
 */
const analyzePlayerDeck = playerState => {
  const hand = playerState.hand || []
  const analyzedCards = hand.map(h => getCard(h.cardId)).filter(c => c !== null)

  return {
    hasAOE: analyzedCards.some(c => c.stats.splashRadius > 0),
    hasBuildings: analyzedCards.some(c => c.type === 'building'),
    hasTanks: analyzedCards.some(c => c.stats.hp > 800),
    maxCost: Math.max(...analyzedCards.map(c => c.elixirCost)),
  }
}

/**
 * Get total tower health
 */
const getTotalTowerHP = playerState => {
  // Estimate total tower HP based on game state
  return playerState.hp || 3500
}

// ============================================================================
// CARD SELECTION STRATEGIES
// ============================================================================

/**
 * Select best defensive card
 */
const selectDefensiveCard = (botState, playableCards, threats) => {
  // Priority 1: Buildings for defense
  const buildings = playableCards.filter(h => {
    const card = getCard(h.cardId)
    return card && card.type === 'building'
  })

  if (buildings.length > 0) {
    return buildings[0]
  }

  // Priority 2: AOE spells to clear many units
  if (threats.manyEnemyUnits) {
    const aoeDef = playableCards.filter(h => {
      const card = getCard(h.cardId)
      return card && card.stats.splashRadius > 80
    })
    if (aoeDef.length > 0) {
      return aoeDef[0]
    }
  }

  // Priority 3: Tank units
  const tanks = playableCards.filter(h => {
    const card = getCard(h.cardId)
    return card && card.stats.hp > 600
  })

  return tanks.length > 0 ? tanks[0] : playableCards[0]
}

/**
 * Select best offensive card
 */
const selectOffensiveCard = (botState, playableCards, threats) => {
  // Priority 1: High-damage troops when we have elixir advantage
  if (botState.elixir > 7) {
    const highValue = playableCards.filter(h => {
      const card = getCard(h.cardId)
      return card && card.elixirCost >= 4 && card.type === 'troop'
    })

    if (highValue.length > 0) {
      return highValue[0]
    }
  }

  // Priority 2: Building-targeting troops
  const buildingTargeters = playableCards.filter(h => {
    const card = getCard(h.cardId)
    return card && card.stats.targetBuildings
  })

  if (buildingTargeters.length > 0) {
    return buildingTargeters[0]
  }

  // Priority 3: Splash damage troops
  const splash = playableCards.filter(h => {
    const card = getCard(h.cardId)
    return card && card.stats.splashRadius > 0
  })

  return splash.length > 0 ? splash[0] : playableCards[0]
}

/**
 * Select best AOE card for clearing
 */
const selectAOECard = (botState, playableCards, threats) => {
  const aoeCards = playableCards.filter(h => {
    const card = getCard(h.cardId)
    return card && card.stats.splashRadius > 80
  })

  if (aoeCards.length > 0) {
    // Prefer higher damage
    return aoeCards.reduce((best, current) => {
      const bestCard = getCard(best.cardId)
      const currentCard = getCard(current.cardId)
      return (currentCard?.stats?.damage || 0) > (bestCard?.stats?.damage || 0) ? current : best
    })
  }

  return selectDefensiveCard(botState, playableCards, threats)
}

/**
 * Select highest value card by elixir cost
 */
const selectHighValueCard = (botState, playableCards, threats) => {
  let best = playableCards[0]

  playableCards.forEach(card => {
    const cardData = getCard(card.cardId)
    const bestData = getCard(best.cardId)

    if (cardData && bestData) {
      let cardScore = cardData.elixirCost
      let bestScore = bestData.elixirCost

      // Bonus for spells in certain scenarios
      if (threats?.manyEnemyUnits && cardData.stats.splashRadius > 0) {
        cardScore *= 1.5
      }

      if (cardScore > bestScore) {
        best = card
      }
    }
  })

  return best
}

// ============================================================================
// POSITIONING STRATEGIES
// ============================================================================

/**
 * Get positioning for medium bot
 */
const getPositioningForCard = (selectedCard, threats) => {
  const card = getCard(selectedCard.cardId)
  if (!card) {
    return { x: 300, y: 300 }
  }

  if (card.type === 'spell') {
    // Spells target center (medium bot doesn't predict unit positions)
    return { x: 300, y: 300 }
  }

  if (card.type === 'building') {
    // Buildings go to center-back for defense
    return { x: 300, y: 250 }
  }

  // Troops: Medium randomness
  return {
    x: 200 + Math.random() * 200,
    y: 150 + Math.random() * 200,
  }
}

/**
 * Get optimal positioning for hard bot
 */
const getHardBotPositioning = (selectedCard, threats, botState, playerState) => {
  const card = getCard(selectedCard.cardId)
  if (!card) {
    return { x: 300, y: 300 }
  }

  // Spell targeting
  if (card.type === 'spell') {
    if (threats.manyEnemyUnits) {
      // Target center where units cluster
      return { x: 300, y: 350 }
    }
    return { x: 300, y: 300 }
  }

  // Building placement
  if (card.type === 'building') {
    if (threats.immediateKingThreat) {
      // Place between king and enemy troops
      return { x: 300, y: 400 }
    }
    return { x: 300, y: 350 }
  }

  // Troop placement (offensive)
  if (card.stats.targetBuildings) {
    // Giant, Hog: push center for building damage
    return { x: 300, y: 300 }
  }

  if (card.stats.splashRadius > 0) {
    // Valkyrie, Baby Dragon: offense path
    return { x: 280 + Math.random() * 40, y: 250 + Math.random() * 100 }
  }

  // Ranged units: flanking positions
  return {
    x: 150 + Math.random() * 300,
    y: 200 + Math.random() * 300,
  }
}

// ============================================================================
// TIMING & PLAYABILITY
// ============================================================================

/**
 * Get playable cards from hand
 */
const getPlayableCards = botState => {
  return (botState.hand || []).filter(h => {
    const card = getCard(h.cardId)
    return card && botState.elixir >= card.elixirCost
  })
}

/**
 * Should bot play a card now? (Play rate control)
 */
export const shouldPlayCard = (lastPlayTime, difficulty) => {
  const now = Date.now()

  const playIntervals = {
    [DIFFICULTY_LEVELS.EASY]: 5000 + Math.random() * 3000,    // 5-8 seconds
    [DIFFICULTY_LEVELS.MEDIUM]: 3000 + Math.random() * 2000,  // 3-5 seconds
    [DIFFICULTY_LEVELS.HARD]: 2000 + Math.random() * 1000,    // 2-3 seconds
  }

  const interval = playIntervals[difficulty] || 3000

  return now - lastPlayTime > interval
}

/**
 * Get reaction time (delay before executing decision)
 */
export const getReactionTime = difficulty => {
  const times = {
    [DIFFICULTY_LEVELS.EASY]: 1500 + Math.random() * 1000,    // 1.5-2.5 sec
    [DIFFICULTY_LEVELS.MEDIUM]: 800 + Math.random() * 400,    // 0.8-1.2 sec
    [DIFFICULTY_LEVELS.HARD]: 200 + Math.random() * 300,      // 0.2-0.5 sec
  }

  return times[difficulty] || 1000
}

/**
 * Evaluate card value (alternative scoring)
 */
export const evaluateCardValue = (cardId, botState, playerState) => {
  const card = getCard(cardId)
  if (!card) return 0

  let value = card.elixirCost

  // Context-dependent bonuses
  if (botState.elixir > playerState.elixir + 2) {
    if (card.type === 'troop' || card.type === 'spell') {
      value *= 1.3
    }
  }

  if (botState.hp < playerState.hp - 500) {
    if (card.type === 'building') {
      value *= 1.8
    }
  }

  // AOE bonus when many enemy units
  if (card.stats?.splashRadius > 80) {
    value *= 1.2
  }

  return value
}
