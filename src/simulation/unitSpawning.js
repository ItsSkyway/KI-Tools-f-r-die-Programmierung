/**
 * Unit Spawning
 * Spawning logic for troops and spells
 */

import { LANE_WIDTH, ARENA_HEIGHT } from '../game/constants.js'
import { getCard } from '../cards/cardDatabase.js'

/**
 * Create a new unit from card
 * @param {string} cardId
 * @param {string} owner - 'player' or 'enemy'
 * @param {number} x - Spawn X
 * @param {number} y - Spawn Y
 * @returns {Unit}
 */
export const createUnit = (cardId, owner, x, y) => {
  const card = getCard(cardId)

  if (!card) {
    console.warn(`Card not found: ${cardId}`)
    return null
  }

  const unit = {
    id: `unit_${Date.now()}_${Math.random()}`,
    cardId,
    owner,
    type: card.type,
    x,
    y,
    hp: card.stats.hp || 100,
    maxHp: card.stats.hp || 100,
    stats: { ...card.stats },
    spawnTime: Date.now(),
    lastAttackTime: 0,
    target: null,
    lane: owner === 'player' ? (x < LANE_WIDTH ? 'top' : 'bottom') : x < LANE_WIDTH ? 'top' : 'bottom',
  }

  // Flying units
  if (card.stats.flying) {
    unit.isFlying = true
  }

  return unit
}

/**
 * Spawn multiple units (minion army, skeleton army)
 * @param {string} cardId
 * @param {string} owner
 * @param {number} centerX
 * @param {number} centerY
 * @returns {Unit[]}
 */
export const spawnUnitArmy = (cardId, owner, centerX, centerY) => {
  const card = getCard(cardId)

  if (!card || !card.stats.count) {
    return []
  }

  const units = []
  const count = card.stats.count

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2
    const offsetDistance = 30

    const x = centerX + Math.cos(angle) * offsetDistance
    const y = centerY + Math.sin(angle) * offsetDistance

    const unit = createUnit(cardId, owner, x, y)
    if (unit) {
      units.push(unit)
    }
  }

  return units
}

/**
 * Validate card can be played
 * @param {string} cardId
 * @param {number} currentElixir
 * @returns {boolean}
 */
export const canPlayCard = (cardId, currentElixir) => {
  const card = getCard(cardId)

  if (!card) {
    return false
  }

  return currentElixir >= card.elixirCost
}

/**
 * Get spawn position for card play
 * Player spawns at bottom, enemy at top
 * @param {string} owner - 'player' or 'enemy'
 * @returns {{x: number, y: number}}
 */
export const getSpawnPosition = owner => {
  if (owner === 'player') {
    // Player spawns at bottom center
    return {
      x: LANE_WIDTH / 2 + (Math.random() - 0.5) * 100,
      y: ARENA_HEIGHT - 50,
    }
  } else {
    // Enemy spawns at top center
    return {
      x: LANE_WIDTH / 2 + (Math.random() - 0.5) * 100,
      y: 50,
    }
  }
}

/**
 * Spawn card (troops, buildings, spells)
 * @param {string} cardId
 * @param {string} owner
 * @param {number} x - Optional custom X
 * @param {number} y - Optional custom Y
 * @returns {Unit[]}
 */
export const spawnCard = (cardId, owner, x, y) => {
  const card = getCard(cardId)

  if (!card) {
    return []
  }

  // Use provided position or default
  if (x === undefined || y === undefined) {
    const pos = getSpawnPosition(owner)
    x = pos.x
    y = pos.y
  }

  // Handle army spawns
  if (card.stats.count && card.stats.count > 1) {
    return spawnUnitArmy(cardId, owner, x, y)
  }

  // Single unit spawn
  const unit = createUnit(cardId, owner, x, y)
  return unit ? [unit] : []
}

/**
 * Remove units by age (despawn after game ends)
 */
export const removeOldUnits = (units, maxAge = 60000) => {
  const now = Date.now()
  return units.filter(unit => now - unit.spawnTime < maxAge)
}

/**
 * Get unit spawn cost
 */
export const getSpawnCost = cardId => {
  const card = getCard(cardId)
  return card ? card.elixirCost : 0
}
