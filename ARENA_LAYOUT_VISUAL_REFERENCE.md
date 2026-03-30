# 🎮 Arena Layout - Visual Reference & Diagrams

## 📐 Canvas Layout Diagram

```
                    800px (ARENA_WIDTH)
    ┌────────────────────────────────────────┐
    │                                        │
    │  ENEMY TERRITORY (Y: 0-400)           │
    │                                        │ 400px
    │  🏰 Princess (100)    🏰 Princess (500)│
    │           👑 King (300)                │
    │                                        │
    │                                        │
    └────────────────────────────────────────┤
    │ 🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊 │ RIVER (Y=400)
    │ 🌊  🌉Bridge(150)  🌉Bridge(470) 🌊  │ 40px total
    │ 🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊 │
    ├────────────────────────────────────────┤
    │                                        │
    │  PLAYER TERRITORY (Y: 400-800)        │
    │                                        │ 400px
    │  🏰 Princess (100)    🏰 Princess (500)│
    │           👑 King (300)                │
    │                                        │
    │                                        │
    └────────────────────────────────────────┘
    0                     400                 800
         X Coordinates
```

---

## 🎯 Lane Boundaries

```
LEFT LANE          CENTER LANE         RIGHT LANE
(X: 0-267)        (X: 267-533)        (X: 533-800)
   Width: 267px     Width: 266px        Width: 267px
   Center: 133      Center: 400         Center: 667

┌─────────┬──────────────┬─────────┐
│   L     │      C       │    R    │
│  133    │     400      │   667   │
└─────────┴──────────────┴─────────┘
0        267           533          800
         │             │
      Lane Boundaries (dashed lines)
```

---

## 🌉 Bridge Positions

### Left Bridge (X = 150)
```
Bridge Width: 80px
X Range: 110 to 190

    110         150         190
     ├───────┬───────┬───────┤
     │ ===== │ ===== │ ===== │  BRIDGE
     ├───────┴───────┴───────┤
     │    Wooden Planks      │
     │  40px Height, Brown    │
     └───────────────────────┘
     │       Y = 400         │  River Center
```

### Right Bridge (X = 470)
```
Bridge Width: 80px
X Range: 430 to 510

    430         470         510
     ├───────┬───────┬───────┤
     │ ===== │ ===== │ ===== │  BRIDGE
     ├───────┴───────┴───────┤
     │    Wooden Planks      │
     │  40px Height, Brown    │
     └───────────────────────┘
     │       Y = 400         │  River Center
```

---

## 💧 River Zone (Collision Detection)

```
Y Axis (height)

    380 ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄ River Zone Start (startY)
        ╔════════════════════╗
        ║   RIVER ZONE       ║  40px collision zone
        ║   (Drowning if     ║  Units take damage if
        ║    off-bridge)     ║  off-bridge here
        ║                    ║
    400 ║ 🌊🌊🌊🌊🌊🌊🌊🌊🌊 ║ River Center (RIVER_Y)
        ║                    ║
        ╚════════════════════╝
    420 ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄ River Zone End (endY)

Units in this zone (Y: 380-420):
✅ Safe: On bridge (X within bridge range)
❌ Danger: Off bridge (takes damage + slow)
```

---

## 🎯 Tower Positioning

### Player Side Towers (Bottom)
```
           133              400              667
            │               │                │
    Princ-L │    King Tower │   Princ-R      │
            │               │                │
        Y=680           Y=740            Y=680


           ↓               ↓                ↓
    ┌─────────────────────────────────────────┐
    │                                         │
    │   (X:133, Y:680) (X:400, Y:740) (X:667, Y:680)
    │      ⚔️             👑              ⚔️    
    │     Blue           Gold            Blue
    │   (Princess)      (King)        (Princess)
    │      1800 HP      3500 HP         1800 HP
    │
    └─────────────────────────────────────────┘
    0                  400                  800
         PLAYER TERRITORY (Y: 400-800)
```

### Enemy Side Towers (Top)
```
           133              400              667
            │               │                │
    Princ-L │    King Tower │   Princ-R      │
            │               │                │
        Y=120           Y=60             Y=120

    ┌─────────────────────────────────────────┐
    │                                         │
    │   (X:133, Y:120) (X:400, Y:60) (X:667, Y:120)
    │      ⚔️             👑              ⚔️    
    │     Red            Gold            Red
    │   (Princess)      (King)        (Princess)
    │      1800 HP      3500 HP         1800 HP
    │
    └─────────────────────────────────────────┘
    0                  400                  800
         ENEMY TERRITORY (Y: 0-400)
    
             ↑                ↑                ↑
```

---

## 🛤️ Unit Movement Pathfinding

### Example 1: Player Unit Crossing River (Left Lane)

```
START POSITION: (100, 750) - Player territory, left lane

Movement Path:
1. (100, 750)  ← Starting position
       ↓
2. Move toward enemy
       ↓
3. Approaching river at (100, 420)
       ↓
4. DETECT: Need to cross river!
       ↓
5. Route to nearest bridge (LEFT BRIDGE at X=150)
       ↓
6. Move to (150, 400) ← BRIDGE CROSSING
       ↓
7. Cross river successfully ✅
       ↓
8. Continue toward enemy (150, 100)
       ↓
FINAL: Unit reaches enemy territory
```

### Example 2: Unit Attempting Off-Bridge Crossing

```
START POSITION: (350, 750) - Center lane

Movement Path (BLOCKED):
1. (350, 750)  ← Starting position
       ↓
2. Move toward enemy at (350, 100)
       ↓
3. Approaching river at (350, 420)
       ↓
4. DETECT: Would cross river at X=350!
       ↓
5. X=350 is NOT on bridge ❌
       ↓
6. Unit diverts to nearest bridge
       ↓
7. Routes to LEFT BRIDGE (150, 400)
       ↓
8. Crosses via bridge ✅
       ↓
9. Continues to target
```

### Example 3: Drowning State

```
Unit at (300, 400) - In river zone but off-bridge

Detection:
isInRiverZone(400)     ✅ true
isBridgeCrossing(300)  ❌ false
→ isUnitDrowning()     ✅ TRUE

Visual Effects:
- Blue aura around unit
- 60% opacity (semi-transparent)
- Damage: 2 HP per frame
- Speed: 30% slow
```

---

## 📊 Bridge Crossing Validation Flowchart

```
                    ┌─ Start: Unit at (X, Y)
                    │
                    ↓
        Is Y in river zone (380-420)?
        ┌───────────────┬───────────┐
        │ NO            │ YES       │
        ↓               ↓
    SAFE: Can    Is X on bridge?
    move freely  ┌──────────┬──────────┐
                 │ YES      │ NO       │
                 ↓          ↓
            SAFE:    DROWNING:
            Cross    - Take damage
            river    - Slow effect
                     - Visual aura
                     - Blue overlay
```

---

## 🌊 River Animation System

### Wave Pattern
```
Y Displacement over time:

Amplitude: 3px
Frequency: 0.02 (20px wavelength equivalent)

    │  ╱╲       ╱╲
  3 │ ╱  ╲     ╱  ╲    ← Wave amplitude
    │╱    ╲   ╱    ╲
  0 ├──────╲─╱──────╲──  ← River Y=400
    │      ╲╱        ╲
 -3 │                ╲   ← Wave amplitude (below)
    ├────────────────────
    0  50  100  150  200    X Position (pixels)
```

### Particle Animation
```
5 Water Droplets flowing across river:

Time T=0:       Time T=1:       Time T=2:
  •             •              •      
    •             •             •    
      •             •             •  
        •             •             • 
          •             •             •


Pattern: Horizontal flow + vertical sine wave bobbing
Direction: Left to right (continuously looping)
Speed: time * 0.05 (pixel position)
```

---

## 🎨 Color Palette Reference

| Element | Color | RGB | Use |
|---------|-------|-----|-----|
| River (Light) | #1a5f9f | 26, 95, 159 | Water gradient top |
| River (Dark) | #0a4f8f | 10, 79, 143 | Water gradient center |
| Bridge Base | #8B6914 | 139, 105, 20 | Wooden plank color |
| Bridge Edge | #D4A574 | 212, 165, 116 | Plank highlight |
| Wave Color | RGBA(200, 220, 255, 0.3) | Light blue | Water waves |
| Particle Color | RGBA(150, 200, 255, 0.3) | Blue | Water droplets |
| Drowning Aura | RGBA(100, 150, 200, 0.4) | Blue | Unit danger indicator |
| Lane Line | RGBA(100, 150, 180, 0.15) | Light blue | Lane boundary |
| Background (Enemy) | #1a2844 | 26, 40, 68 | Enemy territory |
| Background (River) | #2a3f5f | 42, 63, 95 | River region |
| Background (Player) | #1a2844 | 26, 40, 68 | Player territory |

---

## 📏 Dimension Summary Table

| Dimension | Value | Details |
|-----------|-------|---------|
| Canvas Width | 800px | Full width |
| Canvas Height | 800px | Full height |
| Left Lane | 267px | X: 0-267 |
| Center Lane | 266px | X: 267-533 |
| Right Lane | 267px | X: 533-800 |
| Enemy Territory | 400px | Y: 0-400 |
| Player Territory | 400px | Y: 400-800 |
| River Center | Y: 400 | Horizontal divider |
| River Zone | 40px | Y: 380-420 |
| River Collision | ±20px | From Y: 400 |
| Bridge Width | 80px | Both bridges |
| Bridge Height | 40px | Perpendicular |
| Left Bridge X | 150px | Center point |
| Right Bridge X | 470px | Center point |
| Left Bridge Range | 110-190px | X: 150±80÷2 |
| Right Bridge Range | 430-510px | X: 470±80÷2 |

---

## 🔄 Game Loop Integration

```
Game Update (33ms frames)
    │
    ├─ 1. Update Game State
    │      └─ Calculate game time
    │      └─ Update elixir
    │      └─ Check win conditions
    │
    ├─ 2. Update Units
    │      ├─ Calculate target
    │      ├─ Move unit toward target
    │      │   └─ Check isBridgeCrossing(x)
    │      │   └─ Check isInRiverZone(y)
    │      │   └─ Apply drowning effects
    │      └─ Update animations
    │
    ├─ 3. Update Towers
    │      ├─ Scan for targets
    │      ├─ Attack units in range
    │      └─ Update health
    │
    ├─ 4. Render Arena
    │      ├─ Clear canvas
    │      ├─ Draw background
    │      ├─ Draw river (animated)
    │      ├─ Draw bridges
    │      ├─ Draw towers
    │      ├─ Draw units
    │      │   └─ Show drowning state if needed
    │      └─ Draw UI
    │
    └─ 5. Request Next Frame
           → Next game update in 33ms
```

---

## ✅ Implementation Checklist with Visuals

```
Feature                    Status    Visual Reference
────────────────────────────────────────────────────
✅ 800×800 Canvas          DONE      Full grid shown
✅ 3-Lane System           DONE      Left | Center | Right
✅ Horizontal River        DONE      Animated 🌊🌊🌊
✅ Left Bridge             DONE      🌉 at X=150
✅ Right Bridge            DONE      🌉 at X=470
✅ River Zone Detection    DONE      Y: 380-420 band
✅ Bridge Crossing Check   DONE      isBridgeCrossing()
✅ Drowning Detection      DONE      isUnitDrowning()
✅ Wave Animation          DONE      Flowing water ≈
✅ Particle Effects        DONE      Water droplets •
✅ Tower Positioning       DONE      6 towers placed
✅ Unit Rendering          DONE      Green & Red circles
✅ Professional Aesthetics DONE      Medieval theme
```

---

This visual reference provides complete documentation of the arena layout, bridge system, pathfinding mechanics, and rendering pipeline.

**Status**: ✅ Complete
