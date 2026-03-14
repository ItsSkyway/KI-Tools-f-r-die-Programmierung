# Game Testing & Verification Guide

## Quick Start Testing

### Test 1: Menu & Navigation
1. Open `index.html` in browser
2. Verify main menu appears with:
   - Title "⚔️ Clash Royale"
   - Difficulty selector (Easy/Medium/Hard)
   - "Build Deck" button
3. Click each difficulty option - should highlight
4. ✅ Pass: All UI elements responsive

### Test 2: Deck Builder
1. From menu, click "Build Deck"
2. Verify:
   - All 16 cards displayed in grid
   - Cards show emoji, name, elixir cost, type
   - Average elixir cost calculation works
   - Counter shows "X/8" selected
3. Select 8 different cards by clicking
4. Verify:
   - Selected cards highlight (yellow border, scale)
   - "Start Battle" button becomes enabled
5. Try selecting more than 8 - button should prevent it
6. Click "Start Battle"
7. ✅ Pass: Deck builder fully functional

### Test 3: Battle Arena Loads
1. After "Start Battle", battle screen appears
2. Verify:
   - Arena displays with red/blue gradient
   - Player towers (blue) at bottom
   - Enemy towers (red) at top
   - Timer shows "180s" at top
   - Elixir bar shows "10/10"
   - Card hand shows 4 cards at bottom
3. ✅ Pass: Battle UI loads correctly

### Test 4: Card Playing - Basic
1. In battle, wait 2-3 seconds
2. Bot should play a card (enemy units appear)
3. Click a card in your hand (e.g., Knight)
4. Verify:
   - Unit appears on your side
   - Card leaves hand
   - Elixir decreases by card cost
   - Unit has emoji and blue color
5. ✅ Pass: Card play mechanics work

### Test 5: Unit Movement
1. Play a troop (Knight, Archer, etc.)
2. Watch for 3-5 seconds
3. Verify:
   - Unit moves toward enemy side
   - Unit appears to move smoothly
   - Direction is toward enemy towers
4. ✅ Pass: Unit pathfinding works

### Test 6: Combat & HP Bars
1. Play opposing troops (your Knight vs Enemy troops)
2. Watch when they collide
3. Verify:
   - Units attack each other
   - HP bars appear above units
   - HP bars decrease when units take damage
   - Dead units fade and disappear
4. ✅ Pass: Combat system functional

### Test 7: Tower Damage
1. Play multiple strong units
2. Send them to attack enemy towers
3. Verify:
   - Tower HP numbers decrease at top
   - Towers shoot back at units
   - Enemy towers have red color (top center)
   - Your towers have blue color (bottom center)
4. ✅ Pass: Tower interaction works

### Test 8: Spells
1. Play Fireball (4 elixir) or Arrows (3 elixir)
2. Verify:
   - Spell costs elixir
   - Spell hits enemy units in AOE
   - Multiple enemies take damage from spell
3. If Freeze Spell available:
   - Play Freeze near enemy troops
   - Enemy units stop moving for 2 seconds
4. ✅ Pass: Spell mechanics work

### Test 9: Elixir Regeneration
1. Start with 10 elixir
2. Play cards until elixir is low
3. Wait 10-15 seconds
4. Verify:
   - Elixir bar fills up
   - Number in bar increases
5. After ~60s (1 minute mark):
   - Elixir regenerates faster (should be visible)
6. ✅ Pass: Elixir system works

### Test 10: Bot AI
1. Play on Easy difficulty:
   - Bot plays cards slowly (wait 5-8s between plays)
   - Bot cards are random (no pattern)
2. Play on Medium difficulty:
   - Bot plays cards faster (3-5s)
   - Bot seems to strategize slightly
3. Play on Hard difficulty:
   - Bot plays very fast (2-3s)
   - Bot uses varied cards
   - Bot sometimes counters your plays
4. ✅ Pass: All 3 AI levels responsive

### Test 11: Win Condition
1. Play on Easy difficulty
2. Destroy both Princess Towers (top left and top right) - King Tower becomes vulnerable
3. Attack King Tower until it dies
4. Verify:
   - Game ends immediately
   - Results screen shows "🎉 Victory!"
   - Shows tower HP: "Your Towers: X HP" vs "Enemy Towers: X HP"
5. ✅ Pass: Win condition works

### Test 12: Lose Condition
1. Play defensively, let enemy towers damage your towers
2. Get your King Tower destroyed (or lose via timer)
3. Verify:
   - Game ends
   - Results screen shows "💀 Defeat!"
   - Displays final tower HP
4. ✅ Pass: Lose condition works

### Test 13: Tie Condition
1. Play full 3 minutes (let timer expire)
2. Try to have same tower HP on both sides (difficult but possible)
3. Verify:
   - Results screen shows "⚔️ Tie!"
4. ✅ Pass: Tie logic works

### Test 14: Play Again
1. From any results screen
2. Click "Play Again"
3. Verify:
   - Returns to menu
   - Can select difficulty again
   - Can build new deck or use same one
4. ✅ Pass: Navigation works

### Test 15: Mobile Responsiveness
1. Open `index.html` on mobile device or use browser's mobile view
2. Verify:
   - Arena fits on screen (no horizontal scroll)
   - Card hand scrolls horizontally if needed
   - Buttons are tappable (large enough)
   - Layout is readable
   - Can play cards on mobile
3. ✅ Pass: Mobile-friendly design

## Advanced Testing

### Performance Test
- Play for full 3 minutes on Hard difficulty
- Monitor browser performance (F12 → Performance tab)
- Target: 30fps+, no lag spikes
- Unit count should stay <50 per side

### Card Interaction Test
- Verify all 16 cards work:
  - Each card can be selected in deck builder
  - Each card costs correct elixir
  - Each card spawns/casts correctly
  - Each card has unique emoji and name
- Check building cards (Cannon, Bomb Tower):
  - Buildings spawn at player location
  - Buildings attack nearby enemies
  - Splash damage works (Bomb Tower)

### AI Strategy Test
- Hard Bot should:
  - Use higher cost cards (P.E.K.K.A, Witch)
  - Play more frequently than Easy bot
  - Seem strategic (not random)
- Medium Bot should:
  - Play between Easy and Hard speeds
  - Show some strategy (waits for elixir >6)

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Game won't load | Clear browser cache, try different browser, check console for errors |
| Units not moving | Wait 1-2 seconds, ensure units have valid targets |
| Cards won't play | Check elixir cost matches available elixir |
| Towers take no damage | Ensure units reach tower (need valid path) |
| Performance lag | Close other browser tabs, reduce number of units |
| Mobile layout broken | Use browser's mobile view (F12 → Responsive Design Mode) |

## Success Criteria

✅ All tests pass = Fully functional game ready for play

- Menu navigation works
- Deck builder accepts exactly 8 cards
- Battle loop runs smoothly
- Units move and attack
- Towers take damage and can be destroyed
- Win/lose/tie all trigger correctly
- Bot plays cards autonomously
- All 3 difficulty levels work
- Mobile responsive
- Performance maintained at 30fps+

---

**Status: READY FOR TESTING & DEPLOYMENT** ✅
