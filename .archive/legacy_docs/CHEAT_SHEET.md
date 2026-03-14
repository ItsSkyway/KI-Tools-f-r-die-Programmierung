# ⚔️ Clash Royale Game - Mechanics Cheat Sheet

## Quick Reference Cards

### 🎯 Win Conditions (In Order of Priority)
1. **Destroy Enemy King Tower** → Instant win
2. **Destroy Both Enemy Princess Towers** → King Tower becomes vulnerable
3. **Most Tower HP at Timer Expiration** → Win by score
4. **Tied Tower HP at Timer Expiration** → Tie

### ⏱️ Match Timeline
```
Start (0s)          Regular Elixir (1/sec)
    ↓
    ↓
120s (2 min mark)  Regular Elixir continues
    ↓
    ↓
120s (1 min mark)  ⚡ DOUBLE ELIXIR ACTIVATES (2/sec)
    ↓
    ↓
180s (end)         Game ends - Winner determined
```

### 💜 Elixir System
```
Resource Type:    Currency for playing cards
Starting Amount:  10 (max)
Regeneration:     1 per second (normal)
                  2 per second (double elixir, last 60s)
Max Capacity:     10
Cost Range:       2-7 per card
```

### 🏰 Tower Configuration
```
Per Side:
  └─ 1 King Tower (center, back)
  └─ 2 Princess Towers (left & right)

Tower HP:
  King Tower:      3500 HP
  Princess Tower:  1800 HP each
  
Team Colors:
  Player:  🔵 Blue (bottom)
  Enemy:   🔴 Red (top)
```

### 🃏 Card Types

#### TROOPS (Play as units that move & attack)
| Card | Cost | HP | Damage | Speed | Range | Special |
|------|------|----|----|----|----|---------|
| Knight | 3⚡ | 600 | 100 | Normal | Melee | Balanced |
| Archer | 3⚡ | 200 | 120 | Fast | Far | Fragile |
| Giant | 5⚡ | 1800 | 60 | Slow | Melee | Buildings |
| Minions | 3⚡ | 100×3 | 80 | Fast | Far | Flying |
| Skeleton Army | 3⚡ | 60×10 | 40 | Fast | Melee | Swarm |
| Baby Dragon | 4⚡ | 800 | 120 | Slow | Mid | Flying+Splash |
| Valkyrie | 4⚡ | 900 | 130 | Slow | Melee | Splash |
| Musketeer | 4⚡ | 400 | 160 | Normal | Far | Accurate |
| Hog Rider | 4⚡ | 500 | 150 | Fast | Melee | Buildings |
| Witch | 5⚡ | 500 | 100 | Slow | Mid | Spawn Skeletons |
| P.E.K.K.A | 7⚡ | 2000 | 300 | Very Slow | Melee | Ultimate |

#### BUILDINGS (Play as defensive structures)
| Card | Cost | HP | Damage | Range | Special |
|------|------|----|----|----|----|
| Cannon | 3⚡ | 400 | 150 | Far | Single Target |
| Bomb Tower | 5⚡ | 700 | 200 | Very Far | Splash |

#### SPELLS (Cast instantly, instant effect)
| Card | Cost | Effect | Range | Duration |
|------|------|--------|-------|----------|
| Fireball | 4⚡ | Deal 400 damage in radius | 120 | Instant |
| Arrows | 3⚡ | Deal 200 damage in radius | 150 | Instant |
| Freeze | 4⚡ | Disable enemy movement | 120 | 2 seconds |

### 🎮 Card Selection Strategy

#### Balanced Deck (8 cards)
```
  2-3 Defensive cards (Cannon, Bomb Tower, Archers)
  2-3 Offensive cards (Knight, Giant, Hog Rider)
  2-3 Support cards (Spells: Fireball, Arrows, Freeze)
  
  Average Elixir: 3.5-4.0 (ideal range)
```

#### Aggro Deck (Push-heavy)
```
  1-2 Defensive
  5-6 Offensive/Swarm
  1-2 Spells
  
  Average Elixir: 3.5-4.0
```

#### Control Deck (Defense-focused)
```
  4-5 Defensive
  1-2 Offensive
  2-3 Spells
  
  Average Elixir: 3.5-4.0
```

### 🤖 AI Difficulty Comparison

| Aspect | Easy | Medium | Hard |
|--------|------|--------|------|
| Play Speed | Every 5-8s | Every 3-5s | Every 2-3s |
| Strategy | Random | Basic | Advanced |
| Counter-plays | None | Occasional | Frequent |
| Card Selection | Random | Elixir-aware | Situational |
| Difficulty Rating | Beginner | Intermediate | Expert |
| Best For | Learning | Casual | Challenge |

### 📊 Unit Movement Priority

```
Unit finds target by checking:
  1. Buildings (if unit targets buildings)
  2. Towers (if unit targets buildings)
  3. Enemy troops (all units)
  4. Path toward enemy side (if no target)
```

### ⚔️ Combat Mechanics

#### Targeting
```
- Find nearest valid target within range
- Range varies by card (30-140 units)
- Some units prioritize buildings (Giant, Hog Rider)
```

#### Attack
```
- Wait for cooldown (1s ÷ attack speed)
- Deal damage to target
- Splash damage hits nearby units (some cards)
```

#### Death
```
- Unit dies when HP ≤ 0
- Unit is removed from board
- No death effects (except Witch spawns skeletons)
```

#### Special Status
```
- Frozen: Unit cannot move for 2 seconds
- Duration: Countdown from 2000ms
- Movement is disabled, but attacks still possible
```

### 🎨 Visual Indicators

#### HP Bars (Shows unit health)
```
Red:    ▩▩▩▩▩▩▩▩▩▩ 100%  (Full health)
Yellow: ▩▩▩▩▩░░░░░ 50%   (Medium health)
Green:  ▩░░░░░░░░░ 10%   (Low health)
```

#### Elixir Bar (Shows available resources)
```
[████████░░] 8/10 Elixir
 ↑
 Purple fill = amount available
```

#### Tower Status (Shows tower health)
```
Top:    ❤️ 3500  👑     (Enemy towers)
         🏰 1800  🏰
         
Bottom: ❤️ 3500  👑     (Your towers)
         🏰 1800  🏰
```

### 💡 Pro Tips

#### Card Playing
- ✅ Save elixir for counter-plays
- ✅ Play cheapest cards first in a push
- ✅ Use buildings for tower defense
- ❌ Don't spend all elixir at once
- ❌ Don't waste spells on single units

#### Positioning
- ✅ Play troops in center to push both lanes
- ✅ Place buildings near your towers
- ✅ Use ranged units behind melee units
- ❌ Don't isolate troops

#### Timing
- ✅ Wait for elixir >6 before pushing
- ✅ React to opponent's heavy plays
- ✅ Prepare for double elixir at 60s
- ❌ Don't fight 1v3 in different lanes

#### Resources
- ✅ Average out your deck elixir cost
- ✅ Have 2-3 cheap cards for quick plays
- ✅ Have 1-2 expensive cards for big threats
- ❌ Don't have all high-cost cards

### 🔄 Game Loop (30 times per second)

```
Each frame (33ms):
  1. Update timer (-33ms)
  2. Regenerate elixir (+1/sec)
  3. Remove dead units
  4. Unfreeze units
  5. Move units toward targets
  6. Check attack ranges
  7. Apply damage
  8. Towers attack nearby units
  9. Check win conditions
  10. Run bot AI logic
  11. Update UI
```

### 📈 Progression Through Match

```
0-60s:    Early game - build elixir, small pushes
60-120s:  Mid game - test opponent's deck
120-180s: Double elixir - aggressive plays
180s:     Game end - determine winner
```

### 🎯 Matchup Guide

#### What Beats What
```
Swarms (Skeleton Army, Minions)
  ← Defeated by: Arrows, Fireball, Valkyrie

Single targets (Archer, Musketeer)
  ← Defeated by: Swarms, Giant, P.E.K.K.A

Melee units (Knight, Valkyrie)
  ← Defeated by: Archers, Musketeer, towers

Buildings
  ← Defeated by: Hog Rider, Giant, Witch

Flying units (Minions, Baby Dragon)
  ← Defeated by: Arrows, Musketeer, Witch
```

### 📋 Game State Checklist

At any time, track:
- [ ] Your elixir (0-10)
- [ ] Enemy elixir (estimated)
- [ ] Your tower HP (King + 2 Princess)
- [ ] Enemy tower HP (King + 2 Princess)
- [ ] Active units on board (yours + enemy)
- [ ] Cards in your hand (4 shown)
- [ ] Remaining time
- [ ] Double elixir active? (last 60s)

### ⚙️ Difficulty Settings

**Easy Bot**
```
Behavior: Random, slow
Playstyle: Unpredictable
Best for: Learning game mechanics
Typical match time: 3:00
```

**Medium Bot**
```
Behavior: Strategic, moderate
Playstyle: Balanced offense/defense
Best for: Casual play
Typical match time: 3:00
```

**Hard Bot**
```
Behavior: Tactical, fast
Playstyle: Counter-play focused
Best for: Competitive practice
Typical match time: 3:00
```

### 🏆 Win Strategies

#### Aggressive Strategy
1. Build elixir early
2. Create a strong push at 60s
3. Follow up quickly
4. Aim for King Tower

#### Defensive Strategy
1. Place buildings early
2. Defend both lanes
3. Build counter-push while defending
4. Attack after defense stabilizes

#### Balanced Strategy
1. Defend reactively
2. Build medium pushes (2-3 units)
3. Use spells for crowd control
4. Rotate through different units

---

## Quick Lookup Table

### By Elixir Cost
```
3⚡: Knight, Archer, Minions, Skeleton Army, Arrows, Cannon
4⚡: Fireball, Baby Dragon, Valkyrie, Musketeer, Hog Rider, Freeze
5⚡: Giant, Witch, Bomb Tower
7⚡: P.E.K.K.A
```

### By Type
```
Troops:     All except Bomb Tower, Cannon, and spells
Buildings:  Cannon, Bomb Tower
Spells:     Fireball, Arrows, Freeze
Flying:     Minions, Baby Dragon
Swarms:     Skeleton Army, Minions (multiple units)
```

### By Range
```
Melee (50):      Knight, Valkyrie, P.E.K.K.A, Giant, Hog Rider
Close (100):     Archer, Musketeer
Far (120):       Baby Dragon
Very Far (140):  Bomb Tower
```

---

**Print this page for quick reference while playing!** 📋
