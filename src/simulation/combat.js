/**
 * Combat System
 * Handles damage, targeting, and combat logic
 */

import { DEFAULT_UNIT_RANGE } from '../game/constants.js'
import { calculateDamage } from '../cards/cardEffects.js'

/**
 * Find nearest enemy to attack
 * @param {Unit} unit - Attacking unit
 * @param {Object} enemies - { troops, buildings }
 * @param {Tower[]} towers - Enemy towers
 * @returns {Unit|Tower|Building|null}
 */
export const findNearestEnemy = (unit, enemies, towers) => {
  let nearest = null
  let minDist = Infinity

  const range = unit.stats.range || DEFAULT_UNIT_RANGE

  // Buildings first if unit targets buildings
  if (unit.stats.targetBuildings && enemies.buildings) {
    enemies.buildings.forEach(building => {
      if (building.hp > 0) {
        const dist = Math.hypot(building.x - unit.x, building.y - unit.y)
        if (dist < range && dist < minDist) {
          nearest = building
          minDist = dist
        }
      }
    })
  }

  // Towers if unit targets buildings
  if (unit.stats.targetBuildings && towers) {
    towers.forEach(tower => {
      if (tower.hp > 0) {
        const dist = Math.hypot(tower.x - unit.x, tower.y - unit.y)
        if (dist < range && dist < minDist) {
          nearest = tower
          minDist = dist
        }
      }
    })
  }

  // Troops (always targetable)
  if (enemies.troops) {
    enemies.troops.forEach(troop => {
      if (troop.hp > 0) {
        const dist = Math.hypot(troop.x - unit.x, troop.y - unit.y)
        if (dist < range && dist < minDist) {
          nearest = troop
          minDist = dist
        }
      }
    })
  }

  return nearest
}

/**
 * Unit attacks target
 * @param {Unit} attacker
 * @param {Unit|Tower} target
 * @returns {Object} Damage dealt and effects
 */
export const performAttack = (attacker, target) => {
  if (!target || target.hp <= 0) {
    return { damage: 0, effects: [] }
  }

  const now = Date.now()
  const timeSinceLastAttack = now - (attacker.lastAttackTime || 0)
  const attackInterval = (1 / (attacker.stats.attackSpeed || 1)) * 1000

  // Can attack?
  if (timeSinceLastAttack < attackInterval) {
    return { damage: 0, effects: [] }
  }

  const { damage, isCritical } = calculateDamage(attacker, target)
  const finalDamage = isCritical ? damage * 1.5 : damage

  target.hp = Math.max(0, target.hp - finalDamage)
  attacker.lastAttackTime = now

  // PHASE 3: Handle tower destruction
  if (target.isKing || target.type === 'building') {
    target.destroyed = target.hp <= 0
  }

  return {
    damage: Math.floor(finalDamage),
    isCritical,
    effects: [
      {
        type: 'damage',
        value: Math.floor(finalDamage),
        x: target.x,
        y: target.y,
      },
    ],
  }
}

/**
 * Tower attacks target
 * @param {Tower} tower
 * @param {Unit} target
 * @returns {Object} Damage dealt
 */
export const towerAttack = (tower, target) => {
  if (!target || target.hp <= 0) {
    return { damage: 0 }
  }

  const now = Date.now()
  const timeSinceLastAttack = now - (tower.lastAttackTime || 0)
  const attackInterval = (1 / tower.attackSpeed) * 1000

  if (timeSinceLastAttack < attackInterval) {
    return { damage: 0 }
  }

  const damage = tower.damage
  target.hp = Math.max(0, target.hp - damage)
  tower.lastAttackTime = now

  return { damage }
}

/**
 * Check if units are in combat range
 */
export const isInRange = (unit1, unit2, range = DEFAULT_UNIT_RANGE) => {
  const dist = Math.hypot(unit2.x - unit1.x, unit2.y - unit1.y)
  return dist <= range
}

/**
 * Get all units damaged by splash
 */
export const getUnitsInSplash = (centerX, centerY, radius, allUnits) => {
  return allUnits.filter(unit => {
    const dist = Math.hypot(unit.x - centerX, unit.y - centerY)
    return dist <= radius && unit.hp > 0
  })
}

/**
 * Remove dead units
 */
export const removeDeadUnits = units => {
  return units.filter(unit => unit.hp > 0)
}

/**
 * Check if tower is destroyed
 */
export const isTowerDestroyed = tower => {
  return tower.hp <= 0
}

/**
 * Get all destroyed towers
 */
export const getDestroyedTowers = towers => {
  return Object.values(towers).filter(tower => isTowerDestroyed(tower))
}

/**
 * Calculate team score based on towers
 * Used for victory detection
 */
export const calculateTeamScore = towers => {
  let score = 0
  Object.entries(towers).forEach(([key, tower]) => {
    if (tower.hp > 0) {
      score += key === 'kingTower' ? 3 : 1
    }
  })
  return score
}

/**
 * Determine winner based on tower destruction
 * @returns {'player'|'enemy'|null}
 */
export const determineWinner = (playerTowers, enemyTowers) => {
  const playerScore = calculateTeamScore(playerTowers)
  const enemyScore = calculateTeamScore(enemyTowers)

  if (playerScore === 0 && enemyScore === 0) {
    return 'draw'
  }
  if (playerScore === 0) {
    return 'enemy'
  }
  if (enemyScore === 0) {
    return 'player'
  }

  // Still playing - check king towers
  if (playerTowers.kingTower.hp <= 0) {
    return 'enemy'
  }
  if (enemyTowers.kingTower.hp <= 0) {
    return 'player'
  }

  return null
}
