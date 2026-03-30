# Arena Layout - Quick Reference Guide

## 🎮 Arena Dimensions
```
Canvas: 800×800px
River: Horizontal at Y=400
Territory Split: 400px top (enemy) / 400px bottom (player)
```

## 🌉 Bridge Specifications

| Bridge | Position | Range | Notes |
|--------|----------|-------|-------|
| **Left** | X=150 | X: 110-190 | Left/Center lane crossing |
| **Right** | X=470 | X: 430-510 | Center/Right lane crossing |

**Bridge Size**: 80px wide × 40px tall

## 🎯 Lane System

```javascript
// Left Lane (Width: 267px)
minX: 0,    maxX: 267,   centerX: 133

// Center Lane (Width: 266px)  
minX: 267,  maxX: 533,   centerX: 400

// Right Lane (Width: 267px)
minX: 533,  maxX: 800,   centerX: 667
```

## 🌊 River Zone

```javascript
River Center: Y = 400
Collision Zone: Y: 380-420 (±20px from center)
```

## 📍 Tower Positions

### Player Towers (Bottom)
```javascript
King Tower:      (400, 740)  // Center lane
Princess Left:   (133, 680)  // Left lane
Princess Right:  (667, 680)  // Right lane
```

### Enemy Towers (Top)
```javascript
King Tower:      (400, 60)   // Center lane
Princess Left:   (133, 120)  // Left lane
Princess Right:  (667, 120)  // Right lane
```

## 🔧 Core Functions (src/game/arena.js)

### Check if Position is on Bridge
```javascript
import { isBridgeCrossing } from './src/game/arena.js'

// Returns true if unit can cross at this X position
if (isBridgeCrossing(unitX)) {
  // Unit can cross river here
}
```

### Check if Position is in River
```javascript
import { isInRiverZone } from './src/game/arena.js'

// Returns true if unit is in river collision zone
if (isInRiverZone(unitY)) {
  // Unit is in river area
}
```

### Check if Unit is Drowning
```javascript
import { isUnitDrowning } from './src/game/arena.js'

// Returns true if unit is in river but not on bridge
if (isUnitDrowning(unit)) {
  // Apply drowning damage/slow effects
  unit.hp -= 2 // Damage per frame
  unit.speed *= 0.7 // 30% slow
}
```

### Get Nearest Bridge for Lane
```javascript
import { getNearestBridge } from './src/game/arena.js'

const bridge = getNearestBridge('left')  // Returns BRIDGES.left
const bridge = getNearestBridge('center') // Returns BRIDGES.left (default)
const bridge = getNearestBridge('right') // Returns BRIDGES.right
```

### Calculate Unit Path with Bridges
```javascript
import { calculateUnitPath } from './src/game/arena.js'

const waypoints = calculateUnitPath(unit, targetX, targetY)
// Returns: [
//   { x: currentX, y: currentY },
//   { x: bridgeX, y: 400, isBridge: true },  // Only if crossing river
//   { x: targetX, y: targetY }
// ]
```

## 🎨 Rendering (src/ui/ArenaRenderer.jsx)

### Main Component
```jsx
import ArenaRenderer from './src/ui/ArenaRenderer'

<ArenaRenderer 
  gameState={gameState}
  towers={towers}
  selectedCard={selectedCard}
  onCanvasClick={handleCanvasClick}
/>
```

### Canvas Size
- **Width**: 800px
- **Height**: 800px
- **Rendering**: Automated animation loop (60fps)

## 🏗️ Architecture

### File Dependencies
```
src/game/constants.js
  ↓ (imports)
src/game/arena.js
  ↓ (uses constants)
src/ui/ArenaRenderer.jsx
  ↓ (imports arena functions)
src/ui/GameBoard.jsx
  ↓ (delegates to ArenaRenderer)
src/ui/Game.jsx
  ↓ (main game component)
```

### Constants Used
- `ARENA_WIDTH`, `ARENA_HEIGHT` - Canvas dimensions (800×800)
- `RIVER_Y`, `RIVER_ZONE` - River position & collision
- `BRIDGES` - Bridge positions & dimensions
- `LANES` - Lane boundaries & centers
- `TOWER_POSITIONS` - Tower spawn locations

## ✅ Implementation Checklist

- [x] Constants defined (800×800 arena)
- [x] Lane system implemented
- [x] Bridge locations set (X=150, X=470)
- [x] River zone collision detection
- [x] Bridge crossing validation
- [x] Drowning state detection
- [x] Unit pathfinding with bridges
- [x] ArenaRenderer with animations
- [x] Tower positioning updated
- [x] GameBoard integrated
- [x] All functions tested

## 🎬 Visual Features

### River Animation
- Flowing waves (sine pattern)
- Water particles (5 elements)
- Glow effects (blue gradient)
- Real-time animation synchronized with game time

### Bridge Rendering
- Wooden texture with brown colors
- Edge highlighting for 3D effect
- Plank detail lines
- Shadow/glow for depth

### Unit Drowning Effect
- Blue aura when in river off-bridge
- 60% opacity (semi-transparent)
- Damage and slow effects applied

## 📊 Test Values

```javascript
// Bridge crossing test points
isBridgeCrossing(150)  // true (left bridge)
isBridgeCrossing(300)  // false (between bridges)
isBridgeCrossing(470)  // true (right bridge)
isBridgeCrossing(700)  // false (off any bridge)

// River zone test points
isInRiverZone(300)     // false (above river)
isInRiverZone(400)     // true (river center)
isInRiverZone(500)     // false (below river)
isInRiverZone(380)     // true (edge of collision zone)
isInRiverZone(420)     // true (edge of collision zone)

// Lane detection
getLaneId(100)         // 'left'
getLaneId(400)         // 'right' (or 'center' - straddles boundary)
getLaneId(700)         // 'right'
```

## 🚀 Next Steps

When integrating unit movement:

1. **Spawn Units**: Place at lane center + 20px from edge
2. **Calculate Path**: Use `calculateUnitPath()` to get waypoints
3. **Move Units**: Follow waypoints using lane-based movement
4. **Check Drowning**: Apply effects if `isUnitDrowning(unit)`
5. **Cross River**: Units auto-route through nearest bridge

---

**Status**: ✅ Complete and Tested
**Canvas**: 800×800px ✅
**Bridges**: 2 (L:150, R:470) ✅
**River**: Y=400 with animation ✅
**Functions**: All tested ✅
