/**
 * Deck Builder
 * Deck selection and management
 */

import { getCardArray, getCard } from '../cards/cardDatabase.js'
import { HAND_MAX_DECK_SIZE } from '../game/constants.js'

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
 * Get recommended starting hand
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
 * Create initial hand from deck
 * @param {string[]} deck - Deck of 8 cards
 * @returns {Array} Hand of 4 cards
 */
export const createInitialHand = deck => {
  return deck.slice(0, 4).map(cardId => ({
    cardId,
    id: Math.random(),
  }))
}

/**
 * Cycle hand (remove played card, add next from deck)
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
      cards: ['bombTower', 'cannon', 'archer', 'skeletonArmy', 'valkyrie', 'giant', 'freeze', 'arrows'], // BUG #8 FIXED: changed 'archers' to 'archer'
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
