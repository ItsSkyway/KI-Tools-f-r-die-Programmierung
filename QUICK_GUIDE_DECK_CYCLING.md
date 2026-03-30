# ⚡ QUICK START: 4-Card Hand + Deck Cycling

## What's New?

### Old System
- Hand showed all 8 cards at once
- Any card could be played anytime (if you had elixir)
- No strategic hand management

### New System
- Hand shows only 4 cards at a time
- When you play a card, a new one is drawn from your shuffled deck
- Deck cycles every 8 cards played
- Strategic hand management: you must plan around which cards are coming next

---

## How It Works

### 1️⃣ Game Start
You select 8 cards in Deck Builder.

```
Your 8-Card Deck: [Knight, Archer, Giant, Fireball, Arrows, Minions, Skeleton Army, Baby Dragon]
↓
Shuffled: [Arrows, Knight, Baby Dragon, Giant, Skeleton Army, Archer, Minions, Fireball]
↓
Initial Hand (first 4): [Arrows, Knight, Baby Dragon, Giant]
Remaining Pool: [Skeleton Army, Archer, Minions, Fireball]
```

### 2️⃣ Playing Cards & Drawing
You play Arrows (3 elixir).

```
Before:  Hand = [Arrows, Knight, Baby Dragon, Giant]  |  Pool = [Skeleton Army, Archer, Minions, Fireball]
         ↓ Play Arrows
After:   Hand = [Knight, Baby Dragon, Giant, Skeleton Army]  |  Pool = [Archer, Minions, Fireball]
```

### 3️⃣ Full Cycle (After 8 Cards Played)
You've played all 8 cards. Deck reshuffles.

```
Cards Played: [Arrows, Knight, Baby Dragon, Giant, Skeleton Army, Archer, Minions, Fireball]
↓
RESHUFFLE! Deck shuffles again (new random order).
↓
On next card play, draws from freshly shuffled deck.
```

---

## UI Indicators

### Hand Display (Bottom)
Shows your 4 current cards. Tap/drag to play.

### Deck Pool Info (Below Hand)
```
Deck Pool: 3 cards left
Next: 💀 (Skeleton Army)
```

- **Deck Pool:** How many cards are left before reshuffle
- **Next:** The emoji of the next card you'll draw

### Balance Warnings (Deck Builder)
When selecting 8 cards:
- ✅ "Elixir balanced - nice cycling deck!" = Great! (avg 3.0–3.5)
- ⚠️ "High average elixir - deck may feel slow" = OK, but slower (avg 3.5–4.0)
- ⚠️ "Too many high-elixir cards" = Risky! (3+ cards costing 5+)

---

## Strategy Tips

### Tip 1: Build Balanced Decks (Avg 3.0–3.5 Elixir)
**Bad Deck (Avg 4.5):**
- Giant (5), Witch (5), Bomb Tower (5), P.E.K.K.A (7), Baby Dragon (4), etc.
- Problem: Takes forever to cycle, risky "brick hands"

**Good Deck (Avg 3.2):**
- Knight (3), Archer (3), Skeleton Army (2), Minions (3), Arrows (3), Cannon (3), Baby Dragon (4), Fireball (4)
- Result: Fast cycling, can play 3 cards in opening

### Tip 2: Include 1–2 Cycle Cards (2–3 Elixir)
Always include cheap cards to enable cycling:
- Skeleton Army (2) ← **Best cycle card**
- Knight, Archer, Minions, Arrows, Cannon (3 each)

### Tip 3: Limit High-Elixir Cards (5+)
Max 2 high-elixir cards per deck (Giant, Witch, Bomb Tower, P.E.K.K.A):
- 1 high-elixir card: ✅ Safe
- 2 high-elixir cards: ✅ Acceptable (if avg still 3.0–3.5)
- 3+ high-elixir cards: ❌ Risky! You may get hand with only high-cost cards

### Tip 4: Use "Next Card Preview" to Plan
Look at the "Next: 💀" to know what's coming:
- If next card is cheap → you can save elixir for next cycle
- If next card is expensive → start saving elixir now

### Tip 5: Cards Cycle Every ~60–90 Seconds
At 1 elixir per second regen and avg 3.2 cost:
- You can play ~3 cards per 20 seconds (full cycle)
- Full 8-card deck cycles in ~60–90 seconds with active play

---

## Common Questions

### Q: Can I see cards beyond "Next"?
**A:** Not yet. The preview shows only the immediate next card. This keeps strategy interesting (fog of war).

### Q: What if I run out of cards?
**A:** You won't! At 4 cards in hand + reshuffling, you always have cards. The deck never empties your hand.

### Q: Does the enemy cycle the same way?
**A:** Yes! The AI opponent uses the same 4-card hand + cycling system.

### Q: Can I have duplicate cards in my deck?
**A:** Yes! If you add Knight 3 times, the deck treats it normally. Duplicates cycle like any other card.

### Q: Why is Skeleton Army (2 elixir) so important?
**A:** It's the cheapest card, which forces fast cycling. This keeps the game flowing and prevents "brick hands" (stuck with only expensive cards).

### Q: What's the best average elixir?
**A:** 3.0–3.5 is the sweet spot for fast, strategic cycling. Below 3.0 is very aggressive; above 3.5 is slower.

---

## Example Decks

### Aggressive Cycling (3.0 avg) — Fast Paced
Knight (3), Archer (3), Skeleton Army (2), Minions (3), Arrows (3), Cannon (3), Baby Dragon (4), Fireball (4)

- **Play Pattern:** 3 cards in first minute
- **Cycling:** Very fast (~60s for full cycle)
- **Strategy:** Constant pressure, tempo-focused

### Balanced (3.5 avg) — Strategic Mix
Knight (3), Archer (3), Fireball (4), Baby Dragon (4), Valkyrie (4), Hog Rider (4), Minions (3), Arrows (3)

- **Play Pattern:** 2–3 cards per minute
- **Cycling:** Moderate (~75s for full cycle)
- **Strategy:** Defensive counterplay with strong value cards

### Greedy Value (4.0 avg) — High Risk/Reward
Giant (5), Witch (5), Baby Dragon (4), Valkyrie (4), Musketeer (4), Fireball (4), Hog Rider (4), Skeleton Army (2)

- **Play Pattern:** 1–2 cards per minute
- **Cycling:** Slow (~90s for full cycle)
- **Strategy:** Heavy chip damage, one high-elixir finisher per cycle

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Hand never refills | Hand should always be 4. If empty, restart game. |
| Deck shows 0 cards | Deck should reshuffle. If stuck, restart. |
| Can't see next card | Look at "Next: [emoji]" below hand. May be small on mobile. |
| Deck builder warnings confusing | Aim for avg 3.0–3.5 and ✅ green message. |
| Game feels too slow | Lower avg elixir (add Skeleton Army, remove high-cost cards). |
| Game feels too fast | Increase avg elixir (add 4-cost cards, remove Skeleton Army duplicates). |

---

## For Developers

### System Architecture

```javascript
// Deck Pool Structure
gs.playerDeckPool = [array of card IDs]
gs.playerDeckPool.fullDeck = [original 8 cards for reshuffle]
gs.playerDeckPool.cycleCount = 0  // increments each reshuffle

// Hand Structure
gs.playerHand = [
  { cardId: 'knight', id: Math.random() },
  { cardId: 'archer', id: Math.random() },
  ...
]  // Always length 4

// Key Functions
shuffleDeck(deck)        // Fisher-Yates shuffle
drawCardsFromPool(pool, count)  // Draws and reshuffles if needed
playCard(cardId, isPlayer)      // Removes from hand, draws replacement
```

### Integration Points
- **playCard():** Calls `drawCardsFromPool()` to refill hand
- **initializeGame():** Shuffles deck, draws initial 4-card hand
- **renderUI():** Shows hand, deck pool info, next card preview

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2024-Q1 | ✅ Initial 4-card hand + cycling system |
| | | ✅ Deck pool tracking |
| | | ✅ Next card preview UI |
| | | ✅ Balance warnings in deck builder |

---

## Feedback Welcome!
If you find bugs or have balance suggestions, let me know!
