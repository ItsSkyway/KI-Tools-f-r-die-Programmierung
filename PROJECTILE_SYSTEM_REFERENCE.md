// ============================================================================
// PROJECTILE SYSTEM - QUICK REFERENCE
// ============================================================================

/**
 * ARROW LIFECYCLE
 * 
 * 1. CREATION (in processTowers → towerAttack)
 *    Tower detects target → towerAttack() returns arrow data
 *    gameLoop creates arrow with createArrow()
 *    arrow added to gameState.projectiles[]
 *    
 * 2. FLIGHT (updateArrow in game loop PHASE 3)
 *    Position updated: x += vx * dt, y += vy * dt
 *    Trail segments added (up to 10)
 *    Elapsed time tracked
 *    
 * 3. COLLISION (processArrowCollisions)
 *    Check distance to all units in range
 *    On hit: arrow.hasHit = true, apply damage
 *    
 * 4. CLEANUP (filterCompletedArrows)
 *    Keep arrows with hasHit for 100ms fade
 *    Remove after fade complete
 *
 * TOTAL FLIGHT TIME: 150-500ms
 * FADE TIME AFTER HIT: 100ms
 */

// ============================================================================
// VISUAL DESIGN
// ============================================================================

/**
 * ARROW APPEARANCE (rendered on canvas)
 *
 *         PLAYER ARROW        ENEMY ARROW
 *         Gold #FFD700        Red #FF6B6B
 *
 *     ▲ (arrow head)          ▲ (arrow head)
 *     ═══════ (shaft)         ═══════ (shaft)
 *   ▼▼ (fletching)          ▼▼ (fletching)
 *
 * + Rotating based on direction (angle = atan2(dy, dx))
 * + Trail: 10 segments fading over 200ms
 * + Glow: Semi-transparent halo (12px radius)
 *
 * COLORS:
 * - Head & Shaft: Owner color (#FFD700 or #FF6B6B)
 * - Fletching: Darkened owner color
 * - Trail: Owner color at 40% opacity
 * - Glow: Owner color at 30% opacity
 */

// ============================================================================
// SYSTEM COMPONENTS
// ============================================================================

// src/simulation/projectiles.js
export const createArrow = (fromX, fromY, toX, toY, damage, travelTime, owner, target)
  // Returns arrow object with position, velocity, damage, visual properties

export const updateArrow = (arrow, deltaMs)
  // Update position: x += vx*dt, y += vy*dt
  // Update trail segments
  // Check if reached target (distance traveled >= total distance)

export const updateProjectiles = (arrows, deltaMs)
  // Map updateArrow over all arrows

export const renderArrow = (ctx, arrow)
  // Draw trail (fading segments)
  // Draw shaft (rotated line)
  // Draw head (triangle)
  // Draw fletching (back triangle)
  // Draw glow (halo)

export const renderProjectiles = (ctx, arrows)
  // Render all active arrows

export const processArrowCollisions = (arrows, units, hitRadius)
  // Check distance from each arrow to each unit
  // Mark arrow as hit if distance < hitRadius
  // Return damage events

export const applyArrowDamage = (damageEvents)
  // Apply damage: unit.hp -= damage

export const filterCompletedArrows = (arrows)
  // Keep arrows: not hit OR (hit AND elapsed < 100ms)
  // Remove arrows: hit AND elapsed >= 100ms

// ============================================================================
// GAME LOOP INTEGRATION
// ============================================================================

// src/game/gameLoop.js - runGameFrame()

// PHASE 1B: Create arrows
const playerArrows = processTowers(towers.player, enemyTroops, enemyBuildings)
const enemyArrows = processTowers(towers.enemy, playerTroops, playerBuildings)

playerArrows.forEach(arrowData => {
  const arrow = createArrow(...)
  gameState.projectiles.push(arrow)
})

// PHASE 3: Update and process arrows
gameState.projectiles = updateProjectiles(gameState.projectiles, deltaMs)

// Collision detection
const [playerHits, playerDamages] = processArrowCollisions(
  gameState.projectiles.filter(a => a.owner === 'player'),
  gameState.enemyTroops,
  15
)
applyArrowDamage(playerDamages)

// Check towers
gameState.projectiles.forEach(arrow => {
  if (!arrow.hasHit) {
    // Check distance to towers
    // If hit: tower.hp -= arrow.damage, arrow.hasHit = true
  }
})

// Cleanup
gameState.projectiles = filterCompletedArrows(gameState.projectiles)

// ============================================================================
// RENDERING INTEGRATION
// ============================================================================

// src/ui/ArenaRenderer.jsx - renderArena()

// PHASE 7: Render projectiles
if (gameState && gameState.projectiles) {
  renderProjectiles(ctx, gameState.projectiles)
}

// ============================================================================
// PHYSICS FORMULAS
// ============================================================================

// Calculate arrow velocity to reach target in travelTime
distance = hypot(toX - fromX, toY - fromY)
speed = distance / (travelTime / 1000)  // pixels per second
vx = (dx / distance) * speed
vy = (dy / distance) * speed

// Update position each frame
x += (vx * deltaMs) / 1000
y += (vy * deltaMs) / 1000

// Calculate rotation angle
angle = atan2(dy, dx)

// Travel time calculation (dynamic based on distance)
travelTime = max(150, min(500, (distance / 300) * 400))
// 150ms minimum (close range)
// 500ms maximum (far range)
// 300px = 400ms

// ============================================================================
// DATA STRUCTURE
// ============================================================================

const arrow = {
  // Identity
  id: `arrow_${Date.now()}_${Math.random()}`,
  type: 'arrow',
  owner: 'player',  // or 'enemy'
  
  // Position & Motion
  x: 300, y: 100,          // Current position
  fromX: 300, fromY: 100,  // Start position
  toX: 300, toY: 200,      // Target location
  vx: 0, vy: 200,          // Velocity (pixels/second)
  
  // Physics
  speed: 600,              // pixels/second
  distance: 100,           // Total distance to travel
  angle: 1.57,             // Rotation in radians
  elapsed: 50,             // ms since creation
  travelTime: 300,         // Total flight time (ms)
  
  // Damage
  damage: 50,              // Damage on hit
  targetObject: { ... },   // Reference to target (for tracking)
  
  // Visual
  trail: [
    { x: 300, y: 90, age: 10, maxAge: 200 },
    { x: 300, y: 95, age: 5, maxAge: 200 },
  ],
  trailLength: 10,         // Max trail segments
  trailMaxAge: 200,        // Trail fade duration (ms)
  
  // State
  hasHit: false,
  hitAt: null,
  createdAt: Date.now(),
}

// ============================================================================
// INTEGRATION WITH COMBAT SYSTEM
// ============================================================================

// src/simulation/combat.js - towerAttack()

export const towerAttack = (tower, target, allEnemyUnits = []) => {
  // ... existing attack preparation code ...
  
  const distance = hypot(target.x - tower.x, target.y - tower.y)
  const travelTime = max(150, min(500, (distance / 300) * 400))
  
  return {
    damage: tower.damage,
    hitTargets: [...],
    arrow: {
      fromX: tower.x,
      fromY: tower.y,
      toX: target.x,
      toY: target.y,
      damage: tower.damage,
      travelTime,
      owner: tower.ownerType,
      target,
      splashRadius: tower.splashRadius || 0,
    }
  }
}

// Key Change: Arrow returns ARROW DATA, not instant damage
// Game loop creates arrow and handles collision/damage

// ============================================================================
// PERFORMANCE PROFILE
// ============================================================================

// Memory per arrow: ~500 bytes
// Typical arrows in flight: 5-20
// Memory impact: ~10KB (negligible)

// CPU per frame (30fps):
// - Arrow creation: <1ms per tower
// - Arrow update: ~0.1ms per arrow
// - Collision check: ~0.5ms for 20 arrows
// - Arrow rendering: ~0.2ms per arrow
// Total impact: <5ms per frame

// ============================================================================
// USAGE EXAMPLE
// ============================================================================

// In game loop:
const result = towerAttack(tower, target, enemyUnits)

if (result.arrow) {
  const arrow = createArrow(
    result.arrow.fromX,
    result.arrow.fromY,
    result.arrow.toX,
    result.arrow.toY,
    result.arrow.damage,
    result.arrow.travelTime,
    result.arrow.owner,
    result.arrow.target
  )
  
  gameState.projectiles.push(arrow)
}

// Later in frame:
gameState.projectiles = updateProjectiles(gameState.projectiles, deltaMs)

const [hits, damages] = processArrowCollisions(
  gameState.projectiles.filter(a => a.owner === 'player'),
  gameState.enemyTroops,
  15
)

applyArrowDamage(damages)

// In rendering:
renderProjectiles(ctx, gameState.projectiles)

// ============================================================================
// KEY DIFFERENCES FROM INSTANT DAMAGE
// ============================================================================

// BEFORE:
towerAttack(tower, target) {
  target.hp -= tower.damage  // INSTANT!
  return { damage: tower.damage }
}

// AFTER:
towerAttack(tower, target) {
  return {
    arrow: {  // Arrow data for game loop
      fromX: tower.x,
      toX: target.x,
      travelTime: 300,
      ...
    }
  }
}

// Game loop:
// 1. Create arrow from data
// 2. Add to projectiles array
// 3. Each frame: update position
// 4. On collision: apply damage

// BENEFITS:
// + Visually see arrows flying
// + Adds visual delay (more strategic timing)
// + Tower attacks feel more "real"
// + Arrows can miss if target moves!
// + Extensible for homing/curved arrows

// ============================================================================
