# Clash Royale Browser Game - Balance Summary

**Quick Reference for Game Designers & Implementers**

---

## THE 5 CORE PROBLEMS & FIXES

| Problem | Why It Breaks The Game | The Fix | Impact |
|---------|------------------------|---------|--------|
| **Skeleton Army too expensive** | 3 elixir cycle card can't cycle fast | Change to 2 elixir | Enables fast-paced cycle decks |
| **Tower targeting is random** | Hog Rider can ignore towers if unlucky | Prioritize: Flyers → Builders → Ground | Hog becomes fair 4-elixir threat |
| **Destroyed towers disappear** | No visual feedback for tower destruction | Show 👑 crown when tower dies | Players feel accomplishment |
| **Elixir regen too flat** | No "phase" feeling; match feels same throughout | 3-phase regen: Early (0.015) → Mid (0.03) → Late (0.045) | Match pacing feels exciting |
| **AI plays randomly** | No strategy or counter-play | 3-tier AI: Easy (react) → Medium (counter) → Hard (synergy) | Every difficulty feels intentional |

---

## CARD STAT REFERENCE SHEET

### Costs (by role)

**2 Elixir:** Skeleton Army (swarm cycle)  
**3 Elixir:** Knight, Archer, Minions, Cannon, Arrows (entry/cycle)  
**4 Elixir:** Musketeer, Valkyrie, Baby Dragon, Hog Rider, Fireball, Freeze (mid-game threats)  
**5 Elixir:** Giant, Witch, Bomb Tower (strong/situational)  
**7 Elixir:** PEKKA (finisher)

### HP Reference

| Card | HP | Role | Notes |
|------|----|----|-------|
| Skeleton | 40 | Swarm | Weak by design; many in army |
| Knight | 650 | Tank | Cheap melee tank |
| Archer | 250 | Ranged | Squishy but high damage |
| Musketeer | 400 | Ranged | More HP than Archer, more DPS |
| Baby Dragon | 850 | Flying Tank | Tanky, splash, no building targeting |
| Valkyrie | 950 | Melee Tank | Highest melee HP; splash damage |
| Witch | 550 | Support Tank | Spawns skeletons |
| Giant | 1950 | Mega Tank | Highest HP in game; slow |
| PEKKA | 2400 | Mega Tank | Extreme everything |

### Damage Reference

| Card | Damage | Attack Speed | Role | Notes |
|------|--------|--------------|------|-------|
| Skeleton | 35 | 0.8 | Swarm | Weak alone; strong in groups |
| Archer | 110 | 1.2 | Ranged | Fast, consistent |
| Musketeer | 165 | 0.9 | Ranged | Best single-target DPS at 4 elixir |
| Knight | 95 | 1.0 | Melee | Solid balanced melee |
| Baby Dragon | 100 | 1.2 | Flying | Splash, not raw DPS |
| Valkyrie | 120 | 1.3 | Melee | Splash focus, not DPS |
| Giant | 65 | 1.5 | Tank | Slow attack speed = chip damage |
| PEKKA | 290 | 1.8 | Mega | Fastest attack speed; devastating |
| Arrows | 180 | N/A | Spell | 1-shot kills Skeleton Army |
| Fireball | 380 | N/A | Spell | More damage than Arrows, harder to use |

---

## THE META ARCHETYPES (Rock-Paper-Scissors)

### Beatdown (Rock)
- **Deck:** Giant, Witch, Musketeer, Valkyrie, Fireball, Arrows, Knight, Cannon
- **Strategy:** Slow push with high HP units + ranged support
- **Win Con:** Grind down towers
- **Beats:** Swarms (splash clears them)
- **Loses to:** Freeze + Hog (can't defend fast pushes)

### Cycle (Scissors)
- **Deck:** Hog Rider, Skeleton Army, Arrows, Knight, Cannon, Archer, Minions, Freeze
- **Strategy:** Fast rotation; play Hog multiple times
- **Win Con:** Hog rush before opponent defends
- **Beats:** Beatdown (out-rotates, cheaper counters)
- **Loses to:** Spell-Bait (baits waste your counters)

### Spell-Bait (Paper)
- **Deck:** Skeleton Army, Musketeer, Minions, Baby Dragon, Arrows, Fireball, Hog Rider, Cannon
- **Strategy:** Bait spells with swarms; play ranged undefended
- **Win Con:** Force opponent to waste spells
- **Beats:** Beatdown (multiple undefended threats)
- **Loses to:** Cycle (cycles and ignores baits)

---

## ELIXIR PHASE SYSTEM

### The 3-Minute Match Arc

```
EARLY GAME (0–60s)  — 0.50 elixir/sec
├─ Feeling: Careful, testing, high-stakes
├─ Strategy: Cycle rotation, establish win-con
├─ Typical Play: Skeleton Army → Arrows trade
└─ Psychological: "Don't waste elixir"

MID GAME (60–120s) — 1.00 elixir/sec [DOUBLE ELIXIR]
├─ Feeling: Excitement! Tempo shift!
├─ Strategy: Build push, use spells, defend & counter
├─ Typical Play: Giant + Musketeer push
└─ Psychological: "Capitalize on the advantage NOW"

LATE GAME (120–180s) — 1.50 elixir/sec [TRIPLE ELIXIR]
├─ Feeling: Frantic, all-in, massive plays
├─ Strategy: Multiple threats simultaneously
├─ Typical Play: Hog + Freeze + Skeleton Army spam
└─ Psychological: "All cards on the table"

OVERTIME (180s+) — 1.50 elixir/sec [SUDDEN DEATH]
├─ Feeling: Maximum intensity
├─ Rule: First tower to take damage loses
├─ Strategy: Risky, desperate plays
└─ Psychological: "One mistake = game over"
```

---

## AI PERSONALITY TIERS

### EASY (Beginner-Friendly)
- **Play Interval:** 5 seconds
- **Strategy:** React to threats, no planning
- **Counter-Play:** Plays defensive building when you have 3+ troops attacking
- **Deck:** Mixed, no synergy (Knight, Archer, Cannon, Minions, Arrows, Skeleton Army, Baby Dragon, Valkyrie)
- **Lose Condition:** Loses to any coherent 4-card synergy
- **Feel:** Telegraphed, predictable, good for learning

### MEDIUM (Competitive)
- **Play Interval:** 3 seconds
- **Strategy:** Builds pushes, defends intelligently, manages elixir
- **Counter-Play:** 
  - Plays Arrows if you play Skeleton Army
  - Plays defensive building if you have 3+ troops in-arena
  - Builds tank + support pushes
- **Deck:** Balanced synergy (Skeleton Army, Arrows, Hog Rider, Musketeer, Bomb Tower, Valkyrie, Giant, Fireball)
- **Win Condition:** Out-defends you, wins on tower chip
- **Feel:** Competent, strategic, fair challenge

### HARD (Competitive +)
- **Play Interval:** 1.5 seconds
- **Strategy:** Exploits windows, denies efficiency, punishes hesitation
- **Counter-Play:**
  - Phase-aware: Early (cycle Hog), Mid (synergy push), Late (all-in)
  - Plays Hog + Freeze combo
  - Cycles fast in early game to pressure towers
  - Aggressive in late game to maximize damage
- **Deck:** Aggressive synergy (Hog Rider, Freeze, Archer, Knight, Skeleton Army, Minions, Witch, Fireball)
- **Win Condition:** Out-damages you, wins on aggressive tempo
- **Feel:** Aggressive, synergistic, punishing play

---

## CARD ROLE CHEAT SHEET

### Cycle Cards (Play multiple times per match)
- **Skeleton Army (2 elixir):** Bait spells; cheap rotation
- **Arrows (3 elixir):** Kill swarms; cheap counter
- **Knight (3 elixir):** Small push; versatile

### Win Conditions (Play 1–3 times to win)
- **Hog Rider (4 elixir):** Fast building destroyer
- **Giant (5 elixir):** Slow mega tank; needs support
- **PEKKA (7 elixir):** All-in finisher

### Support Cards (Complement other cards)
- **Musketeer (4 elixir):** Ranged DPS for push
- **Baby Dragon (4 elixir):** Flying splash for push
- **Witch (5 elixir):** Swarm generator for push

### Defense Cards (Stop opponent's push)
- **Cannon (3 elixir):** Ground defense
- **Bomb Tower (5 elixir):** Swarm defense

### Spell Cards (Instant effect)
- **Arrows (3 elixir):** AOE clearer
- **Fireball (4 elixir):** High-damage AOE
- **Freeze (4 elixir):** Utility; stops pushes

---

## BALANCE METRICS (For Tuning)

### Card Power Tiers (by elixir cost)

```
Cost 2:  Stat budget ~500 HP or 10 units
Cost 3:  Stat budget ~400-700 HP, 100+ damage
Cost 4:  Stat budget ~400-1000 HP, 100+ damage
Cost 5:  Stat budget ~550-2000 HP, 150+ damage
Cost 7:  Stat budget 2400+ HP, 290+ damage
```

### Win Rate Targets
- **Ideal:** 45–55% win rate per card
- **Warning:** Any card > 60% is overpowered
- **Warning:** Any card < 40% is underpowered
- **Exception:** Situational cards (Freeze, Witch) may have lower play rate but higher win rate

### DPS-per-Elixir Reference
```
PEKKA:     290 damage ÷ 1.8 sec = 161 DPS ÷ 7 elixir = 23 DPS/elixir
Musketeer: 165 damage ÷ 1.1 sec = 150 DPS ÷ 4 elixir = 37.5 DPS/elixir  [HIGH]
Giant:      65 damage ÷ 0.67 sec = 97 DPS ÷ 5 elixir = 19.4 DPS/elixir  [LOW - expected, tank]
Archer:    110 damage ÷ 0.83 sec = 133 DPS ÷ 3 elixir = 44.3 DPS/elixir [HIGH - cycling]
```

**Balance Principle:** High-cost cards = lower DPS/elixir (drawback for high stats)

---

## IMPLEMENTATION PRIORITY

### MUST DO (Core Balance)
1. ✅ Update card stats (Skeleton Army 2 elixir, HP adjustments)
2. ✅ Fix tower targeting (Hog priority)
3. ✅ Implement crown system (visual feedback)
4. ✅ Phase-based elixir regen (0.015 → 0.03 → 0.045)
5. ✅ Improve AI difficulty tiers

### SHOULD DO (Feel Improvements)
1. ⭐ Add phase transition UI (show "DOUBLE ELIXIR" banner)
2. ⭐ Spell wind-up delays (0.3–0.5s)
3. ⭐ Spell placement indicators (where spells will land)
4. ⭐ Improved deck builder (show average elixir cost)

### NICE TO HAVE (Polish)
1. 🎨 Animations (freeze effect, tower explosion)
2. 🎵 Sound effects (phase transitions, tower destruction)
3. 📊 Statistics tracking (card usage, win rates)
4. 🎓 Tutorial (explain phases, synergies, roles)

---

## COMMON BALANCE MISTAKES (Avoid These!)

| Mistake | Impact | How to Avoid |
|---------|--------|-------------|
| **Make expensive cards too weak** | Nobody plays them | High-cost cards need clear advantage (HP, damage, or utility) |
| **Give support cards no reason to play** | Feels like bloat | Every card must have a role (cycle, push support, defense, spell) |
| **Balance only raw damage** | Ignores positioning, speed, range | Balance by DPS-per-elixir, utility, and role filling |
| **Ignore elixir timing** | Match pacing feels flat | Phases should feel distinct (early ≠ mid ≠ late) |
| **Make AI predictable** | No challenge on medium/hard | Each difficulty should have different strategy |
| **Overlook counter-play** | Rock-paper-scissors breaks | Always check: What beats this card? What does it beat? |

---

## QUICK BALANCE CHECKLIST (Pre-Launch)

- [ ] Skeleton Army 1-shot by Arrows (value test)
- [ ] Hog Rider dies to Cannon (but beats Knight)
- [ ] Giant requires ranged support (can't 1v1 Musketeer)
- [ ] PEKKA too expensive for spam (costs 7 elixir; needs setup)
- [ ] Towers focus Hog Rider > random troops (priority system works)
- [ ] Early game: methodical (first 60s)
- [ ] Mid game: exciting (60–120s, double elixir)
- [ ] Late game: frantic (120–180s, triple elixir)
- [ ] Easy AI: loses to coherent strategy
- [ ] Medium AI: counters basic plays (Skeleton Army → Arrows)
- [ ] Hard AI: builds synergies (Hog + Freeze combos)

---

## TUNING GUIDE (After Implementation)

### If Skeleton Army is too strong:
- Reduce count from 12 to 10
- Reduce HP from 40 to 35
- Increase spawn time (more space between skeletons)

### If Hog Rider is dying too fast:
- Increase HP from 550 to 600
- Increase speed from 1.6 to 1.7 (harder to kite)
- Reduce tower focus time (less priority)

### If Giant feels useless:
- Increase building targeting damage by 20%
- Reduce support requirements (buff Witch or Musketeer)
- Increase HP from 1950 to 2050

### If Medium AI is too hard:
- Reduce play interval from 3s to 4s
- Disable Hog + Freeze combo
- Simplify counter-logic

### If elixir phases feel wrong:
- Early feels too slow? Increase to 0.02 elixir/sec
- Mid feels too fast? Decrease to 0.025 elixir/sec
- Late feels chaotic? Decrease to 0.04 elixir/sec

---

## FINAL NOTES

### This Design Delivers:
✅ **Authentic Clash Royale feel** — 3 phases, strategic depth, rock-paper-scissors meta  
✅ **Clear card roles** — Every card has a purpose; synergies are visible  
✅ **Meaningful decisions** — Timing, positioning, and deck building matter  
✅ **Fair difficulty scaling** — Easy → Medium → Hard progression with intentional personality  
✅ **Exciting pacing** — Match arc with rising tension and climactic moments  

### Play-Testing Focus:
1. Does the match arc feel exciting? (Early slow → Mid tempo → Late frantic)
2. Do all 4 archetypes feel viable? (Beatdown, Cycle, Spell-Bait, Control)
3. Do cards feel worth their cost? (No obvious "trap" cards)
4. Does each AI difficulty feel fair and intentional?

### The Winning Formula:
**Strategy + Timing + Synergy + Fair Challenge = Replayability**

This design achieves all four. 🎯

---

**Document Version:** 2.0  
**Status:** Ready for Implementation & Playtesting  
**Last Updated:** 2024
