/**
 * Game Loop
 * Main game simulation loop
 */

import { findNearestEnemy, performAttack, towerAttack, removeDeadUnits, determineWinner } from '../simulation/combat.js'
import { updateUnitMovement, separateUnits } from '../simulation/unitMovement.js'
import { applySpellEffect, applyUnitAbility } from '../cards/cardEffects.js'
import { 
  getPrincessTowerCount, 
  shouldActivateKingTower, 
  activateKingTower 
} from '../simulation/towers.js'
import {
  createArrow,
  updateProjectiles,
  filterCompletedArrows,
  processArrowCollisions,
  applyArrowDamage,
} from '../simulation/projectiles.js'

/**
 * Distance helper for spell targeting
 */
const distance = (obj1, obj2) => Math.hypot(obj2.x - obj1.x, obj2.y - obj1.y)

/**
 * Run one frame of game simulation
 * @param {Object} gameState - Mutable game state
 * @param {Object} towers - Tower state
 * @param {number} deltaMs - Time since last frame
 * @returns {Object} Update data for UI
 */
export const runGameFrame = (gameState, towers, deltaMs = 33) => {
  const updates = {
    troopsUpdated: false,
    towersUpdated: false,
    gameOver: false,
    winner: null,
    kingTowerActivations: [], // Track activation events for UI
  }

  // Update game time
  gameState.gameTime -= deltaMs
  if (gameState.gameTime <= 0) {
    gameState.gameTime = 0
    gameState.gameOver = true

    // Determine winner by tower HP
    const playerTowerHp = Object.values(towers.player).reduce((sum, t) => sum + t.hp, 0)
    const enemyTowerHp = Object.values(towers.enemy).reduce((sum, t) => sum + t.hp, 0)

    gameState.winner = determineWinner(towers.player, towers.enemy)
    updates.gameOver = true
    updates.winner = gameState.winner

    return updates
  }

  // ============================================================================
  // KING TOWER ACTIVATION STATE MACHINE CHECK
  // ============================================================================
  // Check if either king tower should activate (dormant → active)
  
  // Initialize tracking if needed
  if (!gameState.playerPrincessCount) {
    gameState.playerPrincessCount = getPrincessTowerCount(towers.player)
  }
  if (!gameState.enemyPrincessCount) {
    gameState.enemyPrincessCount = getPrincessTowerCount(towers.enemy)
  }

  // Check player king tower activation
  const currentPlayerPrincessCount = getPrincessTowerCount(towers.player)
  if (shouldActivateKingTower(towers.player.kingTower, currentPlayerPrincessCount, gameState.playerPrincessCount)) {
    const activationEvent = activateKingTower(towers.player.kingTower)
    updates.kingTowerActivations.push({
      owner: 'player',
      ...activationEvent,
    })
  }
  gameState.playerPrincessCount = currentPlayerPrincessCount

  // Check enemy king tower activation
  const currentEnemyPrincessCount = getPrincessTowerCount(towers.enemy)
  if (shouldActivateKingTower(towers.enemy.kingTower, currentEnemyPrincessCount, gameState.enemyPrincessCount)) {
    const activationEvent = activateKingTower(towers.enemy.kingTower)
    updates.kingTowerActivations.push({
      owner: 'enemy',
      ...activationEvent,
    })
  }
  gameState.enemyPrincessCount = currentEnemyPrincessCount

  // Check double elixir (last 60 seconds)
  const isDoubleElixir = gameState.gameTime < 60000

  // Process both sides with gameState for ability handling
  processUnits(gameState.playerTroops, gameState.playerBuildings, {
    troops: gameState.enemyTroops,
    buildings: gameState.enemyBuildings,
  }, Object.values(towers.enemy), gameState)

  processUnits(gameState.enemyTroops, gameState.enemyBuildings, {
    troops: gameState.playerTroops,
    buildings: gameState.playerBuildings,
  }, Object.values(towers.player), gameState)

  // PHASE 1: Process active spells
  gameState.activeSpells = gameState.activeSpells.filter(spell => {
    const timeSinceCast = Date.now() - spell.castTime
    
    // Check if spell reached target location
    if (timeSinceCast > spell.travelTime) {
      // Find units in splash radius
      const affectedUnits = [
        ...gameState.playerTroops.filter(u => distance(u, spell.target) < spell.splashRadius),
        ...gameState.enemyTroops.filter(u => distance(u, spell.target) < spell.splashRadius),
      ]
      const affectedTowers = [
        ...Object.values(towers.player).filter(t => distance(t, spell.target) < spell.splashRadius),
        ...Object.values(towers.enemy).filter(t => distance(t, spell.target) < spell.splashRadius),
      ]

      // Apply spell effect
      if (affectedUnits.length > 0 || affectedTowers.length > 0) {
        applySpellEffect(spell, affectedUnits, affectedTowers)
      }

      // Remove spell from active list (return false to filter it out)
      return false
    }
    
    // Spell still in flight
    return true
  })

  // PHASE 1B: Process tower arrows
  const playerArrows = processTowers(towers.player, gameState.enemyTroops, gameState.enemyBuildings)
  const enemyArrows = processTowers(towers.enemy, gameState.playerTroops, gameState.playerBuildings)
  
  // Create arrow projectiles
  playerArrows.forEach(arrowData => {
    const arrow = createArrow(
      arrowData.fromX,
      arrowData.fromY,
      arrowData.toX,
      arrowData.toY,
      arrowData.damage,
      arrowData.travelTime,
      arrowData.owner,
      arrowData.target
    )
    gameState.projectiles.push(arrow)
  })
  
  enemyArrows.forEach(arrowData => {
    const arrow = createArrow(
      arrowData.fromX,
      arrowData.fromY,
      arrowData.toX,
      arrowData.toY,
      arrowData.damage,
      arrowData.travelTime,
      arrowData.owner,
      arrowData.target
    )
    gameState.projectiles.push(arrow)
  })

  // Clean up dead units
  gameState.playerTroops = removeDeadUnits(gameState.playerTroops)
  gameState.enemyTroops = removeDeadUnits(gameState.enemyTroops)
  gameState.playerBuildings = removeDeadUnits(gameState.playerBuildings)
  gameState.enemyBuildings = removeDeadUnits(gameState.enemyBuildings)

  // PHASE 3: Update and process arrow projectiles
  if (!gameState.projectiles) {
    gameState.projectiles = []
  }
  
  // Update arrow positions
  gameState.projectiles = updateProjectiles(gameState.projectiles, deltaMs)
  
  // Process arrow collisions with enemy units
  const [playerArrowsHit, playerDamageEvents] = processArrowCollisions(
    gameState.projectiles.filter(a => a.owner === 'player'),
    gameState.enemyTroops,
    15
  )
  
  const [enemyArrowsHit, enemyDamageEvents] = processArrowCollisions(
    gameState.projectiles.filter(a => a.owner === 'enemy'),
    gameState.playerTroops,
    15
  )
  
  // Apply damage from arrow hits
  applyArrowDamage([...playerDamageEvents, ...enemyDamageEvents])
  
  // Also check collisions with towers
  gameState.projectiles.forEach(arrow => {
    if (arrow.hasHit) return
    
    const towerSet = arrow.owner === 'player' ? towers.enemy : towers.player
    Object.values(towerSet).forEach(tower => {
      if (tower.hp > 0) {
        const dist = Math.hypot(tower.x - arrow.x, tower.y - arrow.y)
        if (dist < 20) {
          arrow.hasHit = true
          arrow.hitAt = arrow.elapsed
          tower.hp = Math.max(0, tower.hp - arrow.damage)
        }
      }
    })
  })
  
  // Filter out completed arrows
  gameState.projectiles = filterCompletedArrows(gameState.projectiles)

  // PHASE 4: Prevent unit overlap - collision separation
  for (let i = 0; i < gameState.playerTroops.length; i++) {
    for (let j = i + 1; j < gameState.playerTroops.length; j++) {
      const dist = distance(gameState.playerTroops[i], gameState.playerTroops[j])
      if (dist < 30) {
        separateUnits(gameState.playerTroops[i], gameState.playerTroops[j])
      }
    }
  }

  for (let i = 0; i < gameState.enemyTroops.length; i++) {
    for (let j = i + 1; j < gameState.enemyTroops.length; j++) {
      const dist = distance(gameState.enemyTroops[i], gameState.enemyTroops[j])
      if (dist < 30) {
        separateUnits(gameState.enemyTroops[i], gameState.enemyTroops[j])
      }
    }
  }

  updates.troopsUpdated = true

  return updates
}

/**
 * Process units on one side (movement, combat)
 * Implements correct unit behavior: targeting, movement, combat, death
 */
const processUnits = (friendlyUnits, friendlyBuildings, enemies, enemyTowers, gameState = null) => {
  friendlyUnits.forEach(unit => {
    // PHASE 2: Check if unit has ability (e.g., Witch spawning) while alive
    if (unit.hp > 0 && unit.cardId === 'witch' && gameState) {
      const { units: newUnits } = applyUnitAbility(unit, gameState)
      if (newUnits && newUnits.length > 0) {
        // Witch spawned skeleton
        if (unit.owner === 'player') {
          gameState.playerTroops.push(...newUnits)
        } else {
          gameState.enemyTroops.push(...newUnits)
        }
      }
    }

    if (unit.hp <= 0) {
      // PHASE 2: Apply unit ability on death (e.g., Witch spawns skeleton on death)
      if (unit.card && unit.card.ability && gameState) {
        const { units: newUnits } = applyUnitAbility(unit, gameState)
        if (newUnits && newUnits.length > 0) {
          if (unit.owner === 'player') {
            gameState.playerTroops.push(...newUnits)
          } else {
            gameState.enemyTroops.push(...newUnits)
          }
        }
      }
      return
    }

    // Skip frozen units
    if (unit.frozen && Date.now() < unit.frozenUntil) return

    // ========== INTELLIGENT TARGET PRIORITIZATION ==========
    // Priority 1: Buildings in Range (nächster)
    // Priority 2: Enemy Towers in Range (nächster)
    // Priority 3: Enemy Troops in Range (nächster nach Health)
    const target = findNearestEnemy(unit, enemies, enemyTowers)

    if (target && target.hp > 0) {
      // ========== MOVEMENT TOWARDS TARGET ==========
      // Smooth lerp movement (không teleport)
      updateUnitMovement(unit, target)

      // ========== CHECK RANGE & PREPARE ATTACK ==========
      const dist = Math.hypot(target.x - unit.x, target.y - unit.y)
      const range = unit.stats.range || 100

      if (dist < range) {
        // In range: perform attack with splash damage handling
        const allEnemyUnits = [...enemies.troops, ...(enemies.buildings || [])]
        performAttack(unit, target, allEnemyUnits)
      }
    } else {
      // ========== NO TARGET: MOVE TOWARDS ENEMY SIDE ==========
      // Troops bewegen sich nach Spawn in Richtung gegner Hälfte
      // Lane-based movement keeps units in corridors
      updateUnitMovement(unit, null)
    }
  })
}

/**
 * Process tower attacks
 * Towers find targets using intelligent prioritization
 * Returns array of arrow creation requests
 * 
 * KING TOWER ACTIVATION:
 * - Dormant king towers cannot shoot (only defend when damaged)
 * - Active king towers shoot normally
 */
const processTowers = (towerSet, enemyTroops, enemyBuildings) => {
  const arrows = []
  
  Object.values(towerSet).forEach(tower => {
    if (tower.hp <= 0) return

    // King tower activation check: skip dormant king towers
    if (tower.isKing && tower.state === 'dormant') {
      return // Dormant king tower cannot attack
    }

    // Towers behave like units: find best target
    let target = findNearestEnemy(
      { x: tower.x, y: tower.y, stats: { range: tower.range, targetBuildings: true } },
      {
        troops: enemyTroops,
        buildings: enemyBuildings,
      },
      []
    )

    if (target) {
      // Towers can also have splash damage
      const allEnemyUnits = [...enemyTroops, ...(enemyBuildings || [])]
      const attackResult = towerAttack(tower, target, allEnemyUnits)
      
      // Create arrow projectile if attack successful
      if (attackResult.arrow) {
        arrows.push(attackResult.arrow)
      }
    }
  })
  
  return arrows
}

/**
 * Check if game is over (all towers destroyed)
 */
export const checkGameOver = towers => {
  const playerTowers = Object.values(towers.player)
  const enemyTowers = Object.values(towers.enemy)

  const playerAllDead = playerTowers.every(t => t.hp <= 0)
  const enemyAllDead = enemyTowers.every(t => t.hp <= 0)

  if (playerAllDead) {
    return { over: true, winner: 'enemy' }
  }

  if (enemyAllDead) {
    return { over: true, winner: 'player' }
  }

  // Check king towers
  if (towers.player.kingTower.hp <= 0) {
    return { over: true, winner: 'enemy' }
  }

  if (towers.enemy.kingTower.hp <= 0) {
    return { over: true, winner: 'player' }
  }

  return { over: false, winner: null }
}

/**
 * Create UI update from game state
 */
export const createUIUpdate = (gameState, towers) => {
  return {
    playerElixir: Math.floor(gameState.playerElixir * 10) / 10,
    enemyElixir: Math.floor(gameState.enemyElixir * 10) / 10,
    gameTime: Math.ceil(gameState.gameTime / 1000),
    playerTroops: gameState.playerTroops.length,
    enemyTroops: gameState.enemyTroops.length,
    playerTowerHp: Object.entries(towers.player).map(([key, tower]) => ({
      type: key,
      hp: tower.hp,
      maxHp: tower.maxHp,
      state: tower.state || 'active', // Include king tower state
      canShoot: !tower.isKing || tower.state === 'active', // King towers only shoot when active
    })),
    enemyTowerHp: Object.entries(towers.enemy).map(([key, tower]) => ({
      type: key,
      hp: tower.hp,
      maxHp: tower.maxHp,
      state: tower.state || 'active',
      canShoot: !tower.isKing || tower.state === 'active',
    })),
    kingTowerStates: {
      player: {
        state: towers.player.kingTower.state,
        isDormant: towers.player.kingTower.state === 'dormant',
        isActive: towers.player.kingTower.state === 'active',
      },
      enemy: {
        state: towers.enemy.kingTower.state,
        isDormant: towers.enemy.kingTower.state === 'dormant',
        isActive: towers.enemy.kingTower.state === 'active',
      },
    },
  }
}
