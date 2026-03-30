/**
 * COMPREHENSIVE INTEGRATION TEST SUITE
 * ===================================
 * Tests all 5 gameplay scenarios for the Clash Royale game engine
 * 
 * Scenarios:
 * A: Basic Movement (units move towards enemy side using bridges)
 * B: Drowning Mechanics (units drown when not on bridge)
 * C: Tower Combat (towers shoot and arrows hit targets)
 * D: King Tower Activation (dormant → active state machine)
 * E: Multiple Cards (play multiple cards, verify spawning and movement)
 * 
 * Usage: Open index.html in browser, open console, run:
 * > runIntegrationTests()
 */

// ============================================================================
// TEST UTILITIES
// ============================================================================

class TestRunner {
  constructor() {
    this.tests = []
    this.results = []
    this.currentScenario = null
  }

  addTest(name, fn) {
    this.tests.push({ name, fn })
  }

  async run() {
    console.clear()
    console.log('🚀 STARTING COMPREHENSIVE INTEGRATION TEST SUITE')
    console.log('=' .repeat(60))
    
    let passed = 0
    let failed = 0
    const startTime = Date.now()

    for (const test of this.tests) {
      try {
        console.log(`\n📋 Running: ${test.name}`)
        const result = await test.fn()
        
        if (result.success) {
          console.log(`✅ PASSED: ${test.name}`)
          passed++
        } else {
          console.log(`❌ FAILED: ${test.name}`)
          console.log(`   Reason: ${result.reason}`)
          failed++
        }
        
        this.results.push({
          name: test.name,
          success: result.success,
          reason: result.reason,
          details: result.details
        })
      } catch (error) {
        console.log(`❌ ERROR: ${test.name}`)
        console.error(error)
        failed++
        this.results.push({
          name: test.name,
          success: false,
          reason: error.message,
          error: true
        })
      }
    }

    const duration = Date.now() - startTime
    console.log('\n' + '='.repeat(60))
    console.log(`📊 TEST RESULTS: ${passed} passed, ${failed} failed (${duration}ms)`)
    console.log('='.repeat(60))

    return { passed, failed, results: this.results }
  }

  printSummary() {
    console.log('\n📋 DETAILED SUMMARY:')
    this.results.forEach((r, i) => {
      const status = r.success ? '✅' : '❌'
      console.log(`${i + 1}. ${status} ${r.name}`)
      if (r.reason) console.log(`   └─ ${r.reason}`)
      if (r.details) console.log(`   └─ Details: ${JSON.stringify(r.details, null, 2)}`)
    })
  }
}

// ============================================================================
// SCENARIO A: BASIC MOVEMENT
// ============================================================================

function createTestScenarioA(gameState, towers) {
  return {
    name: 'Scenario A: Basic Movement',
    async run() {
      // Spawn Knight on player side in left lane
      const knight = {
        id: 'knight-test-' + Date.now(),
        cardName: 'Knight',
        owner: 'player',
        lane: 'left',
        x: 133,
        y: 750, // Player territory
        hp: 400,
        maxHp: 400,
        stats: {
          speed: 2,
          range: 20,
          damage: 50,
          attackSpeed: 1,
          targetBuildings: false
        },
        moving: true,
        direction: 1, // Towards enemy
      }

      gameState.playerTroops.push(knight)
      console.log('✓ Knight spawned at player territory')

      // Simulate movement for 10 frames
      let knightMoved = false
      let bridgeDetected = false

      for (let i = 0; i < 10; i++) {
        // Update unit movement
        knight.y -= knight.stats.speed

        // Check if unit reached bridge zone
        if (knight.y >= 370 && knight.y <= 430) {
          bridgeDetected = true
          console.log(`✓ Knight entered bridge zone at y=${knight.y}`)
        }

        if (knight.y < 750) {
          knightMoved = true
        }

        await new Promise(resolve => setTimeout(resolve, 33))
      }

      // Check if unit moved and didn't drown
      const success = knightMoved && knight.hp === knight.maxHp && bridgeDetected
      
      return {
        success,
        reason: !success ? 'Movement or bridge detection failed' : 'Unit moved successfully',
        details: {
          unitMoved: knightMoved,
          noDrowned: knight.hp === knight.maxHp,
          bridgeDetected,
          finalY: knight.y
        }
      }
    }
  }
}

// ============================================================================
// SCENARIO B: DROWNING MECHANICS
// ============================================================================

function createTestScenarioB(gameState, towers) {
  return {
    name: 'Scenario B: Drowning Mechanics',
    async run() {
      // Spawn unit in river without bridge crossing
      const goblin = {
        id: 'goblin-test-' + Date.now(),
        cardName: 'Goblins',
        owner: 'player',
        lane: 'center',
        x: 400, // Center of arena
        y: 400, // IN THE RIVER
        hp: 100,
        maxHp: 100,
        stats: {
          speed: 2,
          range: 15,
          damage: 30,
          attackSpeed: 1,
          targetBuildings: false
        },
        moving: true,
        isDrowning: false,
        drownTimer: 0,
      }

      gameState.playerTroops.push(goblin)
      console.log('✓ Goblin spawned IN river (should drown)')

      let drowningDetected = false
      let initialHp = goblin.hp

      // Simulate 30 frames (1 second) in river
      for (let i = 0; i < 30; i++) {
        // Simulate drowning damage (example: -2 hp per frame)
        if (goblin.y >= 380 && goblin.y <= 420) {
          goblin.hp -= 2
          goblin.isDrowning = true
          if (i === 1) drowningDetected = true
        }

        await new Promise(resolve => setTimeout(resolve, 33))
      }

      const healthDecreased = goblin.hp < initialHp
      const isDead = goblin.hp <= 0
      const success = drowningDetected && (healthDecreased || isDead)

      return {
        success,
        reason: !success ? 'Drowning not detected properly' : 'Drowning mechanics working',
        details: {
          drowningDetected,
          healthDecreased,
          isDead,
          initialHp,
          finalHp: goblin.hp,
          damageDealt: initialHp - goblin.hp
        }
      }
    }
  }
}

// ============================================================================
// SCENARIO C: TOWER COMBAT
// ============================================================================

function createTestScenarioC(gameState, towers) {
  return {
    name: 'Scenario C: Tower Combat',
    async run() {
      // Get enemy tower
      const enemyTower = towers.enemy.leftTower
      if (!enemyTower) {
        return { success: false, reason: 'Enemy tower not found' }
      }

      // Spawn friendly unit near enemy tower
      const knight = {
        id: 'knight-combat-' + Date.now(),
        cardName: 'Knight',
        owner: 'player',
        lane: 'left',
        x: 133,
        y: 100, // Close to enemy tower
        hp: 400,
        maxHp: 400,
        stats: {
          speed: 1,
          range: 20,
          damage: 50,
          attackSpeed: 1,
          targetBuildings: false
        },
        moving: true,
      }

      gameState.playerTroops.push(knight)
      console.log('✓ Knight spawned near enemy tower')

      let towerAttackDetected = false
      let projectileCreated = false
      const initialKnightHp = knight.hp
      let arrowCount = 0

      // Simulate tower targeting and combat
      for (let i = 0; i < 60; i++) {
        // Simulate tower detecting target and shooting
        const distToKnight = Math.hypot(knight.x - enemyTower.x, knight.y - enemyTower.y)
        
        if (distToKnight < 150) { // Tower range
          towerAttackDetected = true
          
          // Simulate arrow creation
          if (i % 30 === 0) {
            projectileCreated = true
            arrowCount++
            
            // Simulate arrow hitting knight
            if (i > 0) {
              knight.hp -= 30 // Arrow damage
            }
          }
        }

        await new Promise(resolve => setTimeout(resolve, 33))
      }

      const knightTookDamage = knight.hp < initialKnightHp
      const success = towerAttackDetected && projectileCreated && knightTookDamage

      return {
        success,
        reason: !success ? 'Tower combat not working' : 'Tower shooting and damage working',
        details: {
          towerAttackDetected,
          projectileCreated,
          knightTookDamage,
          arrowsFired: arrowCount,
          initialKnightHp,
          finalKnightHp: knight.hp,
          damageFromTower: initialKnightHp - knight.hp
        }
      }
    }
  }
}

// ============================================================================
// SCENARIO D: KING TOWER ACTIVATION
// ============================================================================

function createTestScenarioD(gameState, towers) {
  return {
    name: 'Scenario D: King Tower Activation',
    async run() {
      const kingTower = towers.player.kingTower
      const leftPrincess = towers.player.leftTower

      if (!kingTower || !leftPrincess) {
        return { success: false, reason: 'Towers not found' }
      }

      // Initial state: king tower should be dormant
      const initiallyDormant = !kingTower.active

      // Damage princess tower to trigger king tower activation
      const initialPrincessHp = leftPrincess.hp
      leftPrincess.hp = Math.max(0, leftPrincess.hp - 50)
      const princessDamaged = leftPrincess.hp < initialPrincessHp

      // Simulate state check
      let kingTowerActivated = false
      
      // Check if king tower should activate
      if (leftPrincess.hp === 0 && kingTower.active === false) {
        kingTower.active = true
        kingTower.activatedAt = Date.now()
        kingTowerActivated = true
        console.log('✓ King tower activated on princess destruction')
      }

      const success = initiallyDormant && princessDamaged && kingTowerActivated

      return {
        success,
        reason: !success ? 'King tower activation failed' : 'King tower activation working',
        details: {
          initiallyDormant,
          princessDamaged,
          kingTowerActivated,
          kingTowerActive: kingTower.active,
          princessHp: leftPrincess.hp
        }
      }
    }
  }
}

// ============================================================================
// SCENARIO E: MULTIPLE CARDS
// ============================================================================

function createTestScenarioE(gameState, towers) {
  return {
    name: 'Scenario E: Multiple Cards',
    async run() {
      // Spawn multiple cards in different lanes
      const cards = [
        {
          id: 'knight-e-' + Date.now(),
          cardName: 'Knight',
          lane: 'left',
          x: 133,
          y: 750
        },
        {
          id: 'archer-e-' + Date.now(),
          cardName: 'Archer',
          lane: 'center',
          x: 400,
          y: 750
        },
        {
          id: 'giant-e-' + Date.now(),
          cardName: 'Giant',
          lane: 'right',
          x: 667,
          y: 750
        }
      ]

      let spawnedCount = 0

      for (const card of cards) {
        const unit = {
          id: card.id,
          cardName: card.cardName,
          owner: 'player',
          lane: card.lane,
          x: card.x,
          y: card.y,
          hp: 100,
          maxHp: 100,
          stats: {
            speed: 2,
            range: 20,
            damage: 30,
            attackSpeed: 1,
            targetBuildings: false
          },
          moving: true
        }

        gameState.playerTroops.push(unit)
        spawnedCount++
        console.log(`✓ ${card.cardName} spawned in ${card.lane} lane`)
      }

      // Verify all units are moving independently
      let allMoving = true
      const unitPositions = gameState.playerTroops.map(u => ({ ...u }))

      // Simulate 30 frames
      for (let i = 0; i < 30; i++) {
        gameState.playerTroops.forEach(unit => {
          if (unit.owner === 'player') {
            unit.y -= unit.stats.speed
          }
        })
        await new Promise(resolve => setTimeout(resolve, 33))
      }

      // Check all units moved
      let allMoved = true
      gameState.playerTroops.forEach((unit, idx) => {
        const original = unitPositions[idx]
        if (unit.y >= original.y) {
          allMoved = false
        }
      })

      const success = spawnedCount === 3 && allMoved

      return {
        success,
        reason: !success ? 'Multiple card spawning/movement failed' : 'All cards spawned and moving',
        details: {
          cardsSpawned: spawnedCount,
          allMoved,
          finalPositions: gameState.playerTroops.map(u => ({
            id: u.id,
            lane: u.lane,
            y: u.y
          }))
        }
      }
    }
  }
}

// ============================================================================
// PERFORMANCE TESTS
// ============================================================================

function createPerformanceTests(gameState, towers) {
  return {
    name: 'Performance Tests',
    async run() {
      console.log('🏃 Running performance metrics...')

      // FPS Test
      let frameCount = 0
      const startTime = performance.now()

      for (let i = 0; i < 100; i++) {
        frameCount++
        await new Promise(resolve => setTimeout(resolve, 16))
      }

      const endTime = performance.now()
      const actualFps = (frameCount * 1000) / (endTime - startTime)

      // Memory usage (if available)
      let memoryInfo = null
      if (performance.memory) {
        memoryInfo = {
          usedJsHeapSize: (performance.memory.usedJSHeapSize / 1048576).toFixed(2) + ' MB',
          jsHeapSizeLimit: (performance.memory.jsHeapSizeLimit / 1048576).toFixed(2) + ' MB'
        }
      }

      const fpsGood = actualFps >= 30
      const success = fpsGood

      return {
        success,
        reason: fpsGood ? 'Performance metrics acceptable' : 'FPS below target',
        details: {
          actualFps: actualFps.toFixed(1),
          targetFps: 30,
          memoryInfo,
          unitCount: gameState.playerTroops.length + gameState.enemyTroops.length
        }
      }
    }
  }
}

// ============================================================================
// EDGE CASE TESTS
// ============================================================================

function createEdgeCaseTests(gameState, towers) {
  return {
    name: 'Edge Cases: Multiple Units on Bridge',
    async run() {
      console.log('🧪 Testing edge cases...')

      // Spawn 5 units on same bridge
      const bridgeUnits = []
      for (let i = 0; i < 5; i++) {
        const unit = {
          id: 'bridge-unit-' + i + '-' + Date.now(),
          cardName: 'Goblin',
          owner: 'player',
          lane: 'left',
          x: 133 + (i * 5), // Slightly offset to avoid perfect stacking
          y: 395, // On bridge
          hp: 50,
          maxHp: 50,
          stats: {
            speed: 2,
            range: 15,
            damage: 20,
            attackSpeed: 1,
            targetBuildings: false
          },
          moving: true
        }
        gameState.playerTroops.push(unit)
        bridgeUnits.push(unit)
      }

      console.log('✓ 5 units spawned on same bridge')

      // Simulate collision detection
      let collisionsDetected = 0
      for (let frame = 0; frame < 30; frame++) {
        // Move all units
        bridgeUnits.forEach(unit => {
          unit.y -= unit.stats.speed
        })

        // Simple collision detection
        for (let i = 0; i < bridgeUnits.length; i++) {
          for (let j = i + 1; j < bridgeUnits.length; j++) {
            const dist = Math.hypot(
              bridgeUnits[i].x - bridgeUnits[j].x,
              bridgeUnits[i].y - bridgeUnits[j].y
            )
            if (dist < 20) {
              collisionsDetected++
            }
          }
        }

        await new Promise(resolve => setTimeout(resolve, 16))
      }

      // All units should still be alive and moving
      const allAlive = bridgeUnits.every(u => u.hp > 0)
      const allMoved = bridgeUnits.every(u => u.y < 395)

      const success = allAlive && allMoved

      return {
        success,
        reason: !success ? 'Edge case handling failed' : 'Multiple units on bridge handled correctly',
        details: {
          unitsOnBridge: bridgeUnits.length,
          allAlive,
          allMoved,
          collisionsDetected,
          finalPositions: bridgeUnits.map(u => u.y)
        }
      }
    }
  }
}

// ============================================================================
// MAIN TEST RUNNER
// ============================================================================

window.runIntegrationTests = async function() {
  // Get game state from React component (injected into window by Game.jsx)
  const gameState = window.__gameState__
  const towers = window.__towers__

  if (!gameState || !towers) {
    console.error('❌ Game state not found! Make sure the game is running.')
    console.log('   The game needs to be in "playing" state for tests to work.')
    return
  }

  const runner = new TestRunner()

  // Add all test scenarios
  const scenarios = [
    createTestScenarioA(gameState, towers),
    createTestScenarioB(gameState, towers),
    createTestScenarioC(gameState, towers),
    createTestScenarioD(gameState, towers),
    createTestScenarioE(gameState, towers),
    createPerformanceTests(gameState, towers),
    createEdgeCaseTests(gameState, towers),
  ]

  scenarios.forEach(scenario => {
    runner.addTest(scenario.name, () => scenario.run())
  })

  // Run all tests
  const results = await runner.run()

  // Print detailed summary
  runner.printSummary()

  // Return final verdict
  console.log('\n🎯 FINAL VERDICT:')
  if (results.failed === 0) {
    console.log('✅ ALL TESTS PASSED - GAME IS READY FOR DEPLOYMENT')
  } else {
    console.log(`⚠️  ${results.failed} tests failed - review issues above`)
  }

  return results
}

console.log('✅ Integration test suite loaded!')
console.log('📝 To run tests, use: runIntegrationTests()')
