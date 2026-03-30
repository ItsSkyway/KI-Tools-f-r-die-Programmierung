# Deck Cycling System - Quick Reference

## 🚀 30-Second Overview

**The deck cycling system is Clash Royale-accurate:**
- 8-card deck → shuffled at game start
- 4-card hand → always exactly 4 cards
- Playing a card → draws next from remaining pool
- After 8 plays → deck reshuffles automatically
- Both player and bot have identical cycling

---

## 📦 New Files

```
src/players/
  ├── deckCycling.js                    [NEW] Core cycling system
  ├── deckCyclingIntegration.js         [NEW] Game integration helpers
  ├── playerManager.js                  [UPDATED] Uses new cycling

src/ui/
  ├── CardHandEnhanced.jsx              [NEW] UI with cycle display
```

**Documentation:**
- `DECK_CYCLING_GDD.md` - Full game design
- `DECK_CYCLING_IMPLEMENTATION_GUIDE.md` - Integration guide
- `DECK_CYCLING_PLAYTESTING_GUIDE.md` - Playtesting checklist

---

## 🔧 Key Functions

### Creating Deck Cycling State
```javascript
import { createDeckCyclingState } from '../players/deckCycling.js'

const deckState = createDeckCyclingState(['knight', 'archer', ...])
// Returns:
// {
//   cycleIndex: 0,           // 0-7 position
//   hand: [...4 cards...],   // Current playable
//   remainingPool: [...],    // Waiting to draw
// }
```

### Playing a Card (Cycle + Draw)
```javascript
import { playCardAndCycle } from '../players/deckCycling.js'

const result = playCardAndCycle(deckState, cardInstanceId)
// Returns:
// {
//   success: true,
//   updatedState: {...},     // New deck state
//   reshuffle: false,        // Did reshuffle happen?
//   nextCardId: 'cannon',    // What's next?
// }
```

### Getting Cycle Info for UI
```javascript
import { getCycleInfo } from '../players/deckCycling.js'

const cycleInfo = getCycleInfo(deckState)
// Returns:
// {
//   position: 2,             // Current cycle position
//   positionDisplay: '2/8',  // For UI display
//   nextCardId: 'archer',    // Next card to draw
//   isNearReshuffle: false,  // Within 2 of cycle end?
// }
```

### Integrated Play Handler
```javascript
import { handleCardPlayWithCycling } from '../players/deckCyclingIntegration.js'

const cycleResult = handleCardPlayWithCycling(playerState, cardInstanceId, cardId)
// Returns:
// {
//   success: true,
//   updatedPlayer: {...},    // Player state with new cycling
//   cycleInfo: {...},        // Info for UI
//   reshuffle: false,        // Did deck reshuffle?
// }
```

---

## 💾 Data Flow

```
Game.jsx (playing card)
  ↓
onPlayCard(cardInstanceId, cardId)
  ↓
handleCardPlayWithCycling(player, cardInstanceId, cardId)
  ↓
playCardAndCycle(deckState, cardInstanceId)
  ↓
✓ Returns: { success, updatedPlayer, cycleInfo, reshuffle }
  ↓
setPlayer(updatedPlayer)
setCycleInfo(cycleInfo)
→ UI updates hand + cycle display
```

---

## 🎮 Integration Checklist

### In Game.jsx (Main Component)

```javascript
// 1. Add imports
import { handleCardPlayWithCycling, getPlayerCycleInfo } 
  from '../players/deckCyclingIntegration.js'
import CardHandEnhanced from './CardHandEnhanced.jsx'

// 2. Add state
const [cycleInfo, setCycleInfo] = useState(null)

// 3. Update onPlayCard handler
const onPlayCard = (cardInstanceId, cardId) => {
  // Validate elixir
  if (player.elixir < getCard(cardId).elixirCost) return
  
  // Cycle + draw
  const cycleResult = handleCardPlayWithCycling(player, cardInstanceId, cardId)
  if (!cycleResult.success) {
    console.error(cycleResult.error)
    return
  }
  
  // Update state
  setPlayer(cycleResult.updatedPlayer)
  setCycleInfo(cycleResult.cycleInfo)
  
  // Play card (existing logic)
  playCard(cardId) // Your existing function
}

// 4. Replace CardHand component
<CardHandEnhanced
  hand={player.hand}
  currentElixir={player.elixir}
  onPlayCard={onPlayCard}
  cycleInfo={cycleInfo}
  showNextPreview={true}
  showCyclePosition={true}
/>
```

---

## 📊 Cycle State Structure

```javascript
deckState = {
  // Tracking
  cycleIndex: 2,                    // 0-7: position in current cycle
  cycleCount: 0,                    // How many complete 8-card cycles
  totalCardsPlayed: 10,             // Lifetime plays

  // Cards
  deck: [...8 cards...],            // Full deck in shuffle order
  hand: [                           // 4 cards currently playable
    { cardId: 'knight', instanceId: '...' },
    { cardId: 'archer', instanceId: '...' },
    { cardId: 'giant', instanceId: '...' },
    { cardId: 'fireball', instanceId: '...' },
  ],
  remainingPool: [                  // 4 cards waiting to be drawn
    'minions',
    'cannon',
    'valkyrie',
    'hog',
  ],

  // Metadata
  lastShuffleTime: 1705...000,
  reshuffleHistory: [...],
}
```

---

## 🔄 Cycle Examples

### Example 1: Normal Play
```
Before: Hand=[A, B, C, D], Pool=[E, F, G, H], Cycle=0/8
Player plays A (first card)
After:  Hand=[B, C, D, E], Pool=[F, G, H], Cycle=1/8
```

### Example 2: Reshuffle
```
After playing 8 cards:
  Cycle=8/8 ← TRIGGERS RESHUFFLE
  
Combine hand + pool = [?, ?, ?, ?]
Fisher-Yates shuffle
New cycle begins:
  Cycle=0/8 (cycleCount incremented)
```

### Example 3: Bot Visibility
```
Player cannot see: Bot's hand, remaining pool
Player can see: "Bot has played 5/8 cards"
Player infers: "Bot will reshuffle in 3 plays"
```

---

## ⚙️ Configuration

### Default Values (in deckCycling.js)
```javascript
HAND_SIZE = 4                // Cards in hand
DECK_SIZE = 8                // Total deck cards
RESHUFFLE_TRIGGER = 8        // Cards until reshuffle
```

### Optional UI Settings
```javascript
<CardHandEnhanced
  showNextPreview={true}     // Show "Next: Archer (3)"
  showCyclePosition={true}   // Show "2/8"
/>
```

---

## 🧪 Testing

### Quick Test
```javascript
import { createDeckCyclingState, playCardAndCycle } from './deckCycling.js'

const deck = ['knight', 'archer', 'giant', 'fireball', 
              'minions', 'cannon', 'valkyrie', 'hog']
const state = createDeckCyclingState(deck)
console.log(state.hand)        // [knight, archer, giant, fireball]
console.log(state.cycleIndex)  // 0

const result = playCardAndCycle(state, state.hand[0].instanceId)
console.log(result.updatedState.cycleIndex) // 1
console.log(result.nextCardId)             // 'cannon'
```

### Verify Reshuffle
```javascript
let state = createDeckCyclingState(deck)

// Play 8 cards
for (let i = 0; i < 8; i++) {
  const result = playCardAndCycle(state, state.hand[0].instanceId)
  state = result.updatedState
  console.log(`Play ${i+1}: Cycle ${state.cycleIndex}/${HAND_MAX_DECK_SIZE}`)
}

// Should show: Cycle 0/8 after play 8 (reshuffle happened)
```

---

## 🎯 Success Indicators

### ✅ System Working
- [ ] Deck has 8 cards at start
- [ ] Hand has exactly 4 cards at all times
- [ ] Playing a card removes it and draws next
- [ ] Cycle index advances: 0→1→2→...→7→0 (reshuffle)
- [ ] Bot cycles match player cycling

### ✅ UI Clear
- [ ] Next card preview visible
- [ ] Cycle position (0/8) shows correctly
- [ ] Card playability obvious (green if playable)

### ✅ Feels Good
- [ ] Player plans plays around cycle
- [ ] Player correctly predicts next card
- [ ] Cycle rhythm feels like real Clash Royale

---

## 🐛 Debugging

### Check Deck State
```javascript
console.log('Hand:', player.hand.map(h => h.cardId))
console.log('Cycle:', player.deckCyclingState.cycleIndex)
console.log('Pool:', player.deckCyclingState.remainingPool)
console.log('Next:', getCycleInfo(player.deckCyclingState).nextCardId)
```

### Verify Shuffle is Deterministic
```javascript
const deck = ['knight', 'archer', 'giant', 'fireball', 
              'minions', 'cannon', 'valkyrie', 'hog']
const shuffle1 = createDeckCyclingState(deck).deck
const shuffle2 = createDeckCyclingState(deck).deck
console.log(shuffle1.join(',') === shuffle2.join(',')) // Should be false (random)
```

### Trace Cycle Progression
```javascript
let state = createDeckCyclingState(deck)
for (let i = 0; i < 15; i++) {
  console.log(`${i}: cycle=${state.cycleIndex}, next=${getCycleInfo(state).nextCardId}`)
  const result = playCardAndCycle(state, state.hand[0].instanceId)
  state = result.updatedState
}
// Should show: 0,1,2,3,4,5,6,7,0,1,2,3,4,5,6 (reshuffle at 8)
```

---

## 📚 Full Docs

- **GDD:** `DECK_CYCLING_GDD.md` - Complete game design
- **Implementation:** `DECK_CYCLING_IMPLEMENTATION_GUIDE.md` - How to integrate
- **Playtesting:** `DECK_CYCLING_PLAYTESTING_GUIDE.md` - How to balance/test

---

## 🎓 Concepts

### Fisher-Yates Shuffle
- Deterministic algorithm (no duplicates, truly random)
- O(n) time complexity
- Used for fair deck shuffling

### Cycle Index
- Tracks position in 8-card cycle: 0-7
- Resets to 0 after play 8 (reshuffle)
- Tells player how many plays until reshuffle

### Remaining Pool
- 4 cards not yet in hand
- Drawn in order when hand needs cards
- Combined with hand for reshuffle

### Reshuffle Trigger
- Happens after 8 cards played
- Combines hand (4) + remaining pool (4) = 8 cards
- Shuffles all 8, splits into new hand/pool

---

**Version:** 1.0  
**Status:** Ready to integrate  
**Last Updated:** 2024-01-15
