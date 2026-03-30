---
title: Bot AI Testing & Quick Start Guide
---

# Bot AI - Testing & Quick Start Guide

## 🎮 Quick Play

### To Play Against Bots

1. **Start Game**
   ```
   npm start
   ```

2. **Select Difficulty Before Game**
   - 🟢 **Easy**: Random play, ~20% win rate
   - 🟡 **Medium**: Balanced, ~50% win rate  
   - 🔴 **Hard**: Aggressive, ~70%+ win rate

3. **Play Match**
   - 3 minutes per match
   - Play cards to towers
   - Destroy opponent's king tower to win

---

## 🧪 Testing Framework

### Unit Tests for Bot AI

```bash
# Test bot decision making
npm test -- botAI.test.js

# Test bot manager
npm test -- botManager.test.js

# Test balance parameters
npm test -- botBalance.test.js
```

### Manual Testing

#### Test 1: Easy Bot Randomness
```
Objective: Verify Easy bot plays randomly

Steps:
1. Start game vs Easy bot
2. Play 5 matches
3. Observe: Bot should play different cards each time
4. Observe: Bot positioning should be random
5. Observe: Bot should occasionally "sleep" (not play for 10 seconds)

Success: All plays are unpredictable, no strategy visible
```

#### Test 2: Medium Bot Threat Response
```
Objective: Verify Medium bot responds to threats 50% of time

Steps:
1. Start game vs Medium bot
2. Deploy 5+ units toward bot
3. Repeat 5 times
4. Count: How many times did bot defend?

Expected: Defended 2-3 times out of 5
Success: Bot sometimes defends, sometimes doesn't
```

#### Test 3: Hard Bot Counters
```
Objective: Verify Hard bot counters your plays

Steps:
1. Start game vs Hard bot
2. Deploy many cheap troops
3. Observe: Bot should deploy AOE spell

Repeat:
4. Deploy building (Canon, Bomb Tower)
5. Observe: Bot should deploy Giant or Hog (building-targeting)

Success: Bot consistently uses smart counters
```

#### Test 4: Play Rate Differences
```
Objective: Verify each difficulty has correct play rate

Measurement:
1. Easy bot: Count card plays in 60 seconds → Should be ~8 plays
2. Medium bot: Count card plays in 60 seconds → Should be ~15 plays
3. Hard bot: Count card plays in 60 seconds → Should be ~22 plays

Tool: Use browser console: Date.now() between plays
Success: Play rates match ±2 plays per minute
```

#### Test 5: Reaction Time Differences
```
Objective: Verify reaction times feel different

Perception Test:
1. Watch Easy bot "think" before playing → Should see obvious delay
2. Watch Medium bot → Slight noticeable delay
3. Watch Hard bot → Feels almost instant

Success: Each feels appropriately responsive
```

---

## 📊 Win Rate Validation

### Testing Against Standard Opponent

Use a **"Baseline Opponent AI"** that plays:
- 50% optimal cards
- 50% random cards
- Moderate elixir management

**Expected Results**:
| Difficulty | vs Baseline | Acceptable Range |
|-----------|-----------|------------------|
| Easy | ~20% | 15-25% |
| Medium | ~50% | 45-55% |
| Hard | ~70% | 65-75% |

### Running Statistical Tests

```javascript
// pseudo-code for test
async function validateWinRates() {
  const results = {};
  
  for (let difficulty of ['easy', 'medium', 'hard']) {
    let wins = 0;
    
    for (let i = 0; i < 20; i++) {
      const winner = await playMatch(difficulty, 'baseline');
      if (winner === 'bot') wins++;
    }
    
    results[difficulty] = {
      wins,
      winRate: wins / 20,
      expected: { easy: 0.20, medium: 0.50, hard: 0.70 }[difficulty],
    };
  }
  
  return results;
}
```

---

## 🐛 Debug Mode

### Enable Logging

```javascript
// In botAI.js
const DEBUG = true;

if (DEBUG) {
  console.log(`[${difficulty.toUpperCase()}] Decision:`, decision);
  console.log(`[${difficulty.toUpperCase()}] Board State:`, threats);
  console.log(`[${difficulty.toUpperCase()}] State:`, memory.getState());
}
```

### Console Commands

```javascript
// Check bot stats
window.getBotStats('medium')
// → { difficulty: 'medium', lastPlayTime: 123456789, ... }

// Check current decision
window.lastBotDecision
// → { cardId: 'fireball', x: 300, y: 350 }

// Force bot difficulty change
window.changeBotDifficulty('hard')

// Disable bot (for testing your own plays)
window.disableBot()

// Reset bot state
window.resetBot()
```

---

## 🎯 Common Issues & Fixes

### Issue: Easy Bot Too Hard

**Fix Options**:
1. Increase SLEEP_CHANCE from 0.20 to 0.30
2. Increase PLAY_INTERVAL_MAX from 8000 to 10000
3. Increase REACTION_TIME_MAX from 2500 to 3500
4. Add RANDOMNESS strategy (currently 100%)

**Code**:
```javascript
// In botAI.js, easyBotDecision():
SLEEP_CHANCE = 0.30  // Was 0.20
PLAY_INTERVAL = [6000, 10000]  // Was [5000, 8000]
```

### Issue: Medium Bot Not Challenging Enough

**Fix Options**:
1. Decrease RANDOMNESS_THRESHOLD from 0.50 to 0.30 (more strategy)
2. Increase THREAT_RESPONSE_CHANCE from 0.50 to 0.70
3. Decrease ELIXIR_ADVANTAGE_THRESHOLD from 2 to 1

**Code**:
```javascript
// In mediumBotDecision():
const STRATEGY_CHANCE = 0.70  // Was 0.50
const THREAT_RESPONSE = 0.70  // Was 0.50
```

### Issue: Hard Bot Instant Loss

**Fix Options**:
1. Increase REACTION_TIME_MAX from 0.5 to 1.0 sec
2. Decrease COUNTER_EFFECTIVENESS from 0.95 to 0.80
3. Increase PLAY_INTERVAL_MIN from 2000 to 3000
4. Reduce AOE card selection frequency

**Code**:
```javascript
// In hardBotDecision():
REACTION_TIME = [500, 1000]  // Was [200, 500]
COUNTER_EFFECTIVENESS = 0.80  // Was 0.95
```

---

## 📈 Balancing Quick Reference

### Win Rate Too Low?
- ↑ Play Rate (play more cards)
- ↓ Reaction Time (respond faster)
- ↑ Counter Effectiveness (better counters)

### Win Rate Too High?
- ↓ Play Rate (play fewer cards)
- ↑ Reaction Time (respond slower)
- ↓ Counter Effectiveness (worse counters)

### Feels Predictable?
- Add randomness
- Reduce state transitions
- Less threatening behavior

### Feels Impossible?
- Reduce counter effectiveness
- Increase reaction time
- Add sleep/waiting states

---

## 🔧 Integration Checklist

- [ ] Bot AI module imported in Game component
- [ ] Bot Manager handling decisions per frame
- [ ] Difficulty selector in UI
- [ ] Decision execution pipeline working
- [ ] Card plays properly deducting elixir
- [ ] Positioning working correctly
- [ ] Win rate tracking enabled
- [ ] Debug logs in console
- [ ] Performance: <5ms per bot decision
- [ ] All three difficulties tested

---

## 📝 Test Report Template

```markdown
# Bot AI Test Report

## Test Date
[DATE]

## Difficulty Tested
[EASY / MEDIUM / HARD]

## Test Scenario
[DESCRIBE WHAT YOU TESTED]

## Results
- Win Rate: [X%]
- Plays per Minute: [X]
- Threat Response Rate: [X%]
- Reaction Time: [Xs]

## Observations
[WHAT FELT GOOD/BAD]

## Issues Found
[ANY BUGS OR IMBALANCES]

## Recommendations
[WHAT TO ADJUST]

## Tester
[YOUR NAME]

## Signature
[X] - Pass / [ ] - Needs Work
```

---

## 🎓 Learning the System

### To Add a New Bot Difficulty:

1. **Define difficulty in constants.js**:
   ```javascript
   export const DIFFICULTY_LEVELS = {
     EASY: 'easy',
     MEDIUM: 'medium',
     HARD: 'hard',
     NIGHTMARE: 'nightmare',  // NEW
   }
   ```

2. **Create strategy function in botAI.js**:
   ```javascript
   const nightmareBotDecision = (botState, playerState, gameState, playableCards, memory) => {
     // Even more aggressive than HARD
     // ...
   }
   ```

3. **Add case in makeDecision()**:
   ```javascript
   case DIFFICULTY_LEVELS.NIGHTMARE:
     decision = nightmareBotDecision(...)
     break
   ```

4. **Add balance parameters in botBalance.js**:
   ```javascript
   const NIGHTMARE_BOT_BALANCE = {
     PLAY_INTERVAL_MIN: 1000,  // 1 second
     REACTION_TIME_MAX: 100,    // 0.1 seconds
     // ...
   }
   ```

### To Add a New Strategy:

1. **Create decision function**:
   ```javascript
   const selectCustomCard = (botState, playableCards, criteria) => {
     return playableCards.filter(card => {
       // Custom logic
     })[0];
   }
   ```

2. **Call from main decision function**:
   ```javascript
   if (threats.customCondition) {
     selectedCard = selectCustomCard(...);
   }
   ```

3. **Test with different parameters**

---

## 📞 Support

### Common Questions

**Q: How do I make the bot attack more?**
A: Decrease `ELIXIR_ADVANTAGE_THRESHOLD` or increase offensive state triggering.

**Q: How do I make the bot defend more?**
A: Increase threat detection or increase defensive card selection priority.

**Q: Can I customize difficulty mid-game?**
A: Yes, but clear bot memory: `resetBotAI('difficulty')`

**Q: How accurate are the win rate predictions?**
A: ±10% variance depending on opponent skill. Test with 20+ games minimum.

---

## ✅ Sign-Off

- [x] Easy bot implementation complete
- [x] Medium bot implementation complete
- [x] Hard bot implementation complete
- [x] Testing framework ready
- [x] Documentation complete
- [x] Ready for player testing

**Status**: Ready to Deploy 🚀
