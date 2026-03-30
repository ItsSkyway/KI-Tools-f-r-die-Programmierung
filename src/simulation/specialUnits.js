/**
 * Special Unit Types Behavior
 * Handles unique mechanics for specific unit types:
 * - Flying Units: Ignorieren Bodeneinheiten (fliegen direkt zum Tower)
 * - Skeleton Army: Spawnt 12 einzelne kleine Troops (jeder mit eigenem Target)
 * - Valkyrie: Splash Damage um sie herum
 * - Witch: Ranged + spawnt Skeletons bei Attack
 * - P.E.K.K.A: Extreme damage, targeting buildings
 */

import { createUnit } from './unitSpawning.js'

// ============================================================================
// FLYING UNITS BEHAVIOR
// ============================================================================

/**
 * Check if unit can fly (ignores ground units)
 * Flying units ignore buildings/ground troops and go straight for towers
 */
export const isFlyingUnit = (unit) => {
  return unit.stats.flying || false
}

/**
 * Get flying unit behavior
 * Flying units skip troops and go for towers/buildings directly
 */
export const getFlyingUnitTarget = (unit, enemies, towers) => {
  // Flying units prefer towers > buildings > troops
  const range = unit.stats.range || 100

  // Priority: Towers first
  if (towers && towers.length > 0) {
    let nearest = null
    let minDist = Infinity

    towers.forEach(tower => {
      if (tower.hp > 0) {
        const dist = Math.hypot(tower.x - unit.x, tower.y - unit.y)
        if (dist < range && dist < minDist) {
          nearest = tower
          minDist = dist
        }
      }
    })

    if (nearest) return nearest
  }

  // Fallback: any troops
  if (enemies.troops && enemies.troops.length > 0) {
    let nearest = null
    let minDist = Infinity

    enemies.troops.forEach(troop => {
      if (troop.hp > 0) {
        const dist = Math.hypot(troop.x - unit.x, troop.y - unit.y)
        if (dist < range && dist < minDist) {
          nearest = troop
          minDist = dist
        }
      }
    })

    return nearest
  }

  return null
}

// ============================================================================
// SKELETON ARMY SPECIAL BEHAVIOR
// ============================================================================

/**
 * Check if unit is Skeleton Army
 */
export const isSkeletonArmy = (unit) => {
  return unit.cardId === 'skeletonArmy'
}

/**
 * Get all individual skeletons that should target independently
 * Skeleton Army spawns multiple small skeletons (each with own target)
 */
export const getSkeletonArmyMembers = (armyUnit, allUnits) => {
  // Skeleton Army has count property for number of skeletons
  // Each skeleton acts independently
  return allUnits.filter(u => u.parentArmy === armyUnit.id)
}

/**
 * Mark unit as skeleton army member
 */
export const markAsSkeletonMember = (unit, armyId) => {
  unit.parentArmy = armyId
}

// ============================================================================
// VALKYRIE SPLASH BEHAVIOR
// ============================================================================

/**
 * Check if unit is Valkyrie (splash damage around)
 */
export const isValkyrieUnit = (unit) => {
  return unit.cardId === 'valkyrie'
}

/**
 * Valkyrie attack always includes splash damage in circular pattern
 * Damage in 360° around the unit
 */
export const applyValkyrieAttack = (valkyrie, target, allEnemyUnits) => {
  // Valkyrie has high splash radius (100px)
  const splashRadius = valkyrie.stats.splashRadius || 100
  const baseDamage = valkyrie.stats.damage || 130

  const hitUnits = [target]
  let totalDamage = baseDamage

  // Find all units in splash radius
  const splashTargets = allEnemyUnits.filter(unit => {
    if (unit.hp <= 0 || unit === target) return false
    const dist = Math.hypot(unit.x - valkyrie.x, unit.y - valkyrie.y)
    return dist <= splashRadius
  })

  // Apply splash damage
  splashTargets.forEach(unit => {
    const splashDamage = baseDamage * 0.75
    unit.hp = Math.max(0, unit.hp - splashDamage)
    hitUnits.push(unit)
    totalDamage += splashDamage
  })

  return {
    damage: totalDamage,
    hitUnits,
    splashRadius,
  }
}

// ============================================================================
// WITCH SPECIAL BEHAVIOR
// ============================================================================

/**
 * Check if unit is Witch
 */
export const isWitchUnit = (unit) => {
  return unit.cardId === 'witch'
}

/**
 * Witch spawns skeletons periodically
 * @param {Unit} witch
 * @param {Object} gameState - To add new units
 * @returns {Unit[]} - Newly spawned skeletons
 */
export const witchSpawnSkeletons = (witch, gameState) => {
  const now = Date.now()
  const lastSpawnTime = witch.lastSkeletonSpawnTime || 0
  const spawnInterval = 2000 // Spawn every 2 seconds

  // Check if enough time has passed
  if (now - lastSpawnTime < spawnInterval) {
    return []
  }

  witch.lastSkeletonSpawnTime = now

  // Spawn 2-3 skeletons around witch
  const count = Math.random() > 0.5 ? 2 : 3
  const newSkeletons = []

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2
    const offsetDistance = 40
    const x = witch.x + Math.cos(angle) * offsetDistance
    const y = witch.y + Math.sin(angle) * offsetDistance

    // Create small skeleton unit
    const skeleton = createUnit('skeleton', witch.owner, x, y)
    if (skeleton) {
      // Make it a tiny version
      skeleton.stats.hp = 60
      skeleton.maxHp = 60
      skeleton.stats.damage = 40
      skeleton.stats.speed = 1.3
      skeleton.stats.range = 40
      skeleton.isSkeletonFromWitch = true
      skeleton.parentWitch = witch.id

      newSkeletons.push(skeleton)
    }
  }

  return newSkeletons
}

/**
 * Witch spawns skeleton on death
 */
export const witchDeathSpawns = (witch) => {
  // Spawn 1 skeleton when witch dies
  const skeleton = createUnit('skeleton', witch.owner, witch.x, witch.y)
  if (skeleton) {
    skeleton.isSkeletonFromWitch = true
    skeleton.parentWitch = witch.id
    return [skeleton]
  }
  return []
}

// ============================================================================
// PEKKA SPECIAL BEHAVIOR
// ============================================================================

/**
 * Check if unit is P.E.K.K.A (extreme damage unit)
 */
export const isPekkaUnit = (unit) => {
  return unit.cardId === 'pekka'
}

/**
 * P.E.K.K.A has massive damage but targets buildings prioritarily
 */
export const pekkaTargetBehavior = (pekka) => {
  return {
    isTargetingBuildings: true, // Always targets buildings first
    damage: pekka.stats.damage || 300, // 300 damage
    attackSpeed: pekka.stats.attackSpeed || 1.8,
  }
}

// ============================================================================
// HOG RIDER SPECIAL BEHAVIOR
// ============================================================================

/**
 * Check if unit is Hog Rider (building target specialist)
 */
export const isHogRiderUnit = (unit) => {
  return unit.cardId === 'hogRider'
}

/**
 * Hog Rider ignores troops and goes straight for buildings/towers
 */
export const hogRiderTargetBehavior = (hogRider) => {
  return {
    isTargetingBuildings: true, // Ignore troops
    speed: hogRider.stats.speed || 1.5, // Fast
  }
}

// ============================================================================
// BABY DRAGON SPECIAL BEHAVIOR
// ============================================================================

/**
 * Check if unit is Baby Dragon (flying splash unit)
 */
export const isBabyDragonUnit = (unit) => {
  return unit.cardId === 'babyDragon'
}

/**
 * Baby Dragon is flying with splash damage
 */
export const babyDragonAttack = (dragon, target, allEnemyUnits) => {
  const splashRadius = dragon.stats.splashRadius || 80
  const baseDamage = dragon.stats.damage || 120

  const hitUnits = [target]
  target.hp = Math.max(0, target.hp - baseDamage)

  // Splash damage
  const splashTargets = allEnemyUnits.filter(unit => {
    if (unit.hp <= 0 || unit === target) return false
    const dist = Math.hypot(unit.x - target.x, unit.y - target.y)
    return dist <= splashRadius
  })

  splashTargets.forEach(unit => {
    const splashDamage = baseDamage * 0.75
    unit.hp = Math.max(0, unit.hp - splashDamage)
    hitUnits.push(unit)
  })

  return {
    damage: baseDamage,
    hitUnits,
    splashRadius,
  }
}

// ============================================================================
// DEATH EFFECTS
// ============================================================================

/**
 * Handle unit death effects and animations
 */
export const handleUnitDeath = (unit, gameState) => {
  const effects = []

  // Witch spawns skeleton on death
  if (isWitchUnit(unit)) {
    const skeletons = witchDeathSpawns(unit)
    if (gameState) {
      if (unit.owner === 'player') {
        gameState.playerTroops?.push(...skeletons)
      } else {
        gameState.enemyTroops?.push(...skeletons)
      }
    }
    effects.push({
      type: 'witch_death_spawn',
      x: unit.x,
      y: unit.y,
      count: skeletons.length,
    })
  }

  // Mark unit as dead for animation
  unit.isDying = true
  unit.dieStartTime = Date.now()

  effects.push({
    type: 'death_animation',
    x: unit.x,
    y: unit.y,
    duration: 500, // 0.5s fade-out
  })

  return effects
}

// ============================================================================
// NO COLLISION AFTER DEATH
// ============================================================================

/**
 * Dead units should not participate in collision
 */
export const canCollide = (unit) => {
  return unit.hp > 0 && !unit.isDying
}

/**
 * Dead units should not deal damage or be counted
 */
export const isUnitActive = (unit) => {
  return unit.hp > 0 && !unit.isDying
}
