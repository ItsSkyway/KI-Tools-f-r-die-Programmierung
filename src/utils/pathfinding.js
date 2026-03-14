/**
 * Pathfinding Utilities
 * Lane selection and routing logic
 */

import { LANES, LANE_WIDTH, ARENA_HEIGHT } from '../game/constants.js'

/**
 * Select best lane for unit to move to
 * @param {Unit} unit
 * @param {Unit[]} allEnemies
 * @returns {'top'|'bottom'}
 */
export const selectBestLane = (unit, allEnemies = []) => {
  // Simple: count enemies in each lane
  const topEnemies = allEnemies.filter(e => e.x < LANE_WIDTH && e.hp > 0).length
  const bottomEnemies = allEnemies.filter(e => e.x >= LANE_WIDTH && e.hp > 0).length

  // Go to lane with fewer enemies
  return topEnemies <= bottomEnemies ? 'top' : 'bottom'
}

/**
 * Get lane center X coordinate
 */
export const getLaneCenterX = lane => {
  return lane === 'top' ? LANE_WIDTH / 2 : LANE_WIDTH / 2 + LANE_WIDTH
}

/**
 * Get lane target Y coordinate (based on owner side)
 */
export const getLaneTargetY = (owner, distance = 100) => {
  return owner === 'player' ? distance : ARENA_HEIGHT - distance
}

/**
 * Get next waypoint for unit in lane
 */
export const getNextWaypoint = (unit, lane) => {
  const targetX = getLaneCenterX(lane)
  const targetY = unit.owner === 'player' ? 0 : ARENA_HEIGHT

  return { x: targetX, y: targetY }
}

/**
 * Check if unit is in target lane
 */
export const isInLane = (unit, lane) => {
  const laneX = getLaneCenterX(lane)
  const tolerance = LANE_WIDTH / 2
  return Math.abs(unit.x - laneX) < tolerance
}

/**
 * Get all units in lane
 */
export const getUnitsInLane = (units, lane) => {
  return units.filter(u => isInLane(u, lane))
}

/**
 * Simple pathfinding: straight line to tower
 */
export const getPathToTower = (unit, tower) => {
  return {
    x: tower.x,
    y: tower.y,
  }
}

/**
 * Get all lanes
 */
export const getAllLanes = () => {
  return Object.keys(LANES)
}
