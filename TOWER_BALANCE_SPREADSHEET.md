# Tower System Balance Spreadsheet
**Version:** 2.0  
**Last Tested:** —  
**Status:** [PLACEHOLDER] - AWAITING PLAYTEST

---

## 📊 Core Tower Stats

### Base Statistics (Clash Royale-aligned)

```
┌─────────────┬──────────┬──────────┬────────┬────────┬────────┐
│ Tower       │ Max HP   │ Damage   │ Range  │ Atksp  │ DPS    │
├─────────────┼──────────┼──────────┼────────┼────────┼────────┤
│ Princess    │ 1800     │ 80       │ 350px  │ 1.25s  │ 64     │
│ King        │ 3500     │ 100      │ 400px  │ 1.5s   │ 66.7   │
├─────────────┼──────────┼──────────┼────────┼────────┼────────┤
│ COMBO       │ —        │ —        │ —      │ —      │ 128.7* │
│ (2P + K)    │ 7100     │ 260      │ —      │ —      │ —      │
└─────────────┴──────────┴──────────┴────────┴────────┴────────┘

*DPS with King ACTIVE
 Before King Activation: 128 DPS (2 Princess only)
```

---

## 🎯 Damage Analysis: Troop vs. Tower Interactions

### How Many Hits to Kill a Tower?

```
Princess Tower (1800 HP):
├─ By 80 DMG troop:  1800 / 80 = 22.5 hits → 23 hits
├─ By 100 DMG troop: 1800 / 100 = 18 hits
├─ By 50 DMG troop:  1800 / 50 = 36 hits
└─ By 150 DMG troop: 1800 / 150 = 12 hits

King Tower (3500 HP):
├─ By 80 DMG troop:  3500 / 80 = 43.75 → 44 hits
├─ By 100 DMG troop: 3500 / 100 = 35 hits
├─ By 150 DMG troop: 3500 / 150 = 23.3 → 24 hits
└─ By 200 DMG troop: 3500 / 200 = 17.5 → 18 hits

Time to Kill (at 1 troop attacking continuously):
├─ 80 DMG → Princess: 23 × 1.25s = 28.8s to kill
├─ 100 DMG → King: 35 × 1.5s = 52.5s to king only
└─ Reality: Multiple troops, towers attacking back = much shorter
```

### How Long Until Tower Kills Troop?

```
80 DMG Princess attacking 160 HP troop:
├─ Hits to kill: 160 / 80 = 2 hits
├─ Time: 2 × 1.25s = 2.5s
└─ Frames (at 60 FPS): 2.5 × 60 = 150 frames

100 DMG King attacking 160 HP troop:
├─ Hits to kill: 160 / 100 = 1.6 → 2 hits
├─ Time: 2 × 1.5s = 3.0s
└─ Frames: 3.0 × 60 = 180 frames

INSIGHT: Tower kills most troops in 2–4 hits, not "instant"
         (Player has time to react, place another unit, etc.)
```

---

## 🛡️ Defense Efficiency: Troop Cost vs. Tower Damage

### Elixir Economy Analysis

```
Assumption: 1 Elixir = ~20 HP troop (rough proxy)

Elite Barbarians: 6 Elixir = ~120 HP
├─ vs Princess (80 DMG): 120 / 80 = 1.5 hits → 2 hits total
├─ Tower Time to Kill: 2 × 1.25 = 2.5s
├─ Cost Efficiency: 6 Elixir destroyed in 2.5s = 2.4 Elixir/sec by tower
└─ Value Judgment: Good! Tower deletes mid-tier troop quickly

Hog Rider: 4 Elixir = ~200 HP
├─ vs Princess (80 DMG): 200 / 80 = 2.5 → 3 hits
├─ Tower Time to Kill: 3 × 1.25 = 3.75s
├─ Cost Efficiency: 4 Elixir in 3.75s = 1.07 Elixir/sec by tower
└─ Value Judgment: Moderate; player can support with troops to trade better

Goblin Gang: 3 Elixir = ~30 HP per unit (3 units = 90 total HP)
├─ vs Princess: 90 / 80 = 1.125 → 2 hits (kills all 3 in one volley? No.)
├─ Reality: Tower kills 1 unit (80 DMG), other 2 survive
├─ Actual Time: 1.25s to kill first unit, but 3 units split fire
└─ Value Judgment: Anti-swarm; need placement skill

CONCLUSION: Tower damage vs. troop cost is roughly balanced
            Princess damage ≈ 1 Elixir destruction per 1.25s
            King damage ≈ 1.33 Elixir destruction per 1.5s
```

---

## ⏱️ King Tower Activation Analysis

### Activation Scenarios

#### Scenario A: "Princess Dies First" (Most Common)
```
Timeline:
  t=0s: Game starts, King INACTIVE
  t=30s: Enemy destroys Princess Left → King activation
  t=30.6s: King AWAKENING complete → ACTIVE
  
DPS Change:
  Before: 80 + 80 = 160 DPS (2 Princess)
  During Awakening (0.6s): 80 + 0 = 80 DPS (only right princess)
  After: 80 + 100 = 180 DPS (Princess Right + King)
  
Outcome: +20 DPS after 0.6s window of weakness
```

#### Scenario B: "King Takes Direct Damage Early"
```
Timeline:
  t=0s: Game starts, King INACTIVE
  t=15s: Mini P.E.K.K.A reaches King → 50 damage
  t=15.0s: King activation triggered (direct damage)
  t=15.6s: King AWAKENING complete → ACTIVE
  
King HP: 3500 - 50 = 3450 HP (damaged, still has 1770 hits before death)
DPS Change: Same as Scenario A
Outcome: King loses some HP but gains active state early
```

#### Scenario C: "Princess Dies, Then King Dies" (Rare Comeback)
```
Timeline:
  t=0s: Game starts, King INACTIVE
  t=25s: Enemy destroys Princess Left
  t=25.6s: King ACTIVE
  t=35s: Enemy destroys King → GAME OVER
  
Survivor Analysis:
  ├─ Princess Right still alive (likely)
  ├─ Game ended because King destroyed (instant loss)
  └─ Timing: 10 seconds of King being active
  
Question: Is 10s enough for King to deal 3500 damage to attacker?
  Answer: 100 DMG × (10s / 1.5s) = 667 damage
          Not enough to kill 10-second push (likely 2000+ combined HP)
          
INSIGHT: King activation doesn't guarantee survival; late-game comeback possible
```

---

## 🎲 Tuning Variables (Marked [PLACEHOLDER])

### High-Impact Variables (Test First)

| Variable | Current | Min | Max | Impact | Test Plan |
|----------|---------|-----|-----|--------|-----------|
| **Princess.maxHp** | 1800 | 1500 | 2100 | 🔴 HIGH | Play 5 games each (1500/1650/1800/1950/2100), count avg tower survival time |
| **King.maxHp** | 3500 | 3000 | 4200 | 🔴 HIGH | Same as above; measure comeback rate with reduced King HP |
| **Princess.range** | 350 | 300 | 400 | 🟡 MEDIUM | Test lane coverage; does 300px feel too tight? 400px too safe? |
| **King.range** | 400 | 350 | 450 | 🟡 MEDIUM | Affects overlap with Princess towers; impacts 2-tower focus fire |

### Medium-Impact Variables (Test Second)

| Variable | Current | Min | Max | Impact | Notes |
|----------|---------|-----|-----|--------|-------|
| **Princess.damage** | 80 | 70 | 90 | 🟢 MEDIUM | Adjust if tower-to-troop TTK feels off |
| **Princess.attackSpeed** | 1.25s | 1.0s | 1.5s | 🟢 MEDIUM | Visual clarity vs. DPS balance |
| **King.damage** | 100 | 90 | 110 | 🟢 MEDIUM | Should feel ~1.25x princess; current is 1.25x |
| **King.attackSpeed** | 1.5s | 1.2s | 1.8s | 🟢 MEDIUM | Slower = feels more "heavy", faster = easier stack |
| **King.activationDelay** | 0.6s | 0.4s | 1.0s | 🟢 MEDIUM | Window of opportunity; too long = exploitable, too short = no window |

### Low-Impact Variables (Test Last)

| Variable | Current | Min | Max | Impact | Notes |
|----------|---------|-----|-----|--------|-------|
| Tower.targetRange | 350/400 | — | — | 🟢 LOW | Hard-coded; rarely changes |
| Attack Range Calc | Euclidean | — | — | 🟢 LOW | Standard formula; no adjustment needed |
| HP Clamp | max(0, hp - dmg) | — | — | 🟢 LOW | Correct; no overkill |

---

## 🧮 Damage Multiplier Analysis

### Critical Hits (Currently Disabled for Towers)

```
Q: Should towers have critical hits?
A: NO - Design intent is deterministic tower defense
   (Players should be able to calculate exact damage)
   
Current: Tower damage = tower.damage (always)
Alternative: tower.damage × [0.8–1.2] random multiplier (rejected)
```

### Defensive Multipliers (Against Heavy Armor)

```
Q: Should towers do reduced damage to armored units?
A: NO - Tower damage is already fixed and separate from troop stats
   (No armor stat exists in v1)
   
Future: If armor is added, tower damage might be: damage × (1 / (1 + armor))
```

### Splash Damage

```
Q: Should towers do splash damage to nearby units?
A: NO - Towers are single-target (unlike some Clash Royale towers)
   
Design Intent: Single-target tower forces tactical unit placement
              (Not "tank units in the middle and everything dies")
```

---

## 📈 Tower Strength Curve Over Time

### DPS Available by Game Time

```
Game Time | Active Towers | DPS | Notes
----------|---------------|-----|-----------------------------------
0:00      | P-L, P-R      | 128 | King INACTIVE
1:00      | P-L, P-R      | 128 | No changes yet
2:00      | P-L, P-R      | 128 | Still at base
2:30      | P-R, King*    | 130 | Assume P-L destroyed at this point
3:00      | P-R, King     | 130 | Game ends; scoring based on towers alive

*After King Awakening (0.6s activation delay)
```

**Interpretation:**
- **Early Game (0–1m):** Consistent defense (both princesses active)
- **Mid Game (1–2m):** First tower likely destroyed; DPS drop → comeback window
- **Late Game (2–3m):** King active; asymmetric defense (one side weak, center strong)
- **Overtime:** King is always active; pure "hold the line"

---

## 🎮 Hypothetical Troop Push Analysis

### Push Difficulty Index (PDI)

```
PDI = Attacker Elixir Cost / Tower Defense DPS

Example: Push with 10 Elixir worth of troops (say, 200 total HP)

vs 2 Princess Towers (128 DPS):
├─ Time to destroy all troop: 200 / 128 = 1.56s (if towers focused all)
├─ Reality: Towers split focus, so likely 2s
├─ PDI: 10 Elixir / 128 DPS = 0.078 (very high push cost vs DPS)
├─ Interpretation: Player needs ~0.078 seconds of DPS per elixir cost
└─ Verdict: 10 Elixir push is RISKY (towers shred it)

vs 1 Princess + King (180 DPS):
├─ Time to destroy: Same 200 / 180 = 1.11s
├─ PDI: 10 / 180 = 0.056 (slightly lower)
└─ Verdict: Marginally better, but still high risk

vs 2 Princesses (no King, post-death):
├─ Assume Princess Left destroyed, only P-R active (80 DPS)
├─ Time to destroy 200 HP: 200 / 80 = 2.5s
├─ PDI: 10 / 80 = 0.125 (much higher—indicates weakness)
├─ Interpretation: Attacker has 2.5s to deal damage before push dies
└─ Verdict: EXPLOITABLE (weak side after princess dies)
```

**Design Insight:**
- PDI helps identify "push windows"
- After first princess dies, PDI increases → window of opportunity
- King activation reduces PDI back down (King = 66.7 DPS)
- Late-game PDI should feel "pressured but survivable"

---

## ✅ Balance Checklist

### Pre-Playtesting

- [ ] All tower positions match Clash Royale spec (300,740 etc.)
- [ ] King Tower starts INACTIVE (grayed-out)
- [ ] King Tower activates on princess destruction
- [ ] King Tower activates on direct damage
- [ ] King Tower has 0.6s awakening animation (immune during)
- [ ] HP values are: Princess 1800, King 3500
- [ ] Range values are: Princess 350px, King 400px
- [ ] Damage values are: Princess 80, King 100
- [ ] Attack speeds are: Princess 1.25s, King 1.5s
- [ ] Towers target nearest troop in range
- [ ] Multiple towers can attack same unit
- [ ] Tower destroyed visual feedback plays
- [ ] King destruction triggers instant game over
- [ ] Overtime enters if tied at 180s
- [ ] HP bars display above towers (green/yellow/red)

### Post-Playtesting (Mark each)

- [ ] Princess HP feels tanky (>2 hits to destroy)
- [ ] King HP feels worth protecting (>3 hits to destroy)
- [ ] Attack speeds feel "responsive" (not too slow, not turbo)
- [ ] Range coverage feels fair (both lanes have defense)
- [ ] 0.6s awakening feels like playable window
- [ ] Focus fire feels punishing (multi-tower = high risk)
- [ ] Overtime feels tense (30s is right duration)

---

## 🔬 A/B Testing Plan

### Test Set 1: HP Tuning

```
Group A (Control): Princess 1800, King 3500
Group B: Princess 1650, King 3500
Group C: Princess 1800, King 3200

Measure:
├─ Average game length (should stay ~180s)
├─ Tower survival rate (% of games where tower survives)
├─ Win rate distribution (% ties, % one-sided)
└─ Player feedback: "Was it too easy to destroy towers?"

Success Criteria:
├─ Group A vs B: <5% difference in tower survival
├─ Group A vs C: No significant change in King destruction rate
└─ Player feedback: "Felt balanced"
```

### Test Set 2: Range Tuning

```
Group A (Control): Princess 350, King 400
Group B: Princess 330, King 380
Group C: Princess 370, King 420

Measure:
├─ Successful push rate (% of troops that reach tower)
├─ Multi-tower focus fire rate (% of kills by 2+ towers)
├─ Lane distribution (% of damage to each lane)
└─ Player feedback: "Did range feel fair?"

Success Criteria:
├─ Push success rate: 30–40% (not too easy, not too hard)
├─ Multi-tower focus: 20–30% of kills
├─ Lane balance: Within 10% of each other
```

---

## 📊 Data Logging Plan

### Per-Game Metrics to Track

```javascript
{
  gameId: "uuid",
  duration: number,          // ms
  winner: "player" | "enemy" | "draw",
  
  towers: {
    playerKing: {
      finalHp: number,
      damageDealt: number,
      attacks: number,
      destroyed: boolean,
      activationTime: number   // ms when activated
    },
    playerPrincessLeft: { /* same */ },
    playerPrincessRight: { /* same */ },
    // ... repeat for enemy
  },
  
  events: [
    { time: number, type: "tower_attack", tower: string, target: string, damage: number },
    { time: number, type: "tower_destroyed", tower: string, by: string },
    { time: number, type: "king_activated", tower: string, reason: "princess_destroyed" | "direct_damage" },
    // ...
  ]
}
```

### Aggregation (After 20+ Games)

```
Average:
├─ Game Duration: X seconds
├─ Tower Survival Rate: Y%
├─ King Activation Time: Z seconds
├─ Multi-tower Focus Kills: W%

Outliers:
├─ Shortest Game: A seconds (why? early push?)
├─ Longest Game: B seconds (why? defensive play?)
├─ Tower with most damage: C tower
└─ Most common destruction order: [ Tower X, Tower Y, Tower Z ]
```

---

## 🎯 Success Criteria

**The tower system is balanced when:**

1. ✅ **Defensive Feel:** Players feel protected by towers (not helpless)
2. ✅ **Push Risk:** Attacking towers is risky but possible (not impossible)
3. ✅ **Strategy:** Multiple viable strategies exist (center push, lane focus, mixed)
4. ✅ **Engagement:** King activation feels like a "turning point" (not trivial)
5. ✅ **Clarity:** Players can predict tower damage within ±10% (know their TTK)
6. ✅ **Pacing:** Game ends near 3 minutes (not 2m30s, not 4 minutes)
7. ✅ **Fairness:** Win distribution near 50/50 (no obvious P1/P2 advantage)

---

## 📌 Tuning Decision Log

| Change | Before | After | Reason | Date | Status |
|--------|--------|-------|--------|------|--------|
| Princess HP | [TBD] | 1800 | [PLACEHOLDER] Clash Royale baseline | — | Pending |
| King HP | [TBD] | 3500 | [PLACEHOLDER] 2x Princess + 100 buffer | — | Pending |
| King Activation | — | 0.6s | Playtesting feedback: window felt too short/long | — | Pending |

---

**Document Status:** 🟡 AWAITING PLAYTEST DATA  
**Next Step:** Run 20+ games, log metrics, analyze outliers  
**Final Step:** Make tuning decisions, update values
