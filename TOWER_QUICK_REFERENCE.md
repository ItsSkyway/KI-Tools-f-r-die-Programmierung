# Tower System Quick Reference
**Print this and keep it close during implementation!**

---

## 🗺️ Tower Positions (Copy-Paste)

### Player (Bottom)
```javascript
playerTowers = {
  king: { x: 300, y: 740, type: 'king' },
  princessLeft: { x: 120, y: 680, type: 'princess' },
  princessRight: { x: 480, y: 680, type: 'princess' }
};
```

### Enemy (Top)
```javascript
enemyTowers = {
  king: { x: 300, y: 60, type: 'king' },
  princessLeft: { x: 120, y: 120, type: 'princess' },
  princessRight: { x: 480, y: 120, type: 'princess' }
};
```

---

## 📊 Tower Stats Table

| Stat | Princess | King |
|------|----------|------|
| **HP** | 1800 | 3500 |
| **Damage** | 80 | 100 |
| **Range** | 350px | 400px |
| **Attack Speed** | 1.25s | 1.5s |
| **Initial State** | ACTIVE | INACTIVE |

---

## 🔄 King Tower State Machine

```
START: INACTIVE
  ├─ Trigger 1: Princess.destroyed = true → AWAKENING
  ├─ Trigger 2: King.hp takes damage → AWAKENING
  └─ Visual: 50% opacity, grayed out

AWAKENING (0.6 seconds)
  ├─ Duration: 600ms exactly
  ├─ Immune to damage
  ├─ Does NOT attack
  └─ → ACTIVE (after 600ms)

ACTIVE (permanent)
  ├─ Full opacity, glowing
  ├─ Attacks normally
  ├─ Can take damage
  └─ Cannot return to INACTIVE
```

---

## 🎯 Target Priority (In Order)

1. **Troops** (all troop types)
2. **Buildings** (defensive structures)
3. **Spells** (v2 feature, not in v1)
4. **Select:** Closest unit by Euclidean distance

---

## 💥 Combat Flow

```
Per Frame:
  For each ACTIVE tower:
    1. Check cooldown: (now - lastAttackTime) >= attackSpeed?
    2. If ready: Find target in range
    3. If target found:
       a. Apply damage: target.hp -= tower.damage
       b. Clamp: target.hp = max(0, target.hp)
       c. If hp ≤ 0: target.destroyed = true
       d. Update: tower.lastAttackTime = now
    4. If target dies: Cleanup & remove from field
```

---

## 🛡️ HP Color Coding

```
Green:  hp >= 75% maxHp     (Safe)
Yellow: 25% <= hp < 75%     (Warning)
Red:    hp < 25%            (Critical)
Gray:   King + INACTIVE     (Not defending)
Dark:   destroyed = true    (Dead)
```

---

## 🏆 Win Conditions

### Immediate Loss (Anytime)
```
IF king.destroyed:
  → OPPONENT WINS
  → Game ends immediately
```

### Time-Based (At 180s)
```
playerScore = 0;
if (playerKing.destroyed) playerScore += 3;
if (playerPrincessLeft.destroyed) playerScore += 1;
if (playerPrincessRight.destroyed) playerScore += 1;

if (playerScore < enemyScore) → Player wins
if (playerScore > enemyScore) → Enemy wins
if (playerScore = enemyScore) → OVERTIME
```

### Overtime (If Tied at 180s)
```
Duration: Additional 30 seconds max
Rule: FIRST tower destroyed → That player loses
Music: Urgent/dramatic cue
Banner: "OVERTIME" on screen
```

---

## 🔧 Key Functions to Implement

### Initialization
```javascript
initializeTowers(owner) → returns 3 towers with full stats
```

### Activation
```javascript
activateKingTower(king) → sets state to 'awakening', records time
updateKingTowerAwakening(king, deltaTime) → transitions to 'active' after 600ms
checkKingActivation(king, p_left, p_right) → checks triggers
```

### Combat
```javascript
findTowerTarget(tower, allUnits, range) → returns closest unit or null
processTowerAttacks(towers, units, gameTime) → handles all attacks
damageTower(tower, damage) → applies damage, checks destruction
```

### Status
```javascript
isActive(tower) → boolean (can attack?)
isAlive(tower) → boolean (hp > 0?)
getHealthPercent(tower) → [0, 1]
calculateTowerScore(towers) → 0-5 points
```

---

## 📝 Event Logging

```javascript
// Every tower attack
{ type: 'tower_attack', time, tower, target, damage }

// When tower dies
{ type: 'tower_destroyed', time, tower, killedBy }

// When King activates
{ type: 'king_activated', time, reason, trigger }

// Game end
{ type: 'game_end', winner, reason, time }
```

---

## 🐛 Common Edge Cases

### Case 1: Multiple Towers Same Unit
```
Both attack in same frame → Both damage applies
Result: Unit takes 160 damage (80 + 80)
        Unit dies once, not twice
```

### Case 2: Tower Activated Mid-Combat
```
Princess dies (hp = 0) at frame 100
King activation triggers (awakening starts)
King is IMMUNE for 0.6s
Attacker has 600ms window to push
```

### Case 3: King Takes Damage Before Princess Dies
```
Small unit reaches King early
King takes 50 damage (hp = 3450)
King activates (AWAKENING)
Princess destruction no longer needed
```

### Case 4: Range Boundary (Exactly 350px)
```
distance = 350.00px, range = 350px
✓ In range (use ≤, not <)
distance = 350.01px
✗ Out of range
```

---

## ⚠️ [PLACEHOLDER] Values to Test

```
[ ] Princess.maxHp = 1800 (test: 1500, 1650, 1950, 2100)
[ ] King.maxHp = 3500 (test: 3000, 3200, 3800, 4200)
[ ] Princess.range = 350 (test: 300, 330, 370, 400)
[ ] King.range = 400 (test: 350, 380, 420, 450)
[ ] King.activationDelay = 0.6s (test: 0.4s, 0.5s, 0.8s, 1.0s)
```

After each test: Update TOWER_BALANCE_SPREADSHEET.md with results

---

## 🎮 Player Experience Goals

| Moment | Goal | Mechanic |
|--------|------|----------|
| Game Start | Feel defended | 2 Princess towers active |
| Mid-Game | Princess dies | King activates (0.6s window) |
| Late-Game | Push or defend | Overtime pressure |
| Loss | King destroyed | Instant, dramatic feedback |

---

## 🚀 Implementation Order (Recommended)

1. **Data Structure** → Tower objects with all fields
2. **Initialization** → Create 3 towers per side
3. **King Activation** → State machine (INACTIVE → AWAKENING → ACTIVE)
4. **Attack System** → Target finding + damage application
5. **Destruction** → Tower death + game end check
6. **UI** → HP bars + activation animation
7. **Testing** → Unit + integration tests
8. **Playtesting** → Collect feedback + tune values

---

## 📱 Copy-Paste Code Snippets

### Range Check
```javascript
const distance = Math.hypot(tower.x - unit.x, tower.y - unit.y);
const inRange = distance <= tower.range;
```

### Distance Sort (Closest First)
```javascript
const sorted = units.filter(u => inRange(tower, u))
  .sort((a, b) => distance(tower, a) - distance(tower, b));
const closest = sorted[0];
```

### Cooldown Check
```javascript
const timeSinceLastAttack = (gameTime - tower.lastAttackTime) / 1000;
const canAttack = timeSinceLastAttack >= tower.attackSpeed;
```

### King Awakening
```javascript
if (tower.activationState === 'awakening') {
  const elapsed = (now - tower.activationTime) / 1000;
  if (elapsed >= 0.6) {
    tower.activationState = 'active';
  }
}
```

### Damage Tower
```javascript
tower.hp = Math.max(0, tower.hp - damage);
if (tower.hp === 0) {
  tower.destroyed = true;
  onTowerDestroyed(tower);
}
```

---

## 🎯 Success Checklist Before Playtesting

- [ ] All 3 towers per side initialized with correct positions
- [ ] King starts INACTIVE, Princess ACTIVE
- [ ] King activation triggers on princess death ✓
- [ ] King activation triggers on direct damage ✓
- [ ] 0.6s awakening delay working (verified with timer)
- [ ] Towers attack every N seconds (1.25s/1.5s)
- [ ] Target finding returns closest unit in range
- [ ] Multiple towers can attack same unit
- [ ] Damage is applied, HP clamped at 0
- [ ] Tower destroyed flag set when hp ≤ 0
- [ ] Game ends when King destroyed (instant loss)
- [ ] Tower scoring works (3 for King, 1 for Princess)
- [ ] Overtime activates on tie at 180s
- [ ] All test cases passing
- [ ] No console errors or warnings

---

## 🆘 Debugging Commands

```javascript
// Log current tower state
console.table(towers);

// Check if tower in range
console.log(`Distance: ${distance}, Range: ${tower.range}, In Range: ${distance <= tower.range}`);

// Check activation state
console.log(`King state: ${towerStateRef.enemy.king.activationState}`);

// Simulate damage
damageTower(tower, 100);
console.log(`Tower HP: ${tower.hp}/${tower.maxHp}`);

// Check target
console.log(`Tower target: ${tower.target ? tower.target.id : 'none'}`);

// Check all events
console.table(gameLog.events);
```

---

## 📞 Key Questions to Ask During Implementation

1. **Is the King immune during awakening?** ✓ YES (0–600ms)
2. **Can a tower attack if another tower destroyed its target?** ✓ YES (finds new target)
3. **Does King activation prevent princess from attacking?** ✓ NO (both attack after 0.6s)
4. **Can multiple towers attack in the same frame?** ✓ YES (emergent cooperation)
5. **Is there overkill penalty (e.g., 160 damage vs 80 HP)?** ✓ NO (clamped to 0)
6. **Does King take full damage immediately when activated?** ✓ YES (if not during awakening)
7. **Is tower damage deterministic (no RNG)?** ✓ YES (tower.damage always)

---

## 🎓 Design Principles

> **Every tower mechanic exists to teach players:**
> - Position matters (range, lane coverage)
> - Defense has counterplay (0.6s awakening window)
> - Tower destruction has consequences (permanent, one-way)
> - Cooperation emerges from simple rules (no hard-coded focus fire)

---

**Last Updated:** 2025  
**For Latest Version:** See GDD_TOWER_SYSTEM.md
