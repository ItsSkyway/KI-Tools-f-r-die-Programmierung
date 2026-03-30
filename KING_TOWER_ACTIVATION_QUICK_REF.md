# KING TOWER ACTIVATION - QUICK REFERENCE GUIDE

## TL;DR

**What**: King tower activation system - state machine that gates when the king tower can attack  
**When**: King tower starts dormant, activates on princess tower destruction OR king tower damage  
**Where**: `src/simulation/towers.js`, `src/game/gameLoop.js`  
**Status**: ✅ IMPLEMENTED & TESTED (10/10 tests passing)

---

## STATE MACHINE IN 30 SECONDS

```
START: King tower is DORMANT (can't shoot)
         ↓
TRIGGER 1: Enemy destroys your princess tower → ACTIVATE
TRIGGER 2: Your king tower takes any damage → ACTIVATE
         ↓
RESULT: King tower state = ACTIVE (shoots normally)
         ↓
PERMANENT: Cannot go back to dormant
```

---

## CORE FUNCTIONS

### 1. Check if king should activate THIS FRAME
```javascript
const shouldActivate = shouldActivateKingTower(
  kingTower,              // The king tower object
  currentPrincessCount,   // How many princess towers alive NOW (0-2)
  previousPrincessCount   // How many princess towers alive LAST FRAME (0-2)
)
// Returns: true if should activate, false otherwise
```

**When to call**: Every game frame (called automatically in game loop)

---

### 2. Actually activate the king tower
```javascript
const activationEvent = activateKingTower(kingTower)
// Returns: {
//   activated: true/false,
//   tower: kingTower,
//   previousState: 'dormant',
//   message: 'King Tower Activated!'
// }
```

**When to call**: When `shouldActivateKingTower()` returns true

---

### 3. Count living princess towers
```javascript
const livingPrincesses = getPrincessTowerCount(towers)
// Returns: 0, 1, or 2
```

**When to call**: To check current tower count for activation logic

---

### 4. Get complete king state (for UI/debug)
```javascript
const kingState = getKingTowerState(kingTower)
// Returns: {
//   state: 'dormant' | 'active',
//   isDormant: boolean,
//   isActive: boolean,
//   canShoot: boolean,        // ← Use this for UI!
//   hp: 3500,
//   maxHp: 3500,
//   healthPercent: 100,
//   activatedAt: timestamp,
//   wasKingDamaged: boolean
// }
```

**When to call**: For UI display, debugging, checking state

---

### 5. Damage a tower (tracks king damage automatically)
```javascript
damageTower(tower, damage)
// Automatically calls trackKingTowerDamage() if tower.isKing
```

**When to call**: When applying damage to any tower

---

## INTEGRATION POINTS

### 1. Game Loop Per-Frame Check (Already Implemented)
```javascript
// In runGameFrame() around line 50-80:
const currentPlayerPrincessCount = getPrincessTowerCount(towers.player)
if (shouldActivateKingTower(towers.player.kingTower, currentPlayerPrincessCount, gameState.playerPrincessCount)) {
  const activation = activateKingTower(towers.player.kingTower)
  updates.kingTowerActivations.push(activation)
}
gameState.playerPrincessCount = currentPlayerPrincessCount
// (same for enemy)
```

**Status**: ✅ Already integrated

---

### 2. Tower Attack Processing (Already Implemented)
```javascript
// In processTowers():
if (tower.isKing && tower.state === 'dormant') {
  return // Skip dormant king towers
}
// Continue with normal attack logic
```

**Status**: ✅ Already integrated

---

### 3. Damage Application (Already Implemented)
```javascript
// In damageTower():
export const damageTower = (tower, damage) => {
  tower.hp = Math.max(0, tower.hp - damage)
  if (tower.hp === 0) {
    tower.destroyed = true
  }
  if (tower.isKing) {
    trackKingTowerDamage(tower)  // ← Automatic!
  }
}
```

**Status**: ✅ Already integrated

---

### 4. UI Properties (Already Implemented)
```javascript
// In createUIUpdate() for each tower:
{
  type: 'kingTower',
  hp: 3500,
  maxHp: 3500,
  state: 'dormant' | 'active',  // ← NEW!
  canShoot: false | true         // ← NEW!
}

// King tower states added to UI:
updates.kingTowerStates = {
  player: { state, isDormant, isActive },
  enemy: { state, isDormant, isActive }
}
```

**Status**: ✅ Already integrated

---

## TESTING THE MECHANIC

### Run Test Suite
```bash
node KING_TOWER_MECHANICS_TESTS.js
```

**Expected Output**: ✅ ALL TESTS PASSED (10/10)

### Manual Testing Scenarios

#### Test 1: King tower starts dormant
- Load game → King tower visible but not shooting
- **Expected**: King tower frozen, no attack animations
- **Verify**: `kingTower.state === 'dormant'`

#### Test 2: Activation on princess destruction
- Play game → Destroy enemy's princess tower
- **Expected**: Enemy's king tower gets activation animation, starts shooting
- **Verify**: `kingTower.state === 'active'`

#### Test 3: Activation on king damage
- Play aggressive → Damage enemy's king tower (if dormant)
- **Expected**: King tower immediately activates
- **Verify**: `kingTower.wasKingDamaged === true` → activation

#### Test 4: Dormant king doesn't shoot
- Verify in game → Enemy's dormant king tower doesn't shoot troops
- **Expected**: No attack animations on dormant king
- **Verify**: `processTowers()` returns early if `tower.isKing && tower.state === 'dormant'`

#### Test 5: Active king shoots
- After activation → Active king tower shoots at enemies
- **Expected**: Attack animations, damage applied
- **Verify**: `kingTower.state === 'active'` → normal tower behavior

---

## PROPERTIES ADDED TO TOWERS

### New Tower Properties
```javascript
kingTower: {
  // ... existing properties (id, type, x, y, hp, maxHp, range, damage, etc.)
  
  // NEW properties for activation system:
  state: 'dormant',           // Current state
  wasKingDamaged: false,      // Damage trigger flag
  activatedAt: null           // Timestamp of activation
}
```

### Property Meanings
- **state**: `'dormant'` or `'active'` - current activation state
- **wasKingDamaged**: `true` if this king took damage while dormant (triggers activation)
- **activatedAt**: `Date.now()` timestamp when king activated (or null if not active)

---

## UI DISPLAY RECOMMENDATIONS

### State Indicator Icon
```
DORMANT:  👑 (sleeping face, grayed out)
ACTIVE:   👑 (awake face, glowing gold)
```

### Color Code
```
DORMANT:  #999999 (gray, 60% opacity)
ACTIVE:   #FFD700 (gold, 100% opacity with glow)
```

### Text Label
```
DORMANT:  "SLEEPING"
ACTIVE:   "AWAKE"
```

### Activation Event Animation
1. Flash: Crown fills with light (0.1s)
2. Burst: Energy explodes outward (0.3s)
3. Glow: Settle into steady golden glow (0.2s)
4. Sound: Deep, powerful activation sound

---

## DATA FLOW DIAGRAM

```
┌─────────────────────────┐
│   Game Frame Update     │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  1. Count Princess Towers               │
│     getPrincessTowerCount(towers)       │
└────────────┬────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────────┐
│  2. Check Activation Triggers                │
│     shouldActivateKingTower(...)             │
│     - Princess count decreased?              │
│     - King tower damaged?                    │
└────────────┬─────────────────────────────────┘
             │
             ▼
      ┌──────────────┐
      │ Should       │
      │ Activate?    │
      └──────┬───────┘
             │
         ┌───┴─────┐
         │          │
        YES        NO
         │          │
         ▼          ▼
    ┌────────┐  ┌──────────┐
    │Activate│  │No Change │
    └────┬───┘  └──────────┘
         │
         ▼
    ┌──────────────────────────┐
    │ 3. Process Tower Attacks │
    │ - Check: tower.state     │
    │ - Dormant? Skip          │
    │ - Active? Normal shoot   │
    └──────────────────────────┘
```

---

## COMMON QUESTIONS

### Q: How do I check if a king tower can shoot?
**A**: Use `kingTower.state === 'active'` or `getKingTowerState(kingTower).canShoot`

### Q: What happens if I damage a king tower twice?
**A**: First damage sets `wasKingDamaged = true`, triggers activation. Second damage just deals more HP loss (activation already happened).

### Q: Can a king tower revert to dormant?
**A**: No. Activation is one-way. Once active, always active for the rest of the game.

### Q: What if both princess towers are destroyed on the same frame?
**A**: Activation triggers once (idempotent `activateKingTower()` prevents double activation).

### Q: When should I call `getKingTowerState()`?
**A**: For UI display, debugging, or any code that needs the complete state snapshot. It's read-only (doesn't modify state).

### Q: Is the king tower still subject to targeting logic while dormant?
**A**: No. It skips the `processTowers()` attack phase entirely. Enemy units can still move toward it and target it, but it won't shoot back.

### Q: Can I customize activation timing?
**A**: Not currently. Activation is immediate (0ms delay). If you want a delay, add `activationDelay` property and check `Date.now() - tower.activatedAt > delay` before allowing shots.

### Q: What properties does `createUIUpdate()` return for towers?
**A**:
```javascript
{
  type: 'kingTower' | 'princessLeft' | 'princessRight',
  hp: number,           // Current health
  maxHp: number,        // Max health
  state: 'dormant' | 'active',  // NEW
  canShoot: boolean     // NEW - false for dormant kings
}
```

---

## FILES MODIFIED

### `src/simulation/towers.js`
- Added state properties to tower initialization
- Modified `damageTower()` to call `trackKingTowerDamage()`
- Added 5 new functions:
  - `getPrincessTowerCount()`
  - `shouldActivateKingTower()`
  - `activateKingTower()`
  - `trackKingTowerDamage()`
  - `getKingTowerState()`

### `src/game/gameLoop.js`
- Added imports: `getPrincessTowerCount`, `shouldActivateKingTower`, `activateKingTower`
- Modified `runGameFrame()`: Added princess count tracking and activation checks
- Modified `processTowers()`: Added dormant king tower guard clause
- Modified `createUIUpdate()`: Added state properties to tower objects

---

## DEPLOYMENT CHECKLIST

- [x] Implementation complete
- [x] Unit tests passing (10/10)
- [x] Code integrated into game loop
- [x] Damage tracking working
- [x] Tower attack skipping dormant kings
- [x] UI properties added
- [ ] UI visual feedback implemented (next phase)
- [ ] Audio effects added (next phase)
- [ ] Tutorial updated (next phase)
- [ ] Playtesting feedback collected (next phase)

---

## PERFORMANCE NOTES

**CPU Impact per Frame**: Negligible
- Princess count check: O(1) - 2 comparisons
- Activation check: O(1) - 3 conditions
- Guard clause: O(1) - 1 condition
- Total overhead: < 0.1ms per 60 FPS frame

**Memory Impact**: Minimal
- 3 new properties per king tower (2 per team)
- Total: 6 extra fields (string, boolean, number type)
- Negligible (<1KB total)

---

## NEXT STEPS

### For UI Developer:
- Implement visual state indicators (dormant vs. active)
- Add activation animation when `kingTowerActivations` events received
- Update tower UI to show `state` property
- Add crown icon animation

### For Audio Developer:
- Create king tower activation sound effect
- Play on `kingTowerActivations` event
- Consider "sleeping Z" sound for dormant king

### For QA:
- Run manual test scenarios above
- Check edge cases (both princess destroyed simultaneously, etc.)
- Verify both players' kings track independently
- Monitor for state desynchronization bugs

### For Balancing:
- Monitor average activation time (should be ~1:30)
- Check if players protect princess towers (metric: HP damage ratio)
- If activation too early/late, adjust princess tower HP

---

## DEBUGGING

### Check King Tower State
```javascript
console.log(getKingTowerState(towers.player.kingTower))
// Output: { state, isDormant, isActive, canShoot, hp, maxHp, ... }
```

### Trace Activation Events
```javascript
console.log(updates.kingTowerActivations)
// Output: Array of activation events with owner and timestamp
```

### Verify Princess Count
```javascript
console.log(getPrincessTowerCount(towers.player))
// Output: 0, 1, or 2
```

### Monitor Damage Tracking
```javascript
console.log(kingTower.wasKingDamaged)
// Output: true if damaged while dormant
```

---

## QUICK REFERENCE: FUNCTION SIGNATURES

```javascript
// Initialize towers
const towers = initializeTowers('player') // Already called at game start

// Check and activate per frame
const shouldActivate = shouldActivateKingTower(kingTower, currentCount, prevCount)
if (shouldActivate) activateKingTower(kingTower)

// Get state info
const state = getKingTowerState(kingTower)
const aliveCount = getPrincessTowerCount(towers)

// Damage (automatic tracking)
damageTower(tower, damage) // Sets wasKingDamaged if king tower

// UI data
const uiData = createUIUpdate(gameState, towers)
// Contains: kingTowerStates, tower.state, tower.canShoot
```

---

**For detailed implementation info, see: KING_TOWER_MECHANICS_IMPLEMENTATION.md**  
**For game design details, see: GDD_KING_TOWER_ACTIVATION.md**  
**For tests, run: node KING_TOWER_MECHANICS_TESTS.js**
