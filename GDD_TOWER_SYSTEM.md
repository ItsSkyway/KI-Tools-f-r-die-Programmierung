# Game Design Document: Tower System & Tower Cooperation
**Version:** 2.0 (Clash Royale-aligned)  
**Last Updated:** 2025  
**Status:** Implementation Ready

---

## 📋 Executive Summary

The Tower System is the **core defensive pillar** of the game. Towers punish aggressive pushes, create strategic positioning tradeoffs, and activate based on threat level. The three-tower setup (1 King + 2 Princess) creates emergent defensive coverage patterns.

**Design Pillars:**
1. **Graduated Threat Response** - King Tower activates only when needed, rewarding precise positioning
2. **Spatial Strategy** - Lane coverage forces tradeoffs between push efficiency and safety
3. **Long-term Consequence** - Tower destruction is permanent, raising stakes as game progresses
4. **Cooperative Defense** - Multiple towers can focus fire, creating skill-based threat assessment

---

## 🎮 Core Mechanic: Tower State Machine

### Tower Activation States

```
┌─────────────────────────────────────────────────────┐
│  TOWER STATE MACHINE (Clash Royale)                 │
└─────────────────────────────────────────────────────┘

PRINCESS TOWER:
  ├─ ACTIVE (always)
  │   ├─ Attack: Auto-fires at nearest enemy in 350px range
  │   ├─ Target Priority: Troops > Buildings > Spells (none in v1)
  │   └─ HP: 1800 (player), 1800 (enemy) [PLACEHOLDER: test at 1500/2000]
  └─ DESTROYED (hp ≤ 0)
      └─ Effect: Grayed-out, no attacks, visual rubble

KING TOWER:
  ├─ INACTIVE (game start)
  │   ├─ Visual State: Grayed-out, 50% opacity
  │   ├─ No Attacks
  │   ├─ Activation Trigger:
  │   │   a) ANY Princess Tower hp ≤ 0, OR
  │   │   b) King Tower itself takes damage
  │   └─ Behavior: Cannot be damaged while inactive
  │       (Exception: Direct tower damage via buildings → can activate)
  │
  ├─ AWAKENING (activation frame)
  │   ├─ Duration: 0.6s
  │   ├─ Animation: "Glow out" effect, audio cue
  │   ├─ Game Effect: Immune to attack during this frame
  │   └─ Next State → ACTIVE
  │
  └─ ACTIVE
      ├─ Visual State: Full opacity, glowing
      ├─ Attack: Auto-fires at nearest enemy in 400px range
      ├─ Damage: 100 (vs 80 princess damage)
      ├─ Attack Speed: 1.5s cooldown (vs 1.25s princess)
      ├─ Target Priority: Troops > Buildings > Spells (none in v1)
      └─ State Locked: Cannot return to INACTIVE
          (Must reach game end or be destroyed)
```

**State Transition Rules:**
- Princess: ACTIVE → DESTROYED (one-way)
- King: INACTIVE → AWAKENING → ACTIVE (one-way)
- King: AWAKENING cannot be interrupted (attack-immune frame)

---

## 🎯 Tower Positions (Clash Royale Exact)

### Arena Coordinate System
```
    ┌─────────────────────────────────────┐ y: 0
    │      ENEMY SIDE (Top Lane)          │
    │                                     │
    │  (120,120)    (300,60)   (480,120) │
    │    [PL]        [KE]        [PR]    │
    │                                     │
    │  ◄─── 600px wide ───────────────►  │
    │  ◄─ 300px lane ─► ◄─ 300px lane ─► │
    │                                     │
    │                                     │ y: 400 (neutral)
    │                                     │
    │  ◄─ 300px lane ─► ◄─ 300px lane ─► │
    │                                     │
    │                                     │
    │  (120,680)   (300,740)  (480,680)  │
    │    [PP]        [KP]       [PP]     │
    │      PLAYER SIDE (Bottom)           │
    └─────────────────────────────────────┘ y: 800
```

### Tower Layout Table

| Tower         | Owner  | X     | Y   | Type          | HP   | Range | DMG | Atksp  |
|---------------|--------|-------|-----|---------------|------|-------|-----|--------|
| King          | Player | 300   | 740 | King          | 3500 | 400   | 100 | 1.5s   |
| Princess Left | Player | 120   | 680 | Princess      | 1800 | 350   | 80  | 1.25s  |
| Princess Right| Player | 480   | 680 | Princess      | 1800 | 350   | 80  | 1.25s  |
| King          | Enemy  | 300   | 60  | King (INACTIVE)| 3500 | 400   | 100 | 1.5s   |
| Princess Left | Enemy  | 120   | 120 | Princess      | 1800 | 350   | 80  | 1.25s  |
| Princess Right| Enemy  | 480   | 120 | Princess      | 1800 | 350   | 80  | 1.25s  |

**Rationale:**
- **Symmetry:** Player and Enemy layouts are vertically mirrored (player is bottom, enemy is top)
- **Spacing:** Princess towers 360px apart (covers both lanes with 150px overlap each)
- **Depth:** King towers 100-150px behind princess towers (safer position)
- **Range Coverage:** 350px range = ~58% of 600px arena width → forces choice of lane

---

## ⚔️ Tower Combat System

### Attack Flow Chart

```
┌─────────────────────────────────────┐
│ Game Loop: Process Tower Attacks    │
└──────────────────────────────────────┘
              ↓
   ┌─────────────────────────────┐
   │ For Each Tower (ACTIVE):    │
   ├─ King Tower (if ACTIVE)     │
   ├─ Princess Left (always)     │
   └─ Princess Right (always)    │
              ↓
   ┌─────────────────────────────┐
   │ Check Attack Cooldown       │
   │ now - lastAttackTime        │
   │ ≥ tower.attackSpeed?        │
   └─────────────────────────────┘
         Yes ↓            ↓ No
         ┌──┴────┐      [Skip]
         │        │
    ┌────▼───────▼─────────────┐
    │ Find Target in Range      │
    │ (150px [PLACEHOLDER])     │
    │ Priority:                 │
    │ 1. Troops (closest)       │
    │ 2. Buildings              │
    │ 3. Spells (v2)            │
    └────┬──────────────────────┘
         │ No Target
         ├─────────────→ [Wait]
         │
         │ Target Found
         ▼
    ┌────────────────────────┐
    │ Apply Damage           │
    │ damage = tower.damage  │
    │ target.hp -= damage    │
    │ 0-frame effect (no RNG)│
    └────┬───────────────────┘
         │
         ▼
    ┌────────────────────────┐
    │ Check Destruction      │
    │ if target.hp ≤ 0:      │
    │   target.destroyed=true│
    │   target.hp = 0 (clamp)│
    │   Trigger effects      │
    └────────────────────────┘
         │
         ▼
    ┌────────────────────────┐
    │ Reset Attack Timer     │
    │ lastAttackTime = now   │
    └────────────────────────┘
```

### Attack Range & Targeting

**Range Calculation:**
```javascript
distance = Math.hypot(
  tower.x - target.x,
  tower.y - target.y
)
canAttack = distance ≤ tower.range
```

**Range Values (Clash Royale-aligned):**
- **Princess Towers:** 350px (covers lanes + some overlap)
- **King Tower:** 400px (deeper reach, but activated later)
- **Target Priority:** 
  1. **Troops** (default) - highest threat
  2. **Buildings** (if any) - secondary threat
  3. **Spells** (future) - lowest priority, rare

**Targeting Behavior:**
```
Multiple Valid Targets in Range?
  → Select CLOSEST target (Euclidean distance)
  → Tie-break: By spawn order (older units attacked first)
```

**Range Visualization at Game Start:**
```
Princess Tower at (120, 680) with 350px range:
  ├─ Circles coverage:
  │  ├─ Circle Center: (120, 680)
  │  ├─ Radius: 350px
  │  ├─ Left Edge: x = -230 (off-map)
  │  ├─ Right Edge: x = 470 (covers right lane)
  │  ├─ Top Edge: y = 330
  │  └─ Bottom Edge: y = 1030 (off-map)
  │
  └─ Effective Coverage: Both lanes + central area

King Tower at (300, 740) with 400px range:
  └─ Overlaps both princess towers (multi-tower focus fire)
```

---

## 🛡️ Tower Cooperation: Multi-Tower Focus Fire

### Targeting Coordination (Emergent, Not Hard-coded)

**Design:** Towers target independently; cooperation emerges from shared proximity.

#### Scenario 1: Single Large Troop (e.g., P.E.K.K.A, 10 HP)
```
POSITION:
  Tower A (Princess Left): (120, 680), range 350px
  Tower B (Princess Right): (480, 680), range 350px
  Troop: (300, 400), HP 10

CALC:
  Tower A to Troop: √((300-120)² + (400-680)²) = √(32400 + 78400) = 333px ✓ in range
  Tower B to Troop: √((300-480)² + (400-680)²) = √(32400 + 78400) = 333px ✓ in range

RESULT: Both towers attack simultaneously
  ├─ Tower A attacks: -80 HP
  ├─ Tower B attacks: -80 HP (same frame)
  ├─ Total: -160 HP
  └─ Troop: Destroyed in 0.08s (instant death)

PLAYER DECISION: Do I risk pushing the center, or play around the edge?
```

#### Scenario 2: Two Separate Troops (Different Lanes)
```
POSITION:
  Tower A (Princess Left): (120, 680), range 350px
  Tower B (Princess Right): (480, 680), range 350px
  Troop 1 (top lane): (150, 350)
  Troop 2 (bottom lane): (450, 350)

CALC:
  Tower A to Troop 1: √((150-120)² + (350-680)²) = 330px ✓ in range
  Tower B to Troop 1: √((150-480)² + (350-680)²) = 481px ✗ OUT OF RANGE
  Tower A to Troop 2: √((450-120)² + (350-680)²) = 481px ✗ OUT OF RANGE
  Tower B to Troop 2: √((450-480)² + (350-680)²) = 330px ✓ in range

RESULT: Each tower targets nearest troop in its lane
  ├─ Tower A → Troop 1
  └─ Tower B → Troop 2

PLAYER DECISION: Single-lane vs multi-lane pushes have different difficulty curves.
```

#### Scenario 3: King Tower Activation

```
BEFORE:
  ├─ Princess Left: 1800 HP (ACTIVE)
  ├─ Princess Right: 1800 HP (ACTIVE)
  └─ King: 3500 HP (INACTIVE, grayed-out)

TRIGGER: Enemy destroys Princess Left
  ├─ Princess Left: HP → 0, destroyed=true
  ├─ King: Activation triggered
  └─ Event: King Tower "Awakens"
       ├─ Visual: Glow out effect (0.6s)
       ├─ Audio: Deep bell/horn sound
       └─ Game: Attack-immune during animation

AFTER AWAKENING:
  ├─ Princess Left: DESTROYED (no attacks)
  ├─ Princess Right: ACTIVE (80 dmg, 1.25s)
  ├─ King: ACTIVE (100 dmg, 1.5s, 400px range)
  └─ Total Firepower: ↑ +100 DPS effectively (King enters)

STRATEGY SHIFT:
  ├─ Player loses left lane defense
  ├─ King provides deeper coverage
  ├─ Enemy must push right lane harder
  └─ Game enters "late game" phase (comeback potential)
```

### Cooperation Formula (Not Coded, Design Intent)

```
Total Defensive Firepower = Active Tower DPS
  = Σ (tower.damage / tower.attackSpeed) for all ACTIVE towers

Example at Game Start:
  ├─ Princess Left: 80 / 1.25 = 64 DPS
  ├─ Princess Right: 80 / 1.25 = 64 DPS
  └─ TOTAL: 128 DPS (King INACTIVE)

Example After 1 Princess Destroyed:
  ├─ Princess Right: 80 / 1.25 = 64 DPS
  ├─ King: 100 / 1.5 = 66.7 DPS
  └─ TOTAL: 130.7 DPS (slight increase, but positional change)

INSIGHT: King activation doesn't over-power defender, just shifts lanes.
```

---

## 💚 Tower Health & Visual Representation

### Health Bar Display

**Always Visible (Above Each Tower):**
```
┌──────────────────────────┐
│ HP Bar Specification     │
├──────────────────────────┤
│ Width: 60px              │
│ Height: 8px              │
│ Position: Above tower    │
│ Color: Green → Yellow → Red scale
│ Text: "HP / MaxHP" (small font)
│
│ Update Rate: Every frame (60 Hz)
│ Fade Out: 2s after not damaged
│ Tooltip: Shows on hover (v2)
└──────────────────────────┘
```

**Color Coding:**
- **Green:** 75–100% HP (safe)
- **Yellow:** 25–74% HP (warning)
- **Red:** <25% HP (critical)
- **Grayed (inactive):** King Tower before activation
- **Dark Red (destroyed):** Dead tower

**Visual Destruction State:**
```
PRINCESS TOWER DESTROYED:
  ├─ HP Bar: Disappears
  ├─ Sprite: Darkens to 30% opacity
  ├─ Effect: Rubble/collapse animation (0.5s)
  ├─ Sound: Stone crash, sad horn
  ├─ Particle: Dust cloud (gray particles)
  └─ Game Effect: ZERO attacks from this tower

KING TOWER DESTROYED:
  ├─ Same visual as princess
  ├─ Additional: Screen shake (0.2s)
  ├─ Audio: Louder horn, defeat music cue
  ├─ Effect: "DEFEAT" message, game ends immediately
  └─ Game Effect: OPPONENT WINS (instant loss)
```

---

## 🏆 Win Conditions & Tower Scoring

### Immediate Loss Condition
```
IF player.kingTower.hp ≤ 0:
  ├─ GAME OVER
  ├─ OPPONENT WINS
  ├─ Time Remaining: Irrelevant
  ├─ Audio: Sad horn, defeat music
  └─ UI: "DEFEAT" overlay, "Opponent Won" message
```

### Time-Based Win (After 3 Minutes)
```
IF game.time ≥ 180 seconds:
  ├─ Count destroyed towers per team
  ├─ Points Calculation:
  │   ├─ King Tower destroyed: +3 points
  │   ├─ Princess Tower destroyed: +1 point each
  │   └─ Total: 0–5 points per team
  │
  ├─ Scoring Example:
  │   ├─ Player: 0 towers destroyed → 0 points
  │   ├─ Enemy: 1 princess destroyed → 1 point
  │   └─ RESULT: Player Wins (0 < 1, player has more towers standing)
  │
  └─ Tie (both have same towers up):
      └─ Go to Overtime (Sudden Death)
```

### Overtime Rules (Sudden Death)

```
IF game.time > 180 seconds AND both teams tied on tower destruction:
  ├─ Game continues
  ├─ Elixir regeneration: 1x speed (normal)
  ├─ Visual indicator: "OVERTIME" banner, urgent music
  ├─ Win Condition: FIRST tower destroyed wins
  │   ├─ Any tower hp → 0 triggers instant win
  │   └─ Player who loses tower = loser
  │
  └─ Timeout: Maximum 30 seconds overtime
      └─ If still tied: DRAW (rare, splits rewards)
```

**Rationale:**
- **Immediate King Tower loss** creates tension and comeback risk
- **Time-based scoring** rewards defensive excellence
- **Overtime** prevents endless stalemates
- **Scoring system** makes tower destruction visible/meaningful

---

## 🎲 Tower State Data Structure

### Tower Object

```javascript
{
  // Identity
  id: 'king_player' | 'princess_left_player' | 'princess_right_player' | ...,
  ownerType: 'player' | 'enemy',
  type: 'king' | 'princess',
  
  // Position (static, never changes)
  x: number,
  y: number,
  
  // Health
  hp: number (current),
  maxHp: number (initial),
  destroyed: boolean (true if hp ≤ 0),
  
  // Combat
  range: number (350 for princess, 400 for king),
  damage: number (80 for princess, 100 for king),
  attackSpeed: number (1.25 for princess, 1.5 for king, in seconds),
  lastAttackTime: number (ms, for cooldown calculation),
  target: Unit | null (current target, or null if none),
  
  // King Tower Specific
  activationState: 'inactive' | 'awakening' | 'active',
  activationTime: number (ms when activation started, for 0.6s animation),
  
  // Lifecycle
  createdAt: number (ms, for debugging),
  lastDamagedAt: number (ms, for visual feedback)
}
```

### Tower Update Cycle (Every Frame)

```javascript
// pseudo-code
for each tower {
  if (tower.activationState === 'awakening') {
    if (now - tower.activationTime > 600) {
      tower.activationState = 'active'
    } else {
      // Tower is immune during awakening
      continue
    }
  }
  
  if (!isActive(tower)) continue // skip inactive towers
  
  if (tower.destroyed) continue // skip destroyed towers
  
  if (now - tower.lastAttackTime >= tower.attackSpeed * 1000) {
    const target = findNearestEnemy(tower)
    if (target) {
      applyDamage(target, tower.damage)
      tower.lastAttackTime = now
      
      if (target.hp <= 0) {
        onUnitDestroyed(target)
      }
    }
  }
}
```

---

## ⚙️ Tuning Levers & Balance Variables

| Variable | Base | Min | Max | Rationale |
|----------|------|-----|-----|-----------|
| **Princess.maxHp** | 1800 | 1500 | 2200 | [PLACEHOLDER] - test at different values to tune push difficulty |
| **Princess.damage** | 80 | 60 | 100 | Mid-tier defense; roughly 22 hits to kill 1800 HP troop |
| **Princess.attackSpeed** | 1.25s | 0.8s | 2.0s | Balances DPS vs. visual clarity |
| **King.maxHp** | 3500 | 3000 | 4000 | [PLACEHOLDER] - activates late, should feel tanky |
| **King.damage** | 100 | 80 | 130 | 1.25x princess for late-game power spike |
| **King.attackSpeed** | 1.5s | 1.0s | 2.0s | Slightly slower, but higher damage |
| **King.range** | 400 | 350 | 450 | 50px more reach than princess |
| **Tower.attackRange** | 350/400 | 300 | 500 | Impacts coverage; too high = too defensive, too low = boring |
| **King.activationDelay** | 0.6s | 0.3s | 1.0s | Duration of "Awakening" animation |

---

## 🔄 Edge Cases & Failure States

### Edge Case 1: Unit Destroyed by Tower Mid-Attack
```
Sequence:
  1. Unit A has 1 HP, attacking Enemy Princess
  2. Enemy Princess fires, dealing 80 damage
  3. Unit A: hp = 1 - 80 = -79 → clamped to 0, destroyed=true
  4. Game: Removes Unit A from battlefield

Edge Case Resolution:
  ├─ HP always clamped: max(0, hp - damage)
  ├─ Damage is never "overkill" in scoring (80 damage = 1 kill, not 80 kills)
  └─ Unit death triggers cleanup immediately
```

### Edge Case 2: Multiple Towers Kill Same Unit
```
Sequence:
  1. Unit at (250, 500), both Princess towers in range
  2. Frame N: Tower A fires first (-80 HP)
  3. Same frame: Tower B fires (-80 HP)
  4. Unit HP: 160 - 80 - 80 = 0 → destroyed

Expected Behavior:
  ├─ Unit dies once (not twice)
  ├─ Only one "troop destroyed" event
  ├─ Both towers' attacks register (visual effects both play)
  └─ No "overkill" penalty (both damage counts)

Why This Matters:
  └─ Player skill = predicting multi-tower focus fire
      (e.g., never push center with weak unit)
```

### Edge Case 3: Tower Activation Mid-Combat
```
Sequence:
  1. Princess Left: 100 HP (critical)
  2. Enemy Troops closing in
  3. Unit deals 150 damage to Princess
  4. Princess: 100 - 150 = 0 (destroyed)
  5. TRIGGER: King Tower activation

Timing Question: Can King Tower attack in the same frame as Princess dies?
  
Expected Behavior:
  ├─ Princess dies, triggering activation
  ├─ King enters AWAKENING state (0.6s, immune)
  ├─ King CANNOT attack during AWAKENING
  ├─ Game Effect: Player loses princess coverage for 0.6s
  └─ King then activates, providing new coverage

Why This Matters:
  └─ Window of opportunity (0.6s) for skilled pushes
      (e.g., destroy princess, rush in during King awakening)
```

### Edge Case 4: King Tower Damaged Before Princess Dies
```
Scenario: Troop bypasses all defenses, hits King directly
  
Sequence:
  1. King Tower: INACTIVE state
  2. Troop at (300, 700), King at (300, 740), range 60px
  3. Troop deals 50 damage to King: 3500 - 50 = 3450 HP
  4. TRIGGER: King activation (direct damage override)

Expected Behavior:
  ├─ King takes damage normally (INACTIVE state ends)
  ├─ King enters AWAKENING immediately
  ├─ King will be ACTIVE after 0.6s
  └─ HP reduced to 3450 (damage not negated)

Why This Matters:
  └─ Prevents "safe until princess dies" mindset
      (e.g., can't cycle elixir safely if King can be awakened early)
```

### Edge Case 5: Simultaneous King & Princess Destruction
```
Scenario: Both towers hit 0 HP in the same frame (rare but possible)

Sequence:
  1. Fireball spell: 300 area damage at tower cluster
  2. Affects: King (3500 → 3200 HP) + Princess (1800 → 1500 HP) ← not destroyed
  
Alternative:
  1. Two high-damage units both attack towers
  2. Princess takes combined damage: 1800 - 200 - 200 = -200 → 0 HP
  3. King takes combined damage: 3500 - 50 - 50 = 3400 HP (survives)

Expected Behavior:
  ├─ Each tower resolved independently
  ├─ Princess destroyed first, King activation triggered
  ├─ King does NOT die in same frame (activation prevents it)
  └─ Game outcome: King survives, only Princess lost

Why This Matters:
  └─ Prevents impossible "both towers destroyed simultaneously" state
      (King activation is guaranteed safety frame)
```

### Edge Case 6: Tower Range Boundary Behavior
```
Scenario: Unit at exactly tower.range distance

Calculation:
  Tower: (300, 740), Range: 350
  Unit: (300, 390)
  Distance = √((300-300)² + (390-740)²) = √90000 = 300px ✓ IN RANGE

Unit: (300, 88)
  Distance = √((300-300)² + (88-740)²) = √651104 = 807px ✗ OUT OF RANGE

Edge: Unit at exactly 350px
  Distance = 350.000px → IN RANGE (equal counts as hit)

Expected Behavior:
  ├─ Floating-point comparison: distance ≤ range (not <)
  ├─ At boundary: Tower attacks (no "whiff" at 349.99px)
  └─ Just outside: Tower does NOT attack (no range extension)

Why This Matters:
  └─ Skill play: Positioning at exact range edges
      (e.g., "kite" enemies at tower range boundary)
```

---

## 🎬 Tower Activation Animation (King Tower Only)

### "Awakening" Sequence (0.6 seconds)

```
Frame 0 (Activation Trigger):
  ├─ Event: Princess destroyed OR King takes damage
  ├─ State: king.activationState = 'awakening'
  ├─ Time: king.activationTime = now
  ├─ Visual: Begin fade-in animation

Frame 0–300ms (Fade In):
  ├─ Opacity: 0.5 → 0.8 (linear lerp)
  ├─ Scale: 1.0 (no scale effect)
  ├─ Glow: Yellow/golden glow expands outward
  └─ Audio: Deep bell toll starts

Frame 300–600ms (Glow Peak):
  ├─ Opacity: 0.8 → 1.0
  ├─ Glow: Peak brightness, pulse effect
  ├─ Particle: Golden light particles burst outward
  ├─ Audio: Bell toll crescendo
  └─ Screen: Subtle white flash (20% screen brightness increase)

Frame 600ms (Transition to Active):
  ├─ State: king.activationState = 'active'
  ├─ Opacity: 1.0 (fully visible)
  ├─ Glow: Settles to idle glow
  ├─ Audio: Bell stops
  └─ Game Effect: ACTIVE, can now attack

Total Duration: 0.6s (exactly)
```

**Design Intent:**
- **Visual Clarity:** Player immediately sees King awakened
- **Feedback:** Satisfying "power-up" moment for defender
- **Counterplay Window:** 0.6s grace period for skilled attackers
- **Audio Cue:** Important for players with visual limitations

---

## 📊 Tower Economy & Interaction Matrix

### System Interaction Matrix

| System A | System B | Interaction | Intended? | Notes |
|----------|----------|-------------|-----------|-------|
| Tower | Troop | Tower auto-attacks nearest troop | ✅ YES | Core combat |
| Tower | Building | Tower can attack buildings | ✅ YES | Secondary threat |
| Tower | Spell | Tower cannot target spells (v1) | ✅ YES | Spells are utility, not combat |
| King Tower | Princess Tower | King activates when Princess dies | ✅ YES | Core mechanic |
| King Tower | Direct Damage | King can be activated by direct damage | ✅ YES | Prevents "safe stall" |
| Multiple Towers | Same Target | Can focus-fire (both attack) | ✅ YES | Emergent strategy |
| Tower | Player Elixir | Tower destruction doesn't grant elixir | ✅ YES | Unlike Clash Royale |
| Tower | Game Time | King activation independent of time | ✅ YES | Threat-based, not time-based |
| Tower | Win Condition | King destruction = instant loss | ✅ YES | Highest priority |

---

## 🧪 Playtesting Priorities

### High Priority (Must Test)
1. **King Activation Timing:** Does 0.6s awakening feel like a "window of opportunity"?
2. **Multi-Tower Focus Fire:** Do players feel punished for clustering units?
3. **Tower Range Feel:** Is 350px too tight/too loose?
4. **HP Scaling:** Do 1800 HP princess towers feel tanky enough?

### Medium Priority
1. **Attack Speed:** Does 1.25s feel fast/slow relative to troop attacks?
2. **Damage Values:** Are 80/100 damage fair vs. common troop HP?
3. **Overtime Length:** Is 30s overtime enough time, or too long?

### Low Priority (Balance, Not Feel)
1. **Win Scoring:** 3/1 point system; adjust if needed
2. **Activation Delay:** 0.6s animation; can tweak to 0.4–0.8s

---

## 📝 Handoff to Engineering

### Required for Implementation

**Data to Pass:**
- Tower positions (x, y) per owner type ✅
- Tower stats (HP, range, damage, attack speed) ✅
- State machine (INACTIVE → AWAKENING → ACTIVE) ✅
- Activation conditions (Princess destroyed OR King damaged) ✅
- Target priority (Troops > Buildings > Spells) ✅
- Tuning levers (marked [PLACEHOLDER]) ✅

**No Design Ambiguity:**
- ✅ Every tower has a clear role
- ✅ Activation rules are unambiguous
- ✅ Combat flow is deterministic
- ✅ Win conditions are explicit
- ✅ Animation timing is specified (0.6s)

**Ready for Playtesting:**
- All [PLACEHOLDER] values should be tested before shipping
- Edge cases documented; engineers should handle gracefully
- Cooperation emerges from independent targeting (no hard-coded focus fire)

---

## 📌 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Initial | Core tower system (2 towers active) |
| 2.0 | Current | Added King Tower activation, Cooperation matrix, Balance spreadsheet, Edge cases |

---

**Document Status:** ✅ Ready for Implementation  
**Next Step:** Playtesting & Balance Iteration
