/**
 * Enhanced Deck Cycling System
 * 
 * Implements real Clash Royale card cycling mechanics:
 * - 8-card deck with Fisher-Yates shuffle
 * - 4-card visible hand
 * - Circular cycling through deck
 * - Full cycle tracking for both player and bot
 * - Deterministic reshuffles
 */

import { getCardArray, getCard } from '../cards/cardDatabase.js'
import { HAND_MAX_DECK_SIZE } from '../game/constants.js'

/**
 * Fisher-Yates shuffle algorithm (deterministic)
 * @param {Array} array - Array to shuffle
 * @param {number} seed - Optional seed for deterministic shuffle
 * @returns {Array} Shuffled copy
 */
export const fisherYatesShuffle = (array, seed = null) => {
  const arr = [...array]
  
  // Use seeded random if provided, otherwise use Math.random()
  const getRandom = seed !== null 
    ? (() => {
        // Simple seeded LCG (Linear Congruential Generator)
        seed = (seed * 1103515245 + 12345) & 0x7fffffff
        return seed / 0x7fffffff
      })
    : Math.random

  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(getRandom() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }

  return arr
}

/**
 * Create a complete deck cycling state
 * @param {string[]} cardIds - Array of 8 card IDs
 * @returns {Object} Complete deck state with hand and cycling tracking
 */
export const createDeckCyclingState = (cardIds) => {
  // Validate
  if (cardIds.length !== HAND_MAX_DECK_SIZE) {
    throw new Error(`Deck must have exactly ${HAND_MAX_DECK_SIZE} cards`)
  }

  // Fisher-Yates shuffle the deck
  const shuffledDeck = fisherYatesShuffle(cardIds)

  // Split into hand (0-3) and remaining pool (4-7)
  const handCardIds = shuffledDeck.slice(0, 4)
  const remainingPoolCardIds = shuffledDeck.slice(4, 8)

  // Create hand objects with unique IDs for React rendering
  const hand = handCardIds.map(cardId => ({
    cardId,
    instanceId: Math.random().toString(36).substring(2, 9),
  }))

  return {
    // Cycle tracking
    cycleIndex: 0, // 0-7: which position in the 8-card cycle
    cycleCount: 0, // How many complete 8-card cycles completed
    totalCardsPlayed: 0, // Lifetime card count

    // Deck state
    deck: shuffledDeck, // Full 8-card deck in play order
    hand, // 4 cards currently playable
    remainingPool: remainingPoolCardIds, // 4 cards waiting to be drawn

    // Metadata
    lastShuffleTime: Date.now(),
    reshuffleHistory: [], // Track when deck reshuffles happen
  }
}

/**
 * Get the next card that will be drawn
 * @param {Object} deckState - Deck cycling state
 * @returns {string|null} Card ID of next card, or null if none available
 */
export const getNextCardPreview = (deckState) => {
  if (deckState.remainingPool.length === 0) {
    return null
  }
  return deckState.remainingPool[0]
}

/**
 * Get cycle position display (e.g., "3/8")
 * @param {Object} deckState - Deck cycling state
 * @returns {string} Display string like "3/8"
 */
export const getCyclePositionDisplay = (deckState) => {
  return `${deckState.cycleIndex}/${HAND_MAX_DECK_SIZE}`
}

/**
 * Get complete cycle info for UI display
 * @param {Object} deckState - Deck cycling state
 * @returns {Object} Cycle display info
 */
export const getCycleInfo = (deckState) => {
  return {
    position: deckState.cycleIndex,
    positionDisplay: getCyclePositionDisplay(deckState),
    totalCycles: deckState.cycleCount,
    totalCardsPlayed: deckState.totalCardsPlayed,
    nextCardId: getNextCardPreview(deckState),
    isNearReshuffle: deckState.cycleIndex >= 6, // Within 2 plays of reshuffle
  }
}

/**
 * Play a card and cycle to next
 * 
 * Main cycling logic:
 * 1. Remove card from hand
 * 2. Draw next card from remaining pool
 * 3. Advance cycle index
 * 4. Check if reshuffle needed (cycle_index >= 8)
 * 
 * @param {Object} deckState - Current deck state
 * @param {string} cardInstanceId - Instance ID of card to play (not card ID)
 * @returns {Object} { success, updatedState, cardsRemaining, reshuffle }
 */
export const playCardAndCycle = (deckState, cardInstanceId) => {
  try {
    // Deep copy to avoid mutations
    const state = JSON.parse(JSON.stringify(deckState))

    // Find and remove card from hand
    const cardIndex = state.hand.findIndex(c => c.instanceId === cardInstanceId)
    if (cardIndex === -1) {
      return {
        success: false,
        error: 'Card not found in hand',
      }
    }

    const playedCard = state.hand[cardIndex]
    state.hand.splice(cardIndex, 1)

    // Draw next card from remaining pool
    if (state.remainingPool.length > 0) {
      const nextCardId = state.remainingPool.shift()
      state.hand.push({
        cardId: nextCardId,
        instanceId: Math.random().toString(36).substring(2, 9),
      })
    }

    // Advance cycle
    state.cycleIndex++
    state.totalCardsPlayed++

    // Check if complete cycle (8 cards played)
    let reshuffled = false
    if (state.cycleIndex >= HAND_MAX_DECK_SIZE) {
      state.cycleIndex = 0
      state.cycleCount++
      reshuffled = true
      state.lastShuffleTime = Date.now()
      state.reshuffleHistory.push(Date.now())

      // Reshuffle: Combine hand + remaining pool and shuffle again
      const allCards = [
        ...state.hand.map(h => h.cardId),
        ...state.remainingPool,
      ]
      const reshuffledDeck = fisherYatesShuffle(allCards)

      state.deck = reshuffledDeck
      state.hand = reshuffledDeck.slice(0, 4).map(cardId => ({
        cardId,
        instanceId: Math.random().toString(36).substring(2, 9),
      }))
      state.remainingPool = reshuffledDeck.slice(4, 8)
    }

    return {
      success: true,
      updatedState: state,
      playedCardId: playedCard.cardId,
      nextCardId: getNextCardPreview(state),
      cardsRemaining: state.hand.length,
      reshuffle: reshuffled,
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Force reshuffle (for special mechanics or edge cases)
 * @param {Object} deckState - Current deck state
 * @returns {Object} Updated deck state with reshuffle applied
 */
export const forceReshuffle = (deckState) => {
  const state = JSON.parse(JSON.stringify(deckState))

  // Combine all cards
  const allCards = [
    ...state.hand.map(h => h.cardId),
    ...state.remainingPool,
  ]

  // Reshuffle
  const reshuffledDeck = fisherYatesShuffle(allCards)

  state.deck = reshuffledDeck
  state.hand = reshuffledDeck.slice(0, 4).map(cardId => ({
    cardId,
    instanceId: Math.random().toString(36).substring(2, 9),
  }))
  state.remainingPool = reshuffledDeck.slice(4, 8)
  state.cycleIndex = 0
  state.cycleCount++
  state.lastShuffleTime = Date.now()
  state.reshuffleHistory.push(Date.now())

  return state
}

/**
 * Get all available cards for deck building
 * @returns {Card[]}
 */
export const getAvailableCards = () => {
  return getCardArray()
}

/**
 * Validate deck composition
 * @param {string[]} cardIds - Array of card IDs
 * @returns {Object} { isValid: boolean, errors: string[] }
 */
export const validateDeck = cardIds => {
  const errors = []

  // Check size
  if (cardIds.length !== HAND_MAX_DECK_SIZE) {
    errors.push(`Deck must have exactly ${HAND_MAX_DECK_SIZE} cards`)
  }

  // Check all cards exist
  cardIds.forEach((cardId, idx) => {
    if (!getCard(cardId)) {
      errors.push(`Invalid card at position ${idx}: ${cardId}`)
    }
  })

  // Check no duplicates
  const unique = new Set(cardIds)
  if (unique.size !== cardIds.length) {
    errors.push('Deck cannot have duplicate cards')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Get deck statistics
 */
export const getDeckStats = cardIds => {
  const cards = cardIds.map(id => getCard(id)).filter(c => c !== null)

  const stats = {
    totalCards: cards.length,
    averageCost: cards.reduce((sum, c) => sum + c.elixirCost, 0) / cards.length || 0,
    troops: cards.filter(c => c.type === 'troop').length,
    spells: cards.filter(c => c.type === 'spell').length,
    buildings: cards.filter(c => c.type === 'building').length,
    cardsByElixir: {
      cheap: cards.filter(c => c.elixirCost <= 3).length,
      medium: cards.filter(c => c.elixirCost >= 4 && c.elixirCost <= 6).length,
      expensive: cards.filter(c => c.elixirCost >= 7).length,
    },
  }

  return stats
}

/**
 * Get recommended starting deck
 * @returns {string[]}
 */
export const getRecommendedDeck = () => {
  return ['knight', 'archer', 'fireball', 'arrows', 'giant', 'minions', 'witch', 'pekka']
}

/**
 * Get random valid deck
 * @returns {string[]}
 */
export const getRandomDeck = () => {
  const cards = getAvailableCards()
  const deck = []
  const used = new Set()

  while (deck.length < HAND_MAX_DECK_SIZE && used.size < cards.length) {
    const randomIdx = Math.floor(Math.random() * cards.length)
    const card = cards[randomIdx]

    if (!used.has(card.id)) {
      deck.push(card.id)
      used.add(card.id)
    }
  }

  return deck
}

/**
 * Create initial hand from deck (OLD API - kept for compatibility)
 * @param {string[]} deck - Deck of 8 cards
 * @returns {Array} Hand of 4 cards
 */
export const createInitialHand = deck => {
  const deckState = createDeckCyclingState(deck)
  return deckState.hand
}

/**
 * Cycle hand (OLD API - kept for compatibility)
 * @param {Array} hand - Current hand
 * @param {string} playedCardId - Card that was played
 * @param {string[]} deck - Full deck
 * @param {number} handIndex - Current hand index position
 * @returns {Object} { newHand, newIndex }
 */
export const cycleHand = (hand, playedCardId, deck, handIndex) => {
  const newHand = hand.filter(h => h.cardId !== playedCardId)

  // Add next card from deck
  const nextIndex = (handIndex + 1) % deck.length
  newHand.push({
    cardId: deck[nextIndex],
    id: Math.random(),
  })

  return {
    newHand,
    newIndex: nextIndex + 1,
  }
}

/**
 * Get suggested cards to add to deck
 * @param {string[]} deck - Current deck
 * @returns {Card[]}
 */
export const getSuggestedCards = deck => {
  const available = getAvailableCards()
  const deckSet = new Set(deck)

  return available.filter(card => !deckSet.has(card.id))
}

/**
 * Check if can add card to deck
 */
export const canAddCard = (cardId, deck) => {
  return !deck.includes(cardId) && getCard(cardId) !== null
}

/**
 * Check if can remove card from deck
 */
export const canRemoveCard = (cardId, deck) => {
  return deck.includes(cardId) && deck.length > 1
}

/**
 * Create deck from preset
 */
export const createPresetDecks = () => {
  return {
    aggro: {
      name: 'Aggressive',
      cards: ['knight', 'archer', 'giant', 'pekka', 'witch', 'babyDragon', 'fireball', 'hogRider'],
    },
    defensive: {
      name: 'Defensive',
      cards: ['bombTower', 'cannon', 'archer', 'skeletonArmy', 'valkyrie', 'giant', 'freeze', 'arrows'],
    },
    balanced: {
      name: 'Balanced',
      cards: ['knight', 'archer', 'fireball', 'arrows', 'giant', 'minions', 'witch', 'pekka'],
    },
    flying: {
      name: 'Flying',
      cards: ['minions', 'babyDragon', 'fireball', 'arrows', 'witch', 'musketeer', 'valkyrie', 'pekka'],
    },
  }
}
