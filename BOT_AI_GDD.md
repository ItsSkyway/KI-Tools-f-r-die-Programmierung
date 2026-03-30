---
title: Bot AI System - Game Design Document
version: 2.0
date: 2024
status: IMPLEMENTED
---

# Bot AI System - Game Design Document

## Executive Summary

Three-tier bot difficulty system with distinct behavioral profiles, state machines, and counter-strategies. Each difficulty represents a complete playstyle with measurable win rates and tunable parameters.

---

## 1. Core Gameplay Loop: Bot Decision Making

### Moment-to-Moment (Per Frame: ~33ms)

1. **Decision Check**: Is it time to make a new decision?
   - Easy: Every 5-8 seconds
   - Medium: Every 3-5 seconds
   - Hard: Every 2-3 seconds

2. **Board Analysis** (Hard only):
   - Threat assessment
   - Tower HP calculation
   - Unit count comparison
   - Game phase detection

3. **Card Selection**: Choose which card to play
   - Easy: Random (100%)
   - Medium: 50% random, 50% strategic
   - Hard: Tactical counter-play

4. **Positioning**: Choose where to place card
   - Easy: Random (0-600 on X/Y)
   - Medium: Rough strategical areas
   - Hard: Optimized tactical placement

5. **Execution**: Queue decision with reaction delay
   - Easy: 1.5-2.5 seconds
   - Medium: 0.8-1.2 seconds
   - Hard: 0.2-0.5 seconds

### Session Loop (One Match: 3 minutes)

1. **Early Phase (0-60s)**: Resource gathering, card cycling
2. **Mid Phase (60-120s)**: Build-up, minor engagements
3. **Finishing Phase (120-180s)**: Maximum pressure, win condition push

### Long-Term (Win Rate Calibration)

- **Easy**: Loses ~80% of games against competent players (20% win rate)
- **Medium**: Competitive (50% win rate against skilled human players)
- **Hard**: Dominates (70%+ win rate, exploits human inefficiencies)

---

## 2. Difficulty Tier Analysis

### EASY BOT (🟢 Beginner)

**Player Fantasy**: "I can beat an AI by doing whatever I want"

**Core Design**:
- Pure random card selection
- Completely random positioning
- No strategy whatsoever
- Occasional "sleep" (doesn't play for 10 seconds)

**Mechanics**:

| Aspect | Value | Notes |
|--------|-------|-------|
| Play Rate | 5-8 sec | Slow, predictable |
| Card Selection | 100% Random | No filtering |
| Positioning | Full randomness | X: 150-450, Y: 100-300 |
| Reaction Time | 1.5-2.5 sec | Obvious delay |
| Defense Response | None (50% of time) | Passive |
| Sleep Chance | 20% | Waits 10+ seconds |
| Win Rate Target | ~20% | Loses 4 of 5 |

**State Machine**:
- `CYCLING` → (Random play) → `CYCLING`
- `WAITING` (20% chance) → (Sleeps) → `CYCLING`

**Strategy**:
```
makeDecision(botState):
  1. Filter playable cards
  2. Pick random card
  3. Pick random position
  4. Play immediately
```

**Win Rate Hypothesis**: Bad card choices + poor positioning = easy to beat

---

### MEDIUM BOT (🟡 Intermediate)

**Player Fantasy**: "I need to think strategically to win"

**Core Design**:
- 50% random, 50% strategic plays
- Threat-aware (does NOT counterthreats)
- Balanced offense/defense transitions
- Smart card value filtering

**Mechanics**:

| Aspect | Value | Notes |
|--------|-------|-------|
| Play Rate | 3-5 sec | Moderate speed |
| Card Selection | 50/50 Mix | Half random, half high-value |
| Positioning | Semi-strategic | Safe zones, not optimal |
| Reaction Time | 0.8-1.2 sec | Noticeable but fair |
| Defense Response | 50% of threats | Reactive, not proactive |
| Deck Tracking | Surface-level | Knows hand size, not specific cards |
| Win Rate Target | ~50% | True 50/50 matchup |

**State Machine**:
```
If (underHeavyAttack AND elixir >= 5):
  → DEFENSIVE
Else if (elixirDiff > +2):
  → OFFENSIVE
Else:
  → CYCLING
```

**State Transitions**:

1. **CYCLING** (Default)
   - 50% Random selection
   - 50% High-value card selection
   - Used: 60% of time

2. **DEFENSIVE** (Tower under attack)
   - Priority 1: Buildings
   - Priority 2: AOE spells (if many units)
   - Priority 3: Tank units
   - Used: 25% of time

3. **OFFENSIVE** (Elixir advantage)
   - Prioritize high-cost troops
   - Prefer building-targeting cards
   - Pursue aggressive placement
   - Used: 15% of time

**Strategy Decision Tree**:
```
makeDecision():
  threats = analyzeBoardState()
  
  if threats.underHeavyAttack:
    return selectDefensiveCard()
  else if botElixir > playerElixir + 2:
    return selectOffensiveCard()
  else:
    if random() < 0.5:
      return randomCard()
    else:
      return highestValueCard()
```

**Win Rate Hypothesis**: Smart but predictable; exploitable by maintaining elixir advantage

---

### HARD BOT (🔴 Expert)

**Player Fantasy**: "This bot destroys me no matter what I do"

**Core Design**:
- Advanced threat analysis
- Counter-strategy execution
- Deck knowledge (knows all 8 cards)
- Phase-aware playstyle (changes after minute 2)
- Aggressive opening, defensive middle, finishing push

**Mechanics**:

| Aspect | Value | Notes |
|--------|-------|-------|
| Play Rate | 2-3 sec | Fast, reactive |
| Card Selection | Tactical | Counters specific threats |
| Positioning | Optimized | Precise tactical placement |
| Reaction Time | 0.2-0.5 sec | Feels instant |
| Defense Response | 100% response | Always counters threats |
| Deck Tracking | Full knowledge | Knows all 8 cards |
| Phase Awareness | After 2 min | Changes strategy |
| Win Rate Target | 70%+ | Dominates |

**State Machine**:
```
if immediateKingThreat:
  → DEFENSIVE (blocks push)
else if gamePhase == FINISHING AND elixirDiff > 0:
  → OFFENSIVE (win condition)
else if opponentBuiltUp AND botElixir >= 8:
  → OFFENSIVE (preemptive strike)
else if botElixir > 6 AND !underAttack:
  → OFFENSIVE (maintain pressure)
else:
  → DEFENSIVE (safe play)
```

**State Transitions**:

1. **DEFENSIVE** (Threats active)
   - Immediate response to incoming units
   - Building placement: 80% accuracy
   - AOE spam if manyUnits
   - Used: 45% of time

2. **OFFENSIVE** (Advantage window)
   - High-cost troop deployment
   - Building-targeting cards vs defensive structures
   - Center-of-board pushes
   - Used: 35% of time

3. **CYCLING** (Waiting for opportunity)
   - Cheap spell spam
   - Cycle for better rotation
   - Maintain elixir advantage
   - Used: 20% of time

**Advanced Strategies**:

#### Counter-Play System
```
If playerHasMany Troops:
  → Prioritize AOE spells (Fireball, Arrows)
  
If playerHasBuilding:
  → Deploy building-targeting troops (Giant, Hog)
  
If playerLowHealth:
  → Aggressive offensive push
  
If botLowHealth:
  → Deploy defensive buildings immediately
```

#### Phase Awareness
```
Early Phase (0-60s):
  - Conservative cycling
  - Build up elixir
  - Learn player deck

Mid Phase (60-120s):
  - Balanced play
  - Test defenses
  - Adapt strategy

Finishing Phase (120-180s):
  - Aggressive offensive pushes
  - All-in plays
  - Maximize damage
```

#### Positioning Optimization
```
For Spells:
  - If many units: Center (300, 350)
  - Otherwise: Standard (300, 300)

For Buildings:
  - If king threatened: Defense (300, 400)
  - Otherwise: Standard (300, 350)

For Troops:
  - If targeted building: Push center
  - If splash unit: Flanking positions
  - Otherwise: Tactical spread
```

**Win Rate Hypothesis**: Faster reactions + better decisions + deck knowledge = dominance

---

## 3. Board Analysis System

### Threat Detection (All Difficulties)

```typescript
threats = {
  // Unit-level threats
  manyEnemyUnits: totalEnemyUnits > 4,
  underHeavyAttack: enemyUnits > 3 AND botHP < 2500,
  enemyHasBuildings: playerBuildings.length > 0,

  // King tower threats
  immediateKingThreat: botHP < 1500,
  kingTowerCritical: botHP < 1000,
  playerKingWeak: playerHP < 1500,

  // Resource threats
  elixirLead: botElixir > playerElixir + 2,
  elixirBehind: botElixir < playerElixir - 2,

  // Positioning threats
  playerHasFrontLine: totalEnemyUnits > 2,
  ownTroopsCount: totalFriendlyUnits,
}
```

### Card Selection Priority (Medium Bot)

```
DEFENSIVE STATE:
  1. Buildings (defense structures)
  2. AOE spells (if manyUnits)
  3. Tank units (high HP)

OFFENSIVE STATE:
  1. High-cost troops (5+ elixir)
  2. Building-targeting troops
  3. Splash damage troops

CYCLING STATE:
  50% Random OR 50% Highest Value
```

### Card Selection Priority (Hard Bot)

```
If manyEnemyUnits:
  → selectAOECard() [Primary]

If immediateKingThreat:
  → selectDefensiveCard() [Primary]

If canOffense:
  → selectOffensiveCard() [Primary]

Else:
  → selectHighValueCard() [Secondary]
```

---

## 4. Playability & Timing

### Play Rate (Decision Timing)

| Difficulty | Min Interval | Max Interval | Range |
|------------|-------------|-------------|-------|
| Easy | 5.0 sec | 8.0 sec | +/- 1.5s random |
| Medium | 3.0 sec | 5.0 sec | +/- 1.0s random |
| Hard | 2.0 sec | 3.0 sec | +/- 0.5s random |

**Rationale**: 
- Easy plays slowly (predictable, avoidable)
- Medium plays at normal pace (competitive)
- Hard plays fast (reactive, threatening)

### Reaction Time (Decision Queue Delay)

| Difficulty | Min | Max | Purpose |
|------------|-----|-----|---------|
| Easy | 1.5 sec | 2.5 sec | Telegraphs decision |
| Medium | 0.8 sec | 1.2 sec | Fair competition |
| Hard | 0.2 sec | 0.5 sec | Feels instant |

**Rationale**: 
- Easy: Long delay = player has time to react
- Medium: Medium delay = fair response window
- Hard: Short delay = feels threatening & responsive

### Elixir Checks

```
All difficulties:
  if botElixir < cardCost:
    return null  // Can't play

MEDIUM + HARD:
  if botElixir >= X:
    preferHighValueCards()
```

---

## 5. State Machine Architecture

### Easy Bot (Simple)
```
START → CYCLING → (Random play) → CYCLING
         ↓ (20% chance)
         WAITING → (Sleep 10s) → CYCLING
```

### Medium Bot (Balanced)
```
         ← (elixir lost) ←
         ↓               ↑
START → CYCLING → OFFENSIVE → CYCLING
         ↓ ↑
         DEFENSIVE (if attacked)
```

### Hard Bot (Aggressive)
```
         ← (threat cleared) ←
         ↓                   ↑
START → CYCLING → OFFENSIVE → CYCLING
         ↓ ↑ ↑
         DEFENSIVE (immediate threat)
```

---

## 6. Testing & Validation

### Win Rate Targets

| Difficulty | vs Novice | vs Intermediate | vs Expert | Target |
|------------|-----------|-----------------|-----------|--------|
| Easy | 5% | 10% | 15% | ~20% average |
| Medium | 40% | 50% | 60% | ~50% average |
| Hard | 70% | 75% | 80% | 70%+ average |

### Key Metrics

```
Win Rate = (wins / total_games) * 100
Play Speed = Average time between card plays
Decision Quality = Optimal card choice / Total choices
Threat Response = Counters / Threatening situations
```

### Test Scenarios

1. **vs Many Units**: Does bot deploy AOE?
2. **vs Low Health**: Does bot defend?
3. **Elixir Advantage**: Does bot attack?
4. **Deck Cycling**: Does bot rotate efficiently?
5. **King Threat**: Does bot react immediately?

---

## 7. Tuning Parameters

### Easy Bot (Beginner Tuning)

```javascript
SLEEP_CHANCE = 0.20          // 20% chance to wait
PLAY_INTERVAL = [5000, 8000] // 5-8 seconds
REACTION_TIME = [1500, 2500] // 1.5-2.5 seconds
RANDOM_POSITION_RANGE = 0.8  // 80% random placement
```

**Adjustment Notes**:
- Increase SLEEP_CHANCE → Slower, easier
- Decrease PLAY_INTERVAL → Faster, harder
- Increase REACTION_TIME → More telegraphed

### Medium Bot (Intermediate Tuning)

```javascript
RANDOM_THRESHOLD = 0.50        // 50% random plays
PLAY_INTERVAL = [3000, 5000]   // 3-5 seconds
REACTION_TIME = [800, 1200]    // 0.8-1.2 seconds
ELIXIR_THRESHOLD = 7           // High-value preference at 7+ elixir
THREAT_RESPONSE_CHANCE = 0.50  // 50% threat response rate
```

**Adjustment Notes**:
- Increase RANDOM_THRESHOLD → Easier
- Decrease RANDOM_THRESHOLD → Harder
- Decrease PLAY_INTERVAL → More aggressive

### Hard Bot (Expert Tuning)

```javascript
REACTION_TIME = [200, 500]     // 0.2-0.5 seconds
PLAY_INTERVAL = [2000, 3000]   // 2-3 seconds
THREAT_RESPONSE_CHANCE = 1.0   // Always responds
COUNTER_EFFECTIVENESS = 0.95   // 95% effective counters
DECK_PREDICTION = 0.9          // 90% prediction accuracy
```

**Adjustment Notes**:
- Decrease REACTION_TIME → More threatening
- Decrease PLAY_INTERVAL → More aggressive
- Increase COUNTER_EFFECTIVENESS → Harder to beat

---

## 8. Implementation Checklist

### Core Systems
- [x] Bot state machine
- [x] Board analysis engine
- [x] Card selection strategies
- [x] Positioning algorithms
- [x] Play rate control
- [x] Reaction time delays

### Easy Bot
- [x] Random card selection
- [x] Random positioning
- [x] Sleep mechanic
- [x] No threat response

### Medium Bot
- [x] 50/50 random/strategic
- [x] Board threat detection
- [x] State transitions (CYCLING/OFFENSIVE/DEFENSIVE)
- [x] Partial deck knowledge
- [x] Semi-optimal positioning

### Hard Bot
- [x] Full threat analysis
- [x] AOE card selection
- [x] Counter-strategies
- [x] Full deck knowledge
- [x] Phase awareness
- [x] Optimal positioning
- [x] Immediate threat response

### Testing & Integration
- [x] Bot manager module
- [x] Decision execution pipeline
- [x] Difficulty configuration UI
- [x] Win rate tracking
- [x] Performance benchmarking

---

## 9. Future Enhancements

### Phase 2 Features
- [ ] Machine learning adaptation (learns from player patterns)
- [ ] Team play (coordinated multi-bot strategies)
- [ ] Psychological profile matching (aggressive vs conservative players)
- [ ] Card meta tracking (adjusts to popular decks)

### Phase 3 Features
- [ ] Custom difficulty slider (1-10)
- [ ] Personality profiles (aggressive, passive, balanced)
- [ ] Seasonal strategy updates
- [ ] Ranked ladder with bot tiers

---

## 10. Designer's Notes

### Why Three Tiers?

1. **Easy**: Entry point for learning game mechanics
2. **Medium**: Main competitive challenge
3. **Hard**: Skill ceiling, learning opportunity

### Why State Machine?

- Clear state transitions
- Debuggable behavior
- Tunable difficulty
- Predictable performance

### Why Board Analysis?

- Reactive play feels alive
- Strategy emerges naturally
- Win rates become achievable
- Difficulty scaling works

### Balance Philosophy

**Not:** "Bot does everything perfectly"
**But:** "Bot is efficient within constraints"

Easy bot is constrained by randomness.
Medium bot is constrained by partial information.
Hard bot is constrained by limited reaction speed (still not instant).

---

## 11. GDD Sign-Off

| Role | Date | Sign |
|------|------|------|
| Game Designer | 2024 | ✓ |
| Programmer | 2024 | ✓ |
| QA Lead | 2024 | ✓ |

**Status**: Ready for Implementation & Testing

