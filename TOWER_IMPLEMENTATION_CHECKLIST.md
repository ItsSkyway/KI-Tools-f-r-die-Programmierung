# Tower System Implementation Checklist
**Version:** 2.0  
**Target Completion:** Before Playtesting  
**Handoff Status:** Ready for Engineering

---

## 📋 Overview

This checklist guides engineers through implementing the Tower System as specified in `GDD_TOWER_SYSTEM.md`. All [PLACEHOLDER] values are marked for playtesting.

**Prerequisites:**
- ✅ Game state management in place (gameStateRef, towerStateRef)
- ✅ Unit combat system working (damage, death, health tracking)
- ✅ Game loop processing entities each frame
- ✅ UI rendering towers and health bars

---

## Phase 1: Core Tower Data & Initialization

### 1.1 Tower Data Structure ✅

**Location:** `src/simulation/towers.js`

**Checklist:**
- [ ] Tower object has all required properties:
  ```javascript
  {
    id, ownerType, type,
    x, y,
    hp, maxHp, destroyed,
    range, damage, attackSpeed,
    lastAttackTime,
    target,
    activationState, activationTime,
    createdAt, lastDamagedAt
  }
  ```
- [ ] `activationState` enum: `'inactive' | 'awakening' | 'active'`
- [ ] All numeric values use [PLACEHOLDER] notation where tuning needed

**File Review:**
- [ ] Run `grep -n "activationState" src/simulation/towers.js` → should show field defined
- [ ] Run `grep -n "activationTime" src/simulation/towers.js` → should show field defined

---

### 1.2 Tower Initialization ✅

**Location:** `src/simulation/towers.js` → `initializeTowers(owner)`

**Checklist:**
- [ ] Create 3 towers per player: King + Princess Left + Princess Right
- [ ] Set positions per spec:
  ```javascript
  Player:
    King: (300, 740)
    Princess Left: (120, 680)
    Princess Right: (480, 680)
  
  Enemy:
    King: (300, 60)
    Princess Left: (120, 120)
    Princess Right: (480, 120)
  ```
- [ ] Set initial stats:
  ```javascript
  Princess: hp=1800, maxHp=1800, damage=80, range=350, attackSpeed=1.25
  King: hp=3500, maxHp=3500, damage=100, range=400, attackSpeed=1.5
  ```
- [ ] Set King towers to `activationState = 'inactive'`
- [ ] Set Princess towers to `activationState = 'active'`
- [ ] Initialize `lastAttackTime = -Infinity` (so first attack fires immediately)
- [ ] Initialize `target = null`

**Test:**
```javascript
const towers = initializeTowers('player');
console.assert(towers.king.activationState === 'inactive', 'King should start inactive');
console.assert(towers.princessLeft.hp === 1800, 'Princess HP should be 1800');
```

---

## Phase 2: Tower Activation System (King Tower)

### 2.1 King Tower Activation Triggers ✅

**Location:** `src/simulation/towers.js` → `checkKingActivation(towerState, playerType)`

**Checklist:**
- [ ] Create function `checkKingActivation(king, princess_left, princess_right)`
- [ ] Trigger 1: Princess destroyed (hp ≤ 0)
  ```javascript
  if (princess_left.destroyed || princess_right.destroyed) {
    activateKingTower(king);
  }
  ```
- [ ] Trigger 2: King takes damage (applied in combat system)
  ```javascript
  // Called from damageUnit/damageTower
  if (king.activationState === 'inactive' && damage > 0) {
    activateKingTower(king);
  }
  ```
- [ ] Function `activateKingTower(king)`:
  ```javascript
  if (king.activationState === 'inactive') {
    king.activationState = 'awakening';
    king.activationTime = now;
  }
  ```

**Test:**
```javascript
// Test 1: Activation by princess destruction
king.activationState === 'inactive';
princess_left.destroyed = true;
checkKingActivation(king, princess_left, princess_right);
console.assert(king.activationState === 'awakening', 'King should activate on princess death');

// Test 2: Activation by direct damage
king.activationState === 'inactive';
damageTower(king, 50);
console.assert(king.activationState === 'awakening', 'King should activate on direct damage');
```

---

### 2.2 King Tower Awakening Animation ✅

**Location:** `src/game/gameLoop.js` → `updateTowerStates()`

**Checklist:**
- [ ] Create function `updateKingTowerAwakening(king, deltaTime)`
- [ ] Check if `king.activationState === 'awakening'`
- [ ] Calculate elapsed time: `now - king.activationTime`
- [ ] If elapsed ≥ 0.6 seconds (600 ms):
  ```javascript
  king.activationState = 'active';
  // Trigger visual/audio effects
  onKingActivated(king);
  ```
- [ ] **During awakening (< 600ms):**
  - King is immune to damage
  - King does NOT attack
  - Visual feedback plays (separate from game logic)
- [ ] King cannot transition back to 'inactive' after 'awakening'

**Test:**
```javascript
king.activationState = 'awakening';
king.activationTime = now - 300; // 300ms elapsed
updateKingTowerAwakening(king, now);
console.assert(king.activationState === 'awakening', 'Should still be awakening at 300ms');

king.activationTime = now - 700; // 700ms elapsed
updateKingTowerAwakening(king, now);
console.assert(king.activationState === 'active', 'Should be active after 600ms');
```

---

### 2.3 King Tower Immunity During Awakening

**Location:** `src/simulation/combat.js` → `damageTower(tower, damage)`

**Checklist:**
- [ ] Modify damage function to check activation state:
  ```javascript
  if (tower.type === 'king' && tower.activationState === 'awakening') {
    // Take no damage during awakening
    return 0;
  }
  ```
- [ ] Apply damage normally after awakening complete
- [ ] Log any damage attempts during awakening (for debugging)

**Test:**
```javascript
king.activationState = 'awakening';
const originalHp = king.hp;
damageTower(king, 100);
console.assert(king.hp === originalHp, 'King should take no damage during awakening');

king.activationState = 'active';
damageTower(king, 100);
console.assert(king.hp === originalHp - 100, 'King should take damage when active');
```

---

## Phase 3: Tower Combat System

### 3.1 Tower Target Finding ✅

**Location:** `src/simulation/combat.js` → `findTowerTarget(tower, allUnits)`

**Checklist:**
- [ ] Function signature: `findTowerTarget(tower, allUnits, allBuildings)`
- [ ] **Target Priority:**
  1. Filter troops in range (distance ≤ tower.range)
  2. If no troops, check buildings in range
  3. If no buildings, return null
- [ ] **Range Calculation:** Use Euclidean distance
  ```javascript
  const distance = Math.hypot(tower.x - unit.x, tower.y - unit.y);
  const inRange = distance <= tower.range;
  ```
- [ ] **Select Closest:** Among valid targets, choose nearest
  ```javascript
  const validTargets = units.filter(u => isInRange(tower, u));
  const closest = validTargets.reduce((prev, curr) => 
    getDistance(tower, curr) < getDistance(tower, prev) ? curr : prev
  );
  ```
- [ ] **Tie-Breaking:** Use spawn order (older units first)

**Test:**
```javascript
const tower = { x: 300, y: 740, range: 350 };
const units = [
  { id: 1, x: 300, y: 500, hp: 100 }, // 240px away
  { id: 2, x: 400, y: 600, hp: 100 }, // 223px away (closer)
];

const target = findTowerTarget(tower, units);
console.assert(target.id === 2, 'Should select closest unit');

const unitOutOfRange = { id: 3, x: 300, y: 0, hp: 100 }; // 740px away
const target2 = findTowerTarget(tower, [unitOutOfRange]);
console.assert(target2 === null, 'Should return null if no units in range');
```

---

### 3.2 Tower Attack Execution ✅

**Location:** `src/simulation/combat.js` → `processTowerAttacks(towers, allUnits, gameTime)`

**Checklist:**
- [ ] Create function `processTowerAttacks(towers, allUnits, gameTime)`
- [ ] For each tower:
  - [ ] Check if active: `tower.activationState === 'active'` (princess always active)
  - [ ] Check if alive: `tower.destroyed === false`
  - [ ] Check if can attack (cooldown):
    ```javascript
    const timeSinceLastAttack = (gameTime - tower.lastAttackTime) / 1000;
    if (timeSinceLastAttack < tower.attackSpeed) {
      continue; // Not ready yet
    }
    ```
  - [ ] Find target: `target = findTowerTarget(tower, allUnits)`
  - [ ] If target found:
    - Apply damage: `target.hp -= tower.damage`
    - Clamp HP: `target.hp = Math.max(0, target.hp)`
    - Check destruction: `if (target.hp === 0) target.destroyed = true`
    - Update timer: `tower.lastAttackTime = gameTime`
    - Store target: `tower.target = target` (for visual feedback)
    - Log event: `logEvent({ type: 'tower_attack', tower: tower.id, target: target.id, damage: tower.damage })`
  - [ ] If target dies:
    - Trigger cleanup: `onUnitDestroyed(target)`
    - Update tower target: `tower.target = null`

**Execution Order in Game Loop:**
```javascript
// In gameLoop.js, after updating all unit positions:
function updateGameState(gameStateRef, deltaTime, gameTime) {
  // ...
  
  // Process tower attacks (new)
  processTowerAttacks(
    towerStateRef.player,
    gameStateRef.allEnemyUnits,
    gameTime
  );
  
  processTowerAttacks(
    towerStateRef.enemy,
    gameStateRef.allPlayerUnits,
    gameTime
  );
  
  // ...
}
```

**Test:**
```javascript
const tower = { range: 350, damage: 80, attackSpeed: 1.25, lastAttackTime: 0, destroyed: false, activationState: 'active' };
const unit = { hp: 100, x: 300, y: 500 };
tower.x = 300; tower.y = 740;

processTowerAttacks([tower], [unit], 1000); // 1 second passed
console.assert(unit.hp === 20, 'Unit should take 80 damage'); // 100 - 80
console.assert(tower.lastAttackTime === 1000, 'Tower should update attack time');

processTowerAttacks([tower], [unit], 1500); // Only 0.5s passed
console.assert(unit.hp === 20, 'Tower should not attack (cooldown not ready)');

processTowerAttacks([tower], [unit], 2500); // 1.5s passed since last attack
console.assert(unit.hp === -60, 'Tower should attack again'); // But we need to clamp...
```

---

### 3.3 Tower Death Prevention

**Location:** `src/simulation/combat.js` → `damageTower(tower, damage)`

**Checklist:**
- [ ] When a tower takes damage:
  - [ ] Apply damage: `tower.hp -= damage`
  - [ ] Clamp: `tower.hp = Math.max(0, tower.hp)`
  - [ ] Check destruction: `if (tower.hp <= 0) tower.destroyed = true`
  - [ ] Log event: `logEvent({ type: 'tower_destroyed', tower: tower.id, damage })`
  - [ ] If King destroyed: `triggerGameOver('opponent')`
  - [ ] Record last damage time: `tower.lastDamagedAt = gameTime` (for UI)

**Test:**
```javascript
const tower = { hp: 100, maxHp: 100, destroyed: false, type: 'princess' };
damageTower(tower, 50);
console.assert(tower.hp === 50, 'Tower should have 50 HP remaining');
console.assert(tower.destroyed === false, 'Tower should not be destroyed yet');

damageTower(tower, 60); // Overkill
console.assert(tower.hp === 0, 'HP should clamp at 0 (not -10)');
console.assert(tower.destroyed === true, 'Tower should be destroyed');
```

---

## Phase 4: Tower Status & Activation Checks

### 4.1 Tower State Accessors ✅

**Location:** `src/simulation/towers.js`

**Checklist:**
- [ ] `isActive(tower)` - Returns true if tower can attack
  ```javascript
  function isActive(tower) {
    return tower.activationState === 'active' && !tower.destroyed;
  }
  ```
- [ ] `isAlive(tower)` - Returns true if tower has hp > 0
  ```javascript
  function isAlive(tower) {
    return tower.hp > 0;
  }
  ```
- [ ] `getHealthPercent(tower)` - Returns [0, 1]
  ```javascript
  function getHealthPercent(tower) {
    return Math.max(0, tower.hp / tower.maxHp);
  }
  ```
- [ ] `getTowerStatus(towers)` - Returns status object for each tower
  ```javascript
  function getTowerStatus(towers) {
    return {
      king: { hp: towers.king.hp, maxHp: towers.king.maxHp, active: isActive(towers.king) },
      princessLeft: { /* same */ },
      princessRight: { /* same */ },
    };
  }
  ```

**Test:**
```javascript
const tower = { hp: 100, maxHp: 100, destroyed: false, activationState: 'active' };
console.assert(isActive(tower) === true, 'Tower should be active');
console.assert(getHealthPercent(tower) === 1.0, 'Tower should be at 100% HP');

tower.hp = 50;
console.assert(getHealthPercent(tower) === 0.5, 'Tower should be at 50% HP');

tower.destroyed = true;
console.assert(isActive(tower) === false, 'Destroyed tower should not be active');
```

---

## Phase 5: Win Conditions & Game Over

### 5.1 King Tower Destruction Check ✅

**Location:** `src/game/gameLoop.js` → `determineWinner(towerStateRef, gameTime)`

**Checklist:**
- [ ] Function: `determineWinner(towerStateRef, gameTime)`
- [ ] **Immediate Loss (Anytime):** If King tower destroyed
  ```javascript
  if (towerStateRef.player.king.destroyed) {
    return { winner: 'enemy', reason: 'king_destroyed' };
  }
  if (towerStateRef.enemy.king.destroyed) {
    return { winner: 'player', reason: 'king_destroyed' };
  }
  ```
- [ ] Call this check every frame during game loop
- [ ] Trigger game end immediately if King destroyed

**Test:**
```javascript
const playerKing = { destroyed: false, hp: 100 };
const enemyKing = { destroyed: false, hp: 100 };
const towerState = { player: { king: playerKing }, enemy: { king: enemyKing } };

let winner = determineWinner(towerState, 0);
console.assert(winner === null, 'Should not have winner initially');

playerKing.destroyed = true;
winner = determineWinner(towerState, 0);
console.assert(winner === 'enemy', 'Enemy should win if player king destroyed');
```

---

### 5.2 Time-Based Scoring ✅

**Location:** `src/game/gameLoop.js` → `calculateTowerScore(towerState)`

**Checklist:**
- [ ] Function: `calculateTowerScore(towers)` - Returns score 0–5
- [ ] Scoring table:
  ```javascript
  function calculateTowerScore(towers) {
    let score = 0;
    if (towers.king.destroyed) score += 3;
    if (towers.princessLeft.destroyed) score += 1;
    if (towers.princessRight.destroyed) score += 1;
    return score;
  }
  ```
- [ ] At game end (180s), compare scores:
  ```javascript
  if (gameTime >= 180000) {
    const playerScore = calculateTowerScore(towerStateRef.player);
    const enemyScore = calculateTowerScore(towerStateRef.enemy);
    
    if (playerScore < enemyScore) {
      return { winner: 'player', reason: 'tower_score' };
    } else if (playerScore > enemyScore) {
      return { winner: 'enemy', reason: 'tower_score' };
    } else {
      return { winner: null, reason: 'overtime' }; // Tied, go to overtime
    }
  }
  ```

**Test:**
```javascript
let towers = { king: { destroyed: false }, princessLeft: { destroyed: false }, princessRight: { destroyed: false } };
console.assert(calculateTowerScore(towers) === 0, 'Score should be 0 if no towers destroyed');

towers.princessLeft.destroyed = true;
console.assert(calculateTowerScore(towers) === 1, 'Score should be 1 if one princess destroyed');

towers.king.destroyed = true;
console.assert(calculateTowerScore(towers) === 4, 'Score should be 4 if king + one princess destroyed');
```

---

### 5.3 Overtime Mode ✅

**Location:** `src/game/gameLoop.js` → `processGameEnd()`

**Checklist:**
- [ ] If game reaches 180s with tied tower scores: Enter OVERTIME
- [ ] OVERTIME rules:
  - [ ] Game continues
  - [ ] Elixir regen: 1x speed (normal, no double elixir)
  - [ ] Visual: "OVERTIME" banner on screen
  - [ ] Music: Urgent/dramatic cue
  - [ ] Win condition: **First tower destroyed wins**
  - [ ] Max duration: 30 seconds additional
- [ ] Trigger instant win if ANY tower destroyed in overtime:
  ```javascript
  if (gameState.overtimeMode) {
    // Check if any tower was just destroyed
    // If yes: Game over, destroyer wins
  }
  ```
- [ ] If 30s overtime expires still tied: DRAW (rare)

**Test:**
```javascript
gameState.gameTime = 180000;
gameState.overtimeMode = false;
gameState.playerTowerScore = 1;
gameState.enemyTowerScore = 1;

// Trigger overtime
gameState.overtimeMode = true;
gameState.overtimeStartTime = 180000;

// No tower destroyed after 10 seconds
gameState.gameTime = 190000;
const winner = determineWinner(gameState);
console.assert(winner === null, 'No winner until tower destroyed or time expires');

// Princess destroyed at 195 seconds
gameState.playerPrincessLeft.destroyed = true;
const winner2 = determineWinner(gameState);
console.assert(winner2 === 'enemy', 'Enemy wins if any tower destroyed in overtime');
```

---

## Phase 6: Tower Cooperation & Multi-Tower Focus

### 6.1 Focus Fire Targeting (Emergent)

**Location:** `src/simulation/combat.js` (No code change needed)

**Checklist:**
- [ ] **Design Note:** Cooperation is emergent, not hard-coded
  - Each tower independently targets the nearest unit in range
  - If two towers are near each other, they may attack the same unit
  - This is desired behavior (no override needed)
- [ ] Verify towers can attack the same unit in the same frame
- [ ] Log simultaneous attacks for analysis:
  ```javascript
  if (tower.target === previousFrame.tower.target) {
    logEvent({ type: 'multi_tower_focus', towers: [tower1.id, tower2.id], target: target.id });
  }
  ```

**Test:**
```javascript
// Two princess towers attacking the same unit
const unitAtCenter = { id: 1, x: 300, y: 500, hp: 160 };
const towerLeft = { x: 120, y: 680, range: 350, damage: 80, activationState: 'active', lastAttackTime: -999 };
const towerRight = { x: 480, y: 680, range: 350, damage: 80, activationState: 'active', lastAttackTime: -999 };

// Frame 1: Both attack at 1000ms
processTowerAttacks([towerLeft, towerRight], [unitAtCenter], 1000);
console.assert(unitAtCenter.hp === 0, 'Unit should be destroyed by both towers (160 - 80 - 80)');
```

---

## Phase 7: UI & Visual Feedback

### 7.1 Tower Health Bar ✅

**Location:** `src/ui/towerUI.js` or `src/game/renderer.js`

**Checklist:**
- [ ] Render HP bar above each tower:
  - [ ] Position: 60px wide, 8px tall, centered above tower
  - [ ] Color based on health:
    - [ ] Green: 75–100%
    - [ ] Yellow: 25–74%
    - [ ] Red: <25%
    - [ ] Gray: Inactive (King only)
    - [ ] Dark Red: Destroyed
  - [ ] Text: "HP / MaxHP" (e.g., "1800/1800")
  - [ ] Update every frame (no lag)
  - [ ] Fade out after 2s without damage

**Test (Visual):**
```
Tower with 100% HP → Green bar showing "1800/1800"
Tower with 50% HP → Yellow bar showing "900/1800"
Tower with 10% HP → Red bar showing "180/1800"
Destroyed tower → Dark gray, no bar
```

---

### 7.2 Tower Destruction Animation ✅

**Location:** `src/ui/animations.js`

**Checklist:**
- [ ] When tower destroyed (`tower.destroyed = true`):
  - [ ] Sprite: Darken to 30% opacity over 0.5s
  - [ ] Visual: Rubble/collapse effect
  - [ ] Audio: Stone crash + sad horn
  - [ ] Particle: Gray dust cloud (burst outward)
  - [ ] HP Bar: Disappear
  - [ ] Duration: 0.5s total
- [ ] King destruction adds extra emphasis:
  - [ ] Screen shake: 0.2s
  - [ ] Louder audio cue
  - [ ] "DEFEAT" message overlay

**Test (Visual):**
```
Princess destroyed → Sprite fades, dust effect, sad sound
King destroyed → Same + screen shake + "DEFEAT" text + defeat music
```

---

### 7.3 King Activation Animation ✅

**Location:** `src/ui/animations.js`

**Checklist:**
- [ ] When King enters AWAKENING state:
  - [ ] Duration: 0.6s
  - [ ] Opacity: 0.5 → 1.0 (fade in)
  - [ ] Glow: Yellow/golden glow expands
  - [ ] Particles: Golden light burst outward
  - [ ] Audio: Deep bell toll (0–300ms fade in, 300–600ms crescendo)
  - [ ] Screen flash: 20% brightness increase
- [ ] After 0.6s, transition to ACTIVE state smoothly
- [ ] Visual should be satisfying (not boring, not over-the-top)

**Test (Visual):**
```
Princess destroyed at 30s → King glows, activates over 0.6s
Player feels: "Oh, King is waking up! I have a 0.6s window!"
```

---

## Phase 8: Data Persistence & Logging

### 8.1 Tower State Logging ✅

**Location:** `src/game/gameLoop.js` → Game events

**Checklist:**
- [ ] Log every tower attack:
  ```javascript
  logEvent({
    time: gameTime,
    type: 'tower_attack',
    tower: tower.id,
    target: target.id,
    damage: tower.damage,
    targetHpBefore: target.hp + tower.damage,
    targetHpAfter: target.hp
  });
  ```
- [ ] Log every tower destruction:
  ```javascript
  logEvent({
    time: gameTime,
    type: 'tower_destroyed',
    tower: tower.id,
    damageDealt: (tower.maxHp - tower.hp),
    killedBy: attacker.id
  });
  ```
- [ ] Log King activation:
  ```javascript
  logEvent({
    time: gameTime,
    type: 'king_activated',
    reason: reason, // 'princess_destroyed' or 'direct_damage'
    trigger: triggeringUnit.id
  });
  ```
- [ ] Store final tower state at game end

**Data Structure:**
```javascript
gameLog = {
  gameId: uuid(),
  duration: gameTime,
  winner: winner,
  towers: {
    playerKing: { finalHp, attacks, destroyed, activationTime },
    playerPrincessLeft: { finalHp, attacks, destroyed },
    playerPrincessRight: { finalHp, attacks, destroyed },
    // ... repeat for enemy
  },
  events: [ /* all logged events */ ]
};
```

---

## Phase 9: Testing & Validation

### 9.1 Unit Tests ✅

**File:** `tests/towers.test.js`

**Checklist:**
- [ ] Test tower initialization (positions, stats, states)
- [ ] Test King activation triggers (princess death, direct damage)
- [ ] Test King awakening duration (0.6s)
- [ ] Test attack cooldowns (1.25s, 1.5s)
- [ ] Test target finding (closest unit in range)
- [ ] Test damage application (HP clamping)
- [ ] Test tower destruction (flag set, callbacks fired)
- [ ] Test HP bar color coding (green/yellow/red)
- [ ] Test win conditions (King destroyed, time-based scoring)
- [ ] Test multi-tower focus (both attack same unit)

**Example Test:**
```javascript
describe('Tower System', () => {
  test('King Tower starts INACTIVE', () => {
    const towers = initializeTowers('player');
    expect(towers.king.activationState).toBe('inactive');
  });

  test('King Tower activates when Princess destroyed', () => {
    const towers = initializeTowers('player');
    towers.princessLeft.destroyed = true;
    checkKingActivation(towers.king, towers.princessLeft, towers.princessRight);
    expect(towers.king.activationState).toBe('awakening');
  });

  test('King Tower takes no damage during awakening', () => {
    const king = { activationState: 'awakening', hp: 3500 };
    const originalHp = king.hp;
    damageTower(king, 100);
    expect(king.hp).toBe(originalHp);
  });
});
```

---

### 9.2 Integration Tests ✅

**File:** `tests/gameplay.integration.test.js`

**Checklist:**
- [ ] Full game scenario: 2 players, towers initialized
- [ ] Tower attacks move when unit enters range
- [ ] Multiple towers attack same unit (focus fire)
- [ ] Unit dies → tower stops attacking it
- [ ] Princess destroyed → King activates
- [ ] King activation → 0.6s window observed
- [ ] Game ends when King destroyed
- [ ] Win scoring works (3 pts for King, 1 for Princess)
- [ ] Overtime activates on tie
- [ ] Overtime ends on tower destruction

**Example Test:**
```javascript
test('Game ends when King destroyed', async () => {
  const game = initializeGame();
  const unit = spawnUnit('enemy', 'pekka', { x: 300, y: 700 });
  
  // Let unit attack King
  for (let i = 0; i < 100; i++) {
    updateGameFrame(game);
  }
  
  // Check if player King is destroyed and game ended
  expect(game.gameOver).toBe(true);
  expect(game.winner).toBe('enemy');
});
```

---

### 9.3 Playtesting Protocol ✅

**Location:** `PLAYTESTING_TOWER_SYSTEM.md` (separate document)

**Checklist:**
- [ ] Run 20+ games with current values
- [ ] Measure: Game duration, tower survival rate, win rate distribution
- [ ] Collect feedback: "Did tower damage feel fair? Did King activation feel impactful?"
- [ ] Identify outliers: Which games were too short/long? What strategies dominated?
- [ ] Analyze data: Compare against "Success Criteria" from TOWER_BALANCE_SPREADSHEET.md
- [ ] Make tuning decisions: Update [PLACEHOLDER] values based on findings
- [ ] Document decisions in version history

---

## Phase 10: Final Checklist

### 10.1 Code Quality ✅

- [ ] All functions documented with JSDoc
- [ ] No console.log() left in production code
- [ ] All [PLACEHOLDER] values marked in comments
- [ ] No magic numbers (use constants.js)
- [ ] Error handling for null targets, out-of-range etc.
- [ ] Performance: Tower loop O(n) where n = number of towers (3 per side)

---

### 10.2 Performance ✅

**Checklist:**
- [ ] Tower attack processing: < 1ms per frame
- [ ] Target finding: < 0.5ms per tower per frame
- [ ] No frame rate drops when towers attack

**Profiling:**
```javascript
const start = performance.now();
processTowerAttacks(towers, allUnits, gameTime);
const elapsed = performance.now() - start;
console.log(`Tower processing: ${elapsed.toFixed(2)}ms`);
```

---

### 10.3 Documentation ✅

- [ ] Code comments explain WHY, not WHAT
- [ ] Function signatures include parameter types
- [ ] All state transitions documented (INACTIVE → AWAKENING → ACTIVE)
- [ ] Edge cases handled (null target, out-of-range, simultaneous deaths)
- [ ] References to GDD_TOWER_SYSTEM.md in key functions

---

### 10.4 Handoff Readiness ✅

- [ ] All code reviewed and merged to main branch
- [ ] All tests passing (unit + integration)
- [ ] GDD_TOWER_SYSTEM.md available for reference
- [ ] TOWER_BALANCE_SPREADSHEET.md ready for playtesting
- [ ] PLAYTESTING_PROTOCOL.md distributed to QA team
- [ ] All [PLACEHOLDER] values clearly marked
- [ ] Emergency contacts if urgent tuning needed during playtest

---

## 📌 Handoff Signature

**Implemented By:** [Engineering Team]  
**Date:** [Implementation Date]  
**Reviewed By:** [Lead Engineer]  
**Design Review:** [Game Designer]  
**QA Approved:** [QA Lead]

**Status:** 
- [ ] Ready for Playtesting
- [ ] Awaiting Final Review
- [ ] Approved for Release

---

**Next Steps After Handoff:**
1. Run 20+ playtesting games
2. Collect player feedback
3. Analyze telemetry data
4. Make tuning decisions
5. Update TOWER_BALANCE_SPREADSHEET.md
6. Iterate if needed
7. Final balance approval

---

**Document Location:** This file  
**Companion Documents:**
- `GDD_TOWER_SYSTEM.md` (Design specification)
- `TOWER_BALANCE_SPREADSHEET.md` (Balance values & analysis)
- `tests/towers.test.js` (Unit tests)
- `tests/gameplay.integration.test.js` (Integration tests)
