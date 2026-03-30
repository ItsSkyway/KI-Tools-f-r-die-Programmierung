/**
 * Unit Movement System
 * Pathfinding, lane-based movement, and smooth lerp animations
 */

import { LANES, LANE_WIDTH, ARENA_HEIGHT, RIVER_Y, BRIDGES, ARENA_WIDTH } from '../game/constants.js'

// ============================================================================
// CORE MOVEMENT
// ============================================================================

/**
 * Smooth lerp movement towards target
 * @param {Unit} unit
 * @param {number} targetX
 * @param {number} targetY
 * @param {number} speed - pixels per frame (0.6 to 1.5 base multiplier)
 * @returns {boolean} - true if reached target
 */
export const moveUnit = (unit, targetX, targetY, speed = 1) => {
  const dist = Math.hypot(targetX - unit.x, targetY - unit.y)

  if (dist < speed) {
    unit.x = targetX
    unit.y = targetY
    return true // Reached target
  }

  // Smooth lerp movement (não teleport)
  const ratio = speed / dist
  unit.x += (targetX - unit.x) * ratio
  unit.y += (targetY - unit.y) * ratio

  return false
}

// ============================================================================
// LANE MANAGEMENT & PATHFINDING
// ============================================================================

/**
 * Get lane index for unit X position
 * Returns: 'left' (0-200), 'center' (200-400), 'right' (400-600)
 */
export const getLaneFromX = (x) => {
  if (x < 200) return 'left'
  if (x < 400) return 'center'
  return 'right'
}

/**
 * Get center X for lane
 */
export const getLaneCenterX = (lane) => {
  if (lane === 'left') return 100
  if (lane === 'center') return 300
  return 500
}

/**
 * Constrain unit to lane boundaries
 */
export const constrainToLane = (unit, lane) => {
  if (lane === 'left') {
    unit.x = Math.max(0, Math.min(200, unit.x))
  } else if (lane === 'center') {
    unit.x = Math.max(200, Math.min(400, unit.x))
  } else if (lane === 'right') {
    unit.x = Math.max(400, Math.min(600, unit.x))
  }
}

/**
 * Check if unit is at river and needs bridge
 */
export const isAtRiver = (unit) => {
  return Math.abs(unit.y - RIVER_Y) < 60 // Within river zone
}

/**
 * Get nearest bridge for unit to cross
 */
export const getNearestBridge = (unit) => {
  const currentLane = getLaneFromX(unit.x)
  if (currentLane === 'left' || currentLane === 'center') {
    return BRIDGES.left // Left bridge for left/center lanes
  }
  return BRIDGES.right // Right bridge for right lane
}

/**
 * Get next waypoint for unit movement (lane-based pathfinding)
 * Player spawns at bottom (y=800) moving to top (y=0)
 * Enemy spawns at top (y=0) moving to bottom (y=800)
 */
export const getNextWaypoint = (unit, lanes = LANES) => {
  const currentLane = unit.lane || getLaneFromX(unit.x)
  const laneCenterX = getLaneCenterX(currentLane)

  if (unit.owner === 'player') {
    // Moving towards enemy (top, y=0)
    const isMovingTowardRiver = unit.y > RIVER_Y
    
    if (isMovingTowardRiver) {
      // Move to bridge crossing
      const bridge = getNearestBridge(unit)
      return { x: bridge.x, y: bridge.y }
    } else {
      // Move up to king tower
      return { x: laneCenterX, y: 0 }
    }
  } else {
    // Moving towards player (bottom, y=800)
    const isMovingTowardRiver = unit.y < RIVER_Y
    
    if (isMovingTowardRiver) {
      // Move to bridge crossing
      const bridge = getNearestBridge(unit)
      return { x: bridge.x, y: bridge.y }
    } else {
      // Move down to king tower
      return { x: laneCenterX, y: ARENA_HEIGHT }
    }
  }
}

/**
 * Update unit position - handles movement and lane constraints
 * @param {Unit} unit
 * @param {Unit|Tower|null} target - If has target, move towards it
 */
export const updateUnitMovement = (unit, target) => {
  // Base speed: 0.6 to 1.5 scaled to game frame (33ms)
  const baseSpeed = (unit.stats.speed || 1) * 0.5
  
  if (target && target.hp > 0) {
    // Has target: move towards it directly
    moveUnit(unit, target.x, target.y, baseSpeed)
  } else {
    // No target: move towards enemy side via waypoints
    const waypoint = getNextWaypoint(unit)
    moveUnit(unit, waypoint.x, waypoint.y, baseSpeed)
  }

  // Keep unit in lane corridor (important for clean visuals)
  const lane = unit.lane || getLaneFromX(unit.x)
  constrainToLane(unit, lane)
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
