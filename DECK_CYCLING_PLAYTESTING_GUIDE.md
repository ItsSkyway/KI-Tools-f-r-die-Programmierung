# Deck Cycling System - Playtesting & Balance Guide

## Success Criteria Checklist

### Quantitative Targets

#### Cycle Predictability
- **Target:** Player correctly predicts next card >80% of time
- **How to measure:**
  - Show player cycle info (position/next card)
  - Log predictions vs actual draws
  - Calculate accuracy after 10+ plays
- **Success:** ≥80% accuracy achieved consistently

#### Game Fairness
- **Target:** ~50% player winrate vs. medium bot
- **How to measure:**
  - Play 20 matches with fixed decks
  - Record wins/losses
  - Note if one player has advantage
- **Success:** Winrate 45-55%

#### Cycle Completion Rate
- **Target:** 2-3 complete 8-card cycles per 180s match
- **How to measure:**
  - Track cycleCount at match end
  - Log average plays per minute
- **Expected:** 14-20 total plays per match = 1.75-2.5 cycles

#### Play Timing Distribution
- **Target:** Cards played at appropriate pacing (not too fast, not stale)
- **How to measure:**
  - Log time between card plays
  - Should average 8-12 seconds between plays (not 2s spam, not 60s waits)
- **Success:** 70%+ of plays fall in 4-20 second intervals

---

## Qualitative Playtesting Notes

### Session 1: Feel & Rhythm

**Objective:** Does the cycling feel satisfying? Does the player feel in control?

**What to observe:**
- ✓ Player excitement when deck reshuffles
- ✓ Player groans when weak card in cycle position
- ✓ Player planning: "I'll cycle in 3 plays to get my combo"
- ✓ Overall: Does cycling feel like part of the strategy?

**Red Flags:**
- ✗ Player ignores next card preview (not using info)
- ✗ Player complains cycle is "random" (but it's not)
- ✗ Player feels powerless against bot's cycle (unfair advantage)
- ✗ Cycling feels like "luck" not "strategy"

**Good Feedback:**
- "I knew my finisher was coming in 2 plays"
- "The next preview helped me plan my elixir"
- "Cycling feels like real Clash Royale!"
- "I can read my opponent's hand from their plays"

### Session 2: Clarity & Information

**Objective:** Is cycle info clear? Is next card obvious?

**What to test:**
- Can player easily read cycle position?
- Is next card preview obvious or hidden?
- Does cycle progress indicator make sense?
- Are cards clearly marked as playable/unplayable?

**Measurement:**
- Time to find next card: Should be instant (<1 second)
- Errors in reading cycle: Should be <5% misreads
- Confusion about playability: Should be zero

**Improvements if needed:**
- Make next card LARGER/brighter
- Add animation when new card draws
- Add tooltip on hover
- Add keyboard shortcut to preview deck

### Session 3: Bot Cycling

**Objective:** Is bot's cycle system working? Can player infer bot's hand?

**What to test:**
- Bot makes reasonable plays (not random)
- Player can count bot's total plays
- Optional: show bot's cycle count to player
- Player can predict bot's next likely card

**Measurement:**
- Does bot reshuffle at correct time (after 8 plays)?
- Does player successfully predict "bot will play X next"?
- Is bot's hand management realistic?

**Red Flags:**
- ✗ Bot reshuffles at wrong time
- ✗ Bot's hand doesn't match expected cycle
- ✗ Bot ignores its cycle position when deciding plays

---

## Balance Tuning Parameters

### [PLACEHOLDER] Values to Test

#### Draw Animation Speed
**Current:** Not yet implemented  
**Range:** 200ms - 600ms  
**Tuning Guide:**
- Too fast (200ms): Jarring, hard to follow
- Optimal (~300ms): Smooth, visible but not slow
- Too slow (600ms): Feels sluggish, breaks momentum

**Test:** Have player rate animation speed 1-10

#### Next Card Preview Visibility
**Current:** Semi-transparent gray text  
**Options:**
1. Text-only: "Next: Archer (3)"
2. Large icon + name
3. Dedicated preview card (clickable?)
4. Tooltip on hover

**Tuning:** Start with option 2 (large icon + name), brighten if unnoticed

#### Cycle Position Display
**Current:** Position dots (● ○ ○ ○ ○ ○ ○ ○)  
**Alternatives:**
1. Numbers: "2/8"
2. Progress bar
3. Both numbers + dots
4. Optional toggle

**Tuning:** Use both if space allows, add toggle in settings

#### Reshuffle Notification
**Current:** Console log "Deck reshuffled!"  
**Options:**
1. Small text notification
2. Sound effect (whoosh/shuffle)
3. Screen flash
4. Card animation (all cards briefly spin)

**Tuning:** Sound + text notification = good

---

## Advanced Balance Metrics

### Cycle Strategy Assessment

**Question:** Are players actually using cycle knowledge to make decisions?

**Measurement:**
- Log decision context: "Player held weak card despite having elixir"
- Measure plays per cycle position
  - Position 0/8: What's average play rate?
  - Position 7/8: Do players cycle more aggressively?
- Analyze replays: Did player mention cycle in decision?

**Expected behavior:**
- Near reshuffle (6-7/8): Players more likely to dump weak cards
- Early in cycle (0-2/8): Players more likely to hold cards for combo

### Opponent Read Accuracy

**Question:** Can players infer opponent's cycle from plays?

**Testing:**
1. Show player: "What cards might opponent have left?"
2. Track: Do players improve prediction accuracy over time?
3. Measure: Do players' predictions match bot's actual cycle?

**Expected:** Accuracy improves from ~30% → 70% after 3+ matches

### Hand Management Skill

**Question:** Do skilled players manage their hand differently than casual players?

**Metrics:**
- Average cycle duration (should be steady 8 plays/cycle)
- Play rate in different cycle positions
- Win rate correlation with cycle management

**Expected:**
- Skilled players: Consistent play pace, strategic cycling
- Casual players: Random play patterns, ignore cycle

---

## Playtesting Schedule

### Day 1-2: Core Mechanic Testing
- **Focus:** Does cycling work?
- **Test:** Play 10 matches, track cycle state at each play
- **Success criteria:** All cycles complete correctly, no bugs

### Day 3-4: UI/UX Testing
- **Focus:** Can players understand cycle info?
- **Test:** Ask 5 players to identify next card in first 10 seconds
- **Success criteria:** 100% accuracy

### Day 5-6: Balance Testing
- **Focus:** Is it fair? Does it feel good?
- **Test:** 20 matches player vs. medium bot
- **Measure:** Winrate, average cycle position at end, subjective feel

### Day 7: Edge Cases & Polish
- **Focus:** What breaks? What needs refinement?
- **Test:** Rapid plays, bot hand states, match end handling
- **Fix:** Any bugs or confusing behaviors

---

## Feedback Collection Template

### Quick Playtester Survey

```
1. On a scale of 1-10, how clear is the next card preview?
   [1 = Invisible] _______ [10 = Crystal Clear]

2. How often did you use cycle knowledge to make decisions?
   [ ] Always  [ ] Often  [ ] Sometimes  [ ] Rarely  [ ] Never

3. Did the deck feel "random" or "predictable"?
   [ ] Very Random _______ [ ] Very Predictable

4. How did cycling make you feel? (Select all)
   [ ] In control
   [ ] Satisfied
   [ ] Confused
   [ ] Frustrated
   [ ] Strategic
   [ ] Bored

5. Any suggestions to improve cycling UI?
   ________________________________________________

6. Did you notice opponent's cycle position?
   [ ] Yes, I inferred it  [ ] Vaguely  [ ] Not at all

7. How do you rate the overall cycling system?
   [1 = Broken] _______ [10 = Perfect]
```

---

## Common Issues & Fixes

### Issue: "Next card is hard to see"
**Root cause:** UI contrast too low  
**Fix:** Make text larger, brighter, add icon  
**Verify:** Can player read it from 1 meter away?

### Issue: "Cycle feels random"
**Root cause:** Player doesn't understand shuffle is deterministic  
**Fix:** Show full 8-card deck order at match start (advanced UI)  
**Alternative:** Tutorial explaining Fisher-Yates shuffle

### Issue: "Bot reshuffles at wrong time"
**Root cause:** Bug in cycling logic  
**Fix:** Add logging to verify cycle index progression  
**Test:** Play until cycle=8, confirm reshuffle triggers

### Issue: "I can't predict bot's hand"
**Root cause:** Cycle info not shown, or bot's cycle is hidden  
**Fix:** Show bot's cycle position (e.g., "Bot: 5/8")  
**Trade-off:** Reduces fog of war, may reduce challenge

### Issue: "Card draws feel instant/jarring"
**Root cause:** No animation, or animation too fast  
**Fix:** Add 300-400ms slide-in animation for drawn card  
**Verify:** Animation smooth and visible but not slow

---

## Balance Decisions

### Decision 1: Show Bot's Cycle Position?

**Option A: Hide (Fog of War)**
- Pro: More challenging, player must infer
- Con: Player feels disadvantaged, less strategic agency
- **Recommended for:** Casual mode

**Option B: Show (Full Info)**
- Pro: Player can plan knowing when bot reshuffles
- Con: Less mystery, easier for player
- **Recommended for:** Tournament/competitive

**Recommendation:** Start hidden, add as toggle in settings

### Decision 2: Cycle Speed (How often cards cycle?)

**Current:** 8 plays = 1 cycle  
**Test:** Is this right?

- Too fast (4 plays = 1 cycle): Combo decks too powerful
- Too slow (12 plays = 1 cycle): Game feels stale
- **Current (8 plays) seems right:** ~18 plays per match = 2-3 cycles

### Decision 3: Reshuffle Feedback

**Should reshuffle be obvious to both players?**
- **Yes:** Add sound effect + notification
- **Reasoning:** Psychological "power spike" moment, both players celebrate/prepare
- **Implementation:** "🔄 Deck reshuffled!" message + whoosh sound

---

## Success Criteria Summary

### ✅ Cycling Works Correctly
- [ ] All 8 cards cycle in order
- [ ] Reshuffle triggers at cycle_index=8
- [ ] Both player and bot cycle independently
- [ ] No cards get skipped or duplicated

### ✅ UI/UX Is Clear
- [ ] Next card preview is visible and understandable
- [ ] Cycle position (0/8) is clear
- [ ] Card playability is obvious
- [ ] No confusion about hand state

### ✅ Gameplay Feels Fair
- [ ] ~50% player winrate vs. medium bot
- [ ] Player feels strategic control, not random
- [ ] Cycling rewards good planning
- [ ] Both players suffer equally from bad cycles

### ✅ Strategy Emerges
- [ ] Players plan plays around cycle positions
- [ ] Players infer opponent's hand from plays
- [ ] Different cycle positions create decision points
- [ ] High-skill players outperform casual players

---

## Post-Launch Monitoring

### Metrics to Track
- Average cycle count per match
- Player engagement with next card preview (clicks/hovers)
- Win rate distribution by cycle phase
- Player complaints about cycling balance

### Adjustments to Make
- If cycle too fast: Increase deck size to 10
- If cycle too slow: Decrease deck size to 6
- If players ignore next preview: Redesign UI
- If bot seems unfair: Verify bot's cycling is correct

---

**Version:** 1.0  
**Last Updated:** 2024-01-15  
**Status:** Ready for Playtesting
