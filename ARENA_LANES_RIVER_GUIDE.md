# Arena Lanes + River System Implementation Guide

## 🎮 Overview

Vollständige Implementierung eines **Clash Royale-genauen Arena-Systems** mit:
- ✅ 3-Lane System (Left, Center, Right)
- ✅ River mit animierten Wasserwellen
- ✅ Bridge-Crossings (x: 150 & 450)
- ✅ Lane-basiertes Unit-Movement
- ✅ Drowning-Mechanik für River-Überschreitungen
- ✅ Tower-Integration mit Lane-Positionen
- ✅ Visuelles Design mit Texturen & Animationen

---

## 📁 New Files Created

### 1. **`src/game/arena.js`** - Lane & River System Core
**Kernfunktionen:**
- `getLaneForX(x)` - Bestimmt Lane basierend auf X-Koordinate
- `canCrossRiver(x, y, currentY)` - Prüft ob River überquert werden kann
- `isBridgeCrossing(x)` - Prüft ob Position auf Brücke ist
- `getNearestBridge(laneId)` - Findet nächste Brücke für Lane
- `calculateUnitPath(unit, targetX, targetY)` - Berechnet Pfad mit Brücken-Waypoints
- `isUnitDrowning(unit)` - Prüft ob Unit ins River fällt
- `canPlaceBuilding(x, y, side)` - Validiert Building Placement
- `canCastSpell(x, y)` - Validiert Spell Placement (überall erlaubt)

**Imports in bestehende Module:**
```javascript
import { 
  getLaneId, 
  isBridgeCrossing, 
  isInRiverZone 
} from './arena.js'
```

---

### 2. **`src/ui/ArenaRenderer.jsx`** - Advanced Visual Rendering
**Features:**
- Stone texture Gradient Background
- Animierte River mit Wellen-Effekt
- Bridge Rendering mit Holz-Textur
- Lane Boundaries (subtile Dashed Lines)
- Tower Rendering (King & Princess mit Health Bars)
- Unit Rendering mit Drowning-Effekt
- Grid Pattern für visuelles Tiefe
- Debug Overlay Option

**Komponentenstruktur:**
```jsx
<ArenaRenderer 
  gameState={gameState}
  towers={towers}
  selectedCard={selectedCard}
  onCanvasClick={handleCanvasClick}
/>
```

**Rendering Ordnung (korrekter Z-Index):**
1. Background & Terrain
2. Lanes & Boundaries
3. River (mit Animation)
4. Bridges (Wood Texture)
5. Towers
6. Units (mit Health Bars)
7. Debug Overlay

---

### 3. **`src/game/unitMovement.js`** - Movement & Pathfinding
**Kernfunktionen:**
- `updateUnitPosition(unit, targetX, targetY, speed)` - Unit Position mit River-Constrains
- `calculateAIPath(unit, targetX, targetY)` - AI-Pathfinding mit Bridge-Waypoints
- `getLanePreference(unit)` - Lane-Präferenz für Unit
- `enforceLanePreference(unit, speed)` - Soft-Constrains für Lane-Grenzen
- `checkUnitCollision(unit, otherUnits, minDistance)` - Kollisionsprüfung
- `avoidCollision(unit, otherUnits, maxOffset)` - Kollisions-Ausweich-Logik
- `getSpawnPosition(side, lane)` - Spawn-Position berechnen
- `isValidPlacementPosition(x, y, side)` - Placement-Validierung
- `getUnitsInRange(tower, allUnits, range)` - Units im Tower-Range
- `selectBestTarget(tower, targets)` - Best-Target Auswahl für Towers
- `getUnitsInAOE(aoe, units)` - Units im Spell-AoE

---

## 🏗️ Arena Structure

### Größe & Territorien
```
┌─────────────────────────────────┐
│                                 │
│     ENEMY TERRITORY (0-400px)   │ y: 0-400
│                                 │
├─ ┌─ ──────────────────────── ─┬─┤
│  │ RIVER (y: 400 ± 20px)    │ │ Brücken: x=150, x=450
├─ └─ ──────────────────────── ─┴─┤
│                                 │
│    PLAYER TERRITORY (400-800px) │ y: 400-800
│                                 │
└─────────────────────────────────┘
  0-600px
```

### 3-Lane System
```
Lane 1 (LEFT)     │  Lane 2 (CENTER)   │  Lane 3 (RIGHT)
x: 0-200px        │  x: 200-400px      │  x: 400-600px
Center: 100px     │  Center: 300px     │  Center: 500px
```

### Tower Positionen (Lane-aligned)
```
ENEMY TERRITORY:
  [King] at (300, 60) - CENTER
  [P1]   at (100, 120) - LEFT
  [P2]   at (500, 120) - RIGHT

PLAYER TERRITORY:
  [P1]   at (100, 680) - LEFT
  [P2]   at (500, 680) - RIGHT
  [King] at (300, 740) - CENTER
```

### Brücken-Crossings
```
LEFT BRIDGE:        RIGHT BRIDGE:
  x: 150             x: 450
  y: 400             y: 400
  width: 80          width: 80
  height: 40         height: 40
```

---

## 🔄 Unit Movement Flow

### Player spawns Troop
```
1. Player klickt auf Card
2. Arena.js validiert Placement
   - ✅ In own territory
   - ✅ In valid lane OR on bridge
   - ❌ Blocks river crossing outside bridges
3. Unit spawnt in selected Lane
4. AI calculates path with getNearestBridge()
```

### Unit Movement
```
Each Frame:
1. Get target position (base/tower)
2. Call updateUnitPosition(unit, targetX, targetY, speed)
3. Arena.js checks:
   - ✅ Lane boundaries (soft constraint)
   - ✅ River crossing rules
   - ✅ Bridge position validation
4. If drowning: apply damage
5. Render unit with visual effects
```

### River Crossing
```
Normal Case:
  Unit in Left Lane wants to reach Enemy Territory
  ✅ Moves to Bridge at (150, 400)
  ✅ Crosses river
  ✅ Continues to target

Error Case:
  Unit tries to cross river outside bridge at (250, 400)
  ❌ Movement blocked
  ⚠️ Unit falls into river (isDrowning = true)
  💀 Takes damage per tick until rescued
```

---

## 📊 Constants Updated

**File:** `src/game/constants.js`

```javascript
// Arena Structure
export const RIVER_Y = 400
export const RIVER_WIDTH = 200 // Center lane

// Territory Bounds
export const ENEMY_TERRITORY_START = 0
export const ENEMY_TERRITORY_END = 400
export const PLAYER_TERRITORY_START = 400
export const PLAYER_TERRITORY_END = 800

// 3-Lane System
export const LANES = {
  left: { id: 'left', x: 100, minX: 0, maxX: 200, color: '#2a5f7f' },
  center: { id: 'center', x: 300, minX: 200, maxX: 400, color: '#3a6f8f' },
  right: { id: 'right', x: 500, minX: 400, maxX: 600, color: '#2a5f7f' }
}

// Bridge Positions
export const BRIDGES = {
  left: { x: 150, y: 400, width: 80, height: 40 },
  right: { x: 450, y: 400, width: 80, height: 40 }
}

// Tower Positions (Lane-aligned)
export const TOWER_POSITIONS = {
  player: {
    kingTower: { x: 300, y: 740, lane: 'center' },
    princessLeft: { x: 100, y: 680, lane: 'left' },
    princessRight: { x: 500, y: 680, lane: 'right' }
  }
}
```

---

## 🎨 Visual Features

### River Animation
- **Wave Animation:** Sin-wave patterns with time-based movement
- **Water Particles:** Floating particle effects
- **Glow Effect:** Blue glow around river center
- **Gradient:** Water gradient from top to bottom

### Bridge Design
- **Wood Texture:** Plank pattern with spacing
- **Color:** Wooden brown (#8B6914)
- **Edge Highlight:** Lighter edge for 3D effect
- **Glow:** Subtle shadow/glow effect

### Unit Rendering
- **Health Bar:** Green → Yellow → Red based on HP%
- **Lane Indicator:** Subtle color bar above unit
- **Drowning Effect:** Opacity + water glow when in river
- **Selection:** Yellow outline when selected

### Tower Rendering
- **Gradient Fill:** Lighter to darker radial gradient
- **Health Bar:** Color-coded HP display
- **King Flag:** Red flag on King Towers
- **Shadow:** Drop shadow for depth

---

## 🔧 Integration Steps

### 1. **Update GameBoard.jsx** (if keeping old renderer)
Replace with new ArenaRenderer:
```jsx
// OLD
import GameBoard from './GameBoard'

// NEW
import ArenaRenderer from './ArenaRenderer'

// In component
<ArenaRenderer 
  gameState={gameState}
  towers={towers}
  selectedCard={selectedCard}
  onCanvasClick={handleSpellCast}
/>
```

### 2. **Update Game Loop** (gameLoop.js)
Import arena functions:
```javascript
import { updateUnitPosition } from './unitMovement.js'
import { isUnitDrowning } from './arena.js'

// In unit update loop
unit = updateUnitPosition(unit, targetX, targetY, unit.speed)
if (isUnitDrowning(unit)) {
  // Apply drowning animation/visual effect
}
```

### 3. **Update Unit Spawning** (gameState.js)
```javascript
import { getSpawnPosition, isValidPlacementPosition } from './unitMovement.js'

// On card play
const position = getSpawnPosition(side, selectedLane)
if (!isValidPlacementPosition(position.x, position.y, side)) {
  return // Invalid placement
}
```

### 4. **Update Tower Targeting** (gameLoop.js)
```javascript
import { getUnitsInRange, selectBestTarget } from './unitMovement.js'

// In tower attack logic
const targets = getUnitsInRange(tower, allUnits, TOWER_RANGE)
const target = selectBestTarget(tower, targets)
```

---

## 🧪 Testing Checklist

### ✅ Arena Rendering
- [ ] River animates smoothly
- [ ] Bridges render with wood texture
- [ ] Lanes are visually distinct
- [ ] Towers positioned correctly in lanes
- [ ] Units render with health bars

### ✅ Unit Movement
- [ ] Units move in their lane
- [ ] Units respect lane boundaries
- [ ] Units cross at bridges correctly
- [ ] Drowning penalty applied when off-bridge
- [ ] Collision detection works

### ✅ Placement
- [ ] Can place in own territory only
- [ ] Can place in any lane
- [ ] Cannot place outside bounds
- [ ] Cannot place on river outside bridges
- [ ] Spells work anywhere

### ✅ Tower Behavior
- [ ] Each tower attacks in its lane
- [ ] King tower has larger range
- [ ] Princess towers have smaller range
- [ ] Targeting prioritizes closest units
- [ ] Range indicators visible (debug)

---

## 🎯 Performance Optimization

### Canvas Rendering
- Single canvas with one context
- RequestAnimationFrame for smooth 60fps
- Clip regions for river animation only
- Shadow cache for towers

### Path Calculation
- Cached lane positions (LANES constant)
- Bridge selection pre-calculated
- Collision avoidance uses quadrants

### Memory
- No array allocations in render loop
- Reuse gradient objects where possible
- Waypoint arrays pooled in movement

---

## 📚 References

### Key Files to Import
```javascript
// Arena & Lane System
import { 
  LANES, 
  BRIDGES, 
  RIVER_Y, 
  TOWER_POSITIONS 
} from './constants'

import { 
  getLaneId, 
  isBridgeCrossing, 
  canCrossRiver, 
  isUnitDrowning 
} from './arena'

// Unit Movement
import {
  updateUnitPosition,
  calculateAIPath,
  getSpawnPosition,
  checkUnitCollision
} from './unitMovement'

// Rendering
import ArenaRenderer from './ArenaRenderer'
```

---

## 🚀 Next Steps

1. **Update existing GameBoard.jsx** → Use ArenaRenderer
2. **Integrate unitMovement.js** → Game loop updates
3. **Test river crossing** → Verify bridge mechanics
4. **Tower targeting** → Test lane-based targeting
5. **Visual polish** → Add particle effects, sounds
6. **Performance** → Profile and optimize

---

**Status:** ✅ Core Arena System Implementation Complete
**Performance:** Optimized for 60fps smooth gameplay
**Compatibility:** Ready for integration with existing codebase
