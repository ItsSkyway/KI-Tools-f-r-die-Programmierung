/**
 * Unit Pathfinding Tests - Simplified
 * Tests pathfinding logic directly without module dependencies
 * Run with: node PATHFINDING_TESTS_SIMPLE.js
 */

// Import pathfinding logic inline for testing
const RIVERS = {
  Y: 400,
  ZONE_START: 380,
  ZONE_END: 420,
}

const BRIDGES = {
  left: { x: 150, y: 400, width: 80, height: 40 },
  right: { x: 470, y: 400, width: 80, height: 40 },
}

const LANES = {
  left: { minX: 0, maxX: 267 },
  center: { minX: 267, maxX: 533 },
  right: { minX: 533, maxX: 800 },
}

// ============================================================================
// CORE LOGIC
// ============================================================================

function isInRiverZone(y) {
  return y >= RIVERS.ZONE_START && y <= RIVERS.ZONE_END
}

function isBridgeCrossing(x) {
  const leftOk = x >= BRIDGES.left.x - BRIDGES.left.width / 2 && x <= BRIDGES.left.x + BRIDGES.left.width / 2
  const rightOk = x >= BRIDGES.right.x - BRIDGES.right.width / 2 && x <= BRIDGES.right.x + BRIDGES.right.width / 2
  return leftOk || rightOk
}

function getLaneId(x) {
  if (x < 267) return 'left'
  if (x < 533) return 'center'
  return 'right'
}

function getNearestBridge(laneId) {
  if (laneId === 'left') return BRIDGES.left
  if (laneId === 'right') return BRIDGES.right
  return BRIDGES.left // Default for center
}

function selectOptimalBridge(currentX, targetX, laneId) {
  const currentLaneId = getLaneId(currentX)
  const targetLaneId = getLaneId(targetX)

  // Prefer lane-specific bridges
  if (currentLaneId === 'left') return BRIDGES.left
  if (currentLaneId === 'right') return BRIDGES.right

  // Center lane - choose based on target
  if (currentLaneId === 'center') {
    if (targetLaneId === 'left') return BRIDGES.left
    if (targetLaneId === 'right') return BRIDGES.right
    // Both center - use nearest
    const distToLeft = Math.abs(currentX - BRIDGES.left.x)
    const distToRight = Math.abs(currentX - BRIDGES.right.x)
    return distToLeft < distToRight ? BRIDGES.left : BRIDGES.right
  }

  // Fallback
  const distToLeft = Math.abs(currentX - BRIDGES.left.x)
  const distToRight = Math.abs(currentX - BRIDGES.right.x)
  return distToLeft < distToRight ? BRIDGES.left : BRIDGES.right
}

function calculatePathWithBridges(startX, startY, endX, endY, laneId = 'center') {
  const waypoints = []

  const startBelowRiver = startY > RIVERS.Y
  const endBelowRiver = endY > RIVERS.Y
  const crossesRiver = startBelowRiver !== endBelowRiver

  // Scenario 1: Already in river, off bridge - rescue
  const startInRiver = isInRiverZone(startY)
  if (startInRiver && !isBridgeCrossing(startX)) {
    const nearestBridge = getNearestBridge(laneId)
    waypoints.push({
      x: nearestBridge.x,
      y: RIVERS.Y,
      type: 'bridge',
      priority: 'critical',
      reason: 'rescue_from_river',
    })
    waypoints.push({ x: endX, y: endY, type: 'target', priority: 'normal' })
    return waypoints
  }

  // Scenario 2: Need to cross river (path goes from one side to the other)
  if (crossesRiver && !startInRiver) {
    const bridge = selectOptimalBridge(startX, endX, laneId)
    waypoints.push({
      x: bridge.x,
      y: RIVERS.Y,
      type: 'bridge',
      priority: 'high',
      reason: 'river_crossing',
    })
    waypoints.push({ x: endX, y: endY, type: 'target', priority: 'normal' })
    return waypoints
  }

  // Scenario 3: Direct path (same side of river)
  waypoints.push({ x: endX, y: endY, type: 'target', priority: 'normal' })
  return waypoints
}

function moveUnitAlongPath(unit, path, dt = 1) {
  if (!path || path.length === 0) return { unit, reachedEnd: true }

  const THRESHOLD = 5
  let currentWaypoint = null

  for (const wp of path) {
    const dist = Math.hypot(unit.x - wp.x, unit.y - wp.y)
    if (dist > THRESHOLD) {
      currentWaypoint = wp
      break
    }
  }

  if (!currentWaypoint) {
    currentWaypoint = path[path.length - 1]
    return { unit, currentWaypoint, reachedEnd: true }
  }

  const dx = currentWaypoint.x - unit.x
  const dy = currentWaypoint.y - unit.y
  const dist = Math.hypot(dx, dy)

  if (dist > 0) {
    const speed = (unit.stats?.speed || 1) * 0.5 * dt
    const moveDistance = Math.min(speed, dist)
    unit.x += (dx / dist) * moveDistance
    unit.y += (dy / dist) * moveDistance
  }

  return { unit, currentWaypoint, reachedEnd: false }
}

function isDrowning(unit) {
  return isInRiverZone(unit.y) && !isBridgeCrossing(unit.x)
}

function applyDrowningDamage(unit, damagePerSecond = 0.02, dt = 0.033) {
  if (!isDrowning(unit)) {
    unit.isDrowning = false
    return unit
  }

  const maxHpDamage = unit.maxHp * damagePerSecond
  const damagePerFrame = maxHpDamage * dt

  unit.hp = Math.max(0, unit.hp - damagePerFrame)
  unit.isDrowning = true
  unit.drowningDuration = (unit.drowningDuration || 0) + dt

  return unit
}

function getDrowningVisualEffect(unit) {
  if (!unit.isDrowning) {
    return { opacity: 1, tint: null, scale: 1, particleIntensity: 0 }
  }

  const minOpacity = 0.4
  const maxOpacity = 0.8
  const drowningTime = unit.drowningDuration || 0
  const opacityVariation = Math.sin(drowningTime * 5) * 0.1
  const opacity = Math.max(minOpacity, maxOpacity + opacityVariation)

  return {
    opacity,
    tint: '#4080ff',
    scale: 0.95 + Math.sin(drowningTime * 3) * 0.05,
    particleIntensity: Math.min(1, drowningTime / 2),
  }
}

// ============================================================================
// TEST UTILITIES
// ============================================================================

let testsPassed = 0
let testsFailed = 0

function assert(condition, message) {
  if (condition) {
    testsPassed++
    console.log(`✓ ${message}`)
  } else {
    testsFailed++
    console.error(`✗ ${message}`)
  }
}

function assertCloseTo(actual, expected, tolerance = 1, message) {
  const diff = Math.abs(actual - expected)
  assert(
    diff <= tolerance,
    `${message} (expected ≈${expected}, got: ${actual}, diff: ${diff})`
  )
}

// ============================================================================
// TESTS
// ============================================================================

console.log('\n' + '='.repeat(60))
console.log('UNIT PATHFINDING WITH BRIDGE CROSSING - TEST SUITE')
console.log('='.repeat(60) + '\n')

// Test Data
const playerUnit = {
  id: 'unit_1',
  owner: 'player',
  x: 150,
  y: 750,
  hp: 600,
  maxHp: 600,
  lane: 'left',
  stats: { speed: 1 },
  isDrowning: false,
  drowningDuration: 0,
}

const unitInRiver = {
  id: 'unit_3',
  owner: 'player',
  x: 300,
  y: 400,
  hp: 600,
  maxHp: 600,
  lane: 'center',
  stats: { speed: 1 },
  isDrowning: true,
  drowningDuration: 0,
}

const unitOnBridge = {
  id: 'unit_4',
  owner: 'player',
  x: 150,
  y: 400,
  hp: 600,
  maxHp: 600,
  lane: 'left',
  stats: { speed: 1 },
  isDrowning: false,
}

// ========== TEST 1-5: PATHFINDING ==========
console.log('PATHFINDING WITH BRIDGES:')
console.log('-'.repeat(40))

console.log('1️⃣ Player unit crossing river via left bridge')
const path1 = calculatePathWithBridges(150, 750, 150, 50, 'left')
assert(path1.length > 0, 'Path should have waypoints')
assert(path1.some((wp) => wp.type === 'bridge'), 'Path should include bridge waypoint')
const bridge1 = path1.find((wp) => wp.type === 'bridge')
assertCloseTo(bridge1.x, 150, 1, 'Bridge should be at X=150')
assertCloseTo(bridge1.y, 400, 1, 'Bridge should be at river Y=400')

console.log('\n2️⃣ Direct movement (no river crossing)')
const path2 = calculatePathWithBridges(150, 750, 150, 700, 'left')
assert(path2.length > 0, 'Should have path')
assert(!path2.some((wp) => wp.type === 'bridge'), 'Should NOT have bridge waypoint')

console.log('\n3️⃣ Center lane bridge selection for right territory')
const path3 = calculatePathWithBridges(400, 750, 667, 50, 'center')
assert(path3.length >= 2, 'Path should have bridge and target')
const bridgeWp = path3.find((wp) => wp.type === 'bridge')
assert(bridgeWp, 'Should have bridge waypoint')
assertCloseTo(bridgeWp.x, 470, 10, 'Should use right bridge for right territory')

console.log('\n4️⃣ Unit in river (off-bridge) rescue path')
const path4 = calculatePathWithBridges(300, 400, 150, 50, 'center')
assert(path4.length > 0, 'Should have rescue path')
assert(path4[0].priority === 'critical', 'First waypoint should be critical priority')
assert(path4[0].type === 'bridge', 'First waypoint should be bridge')

console.log('\n5️⃣ Right lane bridge selection')
const path5 = calculatePathWithBridges(667, 750, 667, 50, 'right')
assert(path5.length >= 2, 'Path should have waypoints')
const bridge5 = path5.find((wp) => wp.type === 'bridge')
assertCloseTo(bridge5.x, 470, 1, 'Bridge should be at X≈470 (right bridge)')

// ========== TEST 6-10: WAYPOINT FOLLOWING ==========
console.log('\n\nWAYPOINT FOLLOWING:')
console.log('-'.repeat(40))

console.log('6️⃣ Unit moves towards waypoint')
const unit6 = { ...playerUnit, x: 100, y: 400 }
const waypoints6 = [{ x: 150, y: 400, type: 'target' }]
const result6 = moveUnitAlongPath(unit6, waypoints6, 1)
assert(result6.unit.x > 100, 'Unit should move in X direction')
assert(result6.currentWaypoint, 'Should have current waypoint')

console.log('\n7️⃣ Unit reaches waypoint')
const unit7 = { ...playerUnit, x: 149, y: 400 }
const waypoints7 = [{ x: 150, y: 400, type: 'target' }]
const result7 = moveUnitAlongPath(unit7, waypoints7, 1)
assert(result7.reachedEnd, 'Should detect waypoint reach')

console.log('\n8️⃣ Multi-waypoint path traversal')
let unit8 = { ...playerUnit, x: 150, y: 750 }
const waypoints8 = [
  { x: 150, y: 400, type: 'bridge' },
  { x: 150, y: 50, type: 'target' },
]
for (let i = 0; i < 1000; i++) {
  const res = moveUnitAlongPath(unit8, waypoints8, 1)
  unit8 = res.unit
  if (res.reachedEnd) break
}
assertCloseTo(unit8.y, 50, 10, 'Unit should reach target Y position')

// ========== TEST 11-15: DROWNING DETECTION ==========
console.log('\n\nDROWNING DETECTION:')
console.log('-'.repeat(40))

console.log('9️⃣ Unit in river (off-bridge) is drowning')
const drowning9 = isDrowning(unitInRiver)
assert(drowning9, 'Unit at river (off bridge) should be drowning')

console.log('\n🔟 Unit on bridge is NOT drowning')
const drowning10 = isDrowning(unitOnBridge)
assert(!drowning10, 'Unit on bridge should NOT be drowning')

console.log('\n1️⃣1️⃣ Unit above river is NOT drowning')
const drowning11 = isDrowning(playerUnit)
assert(!drowning11, 'Unit above river should NOT be drowning')

console.log('\n1️⃣2️⃣ Drowning damage reduces HP')
const unit12 = { ...unitInRiver, hp: 600, maxHp: 600 }
const hpBefore12 = unit12.hp
const damaged12 = applyDrowningDamage(unit12, 0.02, 0.033)
assert(damaged12.hp < hpBefore12, 'HP should be reduced')
assert(damaged12.isDrowning, 'Should mark as drowning')

console.log('\n1️⃣3️⃣ Drowning duration accumulates')
const unit13 = { ...unitInRiver, hp: 600, maxHp: 600, drowningDuration: 0 }
const damaged13 = applyDrowningDamage(unit13, 0.02, 0.5)
assert(damaged13.drowningDuration > 0, 'Drowning duration should increase')

// ========== TEST 16-20: VISUAL EFFECTS ==========
console.log('\n\nVISUAL EFFECTS:')
console.log('-'.repeat(40))

console.log('1️⃣4️⃣ Drowning reduces opacity')
const unit14 = { isDrowning: true, drowningDuration: 0.5 }
const effects14 = getDrowningVisualEffect(unit14)
assert(effects14.opacity < 1, 'Opacity should be reduced')
assert(effects14.opacity > 0, 'Should remain visible')
assert(effects14.tint === '#4080ff', 'Should have blue tint')

console.log('\n1️⃣5️⃣ Non-drowning unit has full opacity')
const unit15 = { isDrowning: false }
const effects15 = getDrowningVisualEffect(unit15)
assert(effects15.opacity === 1, 'Opacity should be full')
assert(effects15.tint === null, 'Should not have tint')

console.log('\n1️⃣6️⃣ Particle intensity increases with drowning')
const unit16a = { isDrowning: true, drowningDuration: 0.5 }
const unit16b = { isDrowning: true, drowningDuration: 2 }
const effects16a = getDrowningVisualEffect(unit16a)
const effects16b = getDrowningVisualEffect(unit16b)
assert(
  effects16b.particleIntensity > effects16a.particleIntensity,
  'Particle intensity should increase'
)

// ========== INTEGRATION SCENARIOS ==========
console.log('\n\nINTEGRATION SCENARIOS:')
console.log('-'.repeat(40))

console.log('1️⃣7️⃣ Scenario: Player unit completes river crossing')
let scenario1 = { ...playerUnit, x: 150, y: 750 }
const scenarioPath1 = calculatePathWithBridges(150, 750, 150, 50, 'left')
let frame = 0
while (scenario1.y > 50 && frame < 2000) {
  const res = moveUnitAlongPath(scenario1, scenarioPath1, 1)
  scenario1 = res.unit
  frame++
  if (res.reachedEnd) break
}
assertCloseTo(scenario1.y, 50, 10, 'Unit should reach enemy territory')
assert(!isDrowning(scenario1), 'Should not drown when following bridge path')

console.log('\n1️⃣8️⃣ Scenario: Unit in river takes damage')
let scenario2 = { ...unitInRiver, hp: 600, maxHp: 600 }
const hpBefore2 = scenario2.hp
scenario2 = applyDrowningDamage(scenario2, 0.02, 1)
assert(scenario2.hp < hpBefore2, 'Should take damage')
const rescuePath = calculatePathWithBridges(300, 400, 150, 750, 'center')
assert(rescuePath[0].type === 'bridge', 'Rescue path should start with bridge')

console.log('\n1️⃣9️⃣ Scenario: Unit dies from prolonged drowning')
let scenario3 = { ...unitInRiver, hp: 50, maxHp: 600, drowningDuration: 0 }
for (let i = 0; i < 100; i++) {
  scenario3 = applyDrowningDamage(scenario3, 0.5, 0.033)
  if (scenario3.hp <= 0) break
}
assert(scenario3.hp <= 0, 'Unit should die from drowning')

console.log('\n2️⃣0️⃣ Scenario: Center lane unit chooses appropriate bridge')
const scenario4Left = calculatePathWithBridges(400, 750, 150, 50, 'center')
const bridge4Left = scenario4Left.find((wp) => wp.type === 'bridge')
assert(bridge4Left, 'Should have bridge waypoint')
assertCloseTo(bridge4Left.x, 150, 20, 'Should use left bridge for left territory')

const scenario4Right = calculatePathWithBridges(400, 750, 667, 50, 'center')
const bridge4Right = scenario4Right.find((wp) => wp.type === 'bridge')
assert(bridge4Right, 'Should have bridge waypoint')
assertCloseTo(bridge4Right.x, 470, 20, 'Should use right bridge for right territory')

// ========== RESULTS ==========
console.log('\n' + '='.repeat(60))
console.log('TEST RESULTS')
console.log('='.repeat(60))
console.log(`✓ Passed:  ${testsPassed}`)
console.log(`✗ Failed:  ${testsFailed}`)
console.log(`Total:     ${testsPassed + testsFailed}`)
console.log(`Success Rate: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1)}%`)
console.log(`${testsFailed === 0 ? '🎉 ALL TESTS PASSED! ✨' : '⚠️  Some tests failed'}`)
console.log('='.repeat(60) + '\n')

process.exit(testsFailed > 0 ? 1 : 0)
