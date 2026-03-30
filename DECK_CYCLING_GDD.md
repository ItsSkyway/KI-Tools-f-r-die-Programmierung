# GAME DESIGN DOCUMENT: Deck Cycling System

**Version:** 1.0  
**Status:** Design Phase  
**Last Updated:** 2024-01-15  
**Author:** Game Designer

---

## 1. DESIGN PILLARS

### Core Experiences
1. **Player Agency Over Randomness**
   - Player knows exactly what's coming next (no surprise hand flips)
   - Long-term deckbuilding strategy: which 8 cards and their order matters
   - Short-term decision: "Do I cycle now or save this card for later?"

2. **Fair, Deterministic System**
   - Both player AND bot have identical cycling mechanics
   - No hidden advantages; cycle state always visible or inferrable
   - Shuffles happen only when pool exhausted (not random resets)

3. **Predictable Loop Mastery**
   - Players learn cycling patterns across 180-second match (2-3 complete loops)
   - Early practice: learn your deck's rhythm
   - Late game: know exactly when your combo cards come

4. **Clear Information Architecture**
   - Always visible: 4 cards in hand
   - Always visible: next card (small indicator or tooltip)
   - Bot's hand state: not visible (fog of war), but cycle state is predictable

---

## 2. CORE MECHANICS

### 2.1 Deck Initialization (Match Start)

**Input:** Player selects 8-card deck at lobby screen  
**Process:**
```
1. Create deck array [card0, card1, ..., card7]
2. Fisher-Yates shuffle (seeded or random)
3. Initialize hand: cards[0..3]
4. Set remaining pool: cards[4..7]
5. Set cycle_index = 0 (points to card[0] currently in hand)
```

**Output:**
- Hand: 4 playable cards
- Remaining Pool: 4 cards (hidden from UI, tracked internally)
- Next Card Index: 4 (which card will be drawn next)
- Cycle Position: 0/8

**Example:**
```
Deck (after shuffle): [Knight, Archer, Giant, Fireball, Minions, Cannon, Valkyrie, Hog]
Initial Hand: [Knight, Archer, Giant, Fireball]
Remaining Pool: [Minions, Cannon, Valkyrie, Hog]
Next Card to Draw: Minions (index 4)
```

---

### 2.2 Card Play → Hand Cycle

**Trigger:** Player clicks/drags card from hand to arena

**Process (Step-by-step):**
```
1. Validate: Player has enough elixir
2. Validate: Card is playable (no global cooldown issues)
3. REMOVE from hand: hand.splice(hand_slot, 1)
4. DRAW NEXT: next_card = remaining_pool[cycle_index % 8]
5. ADD to hand: hand.push(next_card)
6. INCREMENT: cycle_index++
7. UPDATE visual: Animate card out, new card in
```

**Before:**
```
Hand: [Knight, Archer, Giant, Fireball]
Hand Index: 0
Remaining Pool: [Minions, Cannon, Valkyrie, Hog]
Cycle Pos: 0/8
```

**Player plays Knight (slot 0):**
```
Hand: [Archer, Giant, Fireball] → [Archer, Giant, Fireball, Minions]
Remaining Pool: [Minions, Cannon, Valkyrie, Hog] → [Cannon, Valkyrie, Hog] (Minions drawn)
Cycle Pos: 1/8
Next Preview: Cannon
```

**Behavior:** 
- Hand always exactly 4 cards (unless game ends)
- Cards are drawn from remaining pool in order
- No "draw" animation until card is needed

---

### 2.3 Cycle Complete & Reshuffle

**Trigger:** After playing 8th card (cycle_index reaches 8)

**Process:**
```
1. Check: cycle_index == 8?
2. Reshuffle: Fisher-Yates shuffle (current hand + remaining pool)
3. Reassign: hand = shuffled[0..3], remaining = shuffled[4..7]
4. Reset: cycle_index = 0
5. Broadcast: "Deck reshuffled!" (optional sound/visual)
```

**Example Timeline (8 cards played):**
```
Play 1: Cycle 0→1
Play 2: Cycle 1→2
Play 3: Cycle 2→3
Play 4: Cycle 3→4
Play 5: Cycle 4→5
Play 6: Cycle 5→6
Play 7: Cycle 6→7
Play 8: Cycle 7→8 [RESHUFFLE TRIGGERED]
Play 9: Cycle 0→1 (after reshuffle)
```

**Fairness Rule:**
- If player finishes 8 cards before bot: player gets a small advantage
- If bot finishes 8 cards first: both decks reshuffle independently
- Each player's cycle is independent (no shared reshuffle timer)

---

### 2.4 Cycle Index Tracking (UI Display)

**Information Layer 1: Next Card Preview**
- Display small indicator: "Next: [Icon]" or visual badge
- OR tooltip on hover: shows next 2-3 cards
- Position: Below hand, center-bottom

**Information Layer 2: Cycle Position (Optional)**
- Small number on each card: "1/4", "2/4", "3/4", "4/4"
- Shows which position in current cycle this card occupies
- Visual: Subtle, semi-transparent

**Information Layer 3: Visual Progression**
- Filled circle indicators: ○ ○ ○ ● (4th position filled)
- As player cycles: ● ○ ○ ○ → ○ ● ○ ○ → ○ ○ ● ○ → ○ ○ ○ ●

**Bot's Cycle State:**
- Player cannot see bot's hand (fog of war)
- BUT: Player can infer cycle position by counting plays
- OPTIONAL: Show bot's total cards played (e.g., "Bot: 7/8 cards cycled")

---

## 3. PLAYER EXPERIENCE (Moment-to-Moment)

### 3.1 Early Turn (Cycles 0-1)

**Player's Mental Model:**
- "I know my next 4 cards coming"
- "Should I cycle now to get to my win condition?"
- "Or should I hold these cards and let opponent waste resources?"

**Action:** Play card (e.g., Knight)  
**Feedback:**
- ✓ Knight slides to arena
- ✓ Minions slide into hand (from right, animated)
- ✓ "Next: Cannon" badge updates
- ✓ Cycle indicator: 1/8 → 2/8

**Feeling:** "I'm in control. I see my future."

---

### 3.2 Mid-Match (Cycles 2-3)

**Player's Mental Model:**
- "I've cycled once; my pattern repeats soon"
- "Opponent might have cycled too — what are they likely playing?"

**Action:** Opponent plays a card  
**Feedback:**
- ✓ Bot's card appears on arena
- ✓ Bot's cycle position updates (if visible: "Bot: 5/8")
- ✓ Player calculates: "They probably have X, Y, Z left"

**Feeling:** "I can predict their hand based on their plays."

---

### 3.3 Late Match (Double Elixir, Cycles 3+)

**Player's Mental Model:**
- "I'm about to cycle again — do I have my finisher ready?"
- "If I cycle now, I get [combo] in 3 more plays"

**Action:** Heavy play phase during double elixir  
**Feedback:**
- ✓ Rapid cycling animations
- ✓ Combo cards arrive in predicted order
- ✓ Reshuffle announcement when cycle completes

**Feeling:** "This is my power spike — I earned this rhythm."

---

## 4. BOTH PLAYER & ENEMY MECHANICS

### 4.1 Player (Human)

**Cycle State Visible:** YES (next preview, cycle position)  
**Hand Visible:** YES (always see all 4 cards)  
**Manual Cycle:** YES (player chooses when to play)  
**Reshuffle:** Independent (triggers at cycle_index = 8)

```javascript
// Pseudo-code: Player cycle
onCardPlay(cardId) {
  remove(cardId, hand);
  nextCard = remaining_pool[cycle_index % 8];
  hand.push(nextCard);
  cycle_index++;
  if (cycle_index >= 8) {
    reshuffle();
    cycle_index = 0;
  }
}
```

---

### 4.2 Enemy Bot

**Cycle State Visible:** PARTIAL (only cycle count, not hand)  
**Hand Visible:** NO (fog of war; hidden from player)  
**Manual Cycle:** YES (but deterministic AI decision)  
**Reshuffle:** Independent (same logic as player)

**Bot's Cycle Management:**
- Bot has identical deck cycling logic
- Bot's hand is NOT rendered (not visible to player)
- Player can infer bot's cycle via play history
- Example: If bot has played 7 cards, they're near a reshuffle

```javascript
// Pseudo-code: Bot cycle (hidden)
botDecision() {
  // ... AI logic to pick a card from hand
  selectedCard = hand[selectedIndex];
  
  // Remove from hand
  remove(selectedCard, hand);
  
  // Draw next
  nextCard = remaining_pool[cycle_index % 8];
  hand.push(nextCard);
  cycle_index++;
  
  if (cycle_index >= 8) {
    reshuffle();
    cycle_index = 0;
  }
}
```

---

## 5. EDGE CASES & HANDLING

### Case 1: Player Waits (No Card Played)

**Trigger:** 30 seconds pass, no card played  
**Behavior:** Cycle does NOT advance  
**Rationale:** Cycling is triggered by play, not time  
**Example:**
```
Time 0-30s: Player waits
Hand: [Knight, Archer, Giant, Fireball]
Cycle: 0/8 (unchanged)

Time 30s: Player plays Knight
Hand: [Archer, Giant, Fireball, Minions]
Cycle: 1/8 (advances)
```

---

### Case 2: Bot Hand Empty (Edge Case)

**Trigger:** Bot's hand somehow becomes empty (shouldn't happen)  
**Recovery:**
```
1. Log warning: "Bot hand empty!"
2. Trigger immediate reshuffle
3. Reset cycle_index = 0
4. Reinitialize hand
5. Continue normally
```

---

### Case 3: Match Ends (Win/Loss)

**Trigger:** King tower destroyed OR 180s timer expires  
**Behavior:** 
- Cycle state is NOT reset
- If match continues (replay/next game): New fresh cycle
- BUT: Match stats preserve cycle count (e.g., "Player cycled 2.3x")

**Rationale:** Consistency. No mid-match cycle resets.

---

### Case 4: Both Players Cycle Simultaneously

**Trigger:** Both play cards in same frame (multiplayer desync)  
**Behavior:** No issue — each player's cycle independent  
**Example:**
```
Frame N: Player cycles 0→1, Bot cycles 3→4 (independent)
Result: Both advance independently; no conflict
```

---

### Case 5: Player Plays 4 Cards Rapidly

**Trigger:** Spam clicking during double elixir  
**Behavior:**
```
Play 1: Hand [A, B, C, D] → [B, C, D, E] (cycle 0→1)
Play 2: Hand [B, C, D, E] → [C, D, E, F] (cycle 1→2)
Play 3: Hand [C, D, E, F] → [D, E, F, G] (cycle 2→3)
Play 4: Hand [D, E, F, G] → [E, F, G, H] (cycle 3→4)
```
**Result:** All cycles execute in order; no skipping

---

## 6. BALANCING & DESIGN VARIABLES

### 6.1 Deterministic vs. Random

| Variable | Value | Rationale |
|----------|-------|-----------|
| **Deck Size** | 8 cards | Clash Royale standard; 2 complete cycles per match |
| **Hand Size** | 4 cards | Visible information; not overwhelming |
| **Shuffle Algorithm** | Fisher-Yates | Cryptographically fair, not pseudo-random |
| **Shuffle Trigger** | After 8 plays | Fully predictable; no surprise resets |
| **Cycle Advancement** | Per card played | Tied to player action, not time |
| **Reshuffle Timing** | Independent per player | Fair; no shared timer advantage |

---

### 6.2 Strategy Implications

| Player Decision | Cycle Impact | Risk/Reward |
|-----------------|--------------|-------------|
| **Play now** | Advance cycle +1 | Get closer to next card (or reshuffle) |
| **Hold + Wait** | Cycle stays same | Preserve hand, but opponent controls tempo |
| **Dump weak card** | Advance cycle +1 | Cycle toward stronger cards faster |
| **Save cycle** | Timing strategy | Save hand, reshuffle later for fresh draw |

**Example Scenario:**
```
Hand: [Knight, Archer, Fireball, Hog]
Next: Valkyrie

Player thinks:
"If I play Knight now, I cycle to Valkyrie (good).
If I wait 10s, opponent might cycle closer to THEIR win condition.
I should play NOW to control the cycle race."
```

---

## 7. SUCCESS CRITERIA (Playtesting)

### Quantitative
- [ ] **Cycle Predictability:** Player correctly predicts next card >80% of time
- [ ] **Fairness:** Player winrate ≈ 50% (vs. medium bot)
- [ ] **Cycle Completion:** Player completes 2-3 full cycles per 180s match
- [ ] **Play Rate:** Player plays ~6-8 cards per cycle (not cycling too fast)

### Qualitative
- [ ] **Feel:** Cycle rhythm feels satisfying (not rushed, not stale)
- [ ] **Agency:** Player feels in control of their hand
- [ ] **Clarity:** Next card is always clear (no confusion)
- [ ] **Fairness:** Both player and bot seem to have same disadvantages/advantages

---

## CHANGELOG

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2024-01-15 | Initial GDD: Core cycle mechanics, both players, UI design |

---

**END OF DOCUMENT**
