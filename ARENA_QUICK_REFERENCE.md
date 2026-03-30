# Arena System - Quick Reference Card

## 🚀 5-Minute Quick Start

### Import Core Functions
```javascript
// Arena logic
import { 
  getLaneId, 
  isBridgeCrossing, 
  isUnitDrowning,
  canPlaceBuilding 
} from './game/arena'

// Movement & targeting
import { 
  updateUnitPosition, 
  calculateAIPath,
  getUnitsInRange,
  selectBestTarget 
} from './game/unitMovement'

// Rendering
import ArenaRenderer from './ui/ArenaRenderer'
```

### Basic Usage
```javascript
// 1. Update unit each frame
unit = updateUnitPosition(unit, targetX, targetY, 40)

// 2. Check if drowning
if (isUnitDrowning(unit)) unit.hp -= 0.5

// 3. Validate placement
if (!canPlaceBuilding(x, y, 'player')) return false

// 4. Tower targeting
const targets = getUnitsInRange(tower, allUnits, 400)
const target = selectBestTarget(tower, targets)

// 5. Render
<ArenaRenderer gameState={gameState} towers={towers} />
```

---

## 🎯 Arena Constants Quick Look

```javascript
// Lanes
LANES.left.x = 100     // Left lane center
LANES.center.x = 300   // Center lane center
LANES.right.x = 500    // Right lane center

// Boundaries
LANES.left.minX = 0, maxX = 200
LANES.center.minX = 200, maxX = 400
LANES.right.minX = 400, maxX = 600

// River & Bridges
RIVER_Y = 400
BRIDGES.left.x = 150
BRIDGES.right.x = 450

// Territories
ENEMY_TERRITORY = 0-400px
PLAYER_TERRITORY = 400-800px
```

---

## 🛠️ Common Tasks

### Task: Spawn Unit
```javascript
import { getSpawnPosition, isValidPlacementPosition } from './game/unitMovement'

// Validate
if (!isValidPlacementPosition(clickX, clickY, 'player')) return

// Spawn
const pos = getSpawnPosition('player', 'center')
const unit = {
  id: 'unit-1',
  x: pos.x,
  y: pos.y,
  hp: 50,
  maxHp: 50,
  side: 'player'
}
```

### Task: Tower Targeting
```javascript
import { getUnitsInRange, selectBestTarget } from './game/unitMovement'

const targets = getUnitsInRange(tower, allUnits, tower.range)
if (targets.length > 0) {
  const target = selectBestTarget(tower, targets)
  // Attack target
}
```

### Task: Unit Movement
```javascript
import { updateUnitPosition } from './game/unitMovement'
import { isUnitDrowning } from './game/arena'

// Update position
unit = updateUnitPosition(unit, targetX, targetY, speed)

// Check drowning
if (isUnitDrowning(unit)) {
  unit.hp = Math.max(0, unit.hp - 0.5)
}
```

### Task: Render Arena
```javascript
import ArenaRenderer from './ui/ArenaRenderer'

<ArenaRenderer 
  gameState={gameState}
  towers={towers}
  selectedCard={selectedCard}
  onCanvasClick={handleClick}
/>
```

---

## 📊 Lane & Bridge Reference

```
LEFT LANE           CENTER LANE         RIGHT LANE
(0-200px)          (200-400px)         (400-600px)
  ↓                    ↓                   ↓

     BRIDGE@150      BRIDGE@450
     /                    \
    /                      \
   ↙ Left Bridge           Right Bridge ↘

Can span units from:
- Left lane → Crosses at LEFT BRIDGE (x=150)
- Center lane → Crosses at either bridge
- Right lane → Crosses at RIGHT BRIDGE (x=450)
```

---

## ⚡ Performance Tips

✅ **DO**
- Use canvas for rendering (single canvas)
- Cache pathfinding waypoints
- Use distance formula for collision
- Call updateUnitPosition once per frame
- Check isBridgeCrossing for river validation

❌ **DON'T**
- Create multiple canvas elements
- Recalculate paths every frame
- Use pixel-perfect collision detection
- Move units outside of updateUnitPosition
- Forget to check isUnitDrowning

---

## 🐛 Debugging Checklist

```javascript
// Enable debug mode
gameState.debug = true

// Check lane assignment
console.log(getLaneId(unit.x))

// Check river zone
console.log(isInRiverZone(unit.y))

// Check bridge position
console.log(isBridgeCrossing(unit.x))

// Check drowning
console.log(isUnitDrowning(unit))

// Check pathfinding
console.log(calculateAIPath(unit, 300, 50))
```

---

## 📖 Documentation Map

| Need | File |
|------|------|
| Quick overview | This file |
| Full system guide | ARENA_LANES_RIVER_GUIDE.md |
| Integration steps | INTEGRATION_GUIDE.md |
| Implementation status | ARENA_SYSTEM_SUMMARY.md |
| Working example | src/ui/ArenaDemo.jsx |
| Arena rendering | src/ui/ArenaRenderer.jsx |
| Game logic | src/game/arena.js |
| Movement logic | src/game/unitMovement.js |
| Constants | src/game/constants.js |

---

## 🎮 Unit AI Quick Start

```javascript
// Calculate AI path
const waypoints = calculateAIPath(unit, targetX, targetY)

// Get next waypoint
const nextWp = getNextWaypoint(unit, waypoints)

// Move towards waypoint
unit = updateUnitPosition(unit, nextWp.x, nextWp.y, speed)

// AI automatically:
// ✓ Finds nearest bridge
// ✓ Adds bridge waypoint if crossing river
// ✓ Routes around obstacles
// ✓ Reaches final target
```

---

## 🎨 Rendering Layers (Z-Order)

```
1. Background (gradient)
2. Grid pattern
3. Lanes (dashed lines)
4. River (animated)
5. Bridges (wood texture)
6. Towers (with health bars)
7. Units (with health bars)
8. Debug overlay (optional)
```

---

## 💾 State Object Structure

```javascript
{
  // Unit properties
  id: 'unit-1',
  name: 'Skeleton',
  x: 150,           // Current X position
  y: 500,           // Current Y position
  hp: 40,           // Current health
  maxHp: 50,        // Max health
  speed: 40,        // pixels per second
  radius: 8,        // Visual size
  side: 'player',   // 'player' or 'enemy'
  lane: 'left',     // 'left', 'center', 'right'
  isDrowning: false // Drowning status
}

// Tower properties
{
  x: 300,           // Tower position X
  y: 740,           // Tower position Y
  hp: 3000,         // Current health
  maxHp: 3000,      // Max health
  isKing: true,     // King tower?
  range: 400,       // Attack range
  lane: 'center'    // Tower's lane
}
```

---

## 🔄 Game Loop Integration

```javascript
function gameLoop(deltaTime) {
  // Update all units
  gameState.playerTroops = gameState.playerTroops.map(unit => {
    // Calculate target
    const target = getTowerTarget(unit.side)
    
    // Update position
    let updated = updateUnitPosition(unit, target.x, target.y, 40 * deltaTime)
    
    // Check drowning
    if (isUnitDrowning(updated)) {
      updated.hp -= 0.5 * deltaTime
    }
    
    return updated
  })
  
  // Update towers
  updateTowerAttacks()
  
  // Render
  render()
}
```

---

## 🎯 River Crossing Example

```
Scenario: Unit in center lane moving up to cross river

Step 1: calculateAIPath(unit, targetX, targetY)
→ Returns: [current] → [bridge@150 OR @450] → [target]

Step 2: getNextWaypoint returns bridge position
unit.x = 150, unit.y = 400 (bridge location)

Step 3: updateUnitPosition moves to bridge
✓ canCrossRiver(150, 400, unit.currentY) = true

Step 4: Bridge crossing complete
Unit continues to target on other side

If unit deviates from bridge:
❌ canCrossRiver(250, 400, ...) = false
❌ Movement blocked, isUnitDrowning = true
💀 Health decreases per frame
```

---

## 📱 Responsive Canvas

```javascript
// Canvas sizing
<canvas width={600} height={800} />

// Scales with viewport but maintains 600×800 aspect ratio
// ArenaRenderer handles all rendering internally
```

---

## ✨ Key Insights

1. **Lanes are the foundation** - Everything respects lane boundaries
2. **Bridges are choke points** - Strategic bottlenecks
3. **Pathfinding is automatic** - AI handles bridge navigation
4. **Drowning is a threat** - Risk/reward for river crossing
5. **Tower lanes matter** - Positioning creates lane focus
6. **Collision is soft** - Units can pass through briefly
7. **Performance is optimized** - 60fps with many units

---

## 🚀 Integration Checklist

- [ ] Import core functions
- [ ] Update game loop with updateUnitPosition()
- [ ] Add drowning check in loop
- [ ] Use ArenaRenderer for rendering
- [ ] Validate placement with canPlaceBuilding()
- [ ] Setup tower targeting
- [ ] Test river crossing
- [ ] Test lane boundaries
- [ ] Verify 60fps performance
- [ ] Run full testing suite

---

**Quick Reference Version:** 1.0
**Status:** ✅ Ready to Use
**Last Updated:** March 2026

For detailed information, see ARENA_LANES_RIVER_GUIDE.md
For integration steps, see INTEGRATION_GUIDE.md
