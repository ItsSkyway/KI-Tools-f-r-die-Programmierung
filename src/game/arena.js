/**
 * arena.js
 * Lane-based movement system and river crossing mechanics
 * Clash Royale accurate implementation
 */

import {
  LANES,
  BRIDGES,
  RIVER_Y,
  RIVER_ZONE,
  ENEMY_TERRITORY_END,
  PLAYER_TERRITORY_START,
} from './constants.js'

// ============================================================================
// LANE SYSTEM
// ============================================================================

/**
 * Determine which lane a unit belongs to based on x coordinate
 */
export function getLaneForX(x) {
  if (x < 200) return LANES.left
  if (x < 400) return LANES.center
  return LANES.right
}

/**
 * Determine which lane ID a unit belongs to
 */
export function getLaneId(x) {
  return getLaneForX(x).id
}

/**
 * Clamp unit x to lane boundaries
 */
export function clampToLane(x, laneId) {
  const lane = Object.values(LANES).find(l => l.id === laneId)
  if (!lane) return x
  return Math.max(lane.minX + 5, Math.min(lane.maxX - 5, x))
}

// ============================================================================
// RIVER CROSSING MECHANICS
// ============================================================================

/**
 * Check if a position is in the river zone
 */
export function isInRiverZone(y) {
  return y >= RIVER_ZONE.startY && y <= RIVER_ZONE.endY
}

/**
 * Check if a unit can cross the river at its current position
 * Only allowed if crossing through a bridge
 */
export function canCrossRiver(x, y, currentY) {
  // Not in river zone = can move freely
  if (!isInRiverZone(y)) {
    return true
  }

  // Check if in river zone but not crossing
  if (!isInRiverZone(currentY)) {
    // Entering river zone - must be on bridge
    return isBridgeCrossing(x)
  }

  // Already in river zone - check if on bridge
  return isBridgeCrossing(x)
}

/**
 * Check if x position is on a bridge
 */
export function isBridgeCrossing(x) {
  const leftBridge = BRIDGES.left
  const rightBridge = BRIDGES.right

  const leftOk = x >= leftBridge.x - leftBridge.width / 2 && x <= leftBridge.x + leftBridge.width / 2
  const rightOk = x >= rightBridge.x - rightBridge.width / 2 && x <= rightBridge.x + rightBridge.width / 2

  return leftOk || rightOk
}

/**
 * Get the nearest bridge crossing for a given lane
 */
export function getNearestBridge(laneId) {
  if (laneId === 'left') {
    return BRIDGES.left
  } else if (laneId === 'right') {
    return BRIDGES.right
  }
  // Center lane - both bridges equidistant
  return BRIDGES.left // Default to left
}

/**
 * Calculate river crossing penalty (river animation falling down)
 * Units that step off bridge fall into river with animation
 */
export function calculateRiverCrossingPenalty(unit, targetX, targetY) {
  const penalty = {
    damagePerTick: 0,
    slowPercentage: 0,
    isDrowning: false,
  }

  // Check if unit is trying to cross river outside of bridge
  if (isInRiverZone(targetY) && !isBridgeCrossing(targetX)) {
    penalty.isDrowning = true
    penalty.damagePerTick = 2 // Damage per frame while in river
    penalty.slowPercentage = 0.3 // 30% slow
  }

  return penalty
}

// ============================================================================
// PATHFINDING & MOVEMENT
// ============================================================================

/**
 * Find target Y position for unit based on its side and objective
 * Player units move up (toward enemy), Enemy units move down (toward player)
 */
export function getTargetYForSide(side) {
  if (side === 'player') {
    // Player units move toward enemy (y = 0)
    return 50
  } else {
    // Enemy units move toward player (y = 800)
    return 750
  }
}

/**
 * Check if a unit can be placed at a specific position
 * Building placement restrictions for player
 */
export function canPlaceBuilding(x, y, side) {
  // Buildings can only be placed in own territory
  if (side === 'player') {
    // Player territory: y > 400
    return y >= PLAYER_TERRITORY_START
  } else {
    // Enemy territory: y < 400
    return y <= ENEMY_TERRITORY_END
  }
}

/**
 * Check if spell can be cast at position
 * Spells work everywhere
 */
export function canCastSpell(x, y) {
  // Spells can be cast anywhere
  return x >= 0 && x <= 600 && y >= 0 && y <= 800
}

/**
 * Determine optimal path for unit considering lane and river
 * Returns array of waypoints for unit to follow
 */
export function calculateUnitPath(unit, targetX, targetY) {
  const currentLane = getLaneId(unit.x)
  const waypoints = []

  // Current position
  waypoints.push({ x: unit.x, y: unit.y })

  // Check if we need to cross river
  if (isInRiverZone(targetY) && !isInRiverZone(unit.y)) {
    // Need to cross river - must go to bridge
    const bridge = getNearestBridge(currentLane)

    // Move to bridge
    waypoints.push({
      x: bridge.x,
      y: RIVER_Y,
      isBridge: true,
    })

    // Then to target
    waypoints.push({ x: targetX, y: targetY })
  } else {
    // Direct path to target
    waypoints.push({ x: targetX, y: targetY })
  }

  return waypoints
}

/**
 * Calculate lane-based movement with constraints
 * Units generally stay in their lane unless crossing to another lane
 */
export function calculateLaneMovement(unit, targetX, targetY, speed) {
  let nextX = unit.x
  let nextY = unit.y

  const dx = targetX - unit.x
  const dy = targetY - unit.y
  const distance = Math.sqrt(dx * dx + dy * dy)

  if (distance < 1) {
    return { x: targetX, y: targetY }
  }

  // Move towards target
  const moveDistance = Math.min(speed, distance)
  nextX = unit.x + (dx / distance) * moveDistance
  nextY = unit.y + (dy / distance) * moveDistance

  // Apply river crossing restrictions
  if (isInRiverZone(nextY) && !isBridgeCrossing(nextX)) {
    // Trying to cross river outside bridge - block or redirect
    if (!isBridgeCrossing(unit.x)) {
      // Not on bridge and trying to enter river zone - block
      return { x: unit.x, y: unit.y }
    }
  }

  // Clamp to lane if not crossing
  const targetLane = getLaneId(targetX)
  if (!isInRiverZone(nextY)) {
    // Not in river zone - respect lane boundaries with some tolerance
    nextX = clampToLane(nextX, targetLane)
  }

  return { x: nextX, y: nextY }
}

// ============================================================================
// VISUAL/DEBUG
// ============================================================================

/**
 * Get debug info for rendering lanes and river
 */
export function getArenaDebugInfo() {
  return {
    lanes: LANES,
    bridges: BRIDGES,
    riverY: RIVER_Y,
    riverZone: RIVER_ZONE,
  }
}

/**
 * Check if unit is in drowning state (in river, not on bridge)
 */
export function isUnitDrowning(unit) {
  return isInRiverZone(unit.y) && !isBridgeCrossing(unit.x)
}
