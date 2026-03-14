/**
 * Game Loop
 * Main game simulation loop
 */

import { findNearestEnemy, performAttack, towerAttack, removeDeadUnits, determineWinner } from '../simulation/combat.js'
import { updateUnitMovement, separateUnits } from '../simulation/unitMovement.js'
import { applySpellEffect, applyUnitAbility } from '../cards/cardEffects.js'

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

  // Process towers
  processTowers(towers.player, gameState.playerTroops, gameState.playerBuildings)
  processTowers(towers.enemy, gameState.enemyTroops, gameState.enemyBuildings)

  // Clean up dead units
  gameState.playerTroops = removeDeadUnits(gameState.playerTroops)
  gameState.enemyTroops = removeDeadUnits(gameState.enemyTroops)
  gameState.playerBuildings = removeDeadUnits(gameState.playerBuildings)
  gameState.enemyBuildings = removeDeadUnits(gameState.enemyBuildings)

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

    // BUG #7 FIXED: Skip frozen units
    if (unit.frozen && Date.now() < unit.frozenUntil) return

    // Find target
    const target = findNearestEnemy(unit, enemies, enemyTowers)

    if (target) {
      // Move towards target
      updateUnitMovement(unit, target)

      // Check range and attack
      const dist = Math.hypot(target.x - unit.x, target.y - unit.y)
      const range = unit.stats.range || 100

      if (dist < range) {
        performAttack(unit, target)
      }
    } else {
      // No target, move towards enemy side
      updateUnitMovement(unit, null)
    }
  })
}

/**
 * Process tower attacks
 */
const processTowers = (towerSet, enemyTroops, enemyBuildings) => {
  Object.values(towerSet).forEach(tower => {
    if (tower.hp <= 0) return

    // Find target
    let target = findNearestEnemy({ x: tower.x, y: tower.y, stats: { range: tower.range } }, {
      troops: enemyTroops,
      buildings: enemyBuildings,
    }, [])

    if (target) {
      towerAttack(tower, target)
    }
  })
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
    })),
    enemyTowerHp: Object.entries(towers.enemy).map(([key, tower]) => ({
      type: key,
      hp: tower.hp,
      maxHp: tower.maxHp,
    })),
  }
}
