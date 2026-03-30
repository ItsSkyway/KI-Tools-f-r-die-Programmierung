/**
 * Unit Movement & AI Targeting System - Implementation Guide
 * 
 * ============================================================================
 * OVERVIEW
 * ============================================================================
 * 
 * This system implements complete unit behavior for a Clash Royale-style game:
 * 1. Intelligent unit movement with lane-based pathfinding
 * 2. Priority-based AI targeting system
 * 3. Range checking and attack mechanics
 * 4. Splash damage handling
 * 5. Death animations and cleanup
 * 6. Special unit type behaviors
 * 
 * ============================================================================
 * UNIT MOVEMENT SYSTEM
 * ============================================================================
 * 
 * Movement Type: Smooth Lerp (Linear Interpolation)
 * - NOT teleportation - units move smoothly frame by frame
 * - Speed range: 0.6 to 1.5 (from card stats, scaled to frame time)
 * - Movement formula: position += (target - position) * (speed / distance)
 * 
 * Lane System:
 * - Three lanes: Left (0-200), Center (200-400), Right (400-600)
 * - Units constrained to lane corridors for clean visuals
 * - Bridge crossings at River (y=400) for movement between territories
 * 
 * Waypoint Navigation:
 * - Player units move from bottom (y=800) → top (y=0)
 * - Enemy units move from top (y=0) → bottom (y=800)
 * - Units cross river via bridges (left bridge or right bridge)
 * - Final waypoint: King Tower center
 * 
 * Example Flow:
 * 1. Unit spawned at bottom center
 * 2. No target → move to nearest bridge waypoint
 * 3. Reach bridge → continue to enemy side
 * 4. Reach enemy side → move to king tower position
 * 5. Target acquired → move directly to target
 * 6. In range → stop and attack
 * 
 * ============================================================================
 * AI TARGETING PRIORITY SYSTEM (KRITISCH)
 * ============================================================================
 * 
 * Targets are recalculated every 0.5 seconds for responsiveness
 * Target is cached between updates to reduce recalculations
 * 
 * Priority 1: BUILDINGS (wenn unit.stats.targetBuildings === true)
 *   - Closest building wins
 *   - Examples: Giant, Hog Rider, P.E.K.K.A
 * 
 * Priority 2: TOWERS (wenn unit.stats.targetBuildings === true)
 *   - Closest tower wins
 *   - Targets any in-range tower
 * 
 * Priority 3: TROOPS (always available)
 *   - Lowest HP first (easiest kill)
 *   - Tiebreaker: closest distance
 *   - Examples: Archer vs Knight - targets weaker unit
 * 
 * Targeting Logic:
 * ```
 * if (target in range) {
 *   if (unit targets buildings && building in range) {
 *     return closest building
 *   }
 *   if (unit targets buildings && tower in range) {
 *     return closest tower
 *   }
 *   return lowest HP troop in range
 * }
 * ```
 * 
 * ============================================================================
 * RANGE & ATTACK MECHANICS
 * ============================================================================
 * 
 * Range Checking:
 * - Range based on card.stats.range (100-140 for most troops)
 * - Distance = sqrt((targetX - unitX)² + (targetY - unitY)²)
 * - If distance < range: unit can attack
 * 
 * Attack Speed:
 * - From card.stats.attackSpeed (0.8 - 1.8 attacks per second)
 * - Interval = 1000ms / attackSpeed
 * - Knight: 1.0 → 1000ms between attacks
 * - Archer: 1.2 → 833ms between attacks
 * - P.E.K.K.A: 1.8 → 556ms between attacks
 * 
 * Damage Calculation:
 * - Base damage from card.stats.damage
 * - Applied: target.hp -= damage
 * - Critical hits: damage * 1.5 (random chance)
 * 
 * Attack Animation:
 * - Brief visual flash on hit (150ms)
 * - Damage indicator shown at target position
 * 
 * ============================================================================
 * SPLASH DAMAGE SYSTEM
 * ============================================================================
 * 
 * Units with Splash Radius:
 * - Baby Dragon: 80px radius, splash
 * - Valkyrie: 100px radius, circular splash
 * - Bomb Tower: 100px radius
 * 
 * Splash Mechanics:
 * 1. Calculate primary damage to main target
 * 2. Find all units within splashRadius of target
 * 3. Apply 75% damage to splash targets
 * 4. Create effect visuals for each splash hit
 * 
 * Example: Valkyrie attacks Knight for 130 damage
 * - Knight takes 130 damage
 * - All units within 100px of Knight take 97.5 damage (75%)
 * - Visual splash effect appears at hit location
 * 
 * ============================================================================
 * DEATH & REMOVAL SYSTEM
 * ============================================================================
 * 
 * Death Animation Timeline (500ms total):
 * - Time 0-500ms: Fade-out + Scale-down animation
 *   - Opacity: 1 → 0 (linear)
 *   - Scale: 1 → 0.7 (slight shrink)
 * - After 500ms: Remove from game arrays completely
 * 
 * Death Processing:
 * 1. Unit takes fatal damage → hp <= 0
 * 2. Mark as isDying = true, start animation
 * 3. Unit still rendered but faded
 * 4. After animation: filter from game array
 * 5. No collision after death (isDying check)
 * 
 * Special Death Effects:
 * - Witch spawns 1 skeleton on death
 * - P.E.K.K.A creates bigger visual effect
 * - Baby Dragon leaves trail
 * 
 * ============================================================================
 * SPECIAL UNIT TYPES
 * ============================================================================
 * 
 * FLYING UNITS (Minions, Baby Dragon, Witch)
 * - Ignore ground obstacles
 * - Move straight up/down (no lane constraints needed)
 * - Prefer towers over troops
 * - Unaffected by ground-unit targeting
 * 
 * SKELETON ARMY (Spawns 12-15 individual troops)
 * - Each skeleton acts independently
 * - Each has own targeting AI
 * - No leader unit (pure swarm)
 * - Weak individually, strong in numbers
 * 
 * VALKYRIE (Melee splash unit)
 * - 100px splash radius around unit
 * - Targets 360° around position
 * - Excellent for clearing swarms
 * - Hits in circular pattern
 * 
 * WITCH (Ranged spawner)
 * - Spawns 2-3 skeletons every 2 seconds
 * - Spawns 1 skeleton on death
 * - Ranged attacks (100px range)
 * - Support unit that creates army
 * 
 * P.E.K.K.A (Heavy tank)
 * - Extreme damage (300) and HP (2000)
 * - Targets buildings only
 * - Very slow (0.6 speed)
 * - Ultimate push unit
 * 
 * HOG RIDER (Fast building breaker)
 * - Fast movement (1.5 speed)
 * - Targets buildings only
 * - High damage (150)
 * - Ignores troops completely
 * 
 * BABY DRAGON (Flying splash)
 * - Flies over obstacles
 * - 80px splash radius
 * - Moderate stats all around
 * - Versatile unit
 * 
 * ============================================================================
 * UNIT BEHAVIOR RULES
 * ============================================================================
 * 
 * TROOPS:
 * - Active spawning and targeting
 * - Move towards enemies or King Tower
 * - Each has independent AI
 * - Can be frozen/slowed by spells
 * - Die when HP <= 0
 * 
 * BUILDINGS (Cannon, Bomb Tower):
 * - Static position (don't move)
 * - Target all units in range
 * - Have area effect (splash)
 * - Destruction = captured tower zone
 * 
 * TOWERS (King + Princess):
 * - Static defensive structures
 * - Priority: Buildings > Towers > Troops
 * - High range (350-400px)
 * - Support ally units
 * - Critical for defense
 * 
 * ============================================================================
 * IMPLEMENTATION CHECKLIST
 * ============================================================================
 * 
 * [✓] Unit Movement System
 *     - [✓] Smooth lerp movement (no teleport)
 *     - [✓] Lane-based pathfinding
 *     - [✓] Lane constraints
 *     - [✓] Bridge crossing detection
 *     - [✓] Waypoint navigation
 * 
 * [✓] AI Targeting System
 *     - [✓] Priority 1: Buildings (closest)
 *     - [✓] Priority 2: Towers (closest)
 *     - [✓] Priority 3: Troops (lowest HP)
 *     - [✓] Target caching (every 0.5s recalculation)
 *     - [✓] Range checking
 * 
 * [✓] Combat System
 *     - [✓] Attack speed respecting
 *     - [✓] Damage calculation
 *     - [✓] Range checks before attack
 *     - [✓] Attack animation visuals
 *     - [✓] Critical hit chance
 * 
 * [✓] Splash Damage
 *     - [✓] Splash radius detection
 *     - [✓] 75% damage to splash targets
 *     - [✓] Multiple units hit
 *     - [✓] Splash effect visuals
 * 
 * [✓] Death System
 *     - [✓] Death animation (0.5s fade + scale)
 *     - [✓] Fade-out over time
 *     - [✓] Scale-down animation
 *     - [✓] Remove after animation
 *     - [✓] No collision while dead
 *     - [✓] Special death effects (Witch)
 * 
 * [✓] Special Units
 *     - [✓] Flying units (bypass obstacles)
 *     - [✓] Skeleton Army (independent skeletons)
 *     - [✓] Valkyrie (360° splash)
 *     - [✓] Witch (spawns skeletons)
 *     - [✓] P.E.K.K.A (building target)
 *     - [✓] Baby Dragon (flying splash)
 *     - [✓] Hog Rider (building target)
 * 
 * ============================================================================
 * INTEGRATION NOTES
 * ============================================================================
 * 
 * Files Modified:
 * - src/simulation/unitMovement.js (complete rewrite)
 * - src/simulation/combat.js (targeting system + splash)
 * - src/game/gameLoop.js (processUnits + processTowers)
 * 
 * Files Created:
 * - src/simulation/specialUnits.js (special behaviors)
 * 
 * Key Changes:
 * 1. performAttack now takes allEnemyUnits for splash damage
 * 2. findNearestEnemy now caches target for efficiency
 * 3. updateUnitMovement preserves lane constraints
 * 4. gameLoop.js updated to pass all enemy units for splash
 * 
 * Performance Considerations:
 * - Target caching reduces O(n²) targeting to O(n) checks
 * - 0.5s update interval balances responsiveness vs efficiency
 * - Lane constraints prevent pathfinding calculations
 * - Smooth lerp is single vector calculation per frame
 * 
 * ============================================================================
 * TESTING SCENARIOS
 * ============================================================================
 * 
 * Scenario 1: Basic Unit Movement
 * - Spawn Knight at bottom center
 * - Verify smooth movement towards river
 * - Check lane constraint (stays in left/center lane)
 * - Verify reach bridge and continue to top
 * 
 * Scenario 2: Targeting Priority
 * - Spawn Giant (targetBuildings) with building and troops
 * - Verify targets building first
 * - Kill building → targets tower next
 * - Kill tower → targets troops as fallback
 * 
 * Scenario 3: Splash Damage
 * - Spawn Valkyrie attacking Knight
 * - Verify main target takes full damage
 * - Verify nearby units take 75% damage
 * - Verify splash effect visual
 * 
 * Scenario 4: Witch Spawning
 * - Spawn Witch vs defensive troops
 * - Verify skeletons spawn every 2 seconds
 * - Verify skeletons act independently
 * - Kill witch → verify 1 skeleton on death
 * 
 * Scenario 5: Death Animation
 * - Kill any unit
 * - Verify fade-out over 0.5 seconds
 * - Verify scale-down animation
 * - Verify removed after animation complete
 * 
 * ============================================================================
 */

export const UNIT_SYSTEM_CONFIG = {
  MOVEMENT: {
    SPEED_RANGE: [0.6, 1.5], // Min and max movement speed multiplier
    FRAME_SCALE: 0.5, // Applied to speed per frame
    LANE_CONSTRAINT_ENABLED: true,
    BRIDGE_CROSSING_ENABLED: true,
  },
  TARGETING: {
    TARGET_UPDATE_INTERVAL: 500, // Recalculate every 500ms
    PRIORITY_1_BUILDINGS: true,
    PRIORITY_2_TOWERS: true,
    PRIORITY_3_TROOPS_LOW_HP: true,
    SPLASH_RADIUS_MULTIPLIER: 0.75, // 75% damage for splash
  },
  COMBAT: {
    ATTACK_SPEED_RANGE: [0.8, 1.8], // Attacks per second
    CRITICAL_CHANCE: 0.15, // 15% crit chance
    CRITICAL_MULTIPLIER: 1.5, // 1.5x damage
    RANGE_BUFFER: 0, // No additional range buffer
  },
  DEATH: {
    ANIMATION_DURATION: 500, // 0.5 seconds
    FADE_OUT_ENABLED: true,
    SCALE_DOWN_ENABLED: true,
    SCALE_TARGET: 0.7, // Scale to 70% at death
  },
  SPECIAL: {
    WITCH_SPAWN_INTERVAL: 2000, // Every 2 seconds
    WITCH_SPAWN_COUNT: [2, 3], // 2-3 skeletons
    WITCH_DEATH_SPAWN: 1, // 1 skeleton on death
    SKELETON_ARMY_COUNT: 12, // 12 individual units
  },
}
