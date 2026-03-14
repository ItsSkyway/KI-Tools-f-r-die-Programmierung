/**
 * Unit Movement
 * Pathfinding and movement logic
 */

import { LANES, LANE_WIDTH, ARENA_HEIGHT } from '../game/constants.js'

/**
 * Move unit towards target position
 * @param {Unit} unit
 * @param {number} targetX
 * @param {number} targetY
 * @param {number} speed - pixels per frame
 * @returns {boolean} - true if reached target
 */
export const moveUnit = (unit, targetX, targetY, speed = 1) => {
  const dist = Math.hypot(targetX - unit.x, targetY - unit.y)

  if (dist < speed) {
    unit.x = targetX
    unit.y = targetY
    return true // Reached target
  }

  const ratio = speed / dist
  unit.x += (targetX - unit.x) * ratio
  unit.y += (targetY - unit.y) * ratio

  return false
}

/**
 * Get target lane for spawned unit
 * @param {Unit} unit
 * @returns {'top'|'bottom'} - Lane to move to
 */
export const selectLane = unit => {
  // Random lane selection
  return Math.random() > 0.5 ? 'top' : 'bottom'
}

/**
 * Get next waypoint for unit (lane-based pathfinding)
 * @param {Unit} unit - Unit with owner & lane
 * @returns {{x: number, y: number}}
 */
export const getNextWaypoint = unit => {
  if (unit.owner === 'player') {
    // Moving towards enemy (top)
    const lane = unit.lane || selectLane(unit)

    const x = lane === 'top' ? LANE_WIDTH / 2 : LANE_WIDTH / 2 + LANE_WIDTH

    return { x, y: Math.max(0, unit.y - 100) }
  } else {
    // Moving towards player (bottom)
    const lane = unit.lane || selectLane(unit)

    const x = lane === 'top' ? LANE_WIDTH / 2 : LANE_WIDTH / 2 + LANE_WIDTH

    return { x, y: Math.min(ARENA_HEIGHT, unit.y + 100) }
  }
}

/**
 * Update unit position in battle
 * @param {Unit} unit
 * @param {Unit|Tower|null} target
 */
export const updateUnitMovement = (unit, target) => {
  // If has target, move towards it
  if (target && target.hp > 0) {
    const speed = (unit.stats.speed || 1) * 0.5 // Scale to game speed

    moveUnit(unit, target.x, target.y, speed)
  } else {
    // Move towards enemy side
    const waypoint = getNextWaypoint(unit)
    const speed = (unit.stats.speed || 1) * 0.5

    moveUnit(unit, waypoint.x, waypoint.y, speed)
  }
}

/**
 * Keep unit within arena bounds
 */
export const clampUnitPosition = unit => {
  unit.x = Math.max(0, Math.min(800, unit.x))
  unit.y = Math.max(0, Math.min(ARENA_HEIGHT, unit.y))
}

/**
 * Flying units ignore obstacles
 */
export const canFly = unit => {
  return unit.stats.flying || false
}

/**
 * Check collision between two units
 */
export const checkCollision = (unit1, unit2, distance = 30) => {
  const dist = Math.hypot(unit2.x - unit1.x, unit2.y - unit1.y)
  return dist < distance
}

/**
 * Separate colliding units (simple physics)
 */
export const separateUnits = (unit1, unit2) => {
  const dist = Math.hypot(unit2.x - unit1.x, unit2.y - unit1.y)
  if (dist === 0) return

  const ratio = 1 / dist
  const moveDistance = (30 - dist) / 2 + 1

  unit1.x -= moveDistance * (unit2.x - unit1.x) * ratio
  unit1.y -= moveDistance * (unit2.y - unit1.y) * ratio
  unit2.x += moveDistance * (unit2.x - unit1.x) * ratio
  unit2.y += moveDistance * (unit2.y - unit1.y) * ratio
}

/**
 * Get distance between two units
 */
export const getDistance = (unit1, unit2) => {
  return Math.hypot(unit2.x - unit1.x, unit2.y - unit1.y)
}
