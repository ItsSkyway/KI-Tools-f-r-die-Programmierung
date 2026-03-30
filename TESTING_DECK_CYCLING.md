# 🧪 Testing Guide: 4-Card Hand + Deck Cycling

## Overview
This document outlines comprehensive tests for the new 4-card hand system and deck cycling mechanics.

---

## TEST SUITE 1: Initial Hand Draw

### Test 1.1: Hand Displays 4 Cards at Game Start
**Setup:**
1. Open Clash Royale game
2. Go to Deck Builder
3. Select any 8 distinct cards
4. Click "Start Battle"

**Expected Result:**
- Hand at bottom shows exactly 4 cards
- All 4 cards are from your selected deck
- Each card displays emoji, name, and elixir cost

**Pass/Fail:** ___

### Test 1.2: Deck Pool Is Randomized
**Setup:**
1. Note the cards in your initial hand
2. Restart game 3 times with same 8-card deck
3. Observe initial hand each time

**Expected Result:**
- Initial hands are different each game (shuffled)
- Hand composition varies (proof of randomization)
- Same 8 cards are in play (no extra/missing cards)

**Pass/Fail:** ___

---

## TEST SUITE 2: Card Draw Mechanics

### Test 2.1: Playing Card Draws Replacement
**Setup:**
1. Start game with any deck
2. Note the 4 cards in hand: [A, B, C, D]
3. Play card A (drag to arena)

**Expected Result:**
- Card A removed from hand
- New card (E) drawn from pool
- Hand now shows [B, C, D, E]
- Hand size remains 4

**Pass/Fail:** ___

### Test 2.2: Repeated Card Plays
**Setup:**
1. Start fresh game
2. Play 5 cards sequentially (enough elixir to do so)
3. Note each card drawn

**Expected Result:**
- After each play, hand refills to 4
- Cards come from original deck
- No duplicates appear
- No hand goes below 4 or above 4

**Pass/Fail:** ___

### Test 2.3: Deck Pool Indicator Tracks Remaining Cards
**Setup:**
1. Start game
2. Look at "Deck Pool" indicator below hand
3. Play cards and observe pool count

**Expected Result:**
- Indicator shows "Deck Pool: 4 cards left" at start
- After playing 1 card, shows "Deck Pool: 3 cards left"
- After playing 2 cards, shows "Deck Pool: 2 cards left"
- etc.

**Pass/Fail:** ___

---

## TEST SUITE 3: Deck Cycling

### Test 3.1: Full Cycle (8 Cards Played)
**Setup:**
1. Start game with Test Deck (e.g., [Knight, Archer, Giant, Fireball, Arrows, Minions, Skeleton Army, Baby Dragon])
2. Play 8 cards total (may need to let elixir regenerate between plays)
3. Watch the "Deck Pool" indicator and "Cycled" counter

**Expected Result:**
- Deck Pool goes from 4 → 3 → 2 → 1 → 0 (as cards drawn)
- After 8th card played, Deck Pool = 0
- "Cycled: 1x" indicator appears
- On 9th card, deck reshuffles and draws continue
- New card order is different (proof of reshuffle)

**Pass/Fail:** ___

### Test 3.2: Multiple Cycles
**Setup:**
1. Start game, play aggressively for full match (180 seconds)
2. Track how many times "Cycled: Nx" increments
3. Note if hand ever runs empty

**Expected Result:**
- Cycled counter increments (e.g., Cycled: 1x → 2x → 3x)
- Hand never empty (always 4 cards available)
- Deck cycles smoothly without errors
- Game remains playable throughout

**Pass/Fail:** ___

---

## TEST SUITE 4: Next Card Preview

### Test 4.1: Preview Shows Next Deck Card
**Setup:**
1. Start game
2. Look at "Deck Pool: X cards left" section at bottom
3. Note the emoji shown as "Next:"

**Expected Result:**
- "Next:" shows an emoji (the next card in deck pool)
- When you play a card, the "Next:" emoji changes to the new next card
- Preview is always 1 card ahead

**Pass/Fail:** ___

### Test 4.2: Preview After Reshuffle
**Setup:**
1. Play 7 cards to nearly empty the deck
2. Play 8th card (triggers reshuffle)
3. Observe the "Next:" preview

**Expected Result:**
- Preview updates after reshuffle
- Shows a card from reshuffled deck (may be different from previous)
- Reshuffle is seamless (no UI glitch)

**Pass/Fail:** ___

---

## TEST SUITE 5: Balance Validation

### Test 5.1: Deck Builder Warns on High Elixir
**Setup:**
1. Go to Deck Builder
2. Select 8 cards with avg elixir > 4.0:
   - Example: P.E.K.K.A (7), Giant (5), Witch (5), Bomb Tower (5), Baby Dragon (4), Valkyrie (4), Hog Rider (4), Freeze (4)
   - Average ≈ 4.625

**Expected Result:**
- Warning message appears: "⚠️ High average elixir - deck may feel slow"
- Shows the calculated average elixir

**Pass/Fail:** ___

### Test 5.2: Deck Builder Warns on Too Many High-Elixir Cards
**Setup:**
1. Go to Deck Builder
2. Select 8 cards with 3+ cards costing 5+ elixir:
   - Example: Giant (5), Witch (5), Bomb Tower (5), P.E.K.K.A (7), + any 4 low-elixir

**Expected Result:**
- Warning message appears: "⚠️ 3 high-elixir cards (5+) - may get bricked hands"
- Or similar message with count

**Pass/Fail:** ___

### Test 5.3: Deck Builder Praise Balanced Deck
**Setup:**
1. Go to Deck Builder
2. Select 8 cards with avg elixir 3.0-3.5:
   - Example: Knight (3), Archer (3), Skeleton Army (2), Minions (3), Arrows (3), Cannon (3), Fireball (4), Baby Dragon (4)
   - Average = 3.25

**Expected Result:**
- Success message appears: "✅ Elixir balanced - nice cycling deck!"
- No warnings displayed

**Pass/Fail:** ___

---

## TEST SUITE 6: Enemy AI Cycling

### Test 6.1: Enemy Also Cycles Deck
**Setup:**
1. Start game on HARD difficulty
2. Observe enemy plays many cards
3. Wait for ~2-3 minutes of gameplay

**Expected Result:**
- Enemy plays continuously without running out of cards
- Enemy hand size appears consistent
- No errors or freezes when enemy cycles

**Pass/Fail:** ___

### Test 6.2: Both Players Cycle Same Way
**Setup:**
1. Start game
2. Play aggressively, deplete your deck to cycle 1
3. Observe if both players cycle simultaneously or independently

**Expected Result:**
- Each player cycles independently (not synchronized)
- Both have 4 cards available throughout
- No sync issues or card duplication

**Pass/Fail:** ___

---

## TEST SUITE 7: Edge Cases

### Test 7.1: Playing While Elixir Low
**Setup:**
1. Start game, play 2-3 cards immediately
2. Wait for elixir to regenerate slowly
3. Once you have 2-3 elixir, play a single card

**Expected Result:**
- Card plays successfully
- Replacement drawn smoothly
- No stalls or errors

**Pass/Fail:** ___

### Test 7.2: Game Over Preserves Deck State
**Setup:**
1. Start game, play some cards to cycle
2. Win or lose the match
3. Return to Menu and start new game

**Expected Result:**
- New game has fresh deck (not contaminated by previous game)
- No memory leaks or state bleeding

**Pass/Fail:** ___

### Test 7.3: Deck with Duplicate Cards
**Setup:**
1. Go to Deck Builder
2. Add same card multiple times (e.g., 3x Knight, 3x Archer, 2x Baby Dragon)
3. Start game and play cards

**Expected Result:**
- Duplicates cycle normally
- No issues with duplicate handling
- Deck shuffles correctly even with multiples

**Pass/Fail:** ___

---

## TEST SUITE 8: UI/UX

### Test 8.1: Hand Cards Animate on Draw
**Setup:**
1. Start game
2. Play 1 card
3. Watch hand area

**Expected Result:**
- New card in hand has card-spawn animation (scales in)
- Animation is smooth and visible
- No layout jump or flicker

**Pass/Fail:** ___

### Test 8.2: Deck Pool Info Readable
**Setup:**
1. Start game
2. Look at bottom section with hand and deck info

**Expected Result:**
- "Deck Pool: X cards left" is visible and readable
- "Cycled: Nx" appears when applicable
- "Next: [emoji]" shows clearly

**Pass/Fail:** ___

### Test 8.3: Mobile Responsiveness
**Setup:**
1. Open game on mobile device (or resize browser to mobile width)
2. Check hand display

**Expected Result:**
- 4-card hand still displays properly (grid layout adjusts)
- No overflow or cutoff
- Deck pool info remains readable

**Pass/Fail:** ___

---

## SUMMARY

| Test Suite | Result | Notes |
|-----------|--------|-------|
| 1. Initial Hand Draw | ___ | ___ |
| 2. Card Draw Mechanics | ___ | ___ |
| 3. Deck Cycling | ___ | ___ |
| 4. Next Card Preview | ___ | ___ |
| 5. Balance Validation | ___ | ___ |
| 6. Enemy AI Cycling | ___ | ___ |
| 7. Edge Cases | ___ | ___ |
| 8. UI/UX | ___ | ___ |

**Overall Status:** ___

---

## KNOWN ISSUES / NOTES

(Fill in any issues found during testing)

1. ___________
2. ___________
3. ___________

---

## NEXT STEPS

- [ ] Fix any failed tests
- [ ] Validate balance in playtests
- [ ] Gather player feedback
- [ ] Iterate on design if needed
