# Tower System Visual Reference & Diagrams 🎯
**Quick visual guide for understanding tower mechanics at a glance**

---

## 📐 Arena Layout (600px × 800px)

```
┌──────────────────────────────────────────────────────┐ y: 0
│                   ENEMY SIDE (Top)                   │
│                                                      │
│                 450px ← → 150px                      │
│  ◄──── 300px Lane ─────► ◄──── 300px Lane ────►    │
│                                                      │
│     (120,120)         (300,60)       (480,120)      │
│        [PL]             [KE]            [PR]        │
│     PRINCESS         KING TOWER      PRINCESS       │
│   x: 0–300px      CENTER            x: 300–600px   │
│                                                      │
│                    OVERLAP: 150px each side          │
│                                                      │
├──────────────────────────────────────────────────────┤ y: 400
│                   NEUTRAL ZONE                       │
│              (Troops clash here)                     │
├──────────────────────────────────────────────────────┤ y: 400
│                                                      │
│      (120,680)        (300,740)      (480,680)      │
│        [PP]             [KP]            [PP]        │
│     PRINCESS         KING TOWER      PRINCESS       │
│   x: 0–300px      CENTER            x: 300–600px   │
│                                                      │
│                 450px ← → 150px                      │
│  ◄──── 300px Lane ─────► ◄──── 300px Lane ────►    │
│                                                      │
│                   PLAYER SIDE (Bottom)              │
└──────────────────────────────────────────────────────┘ y: 800
  0                  150     300     450              600
```

### Key Measurements
```
Arena Width:        600px
Arena Height:       800px
Lane Width:         300px each
Princess Spacing:   360px (120 to 480)
Left Princess X:    120px (40% from left edge)
Right Princess X:   480px (80% from left edge)
King X:             300px (center)
Range Coverage:     Each Princess covers ~58% horizontally
Center Overlap:     150px each side (both princess can hit center)
```

---

## 🔄 King Tower State Machine (Visual)

```
                    ┌─────────────────┐
                    │     START       │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │    INACTIVE     │
                    │  (50% opacity)  │
                    │  • No attacks   │
                    │  • Grayed-out   │
                    └────────┬────────┘
                             │
                    ┌────────┴────────┐
                    │                 │
                    ▼                 ▼
          TRIGGER 1: TRIGGER 2:
        Princess.destroyed   King.hp takes damage
           OR any Princess   (even 1 point)
            destroyed         
                    │                 │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │   AWAKENING     │
                    │  (0.0–0.6 sec)  │
                    │  • Fade in      │
                    │  • Immune to dmg│
                    │  • No attacks   │
                    │  • Glow effect  │
                    └────────┬────────┘
                             │
                          (0.6s)
                             │
                             ▼
                    ┌─────────────────┐
                    │     ACTIVE      │
                    │ (100% opacity)  │
                    │ • Attacks every │
                    │   1.5 seconds   │
                    │ • Full opacity  │
                    │ • Golden glow   │
                    └─────────────────┘
                             │
                      (stays here forever)
                      or until destroyed
```

### State Transition Rules

```
INACTIVE → AWAKENING
  Trigger:
    a) princess.destroyed = true (any princess)
    b) king.hp takes damage (any amount > 0)
  
  Cannot interrupt:
    • King is immune during this phase
    • Must complete 0.6 seconds
    • Other attacks queued, processed after
  
  Cannot reverse:
    • If awakening completes, cannot go back to INACTIVE
    • Must reach 'active' state

AWAKENING → ACTIVE
  Trigger:
    • now - activationTime >= 0.600 seconds
  
  Automatic:
    • No manual trigger needed
    • Happens automatically in game loop
    • Visual glow settles to idle state

ACTIVE → (no reverse)
  Cannot go back to INACTIVE or AWAKENING
  Stays active until destroyed or game ends
```

---

## 🎯 Target Finding Algorithm (Visual)

```
STEP 1: Collect All Units
┌────────────────────────────────┐
│ allUnits = [Unit1, Unit2, ...] │
└────────────────────────────────┘
         │
         ▼
STEP 2: Filter by Range
┌─────────────────────────────────────────┐
│ For each unit:                          │
│   distance = √(Δx² + Δy²)              │
│   if distance ≤ tower.range:            │
│      inRangeUnits.push(unit)            │
└─────────────────────────────────────────┘
         │
         ▼
   ┌─────────────┐
   │ Any in range? │
   └──────┬──────┘
          │
      ┌───┴───┐
    NO│       │YES
      ▼       ▼
   SKIP    STEP 3
   TOWER
      
STEP 3: Find Closest (Troops First)
┌──────────────────────────────────┐
│ Priority:                        │
│ 1. Filter for troops only        │
│ 2. Sort by distance (ascending)  │
│ 3. Select first (closest)        │
│ 4. If tie: use spawn order       │
└──────────────────────────────────┘
         │
         ▼
   ┌─────────────┐
   │ Troops found? │
   └──────┬──────┘
          │
      ┌───┴───┐
    YES│       │NO
      ▼       ▼
  TARGET   Filter buildings
  TROOP   (repeat step 3)
          │
          ▼
      ┌─────────────┐
      │ Building found?│
      └──────┬──────┘
             │
         ┌───┴───┐
       YES│       │NO
         ▼       ▼
     TARGET    SKIP
     BUILD     TOWER
```

### Distance Calculation Example

```
Tower:  (300, 740)
Unit1:  (300, 500)
Unit2:  (200, 600)

Distance to Unit1:
  Δx = 300 - 300 = 0
  Δy = 500 - 740 = -240
  d = √(0² + (-240)²) = √57600 = 240px
  240px ≤ 350px range? ✓ IN RANGE

Distance to Unit2:
  Δx = 200 - 300 = -100
  Δy = 600 - 740 = -140
  d = √((-100)² + (-140)²) = √29600 ≈ 172px
  172px ≤ 350px range? ✓ IN RANGE

Which is closer?
  Unit2 (172px) < Unit1 (240px) → SELECT Unit2
```

---

## ⚔️ Combat Flow (Per Frame)

```
─────────────────────────────────────────────
             GAME LOOP FRAME
─────────────────────────────────────────────

                   ▼
          ┌─────────────────┐
          │  For Each Tower │
          └────────┬────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │ Check State:         │
        │ • Is tower ACTIVE?   │
        │ • Is tower alive?    │
        └────────┬─────────────┘
                 │
             ┌───┴───┐
          NO │       │YES
             ▼       ▼
           SKIP   Continue
           TOWER
                 │
                 ▼
        ┌──────────────────────┐
        │ Check Cooldown:      │
        │ Now - lastAttackTime │
        │ ≥ attackSpeed?       │
        └────────┬─────────────┘
                 │
             ┌───┴───┐
          NO │       │YES
             ▼       ▼
           WAIT   Continue
                 │
                 ▼
        ┌──────────────────────┐
        │ Find Target:         │
        │ Nearest unit in range│
        │ (Troops priority)    │
        └────────┬─────────────┘
                 │
             ┌───┴───┐
          NO │       │YES
             ▼       ▼
           WAIT   Continue
           (idle) │
                 ▼
        ┌──────────────────────┐
        │ Apply Damage:        │
        │ target.hp -= damage  │
        │ Clamp: max(0, hp)    │
        └────────┬─────────────┘
                 │
                 ▼
        ┌──────────────────────┐
        │ Check Destroyed:     │
        │ if hp ≤ 0:           │
        │  destroyed = true    │
        │  OnUnitDestroyed()   │
        └────────┬─────────────┘
                 │
                 ▼
        ┌──────────────────────┐
        │ Reset Cooldown:      │
        │ lastAttackTime = now │
        └─────────────────────┘
```

---

## 💚 HP Color Coding System

```
MAX HP ─────────────────────────────────── 0 HP
100% │                                    │
     │◄─────────── GREEN ──────────►      │
 75% ├────────────────────────────────────┤
     │◄────── YELLOW ──────►              │
 25% ├────────────────────────────────────┤
     │◄── RED ──►                         │
  0% ├────────────────────────────────────┤
     └────────────────────────────────────┘

Example: Princess Tower (1800 HP)
┌─────────────────────────────────────┐
│ 1800 HP (100%) │ GREEN    │ ✓ Safe  │
│ 1350 HP ( 75%) │ GREEN/YEL│ Caution │
│  900 HP ( 50%) │ YELLOW   │ ⚠ Risk  │
│  450 HP ( 25%) │ YELLOW/RE│ ⚠ Risk  │
│  150 HP (  8%) │ RED      │ 🔴 CRIT │
│    0 HP (  0%) │ DARK RED │ ☠ DEAD  │
└─────────────────────────────────────┘
```

---

## 🏆 Win Condition Decision Tree

```
                    GAME OVER?
                        │
              ┌─────────┴─────────┐
              │                   │
              ▼                   ▼
        King.destroyed?    gameTime ≥ 180s?
              │                   │
          ┌───┴───┐           ┌───┴───┐
        YES│      │NO       YES│      │NO
          ▼      ▼            ▼      ▼
       INSTANT CONTINUE      Check   CONTINUE
       LOSS             Scores    (game ongoing)
          │
          ▼
    Who destroyed King?
          │
      ┌───┴───┐
      │       │
    PLAYER  ENEMY
      │       │
      ▼       ▼
    ENEMY    PLAYER
    WINS     WINS
    (Instant)


At 180 seconds (Time-Based):
                        
                    Count Destroyed
                    ┌──────┴──────┐
                    │             │
              playerScore    enemyScore
              (0-5 pts)      (0-5 pts)
                    │             │
              ┌─────┴─────────────┴─────┐
              │                         │
          ┌───┴───┐         ┌───────┐  │  ┌───────┐
        p<e│      │p=e    p>e│       │  │  │       │
         ▼ ▼      ▼        ▼        ▼  ▼  ▼       ▼
       PLAYER  OVERTIME  ENEMY   PLAYER ENEMY   DRAW
       WINS    (30s)     WINS    WINS   WINS    (rare)


Overtime (Sudden Death):
        
        ┌─────────────────────────────────┐
        │  Waiting for any tower destroyed│
        │  (max 30s)                      │
        ├─────────────────────────────────┤
        │                                 │
        ▼ (Tower destroyed)      ▼ (30s timeout)
    Player loses tower       Draw (both alive)
         │                          │
         ▼                          ▼
    ENEMY WINS              DRAW (rare)
    (Sudden Death)          (Stalemate)
```

---

## 🎬 King Activation Animation (0.6 seconds)

```
TIME:    0ms           300ms          600ms
         │             │              │
         ├─────────────┼──────────────┤
         │             │              │
      START         PEAK           END
         │             │              │
         ▼             ▼              ▼
    ┌─────────┐  ┌──────────┐  ┌─────────┐
    │ 50%     │  │ 100%     │  │ 100%    │
    │ opacity │  │ opacity  │  │ opacity │
    │         │  │ + glow   │  │ (idle)  │
    │ Start   │  │ Peak     │  │ Active  │
    │ glow    │  │ pulse    │  │ ready   │
    └─────────┘  └──────────┘  └─────────┘
       │            │               │
       ├────────────┼───────────────┤
       │            │               │
    PHASE 1: Fade In (0-300ms)   LINEAR
    PHASE 2: Peak Glow (300-600ms) LINEAR
    
Events:
  0ms:   activationState = 'awakening'
         activationTime = now
         Opacity fade starts
         Glow effect begins
         Audio: Bell toll begins (fade in)
         
300ms:   Glow reaches peak brightness
         Particles burst outward
         Audio: Bell reaches crescendo
         Screen: 20% brightness flash
         
600ms:   activationState = 'active'
         Opacity reaches 100%
         Glow settles to idle state
         Audio: Bell toll ends
         King can now attack
         
Result: Player has 0.6s "window of opportunity" to push
        before King becomes fully active defender
```

---

## 📊 Tower DPS Comparison

```
┌──────────────────────────────────────────────┐
│ Defensive Firepower Curve (DPS)              │
└──────────────────────────────────────────────┘

DPS
 │     ┌─────────────────┐
 │     │   Both Active   │
180│     │ (After King)    │
 │     │ P_R: 64 + K: 100│
 │     │ = 164 DPS       │
 │    ╱└─────┐            
 │   │       │            
 │   │       └────────────┐
160│   │                  │ Slight drop during
 │   │                    │ awakening
 │   │                    │
140│   │ P-L + P-R        │
 │   │ 128 DPS           │  
 │   │ (Normal)          │
 │   │                   │
120│   │         ╲╱╲      │ Dip when 
 │───┼──────────╲───────┤ princess dies
 │ 0│ 1m  2m  2:30  3m  │ then King
 │   │                   │ activates
  └───┴──────────────────┴──
     Game Time (Minutes)

Key Inflection Points:
  t=0:00    Princess towers active (128 DPS)
  t=2:30    Princess destroyed (example)
            King activation begins (0.6s window)
  t=2:31    King fully active (164 DPS peak)
  t=3:00    Game end (win by score or overtime)
```

---

## 🎮 Multi-Tower Focus Fire Scenario

```
Scenario: Large unit at center, both princesses active

┌─────────────────────────────────────────────┐
│  Tower Range Coverage (350px each)          │
│                                             │
│  Princess Left     Princess Right           │
│     (120,680)         (480,680)             │
│        ●                  ●                 │
│       / \                / \                │
│      /   \  R:350px    /   \  R:350px      │
│     /     \          /     \               │
│  ╱▔▔▔╲     ╱▔▔▔╲ ╱▔▔▔╲     ╱▔▔▔╲         │
│ │      \  / UNIT \  /     │                │
│ │       ╲/       ╲/       │                │
│  ╲▔▔▔╱   ╲ (300,500) ╲▔▔▔╱                │
│   \     /\         /\     /                │
│    \   /  \       /  \   /                 │
│     \ /    R:350 /    \ /                  │
│      ●─────────────────●                   │
│   (120,680)        (480,680)               │
└─────────────────────────────────────────────┘

Distance Calculations:
Left Tower to Unit:
  √((300-120)² + (500-680)²) = √(32400 + 32400) = 255px
  ✓ IN RANGE (255 ≤ 350)

Right Tower to Unit:
  √((300-480)² + (500-680)²) = √(32400 + 32400) = 255px
  ✓ IN RANGE (255 ≤ 350)

Result: BOTH TOWERS ATTACK SIMULTANEOUSLY
  Frame N: Left -80 HP
  Frame N: Right -80 HP
  Total:   Unit takes 160 damage in one frame
  
Unit HP: 200
  200 - 160 = 40 HP remaining
  Or if Unit had 160 HP: Instant kill (0 → destroyed)

Player Decision Point:
  "Should I push the center with my 160 HP unit?"
  Risk: Both towers = 160 damage instant
  Reward: If I push sides, only 1 tower attacks = safer
```

---

## 🔄 Game Flow Timeline (Example Match)

```
TIME    GAME STATE                  TOWERS STATE
────────────────────────────────────────────────────────────
0:00    Game starts                 P_L: ✓ Active
                                    P_R: ✓ Active
                                    K:   ✗ Inactive
                                    Total: 128 DPS

1:00    Players spawn troops        (No changes)
        Early skirmishes            128 DPS defense

2:00    First tower hit             P_L: 1200 HP (↓600)
        Intense mid-game            P_R: ✓ Active
                                    K:   ✗ Inactive
                                    Total: 64 DPS (weakened!)

2:30    Princess Left destroyed!    P_L: ✗ DESTROYED
        King activates              P_R: ✓ Active
        0.6s awakening window       K:   ⟳ AWAKENING
                                    Total: 64 DPS (window!)
                                    
2:31    King fully active           P_L: ✗ Dead
                                    P_R: ✓ Active
                                    K:   ✓ Active
                                    Total: 164 DPS (comeback!)

3:00    GAME OVER - Time's Up       Check tower scores
        
        Scoring:
        Player: 1 princess destroyed = 1 point
        Enemy:  1 princess destroyed = 1 point
        
        Result: OVERTIME! 30 sec sudden death

3:15    (Overtime)                  First tower destroyed
        Enemy destroys P_R          → Enemy team loses
                                    → Player team WINS!

3:15    GAME END                    
        PLAYER VICTORY
```

---

## 🎯 HP Bar Visual Examples

```
PRINCESS TOWER - Full Health (1800/1800)
┌──────────────────────────────────────────┐
│ [████████████████████████████] 1800/1800 │  GREEN
│ 100% HP - Safe                           │
└──────────────────────────────────────────┘

PRINCESS TOWER - Half Health (900/1800)
┌──────────────────────────────────────────┐
│ [████████████            ] 900/1800      │  YELLOW
│ 50% HP - Caution                         │
└──────────────────────────────────────────┘

PRINCESS TOWER - Critical (180/1800)
┌──────────────────────────────────────────┐
│ [██                     ] 180/1800       │  RED
│ 10% HP - CRITICAL                        │
└──────────────────────────────────────────┘

KING TOWER - Inactive (3500/3500)
┌──────────────────────────────────────────┐
│ [░░░░░░░░░░░░░░░░░░░░░░] 3500/3500      │  GRAY (50% opacity)
│ 100% HP - INACTIVE (Grayed Out)         │
└──────────────────────────────────────────┘

TOWER - Destroyed
┌──────────────────────────────────────────┐
│ [░░░░░░░░░░░░░░░░░░░░░░] 0/1800        │  DARK RED
│ DESTROYED - No longer defending          │
└──────────────────────────────────────────┘
```

---

## 📍 Range Visualization (350px Princess, 400px King)

```
Princess Tower Range (350px):
                      
                    350px radius
                        │
                   ╱────┼────╲
                 ╱       │       ╲
               ╱         │         ╲
             ╱           │           ╲
            │      PrincessL         │
            │     (120, 680)         │
            │            *           │
             ╲           │           ╱
              ╲          │          ╱
                ╲        │        ╱
                  ╲      │      ╱
                    ╲────┼────╱
                       350px

Range Coverage (Width):
  Left Edge:  120 - 350 = -230 (off-map)
  Right Edge: 120 + 350 = 470 (covers right lane)
  Vertical:   Covers top 350px + bottom 350px

Coverage %:
  ├─ Top Lane:    100% (smaller tower)
  ├─ Bottom Lane: ~80% (mostly right side)
  └─ Overlap:     150px in center


King Tower Range (400px):
                      
                    400px radius
                        │
                   ╱────┼────╲
                 ╱       │       ╲
               ╱         │         ╲
             ╱           │           ╲
            │      King              │
            │    (300, 740)          │
            │        *               │
             ╲       │              ╱
              ╲      │             ╱
                ╲    │           ╱
                  ╲  │         ╱
                    ╲┼────────╱
                      400px

Range Coverage (Width):
  Left Edge:  300 - 400 = -100 (off-map, but wider)
  Right Edge: 300 + 400 = 700 (off-map on right)
  Vertical:   Covers full arena height

Coverage %:
  ├─ Both Lanes: 100% (center position)
  ├─ Overlap:    Full coverage when active
  └─ Benefit:    Activates late, then full protection
```

---

## ⚠️ Edge Case Examples (Visual)

### Edge Case 1: Tower Range Boundary

```
Tower at (300, 740)      Unit at (300, 388)
Range: 350px

Distance = |740 - 388| = 352px
Question: Can tower hit?

Threshold Comparison:
  352px > 350px range
  ✗ OUT OF RANGE (just barely!)
  
But if unit moves 2px up:
  350px = 350px range
  ✓ IN RANGE (exact boundary)
  
Comparison: distance ≤ range (use ≤, not <)
```

### Edge Case 2: Multi-Tower Simultaneous Kill

```
Unit HP: 160
Tower A: 80 damage
Tower B: 80 damage

Frame N (simultaneous):
  ├─ Tower A fires: 160 - 80 = 80 HP remaining
  ├─ Tower B fires: 80 - 80 = 0 HP remaining
  └─ Unit destroyed (both damage applied)

After Death:
  ├─ Tower A: target = null (unit removed)
  ├─ Tower B: target = null (same unit removed)
  ├─ Event logged: "tower_attack" (Tower A)
  ├─ Event logged: "tower_attack" (Tower B)
  └─ Event logged: "unit_destroyed" (once)
```

---

## 🎓 Learning Path (Mental Model)

```
START: New player learns Tower System

1. BASIC AWARENESS
   └─ "There are 3 towers per side"
   └─ "They attack things automatically"

2. DEFENSIVE UNDERSTANDING
   └─ "Both Princess towers are active"
   └─ "King Tower is grayed out at start"

3. ACTIVATION LEARNING
   └─ "King activates when princess dies"
   └─ "King glows for a moment (0.6s)"

4. TACTICAL DEPTH
   └─ "I can rush during King's 0.6s window"
   └─ "Clustering units is risky (multi-tower)"
   └─ "King in center, Princess on sides"

5. MASTERY (Advanced)
   └─ "I count exact HP and tower damage"
   └─ "I time my pushes to King activation"
   └─ "I use range advantage (lanes vs center)"
   └─ "I understand focus-fire zones"

Result: Player develops positional strategy
        Tower system teaches map control
```

---

**These diagrams complement the written documentation. Print and refer to during:**
- Design reviews (confirm everyone visualizes same system)
- Code implementation (pseudocode matches diagrams)
- Playtesting (explain mechanics to new players)
- Balance discussions (visualize DPS curves, range coverage)

---

**Last Updated:** 2025  
**Version:** 2.0 (Clash Royale-aligned)  
**Status:** ✅ Ready for Production
