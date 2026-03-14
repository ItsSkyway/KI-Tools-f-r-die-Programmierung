/**
 * Tower System
 * Tower initialization, health, and management
 */

import { TOWER_POSITIONS, INITIAL_TOWER_HP, TOWER_STATS } from '../game/constants.js'

/**
 * Initialize towers for a player
 * @param {string} owner - 'player' or 'enemy'
 * @returns {Object} Tower objects { kingTower, princessLeft, princessRight }
 */
export const initializeTowers = owner => {
  const positions = TOWER_POSITIONS[owner]

  return {
    kingTower: {
      id: `tower_king_${owner}`,
      ownerType: owner,
      type: 'king',
      x: positions.kingTower.x,
      y: positions.kingTower.y,
      hp: INITIAL_TOWER_HP.king,
      maxHp: INITIAL_TOWER_HP.king,
      range: TOWER_STATS.king.range,
      damage: TOWER_STATS.king.damage,
      attackSpeed: TOWER_STATS.king.attackSpeed,
      lastAttackTime: 0,
      isKing: true,
      target: null,
      destroyed: false,
    },
    princessLeft: {
      id: `tower_princess_left_${owner}`,
      ownerType: owner,
      type: 'princess',
      x: positions.princessLeft.x,
      y: positions.princessLeft.y,
      hp: INITIAL_TOWER_HP.princess,
      maxHp: INITIAL_TOWER_HP.princess,
      range: TOWER_STATS.princess.range,
      damage: TOWER_STATS.princess.damage,
      attackSpeed: TOWER_STATS.princess.attackSpeed,
      lastAttackTime: 0,
      isKing: false,
      target: null,
      destroyed: false,
    },
    princessRight: {
      id: `tower_princess_right_${owner}`,
      ownerType: owner,
      type: 'princess',
      x: positions.princessRight.x,
      y: positions.princessRight.y,
      hp: INITIAL_TOWER_HP.princess,
      maxHp: INITIAL_TOWER_HP.princess,
      range: TOWER_STATS.princess.range,
      damage: TOWER_STATS.princess.damage,
      attackSpeed: TOWER_STATS.princess.attackSpeed,
      lastAttackTime: 0,
      isKing: false,
      target: null,
      destroyed: false,
    },
  }
}

/**
 * Find nearest enemy for tower to attack
 * @param {Tower} tower
 * @param {Unit[]} enemies
 * @returns {Unit|null}
 */
export const findTowerTarget = (tower, enemies) => {
  let nearest = null
  let minDist = Infinity

  enemies.forEach(enemy => {
    if (enemy.hp > 0) {
      const dist = Math.hypot(enemy.x - tower.x, enemy.y - tower.y)
      if (dist <= tower.range && dist < minDist) {
        nearest = enemy
        minDist = dist
      }
    }
  })

  return nearest
}

/**
 * Check if tower is alive
 */
export const isTowerAlive = tower => {
  return tower.hp > 0
}

/**
 * Damage tower
 */
export const damageTower = (tower, damage) => {
  tower.hp = Math.max(0, tower.hp - damage)
  if (tower.hp === 0) {
    tower.destroyed = true
  }
}

/**
 * Get tower health percentage
 */
export const getTowerHealthPercent = tower => {
  return (tower.hp / tower.maxHp) * 100
}

/**
 * Get all active towers
 */
export const getActiveTowers = towers => {
  return Object.values(towers).filter(tower => isTowerAlive(tower))
}

/**
 * Get destroyed tower count
 */
export const getDestroyedTowerCount = towers => {
  return Object.values(towers).filter(tower => !isTowerAlive(tower)).length
}

/**
 * Check if player destroyed enemy king tower
 */
export const isKingTowerDestroyed = towers => {
  return towers.kingTower && !isTowerAlive(towers.kingTower)
}

/**
 * Calculate tower remaining health for all towers
 */
export const getTowerHealthStatus = towers => {
  return {
    kingTower: {
      hp: towers.kingTower.hp,
      maxHp: towers.kingTower.maxHp,
      percent: getTowerHealthPercent(towers.kingTower),
    },
    princessLeft: {
      hp: towers.princessLeft.hp,
      maxHp: towers.princessLeft.maxHp,
      percent: getTowerHealthPercent(towers.princessLeft),
    },
    princessRight: {
      hp: towers.princessRight.hp,
      maxHp: towers.princessRight.maxHp,
      percent: getTowerHealthPercent(towers.princessRight),
    },
  }
}
