/**
 * Combat System
 * Handles damage, targeting, combat logic, and AI targeting priorities
 */

import { DEFAULT_UNIT_RANGE } from '../game/constants.js'
import { calculateDamage } from '../cards/cardEffects.js'

// ============================================================================
// INTELLIGENT TARGET PRIORITIZATION SYSTEM
// ============================================================================

/**
 * PRIORITY TARGETING SYSTEM (KRITISCH für faire AI)
 * 
 * Priority 1: Enemy Buildings in Range (nächste)
 * Priority 2: Enemy Towers in Range (nächste)
 * Priority 3: Enemy Troops in Range (nächste nach Health)
 * 
 * Wird alle 0.5s recalculated
 * 
 * @param {Unit} unit - Attacking unit
 * @param {Object} enemies - { troops, buildings }
 * @param {Tower[]} towers - Enemy towers
 * @param {number} now - Current timestamp (Date.now())
 * @returns {Unit|Tower|Building|null} - Best target based on priority
 */
export const findNearestEnemy = (unit, enemies, towers) => {
  let nearest = null
  let minDist = Infinity
  let bestPriority = Infinity

  const range = unit.stats.range || DEFAULT_UNIT_RANGE
  const now = Date.now()

  // Recalculate target every 0.5 seconds (important for AI responsiveness)
  const timeSinceTargetUpdate = now - (unit.lastTargetUpdateTime || 0)
  const shouldUpdateTarget = timeSinceTargetUpdate > 500

  // If target exists and recently valid, keep it (unless we should update)
  if (unit.currentTarget && unit.currentTarget.hp > 0 && !shouldUpdateTarget) {
    const distToTarget = Math.hypot(unit.currentTarget.x - unit.x, unit.currentTarget.y - unit.y)
    if (distToTarget < range) {
      return unit.currentTarget
    }
  }

  unit.lastTargetUpdateTime = now

  // ========== PRIORITY 1: BUILDINGS IN RANGE (if unit targets buildings) ==========
  if (unit.stats.targetBuildings && enemies.buildings) {
    enemies.buildings.forEach(building => {
      if (building.hp > 0) {
        const dist = Math.hypot(building.x - unit.x, building.y - unit.y)
        if (dist < range) {
          // Prioritize: closer is better (Priority 1)
          if (dist < minDist) {
            nearest = building
            minDist = dist
            bestPriority = 1
          }
        }
      }
    })
  }

  // ========== PRIORITY 2: TOWERS IN RANGE (if unit targets buildings) ==========
  if (unit.stats.targetBuildings && towers && bestPriority > 2) {
    towers.forEach(tower => {
      if (tower.hp > 0) {
        const dist = Math.hypot(tower.x - unit.x, tower.y - unit.y)
        if (dist < range) {
          // Prioritize: closer is better (Priority 2)
          if (bestPriority > 2 || (bestPriority === 2 && dist < minDist)) {
            nearest = tower
            minDist = dist
            bestPriority = 2
          }
        }
      }
    })
  }

  // ========== PRIORITY 3: TROOPS IN RANGE (always targetable) ==========
  if (enemies.troops && bestPriority > 3) {
    enemies.troops.forEach(troop => {
      if (troop.hp > 0) {
        const dist = Math.hypot(troop.x - unit.x, troop.y - unit.y)
        if (dist < range) {
          // Prioritize: lowest HP first (easier to kill) within priority 3
          // Tiebreaker: closer if same HP
          if (
            bestPriority > 3 ||
            (bestPriority === 3 && troop.hp < (nearest?.hp || Infinity)) ||
            (bestPriority === 3 && troop.hp === nearest?.hp && dist < minDist)
          ) {
            nearest = troop
            minDist = dist
            bestPriority = 3
          }
        }
      }
    })
  }

  // Cache the target for next frame (reduces recalculations)
  if (nearest) {
    unit.currentTarget = nearest
  }

  return nearest
}

/**
 * Unit attacks target
 * 
 * Range Check: wenn dist < range → prepare attack
 * Attack Speed: baseSpeed * unitAttackSpeedMultiplier
 * Damage: Basiert auf Card.stats.damage
 * Splash: wenn card.splashRadius > 0, treffe Units im Radius
 * 
 * @param {Unit} attacker
 * @param {Unit|Tower} target
 * @param {Unit[]} allEnemyUnits - For splash damage calculation
 * @returns {Object} Damage dealt and effects
 */
export const performAttack = (attacker, target, allEnemyUnits = []) => {
  if (!target || target.hp <= 0) {
    return { damage: 0, effects: [], hitTargets: [] }
  }

  const now = Date.now()
  const timeSinceLastAttack = now - (attacker.lastAttackTime || 0)
  
  // Attack speed from card stats (attacks per second)
  const attackSpeed = attacker.stats.attackSpeed || 1
  const attackInterval = (1 / attackSpeed) * 1000

  // Can attack? (respects attack speed)
  if (timeSinceLastAttack < attackInterval) {
    return { damage: 0, effects: [], hitTargets: [] }
  }

  const { damage, isCritical } = calculateDamage(attacker, target)
  const finalDamage = isCritical ? damage * 1.5 : damage

  // Apply damage to main target
  target.hp = Math.max(0, target.hp - finalDamage)
  attacker.lastAttackTime = now

  const effects = []
  const hitTargets = [target]

  // Create attack animation/visual flash
  effects.push({
    type: 'attack_flash',
    value: 0.2, // 20% damage indicator
    x: target.x,
    y: target.y,
    duration: 150, // 150ms flash
  })

  // ========== SPLASH DAMAGE HANDLING ==========
  const splashRadius = attacker.stats.splashRadius || 0

  if (splashRadius > 0 && allEnemyUnits.length > 0) {
    // Find all units within splash radius
    const splashTargets = allEnemyUnits.filter(unit => {
      if (unit.hp <= 0 || unit === target) return false // Skip dead units and main target
      const distToCenter = Math.hypot(unit.x - target.x, unit.y - target.y)
      return distToCenter <= splashRadius
    })

    // Apply splash damage to all affected units
    splashTargets.forEach(unit => {
      const splashDamage = finalDamage * 0.75 // Splash does 75% damage
      unit.hp = Math.max(0, unit.hp - splashDamage)
      hitTargets.push(unit)
      
      effects.push({
        type: 'splash_damage',
        value: Math.floor(splashDamage),
        x: unit.x,
        y: unit.y,
        duration: 150,
      })
    })

    // Add splash effect visual (explosion at target)
    effects.push({
      type: 'splash_effect',
      x: target.x,
      y: target.y,
      radius: splashRadius,
      duration: 200,
    })
  }

  // Handle tower destruction
  if (target.isKing || target.type === 'building') {
    target.destroyed = target.hp <= 0
  }

  return {
    damage: Math.floor(finalDamage),
    isCritical,
    effects,
    hitTargets, // All units damaged in this attack
  }
}

/**
 * Tower attacks target - Returns projectile data instead of instant damage
 * @param {Tower} tower
 * @param {Unit} target
 * @param {Unit[]} allEnemyUnits - For splash damage
 * @returns {Object} Attack result with projectile data
 */
export const towerAttack = (tower, target, allEnemyUnits = []) => {
  if (!target || target.hp <= 0) {
    return { damage: 0, hitTargets: [], arrow: null }
  }

  const now = Date.now()
  const timeSinceLastAttack = now - (tower.lastAttackTime || 0)
  const attackInterval = (1 / tower.attackSpeed) * 1000

  if (timeSinceLastAttack < attackInterval) {
    return { damage: 0, hitTargets: [], arrow: null }
  }

  const damage = tower.damage
  tower.lastAttackTime = now

  // Calculate arrow travel time based on distance
  const distance = Math.hypot(target.x - tower.x, target.y - tower.y)
  const travelTime = Math.max(150, Math.min(500, (distance / 300) * 400)) // 150-500ms based on distance

  const hitTargets = [target]
  const splashTargets = []

  // Handle tower splash if applicable
  if (tower.splashRadius && tower.splashRadius > 0 && allEnemyUnits.length > 0) {
    allEnemyUnits.forEach(unit => {
      if (unit.hp > 0 && unit !== target) {
        const distToCenter = Math.hypot(unit.x - target.x, unit.y - target.y)
        if (distToCenter <= tower.splashRadius) {
          hitTargets.push(unit)
          splashTargets.push(unit)
        }
      }
    })
  }

  // Return projectile data for game loop to create arrow
  return {
    damage,
    hitTargets,
    arrow: {
      fromX: tower.x,
      fromY: tower.y,
      toX: target.x,
      toY: target.y,
      damage: tower.damage,
      travelTime,
      owner: tower.ownerType, // 'player' or 'enemy'
      target,
      splashRadius: tower.splashRadius || 0,
      affectedUnits: splashTargets, // For splash damage application
    }
  }
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
 * Remove dead units - with death animations
 * Units marked for removal after fade-out animation
 * @param {Unit[]} units
 * @returns {Unit[]} - Filtered live units
 */
export const removeDeadUnits = units => {
  return units.filter(unit => {
    if (unit.hp > 0) {
      // Unit is alive
      unit.isDying = false
      return true
    }

    // Unit is dead - mark for death animation
    if (!unit.isDying) {
      unit.isDying = true
      unit.dieStartTime = Date.now()
      return true // Keep for animation
    }

    // Death animation phase
    const deathDuration = 500 // 0.5s fade-out + scale-down
    const timeSinceDeath = Date.now() - unit.dieStartTime
    const progress = timeSinceDeath / deathDuration

    if (progress < 1) {
      // Still animating
      unit.deathAnimationProgress = progress
      unit.opacity = 1 - progress // Fade out
      unit.scale = 1 - progress * 0.3 // Scale down slightly
      return true // Keep for animation
    }

    // Animation complete - remove from game
    return false
  })
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
