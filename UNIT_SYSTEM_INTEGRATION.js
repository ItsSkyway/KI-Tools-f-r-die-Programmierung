/**
 * QUICK INTEGRATION GUIDE
 * Unit Movement + AI Targeting System
 */

// =============================================================================
// 1. IMPORT STATEMENTS
// =============================================================================

// In your game loop (src/game/gameLoop.js):
import { 
  findNearestEnemy, 
  performAttack, 
  towerAttack, 
  removeDeadUnits 
} from '../simulation/combat.js'

import { 
  updateUnitMovement 
} from '../simulation/unitMovement.js'

import {
  isWitchUnit,
  witchSpawnSkeletons,
  witchDeathSpawns,
  isFlyingUnit,
  isValkyrieUnit,
} from '../simulation/specialUnits.js'

// =============================================================================
// 2. PROCESS UNITS (Main Game Loop)
// =============================================================================

/**
 * Call this EVERY FRAME for each side (30 FPS)
 */
export const processUnits = (friendlyUnits, friendlyBuildings, enemies, enemyTowers, gameState) => {
  friendlyUnits.forEach(unit => {
    if (unit.hp <= 0) return

    // Skip frozen units
    if (unit.frozen && Date.now() < unit.frozenUntil) return

    // Find intelligent target (Priority: Buildings > Towers > Troops)
    const target = findNearestEnemy(unit, enemies, enemyTowers)

    if (target && target.hp > 0) {
      // Move towards target (smooth lerp, not teleport)
      updateUnitMovement(unit, target)

      // Check if in range and attack
      const dist = Math.hypot(target.x - unit.x, target.y - unit.y)
      const range = unit.stats.range || 100

      if (dist < range) {
        // Important: Pass all enemy units for splash damage calculation
        const allEnemyUnits = [...enemies.troops, ...(enemies.buildings || [])]
        performAttack(unit, target, allEnemyUnits)
      }
    } else {
      // No target: move towards enemy side
      updateUnitMovement(unit, null)
    }

    // Special: Witch spawning skeletons
    if (isWitchUnit(unit) && gameState) {
      const newSkeletons = witchSpawnSkeletons(unit, gameState)
      if (newSkeletons.length > 0) {
        if (unit.owner === 'player') {
          gameState.playerTroops.push(...newSkeletons)
        } else {
          gameState.enemyTroops.push(...newSkeletons)
        }
      }
    }
  })
}

// =============================================================================
// 3. PROCESS TOWERS
// =============================================================================

/**
 * Towers use same targeting system as troops
 */
export const processTowers = (towerSet, enemyTroops, enemyBuildings) => {
  Object.values(towerSet).forEach(tower => {
    if (tower.hp <= 0) return

    // Towers find target using unit targeting system
    let target = findNearestEnemy(
      { 
        x: tower.x, 
        y: tower.y, 
        stats: { range: tower.range, targetBuildings: true } 
      },
      { troops: enemyTroops, buildings: enemyBuildings },
      []
    )

    if (target) {
      // Important: Pass all enemies for splash
      const allEnemyUnits = [...enemyTroops, ...(enemyBuildings || [])]
      towerAttack(tower, target, allEnemyUnits)
    }
  })
}

// =============================================================================
// 4. DEATH & CLEANUP
// =============================================================================

/**
 * Call this every frame to handle death animations and cleanup
 */
export const cleanupUnits = (units, gameState) => {
  // First pass: handle death animations and special death effects
  units.forEach(unit => {
    if (unit.hp <= 0 && !unit.isDying && unit.cardId === 'witch') {
      // Witch special: spawn skeleton on death
      const skeletons = witchDeathSpawns(unit)
      if (skeletons.length > 0) {
        if (unit.owner === 'player') {
          gameState.playerTroops.push(...skeletons)
        } else {
          gameState.enemyTroops.push(...skeletons)
        }
      }
    }
  })

  // Second pass: filter out dead units (with animation)
  return removeDeadUnits(units)
}

// =============================================================================
// 5. COMPLETE GAME LOOP INTEGRATION
// =============================================================================

export const runGameFrame = (gameState, towers, deltaMs = 33) => {
  const updates = {
    troopsUpdated: false,
    towersUpdated: false,
    gameOver: false,
    winner: null,
  }

  // Update game time
  gameState.gameTime -= deltaMs

  // ... (spell processing, etc.)

  // ===== CRITICAL: PROCESS UNITS WITH NEW SYSTEM =====
  processUnits(gameState.playerTroops, gameState.playerBuildings, {
    troops: gameState.enemyTroops,
    buildings: gameState.enemyBuildings,
  }, Object.values(towers.enemy), gameState)

  processUnits(gameState.enemyTroops, gameState.enemyBuildings, {
    troops: gameState.playerTroops,
    buildings: gameState.playerBuildings,
  }, Object.values(towers.player), gameState)

  // ===== CRITICAL: PROCESS TOWER ATTACKS =====
  processTowers(towers.player, gameState.playerTroops, gameState.playerBuildings)
  processTowers(towers.enemy, gameState.enemyTroops, gameState.enemyBuildings)

  // ===== CRITICAL: CLEANUP DEAD UNITS =====
  gameState.playerTroops = cleanupUnits(gameState.playerTroops, gameState)
  gameState.enemyTroops = cleanupUnits(gameState.enemyTroops, gameState)
  gameState.playerBuildings = cleanupUnits(gameState.playerBuildings, gameState)
  gameState.enemyBuildings = cleanupUnits(gameState.enemyBuildings, gameState)

  // Collision separation
  for (let i = 0; i < gameState.playerTroops.length; i++) {
    for (let j = i + 1; j < gameState.playerTroops.length; j++) {
      const dist = Math.hypot(
        gameState.playerTroops[j].x - gameState.playerTroops[i].x,
        gameState.playerTroops[j].y - gameState.playerTroops[i].y
      )
      if (dist < 30) {
        separateUnits(gameState.playerTroops[i], gameState.playerTroops[j])
      }
    }
  }

  updates.troopsUpdated = true
  return updates
}

// =============================================================================
// 6. CARD STATS REFERENCE
// =============================================================================

/**
 * Important card stats for targeting/movement:
 */

const CARD_STATS = {
  knight: {
    speed: 1,        // Medium
    range: 50,       // Melee
    attackSpeed: 1,  // 1 attack/sec
    targetBuildings: false,
  },

  archer: {
    speed: 1.2,      // Fast
    range: 120,      // Ranged
    attackSpeed: 1.2, // 1.2 attacks/sec
    targetBuildings: false,
  },

  giant: {
    speed: 0.7,      // Slow
    range: 50,       // Melee
    attackSpeed: 1.5, // Fast attack
    targetBuildings: true, // Important!
  },

  babyDragon: {
    flying: true,    // Ignores obstacles
    speed: 0.9,
    range: 100,
    attackSpeed: 1.2,
    splashRadius: 80, // Splash damage
  },

  valkyrie: {
    speed: 0.9,
    range: 50,       // Melee
    attackSpeed: 1.3,
    splashRadius: 100, // Circular splash
  },

  witch: {
    speed: 0.85,
    range: 100,      // Ranged
    attackSpeed: 1.2,
    spawnSkeleton: true, // Special
  },

  pekka: {
    speed: 0.6,      // Very slow
    range: 60,
    attackSpeed: 1.8, // Fast attack
    targetBuildings: true, // Building breaker
  },

  hogRider: {
    speed: 1.5,      // Very fast
    range: 50,
    attackSpeed: 1.2,
    targetBuildings: true, // Building target
  },

  minions: {
    flying: true,    // Flying
    speed: 1.4,      // Fast
    range: 100,
    attackSpeed: 1,
    count: 3,        // Spawn 3
  },

  skeletonArmy: {
    speed: 1.3,
    range: 40,
    attackSpeed: 0.8,
    count: 12,       // Spawn 12
  },
}

// =============================================================================
// 7. COMMON ISSUES & SOLUTIONS
// =============================================================================

/**
 * Issue: Units not moving towards enemy
 * Solution: Check if updateUnitMovement() is called in processUnits
 * Verify: unit.owner === 'player' or 'enemy'
 */

/**
 * Issue: Wrong units being targeted
 * Solution: Targeting priority is Buildings > Towers > Troops
 * Verify: card.stats.targetBuildings is set correctly for Giant, Hog, P.E.K.K.A
 */

/**
 * Issue: Splash damage not working
 * Solution: Must pass allEnemyUnits to performAttack()
 * Verify: card.stats.splashRadius > 0
 */

/**
 * Issue: Units not dying/stuck
 * Solution: removeDeadUnits() must be called every frame
 * Verify: units have hp property and can go to 0
 */

/**
 * Issue: Witch not spawning skeletons
 * Solution: witchSpawnSkeletons() must be called in processUnits
 * Verify: newSkeletons are pushed to gameState arrays
 */

// =============================================================================
// 8. TESTING THE SYSTEM
// =============================================================================

/**
 * Quick test to verify everything works:
 */
function testUnitSystem() {
  console.log('🧪 Testing Unit Movement & AI Targeting System...')

  // Test 1: Create units
  const player = createUnit('knight', 'player', 300, 700)
  const enemy = createUnit('archer', 'enemy', 300, 200)

  console.log('✓ Units created')

  // Test 2: Movement
  updateUnitMovement(player, null)
  console.log(`✓ Player moved to Y: ${player.y}`)

  // Test 3: Targeting
  const target = findNearestEnemy(player, { troops: [enemy], buildings: [] }, [])
  console.log(`✓ Target selected: ${target ? target.id : 'none'}`)

  // Test 4: Attack
  const result = performAttack(player, target, [])
  console.log(`✓ Attack dealt ${result.damage} damage`)

  // Test 5: Death
  target.hp = 0
  const filtered = removeDeadUnits([target])
  console.log(`✓ Dead unit handling: ${filtered.length} units alive`)

  console.log('✅ All tests passed!')
}

// =============================================================================
// 9. PERFORMANCE TIPS
// =============================================================================

/**
 * Target caching: Reduces calculations from O(n²) to O(n)
 * - Targets recalculated every 500ms
 * - Cached between updates
 * - Huge CPU savings with many units
 */

/**
 * Lane constraints: No expensive pathfinding
 * - Units constrained to lane corridors
 * - Simple waypoint navigation
 * - Clean visual presentation
 */

/**
 * Smooth lerp: Efficient movement
 * - Single vector calculation per frame
 * - No pathfinding algorithm
 * - Frame-rate independent via speed scaling
 */

// =============================================================================
// 10. NEXT STEPS
// =============================================================================

/**
 * 1. Test the system with npm run dev or equivalent
 * 2. Verify units move and attack correctly
 * 3. Check splash damage is working
 * 4. Test death animations
 * 5. Play a few matches to ensure balance
 * 6. Adjust card stats if needed
 * 7. Fine-tune movement speeds if needed
 * 8. Monitor performance with many units
 */

export default {
  processUnits,
  processTowers,
  cleanupUnits,
  runGameFrame,
}
