/**
 * unitMovement.js
 * Unit movement with lane-based pathfinding and river crossing
 * Integrates with arena.js for lane system
 */

import {
  getLaneId,
  canCrossRiver,
  isBridgeCrossing,
  isInRiverZone,
  getNearestBridge,
  calculateLaneMovement,
  isUnitDrowning,
} from './arena.js'

import { LANES, RIVER_Y, BRIDGES } from './constants.js'

// ============================================================================
// UNIT MOVEMENT LOGIC
// ============================================================================

/**
 * Update unit position with lane and river constraints
 */
export function updateUnitPosition(unit, targetX, targetY, speed = 1) {
  if (!unit) return unit

  const newPosition = calculateLaneMovement(unit, targetX, targetY, speed)

  const updatedUnit = {
    ...unit,
    x: newPosition.x,
    y: newPosition.y,
  }

  // Apply drowning damage if in river without bridge
  if (isUnitDrowning(updatedUnit)) {
    updatedUnit.hp = Math.max(0, updatedUnit.hp - 0.2) // Damage per tick
    updatedUnit.isDrowning = true
  } else {
    updatedUnit.isDrowning = false
  }

  return updatedUnit
}

/**
 * Calculate unit AI path to target
 * Considers bridge crossings and lane preferences
 */
export function calculateAIPath(unit, targetX, targetY) {
  const waypoints = []

  // Current position
  const currentLane = getLaneId(unit.x)
  const targetLane = getLaneId(targetX)

  // If in river zone, find nearest bridge
  if (isInRiverZone(unit.y)) {
    if (!isBridgeCrossing(unit.x)) {
      // Off bridge - go to nearest bridge
      const nearestBridge = getNearestBridge(currentLane)
      waypoints.push({
        x: nearestBridge.x,
        y: RIVER_Y,
        priority: 'critical',
      })
    }
  }

  // Check if target is across river
  const needsRiverCross = isAcrossRiver(unit.y, targetY)

  if (needsRiverCross && !isInRiverZone(unit.y)) {
    // Add bridge waypoint
    const bridge = selectOptimalBridge(unit.x, currentLane, targetLane)
    waypoints.push({
      x: bridge.x,
      y: RIVER_Y,
      isBridge: true,
      priority: 'high',
    })

    // Then to target
    waypoints.push({
      x: targetX,
      y: targetY,
      priority: 'normal',
    })
  } else {
    // Direct path
    waypoints.push({
      x: targetX,
      y: targetY,
      priority: 'normal',
    })
  }

  return waypoints
}

/**
 * Check if target is on opposite side of river
 */
function isAcrossRiver(currentY, targetY) {
  const currentAboveRiver = currentY < RIVER_Y
  const targetAboveRiver = targetY < RIVER_Y
  return currentAboveRiver !== targetAboveRiver
}

/**
 * Select optimal bridge for crossing based on current lane and target
 */
function selectOptimalBridge(currentX, currentLane, targetLane) {
  // If in center lane, can use either bridge
  if (currentLane === 'center') {
    // Choose based on target lane
    if (targetLane === 'left') {
      return BRIDGES.left
    } else if (targetLane === 'right') {
      return BRIDGES.right
    }
    // Default to nearest
    return currentX < 300 ? BRIDGES.left : BRIDGES.right
  }

  // If in left lane, prefer left bridge
  if (currentLane === 'left') {
    return BRIDGES.left
  }

  // If in right lane, prefer right bridge
  return BRIDGES.right
}

/**
 * Get next waypoint for unit
 */
export function getNextWaypoint(unit, waypoints) {
  if (!waypoints || waypoints.length === 0) {
    return null
  }

  const distance = 5 // Distance threshold to consider waypoint reached

  for (let i = 0; i < waypoints.length; i++) {
    const wp = waypoints[i]
    const dist = Math.hypot(unit.x - wp.x, unit.y - wp.y)

    if (dist > distance) {
      return wp
    }
  }

  // All waypoints reached
  return waypoints[waypoints.length - 1]
}

// ============================================================================
// LANE ENFORCEMENT
// ============================================================================

/**
 * Get lane preferences for unit movement
 * Most units prefer to stay in their lane
 */
export function getLanePreference(unit) {
  const lane = getLaneId(unit.x)

  return {
    preferred: lane,
    current: lane,
    canSwitchLanes: !isInRiverZone(unit.y), // Can't switch lanes in river
  }
}

/**
 * Enforce lane boundaries with soft constraints
 * Units are attracted back to their lane
 */
export function enforceLanePreference(unit, speed = 0.5) {
  if (isInRiverZone(unit.y)) {
    // No lane preference in river zone
    return unit
  }

  const lane = Object.values(LANES).find((l) => getLaneId(unit.x) === l.id)
  if (!lane) return unit

  // If unit drifts too far from center, gently pull back
  const laneCenter = (lane.minX + lane.maxX) / 2
  const distFromCenter = Math.abs(unit.x - laneCenter)
  const maxDrift = 30 // Max distance from lane center

  if (distFromCenter > maxDrift) {
    // Pull unit back toward lane center
    const direction = unit.x > laneCenter ? -1 : 1
    unit.x += direction * speed
  }

  return unit
}

// ============================================================================
// COLLISION & PATHFINDING
// ============================================================================

/**
 * Check collision with units
 */
export function checkUnitCollision(unit, otherUnits, minDistance = 15) {
  for (const other of otherUnits) {
    if (unit.id === other.id) continue
    if (other.hp <= 0) continue

    const dist = Math.hypot(unit.x - other.x, unit.y - other.y)
    if (dist < minDistance) {
      return true
    }
  }

  return false
}

/**
 * Avoid collision by adjusting unit position
 */
export function avoidCollision(unit, otherUnits, maxOffset = 10) {
  let offsetX = 0
  let offsetY = 0

  for (const other of otherUnits) {
    if (unit.id === other.id) continue
    if (other.hp <= 0) continue

    const dx = unit.x - other.x
    const dy = unit.y - other.y
    const dist = Math.hypot(dx, dy)

    if (dist < 20) {
      const force = (20 - dist) / 20
      offsetX += (dx / (dist + 0.1)) * force
      offsetY += (dy / (dist + 0.1)) * force
    }
  }

  // Cap offset
  const offsetDist = Math.hypot(offsetX, offsetY)
  if (offsetDist > maxOffset) {
    offsetX = (offsetX / offsetDist) * maxOffset
    offsetY = (offsetY / offsetDist) * maxOffset
  }

  return {
    x: unit.x + offsetX,
    y: unit.y + offsetY,
  }
}

// ============================================================================
// SPAWNING & POSITIONING
// ============================================================================

/**
 * Get spawn position for unit based on side and lane
 */
export function getSpawnPosition(side, lane = 'center') {
  const laneObj = LANES[lane] || LANES.center

  if (side === 'player') {
    return {
      x: laneObj.x + (Math.random() - 0.5) * 20, // Slight randomness
      y: 750,
    }
  } else {
    return {
      x: laneObj.x + (Math.random() - 0.5) * 20,
      y: 50,
    }
  }
}

/**
 * Validate position for unit placement
 */
export function isValidPlacementPosition(x, y, side) {
  // Check territory
  if (side === 'player' && y < 400) {
    return false // Can't place in enemy territory
  }
  if (side === 'enemy' && y > 400) {
    return false // Can't place in player territory
  }

  // Check river crossing rules
  if (isInRiverZone(y) && !isBridgeCrossing(x)) {
    return false // Can't place on river outside bridge
  }

  // Check bounds
  return x >= 0 && x <= 600 && y >= 0 && y <= 800
}

/**
 * Get valid lane for placement in own territory
 */
export function getValidLaneForPlacement(x, side) {
  if (isInRiverZone(x) && !isBridgeCrossing(x)) {
    // Would be on river, select nearest lane
    return getLaneId(x) // Will be clamped to valid lane
  }
  return getLaneId(x)
}

// ============================================================================
// TOWER TARGETING
// ============================================================================

/**
 * Get units in tower attack range
 */
export function getUnitsInRange(tower, allUnits, range) {
  return allUnits.filter((unit) => {
    if (unit.hp <= 0) return false
    const dist = Math.hypot(tower.x - unit.x, tower.y - unit.y)
    return dist < range
  })
}

/**
 * Select best target for tower (closest to tower base)
 */
export function selectBestTarget(tower, targets) {
  if (targets.length === 0) return null

  return targets.reduce((best, current) => {
    const distCurrent = Math.hypot(tower.x - current.x, tower.y - current.y)
    const distBest = Math.hypot(tower.x - best.x, tower.y - best.y)

    // Prioritize units that are closer to tower base
    if (Math.abs(distCurrent - distBest) > 20) {
      return distCurrent < distBest ? current : best
    }

    // If same distance, prioritize units further up (closer to king tower)
    return current.y < best.y ? current : best
  })
}

// ============================================================================
// SPELL PLACEMENT
// ============================================================================

/**
 * Get spell area of effect centered at position
 */
export function getSpellAOE(x, y, radius) {
  return {
    center: { x, y },
    radius,
  }
}

/**
 * Get units affected by spell
 */
export function getUnitsInAOE(aoe, units) {
  return units.filter((unit) => {
    const dist = Math.hypot(unit.x - aoe.center.x, unit.y - aoe.center.y)
    return dist < aoe.radius
  })
}
