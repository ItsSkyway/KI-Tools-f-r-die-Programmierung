/**
 * Unit Pathfinding Tests
 * Tests for bridge crossing, drowning mechanics, and waypoint following
 */

import {
  calculatePathWithBridges,
  moveUnitAlongPath,
  isDrowning,
  applyDrowningDamage,
  getDrowningVisualEffect,
  hasReachedWaypoint,
  getBridgeCrossingStatus,
} from '../src/simulation/pathfinding.js'

import {
  LANES,
  BRIDGES,
  RIVER_Y,
  RIVER_ZONE,
  ARENA_WIDTH,
  ARENA_HEIGHT,
} from '../src/game/constants.js'

// ============================================================================
// TEST SETUP & UTILITIES
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

function assertEqual(actual, expected, message) {
  assert(actual === expected, `${message} (expected: ${expected}, got: ${actual})`)
}

function assertCloseTo(actual, expected, tolerance = 1, message) {
  const diff = Math.abs(actual - expected)
  assert(diff <= tolerance, `${message} (expected ≈${expected}, got: ${actual}, diff: ${diff})`)
}

// ============================================================================
// TEST DATA
// ============================================================================

const testUnits = {
  playerTroop: {
    id: 'unit_1',
    owner: 'player',
    x: 150,
    y: 750,
    hp: 600,
    maxHp: 600,
    lane: 'left',
    stats: { speed: 1, flying: false },
    isDrowning: false,
    drowningDuration: 0,
  },
  enemyTroop: {
    id: 'unit_2',
    owner: 'enemy',
    x: 150,
    y: 50,
    hp: 600,
    maxHp: 600,
    lane: 'left',
    stats: { speed: 1, flying: false },
    isDrowning: false,
    drowningDuration: 0,
  },
  unitInRiver: {
    id: 'unit_3',
    owner: 'player',
    x: 300, // Off bridge
    y: 400, // In river
    hp: 600,
    maxHp: 600,
    lane: 'center',
    stats: { speed: 1, flying: false },
    isDrowning: true,
    drowningDuration: 0,
  },
  unitOnBridge: {
    id: 'unit_4',
    owner: 'player',
    x: 150, // On left bridge
    y: 400, // River level
    hp: 600,
    maxHp: 600,
    lane: 'left',
    stats: { speed: 1, flying: false },
    isDrowning: false,
    drowningDuration: 0,
  },
}

// ============================================================================
// TESTS: PATHFINDING WITH BRIDGES
// ============================================================================

console.log('\n=== PATHFINDING WITH BRIDGES ===\n')

// TEST 1: Player unit crossing river via left bridge
console.log('Test 1: Player unit (left lane) crossing river to enemy territory')
const path1 = calculatePathWithBridges(
  testUnits.playerTroop.x,
  testUnits.playerTroop.y,
  150,
  50,
  'left'
)
assert(path1.length > 0, 'Path should have waypoints')
assert(
  path1.some((wp) => wp.type === 'bridge'),
  'Path should include bridge waypoint'
)
const bridgeWp = path1.find((wp) => wp.type === 'bridge')
if (bridgeWp) {
  assertCloseTo(bridgeWp.x, BRIDGES.left.x, 1, 'Bridge waypoint should be at left bridge')
  assertCloseTo(bridgeWp.y, RIVER_Y, 1, 'Bridge waypoint should be at river Y')
}

// TEST 2: Enemy unit crossing river
console.log('Test 2: Enemy unit crossing river to player territory')
const path2 = calculatePathWithBridges(
  testUnits.enemyTroop.x,
  testUnits.enemyTroop.y,
  150,
  750,
  'left'
)
assert(path2.length > 0, 'Enemy path should have waypoints')
assert(
  path2.some((wp) => wp.type === 'bridge'),
  'Enemy path should include bridge waypoint'
)

// TEST 3: Direct movement without river crossing
console.log('Test 3: Unit moving within own territory (no river crossing)')
const path3 = calculatePathWithBridges(150, 750, 150, 700, 'left')
assert(path3.length > 0, 'Should have path')
assert(
  !path3.some((wp) => wp.type === 'bridge'),
  'Should NOT have bridge waypoint (no river crossing)'
)
assertCloseTo(path3[0].x, 150, 5, 'Target should be in path')

// TEST 4: Center lane choosing left bridge
console.log('Test 4: Center lane unit choosing bridge for crossing')
const path4 = calculatePathWithBridges(400, 750, 150, 50, 'center')
assert(path4.length >= 2, 'Path should have target and bridge waypoints')
const bridgeWp4 = path4.find((wp) => wp.type === 'bridge')
assert(bridgeWp4, 'Should have bridge waypoint')

// TEST 5: Rescue from river (off-bridge)
console.log('Test 5: Unit in river (off bridge) rescues to nearest bridge')
const path5 = calculatePathWithBridges(300, 400, 150, 50, 'center')
assert(path5.length > 0, 'Should have rescue path')
assert(
  path5[0].priority === 'critical',
  'First waypoint should have critical priority'
)
assert(path5[0].type === 'bridge', 'First waypoint should be bridge')

// ============================================================================
// TESTS: WAYPOINT FOLLOWING
// ============================================================================

console.log('\n=== WAYPOINT FOLLOWING ===\n')

// TEST 6: Move towards waypoint
console.log('Test 6: Unit moving towards waypoint')
const unit6 = { ...testUnits.playerTroop, x: 100, y: 400 }
const waypoints6 = [
  { x: 150, y: 400, type: 'target' },
  { x: 200, y: 300, type: 'target' },
]
const result6 = moveUnitAlongPath(unit6, waypoints6, 1)
assert(result6.unit.x > 100, 'Unit should move in X direction')
assert(result6.currentWaypoint !== null, 'Should have current waypoint')

// TEST 7: Waypoint threshold detection
console.log('Test 7: Detecting waypoint reach')
const unit7 = { ...testUnits.playerTroop, x: 149, y: 400 }
const waypoints7 = [{ x: 150, y: 400, type: 'target' }]
const reached = hasReachedWaypoint(unit7, waypoints7[0], 5)
assert(reached, 'Should detect waypoint reach within threshold')

// TEST 8: Path with multiple waypoints
console.log('Test 8: Following multi-waypoint path')
const unit8 = { ...testUnits.playerTroop, x: 150, y: 750 }
const waypoints8 = [
  { x: 150, y: 400, type: 'bridge' }, // River crossing
  { x: 150, y: 50, type: 'target' }, // Target
]
let unit8Current = { ...unit8 }
for (let i = 0; i < 50; i++) {
  const res = moveUnitAlongPath(unit8Current, waypoints8, 1)
  unit8Current = res.unit
}
assertCloseTo(unit8Current.y, 50, 5, 'Unit should reach target Y')

// ============================================================================
// TESTS: DROWNING DETECTION
// ============================================================================

console.log('\n=== DROWNING DETECTION ===\n')

// TEST 9: Unit in river off-bridge is drowning
console.log('Test 9: Unit in river (off bridge) is drowning')
const drowning9 = isDrowning(testUnits.unitInRiver)
assert(drowning9, 'Unit at river (off bridge) should be drowning')

// TEST 10: Unit on bridge is not drowning
console.log('Test 10: Unit on bridge is not drowning')
const drowning10 = isDrowning(testUnits.unitOnBridge)
assert(!drowning10, 'Unit on bridge should NOT be drowning')

// TEST 11: Unit above river is not drowning
console.log('Test 11: Unit above river is not drowning')
const drowning11 = isDrowning(testUnits.playerTroop)
assert(!drowning11, 'Unit above river should NOT be drowning')

// ============================================================================
// TESTS: DROWNING DAMAGE
// ============================================================================

console.log('\n=== DROWNING DAMAGE ===\n')

// TEST 12: Drowning damage reduces HP
console.log('Test 12: Drowning damage reduces unit HP')
const unit12 = { ...testUnits.unitInRiver, hp: 600, maxHp: 600 }
const damaged12 = applyDrowningDamage(unit12, 0.02, 0.033) // 2% per second
assert(damaged12.hp < 600, 'HP should be reduced by drowning damage')
assert(damaged12.isDrowning, 'Should mark unit as drowning')

// TEST 13: Drowning duration tracking
console.log('Test 13: Drowning duration accumulates')
const unit13 = { ...testUnits.unitInRiver, hp: 600, maxHp: 600, drowningDuration: 0 }
const damaged13 = applyDrowningDamage(unit13, 0.02, 0.033)
assert(damaged13.drowningDuration > 0, 'Drowning duration should increase')

// TEST 14: Unit dies from drowning
console.log('Test 14: Unit dies from prolonged drowning')
const unit14 = { ...testUnits.unitInRiver, hp: 1, maxHp: 600 }
const damaged14 = applyDrowningDamage(unit14, 0.02, 1) // High damage
assert(damaged14.hp <= 0, 'Unit should be dead after drowning damage')

// TEST 15: No drowning damage outside river
console.log('Test 15: No drowning damage for unit outside river')
const unit15 = { ...testUnits.playerTroop, hp: 600, maxHp: 600 }
const result15 = applyDrowningDamage(unit15, 0.02, 0.033)
assert(result15.hp === 600, 'HP should not be reduced outside river')
assert(!result15.isDrowning, 'Should not be marked as drowning')

// ============================================================================
// TESTS: VISUAL EFFECTS
// ============================================================================

console.log('\n=== VISUAL EFFECTS ===\n')

// TEST 16: Drowning visual effect opacity
console.log('Test 16: Drowning reduces opacity')
const unit16 = { ...testUnits.unitInRiver, isDrowning: true, drowningDuration: 0.5 }
const effects16 = getDrowningVisualEffect(unit16)
assert(effects16.opacity < 1, 'Drowning should reduce opacity')
assert(effects16.opacity > 0, 'Opacity should remain visible')
assert(effects16.tint === '#4080ff', 'Should have blue water tint')

// TEST 17: No visual effects when not drowning
console.log('Test 17: No visual effects when not drowning')
const unit17 = { ...testUnits.playerTroop, isDrowning: false }
const effects17 = getDrowningVisualEffect(unit17)
assert(effects17.opacity === 1, 'Opacity should be full')
assert(effects17.tint === null, 'Should not have tint')

// TEST 18: Particle intensity increases with drowning duration
console.log('Test 18: Particle intensity increases with drowning')
const unit18a = { isDrowning: true, drowningDuration: 0.5 }
const unit18b = { isDrowning: true, drowningDuration: 2 }
const effects18a = getDrowningVisualEffect(unit18a)
const effects18b = getDrowningVisualEffect(unit18b)
assert(
  effects18b.particleIntensity > effects18a.particleIntensity,
  'Particle intensity should increase with drowning duration'
)

// ============================================================================
// TESTS: BRIDGE CROSSING STATUS
// ============================================================================

console.log('\n=== BRIDGE CROSSING STATUS ===\n')

// TEST 19: Bridge crossing status for unit on bridge
console.log('Test 19: Unit on bridge shows correct status')
const status19 = getBridgeCrossingStatus(testUnits.unitOnBridge)
assert(status19.isCrossing, 'Should detect river crossing')
assert(status19.onBridge, 'Should detect being on bridge')
assert(status19.nearBridge, 'Should detect nearness to bridge')

// TEST 20: Bridge crossing status for unit off bridge
console.log('Test 20: Unit off bridge shows correct status')
const status20 = getBridgeCrossingStatus(testUnits.unitInRiver)
assert(status20.isCrossing, 'Should detect river crossing')
assert(!status20.onBridge, 'Should NOT be on bridge')

// ============================================================================
// TEST SCENARIOS: INTEGRATION
// ============================================================================

console.log('\n=== INTEGRATION SCENARIOS ===\n')

// SCENARIO 1: Player unit crosses river safely
console.log('Scenario 1: Player unit spawns, crosses river via bridge, reaches enemy')
let scenario1Unit = { ...testUnits.playerTroop, x: 150, y: 750 }
const scenario1Path = calculatePathWithBridges(150, 750, 150, 50, 'left')
assert(scenario1Path.some((wp) => wp.type === 'bridge'), 'Should have bridge waypoint')

let scenario1Current = { ...scenario1Unit }
let scenario1Frame = 0
while (scenario1Current.y > 50 && scenario1Frame < 1000) {
  const res = moveUnitAlongPath(scenario1Current, scenario1Path, 1)
  scenario1Current = res.unit
  scenario1Frame++
}
assertCloseTo(scenario1Current.y, 50, 10, 'Player unit should reach enemy territory')
assert(!scenario1Current.isDrowning, 'Should not be drowning when on path')

// SCENARIO 2: Unit forced into river, takes damage, escapes
console.log('Scenario 2: Unit in river takes damage, escapes via bridge')
let scenario2Unit = { ...testUnits.unitInRiver, hp: 600, maxHp: 600 }
const hpBefore = scenario2Unit.hp

// Apply drowning damage
scenario2Unit = applyDrowningDamage(scenario2Unit, 0.02, 1)
assert(scenario2Unit.hp < hpBefore, 'Should take damage in river')

// Calculate rescue path to bridge
const rescuePath = calculatePathWithBridges(scenario2Unit.x, scenario2Unit.y, 150, 750, 'center')
assert(rescuePath[0].type === 'bridge', 'First waypoint should be bridge (rescue)')

// SCENARIO 3: Unit stays in river too long, dies
console.log('Scenario 3: Unit in river dies from prolonged drowning')
let scenario3Unit = { ...testUnits.unitInRiver, hp: 100, maxHp: 600, drowningDuration: 0 }
const scenario3MaxFrames = 100
let scenario3Frame = 0

while (scenario3Unit.hp > 0 && scenario3Frame < scenario3MaxFrames) {
  scenario3Unit = applyDrowningDamage(scenario3Unit, 0.5, 0.033) // High damage rate
  scenario3Frame++
}

assert(scenario3Unit.hp <= 0, 'Unit should die from drowning')

// ============================================================================
// RESULTS
// ============================================================================

console.log('\n=== TEST RESULTS ===\n')
console.log(`✓ Passed: ${testsPassed}`)
console.log(`✗ Failed: ${testsFailed}`)
console.log(`Total:   ${testsPassed + testsFailed}`)
console.log(`${testsFailed === 0 ? '🎉 All tests passed!' : '⚠️ Some tests failed'}`)
