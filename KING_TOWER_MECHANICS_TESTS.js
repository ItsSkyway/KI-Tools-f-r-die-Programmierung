/**
 * KING TOWER ACTIVATION MECHANICS - TEST SUITE
 * 
 * Tests for:
 * 1. Initial state: King tower starts dormant
 * 2. Activation on princess tower destruction
 * 3. Activation on king tower damage
 * 4. King tower cannot shoot while dormant
 * 5. King tower shoots normally after activation
 * 6. Visual feedback on activation
 */

import {
  initializeTowers,
  getPrincessTowerCount,
  shouldActivateKingTower,
  activateKingTower,
  trackKingTowerDamage,
  getKingTowerState,
  damageTower,
  isTowerAlive,
} from './src/simulation/towers.js'

// ============================================================================
// TEST UTILITIES
// ============================================================================

const assert = (condition, message) => {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`)
    throw new Error(message)
  }
  console.log(`✅ PASSED: ${message}`)
}

const assertEquals = (actual, expected, message) => {
  if (actual !== expected) {
    console.error(`❌ FAILED: ${message}`)
    console.error(`   Expected: ${expected}`)
    console.error(`   Actual: ${actual}`)
    throw new Error(message)
  }
  console.log(`✅ PASSED: ${message}`)
}

// ============================================================================
// TEST SUITE
// ============================================================================

console.log('\n' + '='.repeat(70))
console.log('KING TOWER ACTIVATION MECHANICS - TEST SUITE')
console.log('='.repeat(70) + '\n')

// TEST 1: Initial state - King tower starts dormant
console.log('TEST 1: Initial Tower State')
console.log('-'.repeat(70))
{
  const towers = initializeTowers('player')
  
  assertEquals(towers.kingTower.state, 'dormant', 'King tower initial state is DORMANT')
  assertEquals(towers.kingTower.wasKingDamaged, false, 'wasKingDamaged flag is false')
  assertEquals(towers.kingTower.activatedAt, null, 'activatedAt is null')
  
  // Princess towers should not have state (optional, but verify they're initialized)
  assertEquals(towers.princessLeft.hp, 1800, 'Princess left initialized with correct HP')
  assertEquals(towers.princessRight.hp, 1800, 'Princess right initialized with correct HP')
  
  const kingState = getKingTowerState(towers.kingTower)
  assertEquals(kingState.isDormant, true, 'getKingTowerState.isDormant = true')
  assertEquals(kingState.isActive, false, 'getKingTowerState.isActive = false')
  assertEquals(kingState.canShoot, false, 'Dormant king tower cannot shoot')
}

// TEST 2: Princess tower destruction triggers activation
console.log('\nTEST 2: Activation on Princess Tower Destruction')
console.log('-'.repeat(70))
{
  const towers = initializeTowers('player')
  
  // Verify initial state
  assertEquals(getPrincessTowerCount(towers), 2, 'Initial princess tower count = 2')
  assertEquals(towers.kingTower.state, 'dormant', 'King tower starts dormant')
  
  // Destroy one princess tower
  damageTower(towers.princessLeft, towers.princessLeft.maxHp)
  assertEquals(towers.princessLeft.destroyed, true, 'Princess left is destroyed')
  
  const currentPrincessCount = getPrincessTowerCount(towers)
  assertEquals(currentPrincessCount, 1, 'Princess tower count = 1 after destruction')
  
  // Check if activation should occur (1 < 2)
  const shouldActivate = shouldActivateKingTower(
    towers.kingTower, 
    currentPrincessCount, 
    2 // previousCount
  )
  assertEquals(shouldActivate, true, 'shouldActivateKingTower returns true')
  
  // Activate the king tower
  const activation = activateKingTower(towers.kingTower)
  assertEquals(activation.activated, true, 'Activation event: activated = true')
  assertEquals(towers.kingTower.state, 'active', 'King tower state changed to ACTIVE')
  assertEquals(activation.message, 'King Tower Activated!', 'Correct activation message')
}

// TEST 3: King tower damage triggers activation
console.log('\nTEST 3: Activation on King Tower Damage')
console.log('-'.repeat(70))
{
  const towers = initializeTowers('player')
  
  assertEquals(towers.kingTower.state, 'dormant', 'King tower starts dormant')
  assertEquals(towers.kingTower.wasKingDamaged, false, 'wasKingDamaged = false')
  
  // Apply damage to king tower
  const initialHp = towers.kingTower.hp
  damageTower(towers.kingTower, 100)
  
  assertEquals(towers.kingTower.hp, initialHp - 100, 'King tower took 100 damage')
  assertEquals(towers.kingTower.wasKingDamaged, true, 'wasKingDamaged flag set to true')
  
  // Check if activation should occur
  const shouldActivate = shouldActivateKingTower(
    towers.kingTower,
    2, // princessTowerCount (unchanged)
    2  // previousCount (unchanged)
  )
  assertEquals(shouldActivate, true, 'shouldActivateKingTower returns true on damage')
  
  // Activate
  const activation = activateKingTower(towers.kingTower)
  assertEquals(activation.activated, true, 'King tower activated successfully')
  assertEquals(towers.kingTower.state, 'active', 'King tower state = ACTIVE')
  assertEquals(towers.kingTower.wasKingDamaged, false, 'wasKingDamaged reset after activation')
}

// TEST 4: King tower cannot shoot while dormant
console.log('\nTEST 4: Dormant King Tower Cannot Shoot')
console.log('-'.repeat(70))
{
  const towers = initializeTowers('player')
  const kingState = getKingTowerState(towers.kingTower)
  
  assertEquals(kingState.canShoot, false, 'Dormant: canShoot = false')
  assertEquals(towers.kingTower.state, 'dormant', 'King tower is dormant')
  
  // Activate
  activateKingTower(towers.kingTower)
  const kingStateAfter = getKingTowerState(towers.kingTower)
  
  assertEquals(kingStateAfter.canShoot, true, 'Active: canShoot = true')
  assertEquals(towers.kingTower.state, 'active', 'King tower is active')
}

// TEST 5: Double activation prevented (idempotent)
console.log('\nTEST 5: Double Activation Prevention (Idempotent)')
console.log('-'.repeat(70))
{
  const towers = initializeTowers('player')
  
  // First activation
  const activation1 = activateKingTower(towers.kingTower)
  assertEquals(activation1.activated, true, 'First activation succeeds')
  assertEquals(towers.kingTower.state, 'active', 'King tower is active')
  
  // Try to activate again
  const activation2 = activateKingTower(towers.kingTower)
  assertEquals(activation2.activated, false, 'Second activation returns false (already active)')
  assertEquals(towers.kingTower.state, 'active', 'King tower still active')
}

// TEST 6: Both princess towers destroyed
console.log('\nTEST 6: Both Princess Towers Destroyed')
console.log('-'.repeat(70))
{
  const towers = initializeTowers('player')
  
  // Destroy both princess towers
  damageTower(towers.princessLeft, towers.princessLeft.maxHp)
  damageTower(towers.princessRight, towers.princessRight.maxHp)
  
  assertEquals(getPrincessTowerCount(towers), 0, 'Princess tower count = 0')
  assertEquals(towers.kingTower.state, 'dormant', 'King tower still dormant (not yet activated)')
  
  // Check activation (0 < 2)
  const shouldActivate = shouldActivateKingTower(
    towers.kingTower,
    0,
    2
  )
  assertEquals(shouldActivate, true, 'Activation triggered when both destroyed')
}

// TEST 7: King tower state snapshot
console.log('\nTEST 7: King Tower State Snapshot')
console.log('-'.repeat(70))
{
  const towers = initializeTowers('player')
  
  // Dormant state
  const dormantState = getKingTowerState(towers.kingTower)
  assertEquals(dormantState.isDormant, true, 'dormantState.isDormant = true')
  assertEquals(dormantState.isActive, false, 'dormantState.isActive = false')
  assertEquals(dormantState.state, 'dormant', 'dormantState.state = "dormant"')
  
  // Activate
  activateKingTower(towers.kingTower)
  const activeState = getKingTowerState(towers.kingTower)
  
  assertEquals(activeState.isDormant, false, 'activeState.isDormant = false')
  assertEquals(activeState.isActive, true, 'activeState.isActive = true')
  assertEquals(activeState.state, 'active', 'activeState.state = "active"')
  assertEquals(activeState.canShoot, true, 'activeState.canShoot = true')
}

// TEST 8: Damage tracking doesn't affect active tower
console.log('\nTEST 8: Damage Tracking After Activation')
console.log('-'.repeat(70))
{
  const towers = initializeTowers('player')
  
  // Activate first
  activateKingTower(towers.kingTower)
  assertEquals(towers.kingTower.state, 'active', 'King tower is active')
  
  // Apply damage
  damageTower(towers.kingTower, 100)
  assertEquals(towers.kingTower.hp, 3500 - 100, 'Damage applied')
  assertEquals(towers.kingTower.state, 'active', 'King tower still active after damage')
  assertEquals(towers.kingTower.wasKingDamaged, false, 'Damage flag not set (already active)')
}

// TEST 9: Multiple enemy towers same behavior
console.log('\nTEST 9: Both Players King Towers')
console.log('-'.repeat(70))
{
  const playerTowers = initializeTowers('player')
  const enemyTowers = initializeTowers('enemy')
  
  assertEquals(playerTowers.kingTower.state, 'dormant', 'Player king tower dormant')
  assertEquals(enemyTowers.kingTower.state, 'dormant', 'Enemy king tower dormant')
  
  // Damage both
  damageTower(playerTowers.kingTower, 50)
  damageTower(enemyTowers.kingTower, 50)
  
  assertEquals(playerTowers.kingTower.wasKingDamaged, true, 'Player king damaged flag set')
  assertEquals(enemyTowers.kingTower.wasKingDamaged, true, 'Enemy king damaged flag set')
  
  // Activate both
  activateKingTower(playerTowers.kingTower)
  activateKingTower(enemyTowers.kingTower)
  
  assertEquals(playerTowers.kingTower.state, 'active', 'Player king activated')
  assertEquals(enemyTowers.kingTower.state, 'active', 'Enemy king activated')
}

// TEST 10: HP doesn't affect activation condition
console.log('\nTEST 10: HP Independence from Activation')
console.log('-'.repeat(70))
{
  const towers = initializeTowers('player')
  
  // Massive damage but not destroyed
  damageTower(towers.kingTower, 3000)
  assertEquals(towers.kingTower.hp, 500, 'King tower at low HP')
  assertEquals(towers.kingTower.destroyed, false, 'King tower not destroyed')
  assertEquals(towers.kingTower.wasKingDamaged, true, 'Damage flag set')
  
  // Activation still works
  const shouldActivate = shouldActivateKingTower(towers.kingTower, 2, 2)
  assertEquals(shouldActivate, true, 'Activation works at low HP')
}

// ============================================================================
// TEST SUMMARY
// ============================================================================

console.log('\n' + '='.repeat(70))
console.log('✅ ALL TESTS PASSED!')
console.log('='.repeat(70))

console.log('\nTest Summary:')
console.log('  ✓ Test 1: Initial tower state (DORMANT)')
console.log('  ✓ Test 2: Activation on princess destruction')
console.log('  ✓ Test 3: Activation on king tower damage')
console.log('  ✓ Test 4: Dormant tower cannot shoot')
console.log('  ✓ Test 5: Double activation prevention')
console.log('  ✓ Test 6: Both princess towers destroyed')
console.log('  ✓ Test 7: State snapshot functions')
console.log('  ✓ Test 8: Damage tracking after activation')
console.log('  ✓ Test 9: Both players king towers independent')
console.log('  ✓ Test 10: HP independence from activation')

console.log('\nKey Mechanics Verified:')
console.log('  ✓ State machine: DORMANT → ACTIVE (one-way transition)')
console.log('  ✓ Activation trigger 1: Princess tower destruction')
console.log('  ✓ Activation trigger 2: King tower takes damage')
console.log('  ✓ Visual feedback: canShoot flag, state property')
console.log('  ✓ Idempotency: Cannot double-activate')
console.log('  ✓ Independent: Both players tracked separately')

console.log('\n' + '='.repeat(70) + '\n')
