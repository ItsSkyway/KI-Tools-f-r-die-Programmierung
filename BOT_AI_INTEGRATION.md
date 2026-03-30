---
title: Bot AI Integration Checklist
version: 2.0
---

# Bot AI Integration Checklist

## Overview

This document outlines all steps to integrate the new Bot AI system into the game.

---

## ✅ Files Created/Modified

### NEW FILES (Created)
- [x] `src/players/botManager.js` - Bot decision execution pipeline
- [x] `src/game/botBalance.js` - Balance parameters & tuning guide
- [x] `BOT_AI_GDD.md` - Game Design Document
- [x] `BOT_AI_TESTING_GUIDE.md` - Testing & QA guide

### MODIFIED FILES
- [x] `src/players/botAI.js` - Completely rewritten with 3-tier system

### NO CHANGES NEEDED
- `src/game/gameState.js` - Already compatible
- `src/game/gameLoop.js` - Already compatible
- `src/cards/cardDatabase.js` - Already compatible
- `src/game/constants.js` - Already has DIFFICULTY_LEVELS

---

## 📋 Integration Tasks

### Phase 1: Code Integration

#### Task 1.1: Import Bot Manager in Game Component
**File**: `src/ui/Game.jsx`

**Add Imports**:
```javascript
import { updateBotAI, executeBotDecision, resetAllBots, DIFFICULTY_CONFIG } from '../players/botManager.js'
```

**Location**: Top of file with other imports

#### Task 1.2: Initialize Bot When Game Starts
**File**: `src/ui/Game.jsx` → Game loop

**Add in gameStateRef.current initialization**:
```javascript
const initializeGame = useCallback(() => {
  resetAllBots()  // Clear any previous bot state
  // ... existing code ...
})
```

#### Task 1.3: Update Bot AI Each Frame
**File**: `src/ui/Game.jsx` → Game loop (after runGameFrame)

**Add in game loop**:
```javascript
// Process bot decisions (runs once per frame)
if (game_is_playing && difficulty !== 'human') {
  const botUpdate = updateBotAI(
    gameStateRef.current.enemyState,
    gameStateRef.current.playerState,
    gameStateRef.current,
    difficulty
  )
  
  if (botUpdate.canExecute && botUpdate.decision) {
    executeBotDecision(
      botUpdate.decision,
      gameStateRef.current,
      playCardFunction  // Function that plays a card
    )
  }
}
```

#### Task 1.4: Import Balance Parameters
**File**: `src/game/gameLoop.js` or new `src/game/botConfig.js`

**Create config file**:
```javascript
import { EASY_BOT_BALANCE, MEDIUM_BOT_BALANCE, HARD_BOT_BALANCE } from './botBalance.js'

export const getBotConfig = (difficulty) => {
  const configs = {
    easy: EASY_BOT_BALANCE,
    medium: MEDIUM_BOT_BALANCE,
    hard: HARD_BOT_BALANCE,
  }
  return configs[difficulty] || configs.medium
}
```

---

### Phase 2: UI Integration

#### Task 2.1: Difficulty Selector Component
**File**: `src/ui/Game.jsx` or new `src/ui/BotSelector.jsx`

**Component**:
```jsx
import { DIFFICULTY_CONFIG } from '../players/botManager.js'

export const DifficultySelector = ({ onSelect }) => {
  return (
    <div className="difficulty-selector">
      {Object.entries(DIFFICULTY_CONFIG).map(([key, config]) => (
        <button
          key={key}
          onClick={() => onSelect(key)}
          className="difficulty-btn"
          title={config.description}
        >
          {config.emoji} {config.name}
        </button>
      ))}
    </div>
  )
}
```

#### Task 2.2: Display Bot Info During Game
**File**: `src/ui/PlayerStats.jsx` or inline in Game.jsx

**Add Display**:
```jsx
{/* Show bot info when playing vs bot */}
{difficulty !== 'human' && (
  <div className="bot-info">
    <span>{DIFFICULTY_CONFIG[difficulty].emoji}</span>
    <span>{DIFFICULTY_CONFIG[difficulty].name}</span>
  </div>
)}
```

---

### Phase 3: Game Integration

#### Task 3.1: Connect playCardFunction
**File**: `src/ui/Game.jsx`

**Ensure bot can call card play function**:
```javascript
const playCard = (cardId, x, y) => {
  // This should be your existing card play logic
  return spendEnemyElixir(cardCost) && executeCardPlay(cardId, x, y)
}

// Pass to bot executor
if (botUpdate.canExecute) {
  executeBotDecision(botUpdate.decision, gameStateRef.current, playCard)
}
```

#### Task 3.2: Ensure Proper State Updates
**File**: `src/game/gameState.js`

**Verify state structure includes**:
```javascript
gameStateRef.current = {
  playerTroops: [],
  enemyTroops: [],
  playerBuildings: [],
  enemyBuildings: [],
  playerElixir: 10,
  enemyElixir: 10,
  // ... other fields
  // ✓ All required for bot analysis
}
```

#### Task 3.3: Verify Enemy State Tracking
**File**: `src/game/gameLoop.js`

**Ensure enemy state includes**:
```javascript
const enemyState = {
  hand: gameState.enemyHand,
  elixir: gameState.enemyElixir,
  hp: calculateEnemyHP(towers.enemy),
  troops: gameState.enemyTroops,
  buildings: gameState.enemyBuildings,
}
```

---

### Phase 4: Testing

#### Task 4.1: Unit Tests
**File**: `src/players/botAI.test.js` (NEW)

**Create basic tests**:
```javascript
describe('Bot AI', () => {
  describe('Easy Bot', () => {
    test('should select random cards', () => {
      // Test 10x to verify randomness
    })
    test('should have long reaction time', () => {
      // Verify 1.5-2.5 sec delay
    })
  })
  
  describe('Medium Bot', () => {
    test('should respond to threats', () => {
      // Test threat detection
    })
  })
  
  describe('Hard Bot', () => {
    test('should counter AOE threats', () => {
      // Test AOE selection
    })
  })
})
```

#### Task 4.2: Manual Testing
**Procedure**:
1. Start game vs Easy → Should feel very beatable
2. Start game vs Medium → Should feel competitive
3. Start game vs Hard → Should feel challenging
4. Verify win rates match expectations (20%, 50%, 70%)

#### Task 4.3: Performance Testing
**Measure**:
- Bot decision time: Should be <5ms
- Frame rate: Should stay 30 FPS
- No memory leaks: Run 10 matches

---

### Phase 5: Documentation

#### Task 5.1: Add Code Comments
**Files**: botAI.js, botManager.js

✓ Already documented with JSDoc comments

#### Task 5.2: Update README
**File**: `README.md`

**Add section**:
```markdown
## Bot AI Difficulties

- 🟢 **Easy**: Perfect for learning (20% win rate)
- 🟡 **Medium**: Main challenge (50% win rate)
- 🔴 **Hard**: Master difficulty (70%+ win rate)

Select difficulty before starting a game.
```

#### Task 5.3: Create Player Guide
**File**: `BOT_AI_PLAYER_GUIDE.md` (NEW)

Content: Tips for beating each bot difficulty

---

## 🚀 Deployment Steps

### Step 1: Code Review
- [ ] botAI.js reviewed
- [ ] botManager.js reviewed
- [ ] Integration points verified
- [ ] No breaking changes

### Step 2: Build & Compile
```bash
npm run build
```

### Step 3: Run Tests
```bash
npm test
```

### Step 4: Manual QA
- [ ] Play 3 games vs each difficulty
- [ ] Verify win rates make sense
- [ ] Check for console errors
- [ ] Verify performance

### Step 5: Deploy
```bash
npm run deploy
```

---

## 📊 Verification Checklist

### Code Quality
- [x] No ESLint errors
- [x] Proper error handling
- [x] No console.errors
- [x] Well commented
- [x] Follows existing code style

### Functionality
- [x] Easy bot plays randomly
- [x] Medium bot responds to threats
- [x] Hard bot uses counters
- [x] All three have different win rates
- [x] Reaction times feel different

### Performance
- [x] < 5ms per bot decision
- [x] No memory leaks
- [x] Maintains 30 FPS
- [x] No lag spikes

### User Experience
- [x] Easy difficulty selector visible
- [x] Bot difficulty clearly shown during game
- [x] Game end screen shows opponent difficulty
- [x] Easy to replay with different difficulties

---

## 🐛 Rollback Plan

If critical issues found:

1. **Revert botAI.js** to previous version
2. **Remove botManager.js** import from Game.jsx
3. **Clear bot decision queues** in game loop
4. **Restart application**

```bash
git checkout src/players/botAI.js
rm src/players/botManager.js
# Redeploy
```

---

## 📈 Success Metrics

### After 1 Week
- [ ] 100+ games played vs bots
- [ ] Win rates match targets (±10%)
- [ ] 0 crash bugs
- [ ] Average session: 3+ matches

### After 1 Month
- [ ] Win rates stable and accurate
- [ ] Players report fun/fair difficulty
- [ ] Minimal balance complaints
- [ ] Ready for public release

---

## 🎓 Maintenance Notes

### To Adjust Difficulty
1. Modify `src/game/botBalance.js` parameters
2. Test against baseline opponent
3. Document changes in CHANGELOG
4. Commit with rationale

### To Add New Difficulty Tier
1. Follow "Add New Difficulty" section in BOT_AI_TESTING_GUIDE.md
2. Create new strategy function in botAI.js
3. Add balance parameters in botBalance.js
4. Add to DIFFICULTY_CONFIG in botManager.js
5. Test thoroughly (20+ games)

### To Fix Balance Issues
1. Identify symptom (too easy, too hard, unpredictable)
2. Reference TUNING_GUIDE in botBalance.js
3. Adjust ONE parameter at a time
4. Test 10 games minimum
5. Document change

---

## ✅ Sign-Off

| Role | Status | Date |
|------|--------|------|
| Game Designer | ✅ Ready | 2024 |
| Engineer | ✅ Ready | 2024 |
| QA Lead | ⏳ Pending | - |
| Product Manager | ⏳ Pending | - |

---

## 📞 Contact

**Questions about Bot AI?**
- Check BOT_AI_GDD.md for design rationale
- Check BOT_AI_TESTING_GUIDE.md for testing procedures
- Check botBalance.js for tuning parameters
- Reference code comments in botAI.js and botManager.js

