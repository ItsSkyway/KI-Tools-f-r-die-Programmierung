# Deck Cycling - Integration Checklist

**Purpose:** Step-by-step checklist for implementing the cycling system into Game.jsx

**Estimated Time:** 1-2 hours

**Status:** Ready to start

---

## 📋 PHASE 1: Setup (15 minutes)

### ✓ Review Documentation
- [ ] Read DECK_CYCLING_QUICK_REFERENCE.md (5 min)
- [ ] Review DECK_CYCLING_GDD.md Section 2-3 (5 min)
- [ ] Skim DECK_CYCLING_IMPLEMENTATION_GUIDE.md (5 min)

**Goal:** Understand the system before touching code

---

## 📋 PHASE 2: File Verification (10 minutes)

### ✓ Verify New Files Exist
- [ ] `src/players/deckCycling.js` exists (11.5 KB)
- [ ] `src/players/deckCyclingIntegration.js` exists (4.4 KB)
- [ ] `src/ui/CardHandEnhanced.jsx` exists (7.7 KB)

**Command to verify:**
```bash
ls -la src/players/deckCycling*.js src/ui/CardHandEnhanced.jsx
```

### ✓ Verify Updated Files
- [ ] `src/players/playerManager.js` has been updated
  - Look for `deckCyclingState` in `createPlayerState()`
  - Look for `createDeckCyclingState()` import

**Command to verify:**
```bash
grep -n "deckCyclingState" src/players/playerManager.js
```

---

## 📋 PHASE 3: Update Game.jsx - Imports (10 minutes)

### ✓ Add Imports at Top of File

**Find this section:**
```javascript
import { getCard } from '../cards/cardDatabase.js'
import CardHand from './CardHand.jsx'
// ... other imports
```

**Add these imports:**
```javascript
import { 
  handleCardPlayWithCycling, 
  getPlayerCycleInfo, 
  getBotCycleDisplay 
} from '../players/deckCyclingIntegration.js'
import CardHandEnhanced from './CardHandEnhanced.jsx'
```

**Checklist:**
- [ ] Imports added without errors
- [ ] No typos in import paths
- [ ] Old CardHand import can stay (backward compat)

---

## 📋 PHASE 4: Update Game.jsx - State (10 minutes)

### ✓ Add Cycle Info State Hook

**Find the state section:**
```javascript
export default function Game() {
  const [player, setPlayer] = useState(...)
  const [enemy, setEnemy] = useState(...)
  // ... other useState hooks
}
```

**Add this after other state hooks:**
```javascript
const [cycleInfo, setCycleInfo] = useState(null)
const [enemyCycleDisplay, setEnemyCycleDisplay] = useState(null)
```

**Checklist:**
- [ ] State hooks added
- [ ] No syntax errors
- [ ] Placed in correct location (inside component)

### ✓ Add Effect Hook to Update Cycle Info

**Add this useEffect hook:**
```javascript
useEffect(() => {
  if (player && player.deckCyclingState) {
    const newCycleInfo = getPlayerCycleInfo(player)
    setCycleInfo(newCycleInfo)
  }
}, [player.deckCyclingState])

useEffect(() => {
  if (enemy && enemy.deckCyclingState) {
    const newEnemyCycleDisplay = getBotCycleDisplay(enemy)
    setEnemyCycleDisplay(newEnemyCycleDisplay)
  }
}, [enemy.deckCyclingState])
```

**Checklist:**
- [ ] useEffect hooks added
- [ ] Dependency arrays correct
- [ ] No infinite loops

---

## 📋 PHASE 5: Update onPlayCard Handler (30 minutes)

### ⚠️ CRITICAL - This is the Main Change

**Find this function:**
```javascript
const onPlayCard = (cardId) => {
  // OLD implementation
  const canPlay = player.elixir >= getCard(cardId).elixirCost
  if (!canPlay) return
  
  const result = cycleHand(player.hand, cardId, player.deck, player.handIndex)
  setPlayer({
    ...player,
    hand: result.newHand,
    handIndex: result.newIndex,
  })
  
  // ... rest of card play logic
}
```

### ✓ STEP 1: Add Cycle Handling

**Replace the old cycling logic with new:**
```javascript
const onPlayCard = (cardInstanceId, cardId) => {
  // ============ CYCLE LOGIC (NEW) ============
  const card = getCard(cardId)
  
  // Validate elixir
  if (player.elixir < card.elixirCost) {
    return
  }

  // Handle cycling and draw
  const cycleResult = handleCardPlayWithCycling(player, cardInstanceId, cardId)
  
  if (!cycleResult.success) {
    console.error('Card cycling failed:', cycleResult.error)
    return
  }

  // Update player with new cycling state
  const updatedPlayer = cycleResult.updatedPlayer
  setPlayer(updatedPlayer)

  // Update cycle display
  setCycleInfo(cycleResult.cycleInfo)

  // Log reshuffle if it happened
  if (cycleResult.reshuffle) {
    console.log('🔄 Deck reshuffled!')
    // TODO: Play reshuffle sound effect
    // playSound('reshuffle')
  }

  // ============ EXISTING CARD PLAY LOGIC ============
  // Now handle the actual card play (spawn unit, cast spell, etc.)
  // Your existing code here...
}
```

**Checklist:**
- [ ] Function signature updated (now takes cardInstanceId)
- [ ] Cycle handling comes first
- [ ] Card play logic still intact
- [ ] No syntax errors
- [ ] Reshuffle logging added

### ✓ STEP 2: Update CardHand Component Call

**Find where CardHand is rendered:**
```javascript
<CardHand 
  hand={player.hand} 
  currentElixir={player.elixir} 
  onPlayCard={onPlayCard} 
/>
```

**Replace with CardHandEnhanced:**
```javascript
<CardHandEnhanced
  hand={player.hand}
  currentElixir={player.elixir}
  onPlayCard={onPlayCard}
  cycleInfo={cycleInfo}
  showNextPreview={true}
  showCyclePosition={true}
/>
```

**Checklist:**
- [ ] Old CardHand removed or commented out
- [ ] CardHandEnhanced in correct position
- [ ] All required props passed
- [ ] No syntax errors

---

## 📋 PHASE 6: Testing - Basic (20 minutes)

### ✓ Test 1: Game Starts

**What to check:**
```
1. Start new game
2. Check console: No errors
3. Check hand: Has 4 cards
4. Check cycle display: Shows "0/8"
5. Check next preview: Shows next card correctly
```

**If problem:**
- Re-read DECK_CYCLING_QUICK_REFERENCE.md
- Check imports are correct
- Check CardHandEnhanced props

### ✓ Test 2: Play One Card

**What to check:**
```
1. Click on a playable card (green, enough elixir)
2. Check: Card leaves hand
3. Check: New card appears (animated from right)
4. Check: Cycle shows "1/8"
5. Check: Next preview updates
6. Check: No console errors
```

**If hand disappears:**
- onPlayCard() may have thrown error
- Check console for error messages
- Verify handleCardPlayWithCycling() returns { success: true, ... }

**If cycle doesn't advance:**
- Check: cycleResult.cycleInfo updated correctly
- Verify: setCycleInfo(cycleResult.cycleInfo) called

### ✓ Test 3: Play 4 Cards (One Full Hand)

**What to check:**
```
1. Play first 4 cards (clicking each)
2. Check: Cycle goes 0/8 → 1/8 → 2/8 → 3/8 → 4/8
3. Check: Hand always has 4 cards
4. Check: Next preview keeps updating
5. Check: No duplicates in hand
```

**If hand size goes below 4:**
- Bug in playCardAndCycle()
- Check remaining pool has cards

### ✓ Test 4: Play All 8 Cards (Reshuffle Trigger)

**What to check:**
```
1. Continue clicking cards until played 8 total
2. Check: At play 8, cycle shows "8/8"
3. Check: After play 8, cycle resets to "0/8" (RESHUFFLE)
4. Check: Console shows "🔄 Deck reshuffled!"
5. Check: Hand updated with new cards
```

**If reshuffle doesn't happen:**
- Check cycleResult.reshuffle === true
- Verify playCardAndCycle triggers reshuffle at cycle_index = 8

**If cycle doesn't reset:**
- Check getCycleInfo() returns position: 0 after reshuffle

---

## 📋 PHASE 7: Testing - Bot (15 minutes)

### ✓ Test 5: Bot Cycling

**What to check:**
```
1. Start game vs. medium bot
2. Let bot play 1-2 cards (should auto-play)
3. Check: Bot's cycle advances
4. Check: Bot plays max 4 cards before player turn
5. Let bot complete full 8 cards
6. Check: Bot reshuffles at correct time
7. Check: Bot continues playing normally after reshuffle
```

**If bot doesn't cycle:**
- Check: Bot's playerState has deckCyclingState
- Verify: Bot's play logic calls handleCardPlayWithCycling()
- Check: Bot's hand updates after play

### ✓ Test 6: Cycle Balance

**What to check:**
```
1. Play 3-4 full matches vs. medium bot
2. Check: Both player and bot reshuffle at same time (roughly)
3. Observe: Does cycling feel fair?
4. Does bot have obvious advantage? No?
5. Does player feel in control? Yes?
```

**Red Flags:**
- Bot always has better hand (unfair)
- Cycle feels random (but it's deterministic!)
- Reshuffle timing inconsistent

---

## 📋 PHASE 8: Visual Polish (Optional, 10 minutes)

### ✓ Optional: Add Reshuffle Sound Effect

**Find where to add sound:**
```javascript
if (cycleResult.reshuffle) {
  console.log('🔄 Deck reshuffled!')
  // playSound('reshuffle') // Uncomment if sound system exists
}
```

### ✓ Optional: Add Reshuffle Visual

**Ideas:**
- Brief white screen flash
- Card animation (all cards spin)
- Particles/confetti
- HUD notification

---

## 📋 PHASE 9: Documentation (10 minutes)

### ✓ Add Code Comments

**In your updated onPlayCard():**
```javascript
// Handle cycling and draw (DECK_CYCLING_SYSTEM)
const cycleResult = handleCardPlayWithCycling(player, cardInstanceId, cardId)
// See: DECK_CYCLING_QUICK_REFERENCE.md for details
```

### ✓ Document Any Custom Changes

If you modified the cycling system:
- [ ] Document what changed and why
- [ ] Update DECK_CYCLING_IMPLEMENTATION_SUMMARY.md

---

## 🧪 Quick Verification Script

**Run this in browser console to verify:**

```javascript
// Check 1: Player has cycling state
console.log('Player has cycling:', !!gameState.player.deckCyclingState)

// Check 2: Hand has 4 cards
console.log('Hand size:', gameState.player.hand.length)

// Check 3: Cycle position
console.log('Cycle position:', gameState.player.deckCyclingState.cycleIndex)

// Check 4: Next card
console.log('Next card:', gameState.player.deckCyclingState.remainingPool[0])

// Check 5: Total cards played
console.log('Total played:', gameState.player.deckCyclingState.totalCardsPlayed)
```

---

## 🆘 Troubleshooting

### Problem: "Hand disappears after clicking card"
**Solution:**
1. Check browser console for errors
2. Verify `handleCardPlayWithCycling()` returns `{ success: true, ... }`
3. Check `setPlayer()` is called with updated state

### Problem: "Cycle doesn't advance"
**Solution:**
1. Check `setCycleInfo()` is called
2. Verify `cycleResult.cycleInfo` is correct
3. Check React component is re-rendering

### Problem: "Reshuffle doesn't happen at play 8"
**Solution:**
1. Count total plays to verify it's actually 8
2. Check `playCardAndCycle()` logic in deckCycling.js
3. Verify `cycleIndex >= 8` triggers reshuffle

### Problem: "Bot hand not updating"
**Solution:**
1. Check bot also has `deckCyclingState`
2. Verify bot's play logic calls `handleCardPlayWithCycling()`
3. Check bot's state is passed correctly

### Problem: "CardHandEnhanced not rendering"
**Solution:**
1. Check import path is correct
2. Verify all required props passed
3. Check console for React errors
4. Verify hand array is not empty

---

## ✅ Final Verification Checklist

Before declaring "done":

- [ ] Game starts with no errors
- [ ] Hand displays 4 cards
- [ ] Cycle shows "0/8"
- [ ] Next preview shows correct card
- [ ] Playing card removes it from hand
- [ ] New card appears with animation
- [ ] Cycle advances by 1 each play
- [ ] After 8 plays, cycle resets to 0/8
- [ ] Reshuffle notification appears
- [ ] Bot cycles independently
- [ ] Both player and bot reach reshuffle
- [ ] No duplicates in hand
- [ ] No console errors
- [ ] Feels like real Clash Royale!

---

## 🎯 Success Criteria

**System is working when:**
1. ✅ All 8 tests above pass
2. ✅ No console errors
3. ✅ Cycle advances correctly
4. ✅ Reshuffle happens at right time
5. ✅ UI is clear and readable
6. ✅ Both player and bot cycle

---

## 📞 Need Help?

**Reference documents:**
- Quick question? → DECK_CYCLING_QUICK_REFERENCE.md
- Implementation details? → DECK_CYCLING_IMPLEMENTATION_GUIDE.md
- Design questions? → DECK_CYCLING_GDD.md
- Debugging? → DECK_CYCLING_IMPLEMENTATION_GUIDE.md "Debugging" section

---

**Estimated Total Time:** 1.5 - 2 hours  
**Difficulty:** Medium (mostly copy-paste with understanding)  
**Status:** Ready to implement

**Good luck! 🚀**
