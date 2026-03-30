/**
 * Pathfinding Module with Bridge Crossing
 * Handles intelligent waypoint generation for units crossing rivers with bridges
 * Mandatory bridge usage for river crossing - no direct river traversal allowed
 */

import {
  LANES,
  BRIDGES,
  RIVER_Y,
  RIVER_ZONE,
  ARENA_WIDTH,
  ARENA_HEIGHT,
} from '../game/constants.js'

import {
  isInRiverZone,
  isBridgeCrossing,
  getLaneId,
  getNearestBridge,
} from '../game/arena.js'

// ============================================================================
// BRIDGE-AWARE PATHFINDING
// ============================================================================

/**
 * Calculate path with mandatory bridge crossing
 * @param {number} startX - Starting X position
 * @param {number} startY - Starting Y position
 * @param {number} endX - Target X position
 * @param {number} endY - Target Y position
 * @param {string} laneId - Unit's lane ('left', 'center', 'right')
 * @returns {Array<{x, y, type, priority}>} Waypoints to follow
 */
export function calculatePathWithBridges(startX, startY, endX, endY, laneId = 'center') {
  const waypoints = []

  // Safety checks
  if (!Number.isFinite(startX) || !Number.isFinite(startY) || 
      !Number.isFinite(endX) || !Number.isFinite(endY)) {
    return [{ x: endX, y: endY, type: 'target', priority: 'normal' }]
  }

  const startInRiver = isInRiverZone(startY)
  const endInRiver = isInRiverZone(endY)
  
  // Check if path crosses river by checking if start and end are on opposite sides
  const startBelowRiver = startY > RIVER_Y
  const endBelowRiver = endY > RIVER_Y
  const crossesRiver = startBelowRiver !== endBelowRiver

  // ========== SCENARIO 1: Already in river, not on bridge ==========
  if (startInRiver && !isBridgeCrossing(startX)) {
    const nearestBridge = getNearestBridge(laneId)
    waypoints.push({
      x: nearestBridge.x,
      y: RIVER_Y,
      type: 'bridge',
      priority: 'critical',
      reason: 'rescue_from_river',
    })

    // Add target
    waypoints.push({
      x: endX,
      y: endY,
      type: 'target',
      priority: 'normal',
    })

    return waypoints
  }

  // ========== SCENARIO 2: Path crosses river (not currently in river) ==========
  if (crossesRiver && !startInRiver) {
    // Determine which bridge to use based on lanes and target
    const optimalBridge = selectOptimalBridge(startX, endX, laneId)

    waypoints.push({
      x: optimalBridge.x,
      y: RIVER_Y,
      type: 'bridge',
      priority: 'high',
      reason: 'river_crossing',
    })

    // Add target
    waypoints.push({
      x: endX,
      y: endY,
      type: 'target',
      priority: 'normal',
    })

    return waypoints
  }

  // ========== SCENARIO 3: Direct path (no river crossing) ==========
  waypoints.push({
    x: endX,
    y: endY,
    type: 'target',
    priority: 'normal',
  })

  return waypoints
}

/**
 * Select optimal bridge based on current lane and target position
 * @param {number} currentX - Current X position
 * @param {number} targetX - Target X position
 * @param {string} laneId - Current lane
 * @returns {Object} Bridge object {x, y, width, height}
 */
function selectOptimalBridge(currentX, targetX, laneId) {
  const currentLaneId = getLaneId(currentX)
  const targetLaneId = getLaneId(targetX)

  // Left lane units prefer left bridge
  if (currentLaneId === 'left') {
    return BRIDGES.left
  }

  // Right lane units prefer right bridge
  if (currentLaneId === 'right') {
    return BRIDGES.right
  }

  // Center lane - choose based on target lane or proximity
  if (currentLaneId === 'center') {
    if (targetLaneId === 'left') {
      return BRIDGES.left
    }
    if (targetLaneId === 'right') {
      return BRIDGES.right
    }

    // Both center - use nearest bridge
    const distToLeft = Math.abs(currentX - BRIDGES.left.x)
    const distToRight = Math.abs(currentX - BRIDGES.right.x)
    return distToLeft < distToRight ? BRIDGES.left : BRIDGES.right
  }

  // Fallback to nearest
  const distToLeft = Math.abs(currentX - BRIDGES.left.x)
  const distToRight = Math.abs(currentX - BRIDGES.right.x)
  return distToLeft < distToRight ? BRIDGES.left : BRIDGES.right
}

// ============================================================================
// WAYPOINT FOLLOWING & MOVEMENT
// ============================================================================

/**
 * Move unit along a path following waypoints
 * @param {Unit} unit - Unit to move
 * @param {Array} path - Array of waypoints from calculatePathWithBridges
 * @param {number} dt - Delta time (frame time)
 * @returns {Object} {unit, currentWaypoint, reachedEnd}
 */
export function moveUnitAlongPath(unit, path, dt = 1) {
  if (!path || path.length === 0) {
    return { unit, currentWaypoint: null, reachedEnd: true }
  }

  // Find next active waypoint (not yet reached)
  const WAYPOINT_THRESHOLD = 5 // pixels to consider waypoint reached

  let currentWaypoint = null
  let nextWaypointIndex = 0

  for (let i = 0; i < path.length; i++) {
    const wp = path[i]
    const dist = Math.hypot(unit.x - wp.x, unit.y - wp.y)

    if (dist > WAYPOINT_THRESHOLD) {
      currentWaypoint = wp
      nextWaypointIndex = i
      break
    }
  }

  // If all waypoints reached, stay at last one
  if (!currentWaypoint) {
    currentWaypoint = path[path.length - 1]
    return {
      unit,
      currentWaypoint,
      reachedEnd: true,
      nextWaypointIndex: path.length - 1,
    }
  }

  // Move towards waypoint
  const dx = currentWaypoint.x - unit.x
  const dy = currentWaypoint.y - unit.y
  const dist = Math.hypot(dx, dy)

  if (dist > 0) {
    // Speed is 0.5 pixels per frame base
    const speed = (unit.stats?.speed || 1) * 0.5 * dt
    const moveDistance = Math.min(speed, dist)

    unit.x += (dx / dist) * moveDistance
    unit.y += (dy / dist) * moveDistance
  }

  return {
    unit,
    currentWaypoint,
    reachedEnd: false,
    nextWaypointIndex,
  }
}

/**
 * Check if unit has reached a waypoint
 * @param {Unit} unit - Unit to check
 * @param {Object} waypoint - Target waypoint
 * @param {number} threshold - Distance threshold (default 5)
 * @returns {boolean}
 */
export function hasReachedWaypoint(unit, waypoint, threshold = 5) {
  const dist = Math.hypot(unit.x - waypoint.x, unit.y - waypoint.y)
  return dist < threshold
}

/**
 * Get current waypoint for unit (next waypoint to reach)
 * @param {Unit} unit - Unit to check
 * @param {Array} waypoints - Array of waypoints
 * @param {number} threshold - Distance threshold (default 5)
 * @returns {Object|null} Current waypoint or null if all reached
 */
export function getCurrentWaypoint(unit, waypoints, threshold = 5) {
  if (!waypoints || waypoints.length === 0) {
    return null
  }

  for (const wp of waypoints) {
    const dist = Math.hypot(unit.x - wp.x, unit.y - wp.y)
    if (dist > threshold) {
      return wp
    }
  }

  return null
}

// ============================================================================
// DROWNING DETECTION & DAMAGE
// ============================================================================

/**
 * Check if unit is drowning in river
 * @param {Unit} unit - Unit to check
 * @returns {boolean}
 */
export function isDrowning(unit) {
  return isInRiverZone(unit.y) && !isBridgeCrossing(unit.x)
}

/**
 * Apply drowning damage to unit
 * @param {Unit} unit - Unit to damage
 * @param {number} damagePerSecond - Damage per second (default 2% of max HP)
 * @param {number} dt - Delta time in seconds (default frame time ~33ms)
 * @returns {Unit} Updated unit with applied drowning damage
 */
export function applyDrowningDamage(unit, damagePerSecond = 0.02, dt = 0.033) {
  if (!isDrowning(unit)) {
    unit.isDrowning = false
    return unit
  }

  // Calculate damage per frame
  const maxHpDamage = unit.maxHp * damagePerSecond
  const damagePerFrame = maxHpDamage * dt

  unit.hp = Math.max(0, unit.hp - damagePerFrame)
  unit.isDrowning = true

  // Track drowning duration for visual effects
  unit.drowningDuration = (unit.drowningDuration || 0) + dt

  return unit
}

/**
 * Check and apply drowning damage (wrapper function)
 * @param {Unit} unit - Unit to check
 * @param {number} dt - Delta time per frame
 * @returns {Unit} Updated unit
 */
export function checkAndApplyDrowningDamage(unit, dt = 0.033) {
  if (!isDrowning(unit)) {
    // Clear drowning state if not drowning anymore
    unit.isDrowning = false
    unit.drowningDuration = 0
    return unit
  }

  // Apply drowning damage
  return applyDrowningDamage(unit, 0.02, dt) // 2% HP per second
}

/**
 * Get drowning visual effect parameters
 * @param {Unit} unit - Unit to get effects for
 * @returns {Object} Visual effect parameters {opacity, tint, scale, particleIntensity}
 */
export function getDrowningVisualEffect(unit) {
  if (!unit.isDrowning) {
    return {
      opacity: 1,
      tint: null,
      scale: 1,
      particleIntensity: 0,
    }
  }

  // Calculate opacity based on drowning duration
  // Start at 60% opacity, decrease over time
  const minOpacity = 0.4
  const maxOpacity = 0.8
  const drowningTime = unit.drowningDuration || 0
  const opacityVariation = Math.sin(drowningTime * 5) * 0.1 // Oscillate slightly
  const opacity = Math.max(minOpacity, maxOpacity + opacityVariation)

  return {
    opacity,
    tint: '#4080ff', // Blue tint for water
    scale: 0.95 + Math.sin(drowningTime * 3) * 0.05, // Subtle bobbing
    particleIntensity: Math.min(1, drowningTime / 2), // Increase particles over time
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if unit needs to recalculate path
 * Returns true if:
 * - Unit has no path
 * - Unit's target changed
 * - Unit completed all waypoints
 * @param {Unit} unit - Unit to check
 * @param {Object} newTarget - New target position
 * @returns {boolean}
 */
export function shouldRecalculatePath(unit, newTarget) {
  if (!unit.currentPath || unit.currentPath.length === 0) {
    return true
  }

  // If target changed significantly
  if (newTarget) {
    const lastWaypoint = unit.currentPath[unit.currentPath.length - 1]
    const targetDist = Math.hypot(
      newTarget.x - lastWaypoint.x,
      newTarget.y - lastWaypoint.y
    )

    if (targetDist > 20) {
      return true
    }
  }

  // If all waypoints reached
  if (unit.pathComplete) {
    return true
  }

  return false
}

/**
 * Get bridge crossing status for unit
 * @param {Unit} unit - Unit to check
 * @returns {Object} {isCrossing, onBridge, nearBridge, bridgeDistance}
 */
export function getBridgeCrossingStatus(unit) {
  const inRiver = isInRiverZone(unit.y)
  const onBridge = isBridgeCrossing(unit.x)
  const nearestBridge = getNearestBridge(getLaneId(unit.x))

  const bridgeDistance = Math.hypot(unit.x - nearestBridge.x, unit.y - nearestBridge.y)

  return {
    isCrossing: inRiver,
    onBridge,
    nearBridge: bridgeDistance < 100,
    bridgeDistance,
    currentBridge: onBridge ? nearestBridge : null,
  }
}

/**
 * Validate path for safety
 * @param {Array} path - Path to validate
 * @returns {boolean}
 */
export function isPathValid(path) {
  if (!Array.isArray(path) || path.length === 0) {
    return false
  }

  return path.every((wp) => {
    return (
      Number.isFinite(wp.x) &&
      Number.isFinite(wp.y) &&
      wp.x >= 0 &&
      wp.x <= ARENA_WIDTH &&
      wp.y >= 0 &&
      wp.y <= ARENA_HEIGHT
    )
  })
}
