# 🎴 Game Design Document: 4-Card Hand + Deck Cycling System

## 1. DESIGN PILLARS
1. **Strategic Hand Management** - Player can't just play any card anytime; they must think about sequence
2. **Cycling Depth** - The order of cards in deck matters strategically (risk/reward in cycling)
3. **Elixir Rhythm** - Spacing high-elixir cards means players have to time pushes carefully
4. **Fairness** - Both player and enemy see deck next-card, same deck size (8 cards, 4 in hand)

## 2. CORE MECHANICS

### 2.1 Hand System (4-Card Interface)
- **Initial State**: At game start, player's hand contains 4 random cards from their 8-card deck
- **Visual Layout**: Grid of 4 cards at bottom of screen (existing UI is correct)
- **Card Lifecycle**:
  1. Card displayed in hand
  2. Player drags card to arena and places it
  3. Card removed from hand
  4. Next card from deck pool drawn into hand (hand size: always 4)
  5. If deck pool is empty → Reshuffle full 8-card deck randomly → Continue drawing

### 2.2 Deck Pool (Hidden Cycling System)
- **Structure**:
  ```
  Player Deck = [8 unique cards selected in deck builder]
  
  Game Start:
    deckPool = shuffle(Player Deck)  // Randomize order
    hand = draw 4 from deckPool     // First 4 shown
    // deckPool now has 4 remaining
  
  On Card Play:
    hand.splice(playedCardIndex, 1)  // Remove played card
    if (deckPool.length > 0):
      nextCard = deckPool.shift()     // Take first card from pool
      hand.push(nextCard)             // Add to end of hand
    else:
      deckPool = shuffle(Player Deck) // CYCLE: Reshuffle
      nextCard = deckPool.shift()
      hand.push(nextCard)
  ```

- **Deck Pool Size**: 4 cards remaining after initial draw
- **Shuffle Algorithm**: Fisher-Yates shuffle for true randomness
- **Cycle Tracking**: When pool empties → log cycle event (for future metrics)

### 2.3 Visual Indicators
- **Primary**: 4 cards in hand (existing UI)
- **Secondary**: OPTIONAL - Small "next card preview" indicator
  - Show emoji of next card at edge of hand area
  - When card is drawn, show next-next card
  - Gives player 1 card lookahead without breaking fog of war
  
### 2.4 Balance Properties

#### 2.4.1 Average Elixir Cost Constraints
- **Target**: 3.0–3.5 elixir per card (average across 8-card deck)
- **Rationale**: At 10 starting elixir, player can play ~2.8–3.3 cards opening hand before needing regen
- **Validation**: Deck builder shows average elixir; if > 4.0, warn player

#### 2.4.2 High-Elixir Distribution
- **Define**: "High-elixir" = 5+ elixir (Giant, Witch, P.E.K.K.A, Bomb Tower)
- **Goal**: Max 2 high-elixir cards per 8-card deck (to avoid bricking hand with two 7-elixir cards)
- **Validation Logic**: 
  ```
  highElixirCards = deck.filter(cardId => CARDS[cardId].elixirCost >= 5)
  if (highElixirCards.length > 2):
    showWarning("Hand may feel clunky with too many high-elixir cards")
  ```

#### 2.4.3 Skeleton Army Cost Lock
- **Skeleton Army**: Always 2 elixir (rare but low-cost)
- **Rationale**: Enables cycling and low-elixir cycle decks
- **Status**: LOCKED — do not change

#### 2.4.4 Current 8-Card Decks (All 18 cards available)
| Card | Cost | Rarity | Type | Status |
|------|------|--------|------|--------|
| Knight | 3 | Common | Troop | ✅ Baseline |
| Archer | 3 | Common | Troop | ✅ Baseline |
| Giant | 5 | Rare | Troop | ⚠️ High-elixir |
| Fireball | 4 | Rare | Spell | ✅ Mid-cost |
| Arrows | 3 | Common | Spell | ✅ Cycle |
| Minions | 3 | Common | Troop | ✅ Baseline |
| Skeleton Army | 2 | Rare | Troop | 🔒 LOCKED |
| Baby Dragon | 4 | Rare | Troop | ✅ Mid-cost |
| Valkyrie | 4 | Rare | Troop | ✅ Mid-cost |
| Musketeer | 4 | Rare | Troop | ✅ Mid-cost |
| Hog Rider | 4 | Epic | Troop | ✅ Mid-cost |
| Witch | 5 | Epic | Troop | ⚠️ High-elixir |
| P.E.K.K.A | 7 | Legendary | Troop | ⚠️ Ultra-high |
| Bomb Tower | 5 | Rare | Building | ⚠️ High-elixir |
| Cannon | 3 | Common | Building | ✅ Cycle |
| Freeze | 4 | Epic | Spell | ✅ Mid-cost |

**Average Costs by Rarity:**
- Common (6 cards): avg 2.67 elixir
- Rare (7 cards): avg 3.86 elixir
- Epic (2 cards): avg 4.5 elixir
- Legendary (1 card): 7 elixir

**Validation**: When player selects 8 cards:
- Warn if avg elixir > 4.0
- Warn if > 2 cards with 5+ elixir
- Show OK if avg 3.0–3.5 (sweet spot)

## 3. IMPLEMENTATION SPEC

### 3.1 Data Structure Changes
```javascript
// OLD (current):
gs.playerHand = selectedDeck.map(cardId => ({ cardId, id: Math.random() }))

// NEW:
gs.playerDeckPool = shuffle(selectedDeck)  // 8 cards randomized
gs.playerHand = drawCards(gs.playerDeckPool, 4)  // Draw first 4
gs.playerCycleCount = 0  // Track how many times deck cycled
```

### 3.2 Functions to Add/Modify

#### `initializeGame()`
- Create shuffled deck pools for player and enemy
- Draw initial 4-card hands
- Store cycle metadata

#### `drawCard(isPlayer)`
- Pop first card from deckPool
- Add to hand
- If deckPool is empty → reshuffle and increment cycleCount

#### `playCard()` (EXISTING — no major changes)
- After card removed from hand, call `drawCard(isPlayer)` to draw replacement
- Hand always stays at 4 cards

### 3.3 UI Modifications
- Hand container: Already set to `grid-cols-4` ✅
- Add optional "Next Card Preview" indicator:
  ```jsx
  <div className="next-card-preview">
    <div className="text-xs text-gray-400">Next Card:</div>
    <div className="text-xl">{nextCard.emoji}</div>
  </div>
  ```

## 4. BALANCE VALIDATION CHECKLIST

- [ ] Average elixir costs reasonable (3.0–3.5)
- [ ] No more than 2 high-elixir (5+) cards per deck
- [ ] Skeleton Army locked at 2 elixir
- [ ] Deck builder shows warnings for unbalanced decks
- [ ] Both player and enemy use same deck cycling system
- [ ] First playtest: Can player play 3 cards in opening? (Should yes with good cycling)

## 5. DESIGN RISKS & MITIGATION

| Risk | Description | Mitigation |
|------|-------------|-----------|
| **Brick Hands** | Drawing 4 high-elixir cards in a row | Suggest max 2 per deck; show in deck builder |
| **Cycling Too Fast** | Player cycles whole deck in <2 minutes | Track cycle time; adjust if < 90s |
| **Obvious Next Card** | "Next card preview" removes fog of war | Optional feature; can hide in later builds |
| **Enemy AI Cycling** | Bot doesn't play strategically around cycles | Bot plays first playable card (current behavior) |

## 6. TEST SCENARIOS

### Test 1: Initial Hand Draw
- Start game with 8-card deck
- Verify: Hand shows exactly 4 cards
- Verify: All 4 cards are from the selected deck
- Verify: Remaining 4 cards are in `deckPool`

### Test 2: Single Card Play & Draw
- Play 1 card from hand
- Verify: Hand still shows 4 cards (old card removed, new card added)
- Verify: New card is next card from `deckPool`

### Test 3: Full Cycle
- Play 8 cards in sequence (deplete deckPool, draw all 4 initial hand)
- After 8 plays, deckPool should be empty
- 9th play should trigger reshuffle
- Verify: Hand still 4 cards after reshuffle
- Verify: New 4th card is from reshuffled pool (different order than original)

### Test 4: Balance Check
- Build deck with avg elixir 3.2
- Play 10 cards in opening → should feel fluid (no long brick periods)
- Build deck with avg elixir 4.5
- Play 10 cards in opening → should feel clunky (long waits for elixir)

### Test 5: Enemy Cycling
- Observe enemy playing cards → should also cycle from their deck
- Enemy should also reshuffle after 8 plays

## 7. FUTURE ENHANCEMENTS (Out of Scope for This Task)
- [ ] Mulligan system (redraw hand once at start of match)
- [ ] Deck statistics (cycle time, hand quality metrics)
- [ ] Seasonal balance changes (adjust costs, rarity)
- [ ] Custom deck validation warnings in UI
- [ ] Replay system showing card order played
