# Clash Royale Balance Implementation Guide

**Quick Reference:** Specific code changes to make the game feel authentic and balanced

---

## 1. CARD STAT UPDATES

### Changes to CARDS Object (Lines 32–177 in index.html)

```javascript
// BEFORE (Unbalanced)
skeletonArmy: {
  elixirCost: 3,  // ❌ Too expensive for a cycle card
  stats: { hp: 60, damage: 40, speed: 1.3, count: 10 }
}

// AFTER (Balanced)
skeletonArmy: {
  elixirCost: 2,  // ✅ Now a true cycle card
  stats: { hp: 40, damage: 35, speed: 1.2, count: 12 }
  // Lower HP means it's bait-friendly; more skeletons = swarm threat
}
```

### Full Card Stat Replacement (Drop-in)

```javascript
const CARDS = {
  // === TIER 1 CYCLE CARDS (2-3 ELIXIR) ===
  
  skeletonArmy: {
    id: 'skeletonArmy',
    name: 'Skeleton Army',
    emoji: '💀',
    elixirCost: 2,  // CHANGED: 3 → 2 (cycle card!)
    type: 'troop',
    stats: { hp: 40, damage: 35, speed: 1.2, range: 35, attackSpeed: 0.8, count: 12 },
    description: 'Swarm card. Bait spells, cycle rotation.',
  },
  
  archer: {
    id: 'archer',
    name: 'Archer',
    emoji: '🏹',
    elixirCost: 3,
    type: 'troop',
    stats: { hp: 250, damage: 110, speed: 1.0, range: 130, attackSpeed: 1.2 },
    description: 'Ranged damage dealer. Balanced.',
  },
  
  cannon: {
    id: 'cannon',
    name: 'Cannon',
    emoji: '🔫',
    elixirCost: 3,
    type: 'building',
    stats: { hp: 450, damage: 140, range: 110, attackSpeed: 1.2 },
    description: 'Ground defense. No splash. Dies to Hog.',
  },
  
  knight: {
    id: 'knight',
    name: 'Knight',
    emoji: '🛡️',
    elixirCost: 3,
    type: 'troop',
    stats: { hp: 650, damage: 95, speed: 0.9, range: 50, attackSpeed: 1.0 },
    description: 'Melee tank. Cheap push unit.',
  },
  
  minions: {
    id: 'minions',
    name: 'Minions',
    emoji: '👿',
    elixirCost: 3,
    type: 'troop',
    stats: { hp: 110, damage: 75, speed: 1.3, range: 90, attackSpeed: 1, flying: true, count: 3 },
    description: 'Flying swarm. Fast.',
  },
  
  // === TIER 2 MID-GAME CARDS (4 ELIXIR) ===
  
  babyDragon: {
    id: 'babyDragon',
    name: 'Baby Dragon',
    emoji: '🐉',
    elixirCost: 4,
    type: 'troop',
    stats: { hp: 850, damage: 100, speed: 0.8, range: 100, attackSpeed: 1.2, flying: true, splashRadius: 90 },
    description: 'Flying tank with splash.',
  },
  
  valkyrie: {
    id: 'valkyrie',
    name: 'Valkyrie',
    emoji: '⚔️',
    elixirCost: 4,
    type: 'troop',
    stats: { hp: 950, damage: 120, speed: 0.85, range: 50, attackSpeed: 1.3, splashRadius: 100 },
    description: 'Melee. Splash damage. Swarm killer.',
  },
  
  musketeer: {
    id: 'musketeer',
    name: 'Musketeer',
    emoji: '🤠',
    elixirCost: 4,
    type: 'troop',
    stats: { hp: 400, damage: 165, speed: 0.95, range: 145, attackSpeed: 0.9 },
    description: 'Long-range single target. Pure DPS.',
  },
  
  hogRider: {
    id: 'hogRider',
    name: 'Hog Rider',
    emoji: '🐗',
    elixirCost: 4,
    type: 'troop',
    stats: { hp: 550, damage: 140, speed: 1.6, range: 50, attackSpeed: 1.2, targetBuildings: true },
    description: 'Fast building-destroyer. Win condition.',
  },
  
  arrows: {
    id: 'arrows',
    name: 'Arrows',
    emoji: '⬆️',
    elixirCost: 3,
    type: 'spell',
    stats: { damage: 180, splashRadius: 150 },
    description: 'AOE spell. Anti-swarm.',
  },
  
  fireball: {
    id: 'fireball',
    name: 'Fireball',
    emoji: '🔥',
    elixirCost: 4,
    type: 'spell',
    stats: { damage: 380, splashRadius: 120 },
    description: 'AOE spell. Chip damage.',
  },
  
  freeze: {
    id: 'freeze',
    name: 'Freeze Spell',
    emoji: '❄️',
    elixirCost: 4,
    type: 'spell',
    stats: { splashRadius: 130, freezeDuration: 2000 },
    description: 'Freezes troops + tower.',
  },
  
  // === TIER 3 HIGH-ELIXIR CARDS (5+ ELIXIR) ===
  
  witch: {
    id: 'witch',
    name: 'Witch',
    emoji: '🧙‍♀️',
    elixirCost: 5,
    type: 'troop',
    stats: { hp: 550, damage: 95, speed: 0.8, range: 100, attackSpeed: 1.2, spawnSkeleton: true },
    description: 'Spawns skeletons. Beatdown.',
  },
  
  giant: {
    id: 'giant',
    name: 'Giant',
    emoji: '👹',
    elixirCost: 5,
    type: 'troop',
    stats: { hp: 1950, damage: 65, speed: 0.65, range: 50, attackSpeed: 1.5, targetBuildings: true },
    description: 'Mega tank. Requires support.',
  },
  
  bombTower: {
    id: 'bombTower',
    name: 'Bomb Tower',
    emoji: '💣',
    elixirCost: 5,
    type: 'building',
    stats: { hp: 800, damage: 180, range: 120, attackSpeed: 1.1, splashRadius: 110 },
    description: 'Defensive splash building.',
  },
  
  pekka: {
    id: 'pekka',
    name: 'P.E.K.K.A',
    emoji: '🤖',
    elixirCost: 7,
    type: 'troop',
    stats: { hp: 2400, damage: 290, speed: 0.6, range: 60, attackSpeed: 1.8 },
    description: 'Extreme cost. Extreme reward. Melee damage.',
  },
}
```

---

## 2. FIX TOWER TARGETING

**Location:** Lines 571–587 (towerAttack function)

### Current Code (Broken)
```javascript
const towerAttack = (tower, troops) => {
  if (tower.hp <= 0) return
  const range = 150
  const targets = troops.filter(t => Math.hypot(t.x - tower.x, t.y - tower.y) < range && t.hp > 0)
  if (targets.length > 0) {
    const target = targets[0]  // ❌ Picks first in array (random!)
    // ...
  }
}
```

### New Code (Smart Targeting)
```javascript
const towerAttack = (tower, troops) => {
  if (tower.hp <= 0) return
  const range = 150
  const inRange = troops.filter(t => Math.hypot(t.x - tower.x, t.y - tower.y) < range && t.hp > 0)
  
  if (inRange.length === 0) return
  
  // ✅ NEW: Priority-based targeting
  // Priority 1: Flying units (that don't target buildings)
  const flyers = inRange.filter(t => t.card.stats.flying && !t.card.stats.targetBuildings)
  const buildingTargeters = inRange.filter(t => t.card.stats.targetBuildings)
  const groundTroops = inRange.filter(t => !t.card.stats.flying && !t.card.stats.targetBuildings)
  
  // Select target by priority
  let target = null
  if (flyers.length > 0) {
    target = flyers.reduce((closest, t) => {
      const d1 = Math.hypot(t.x - tower.x, t.y - tower.y)
      const d2 = Math.hypot(closest.x - tower.x, closest.y - tower.y)
      return d1 < d2 ? t : closest
    })
  } else if (buildingTargeters.length > 0) {  // ✅ Prioritize Hog/Giant
    target = buildingTargeters.reduce((closest, t) => {
      const d1 = Math.hypot(t.x - tower.x, t.y - tower.y)
      const d2 = Math.hypot(closest.x - tower.x, closest.y - tower.y)
      return d1 < d2 ? t : closest
    })
  } else if (groundTroops.length > 0) {
    target = groundTroops.reduce((closest, t) => {
      const d1 = Math.hypot(t.x - tower.x, t.y - tower.y)
      const d2 = Math.hypot(closest.x - tower.x, closest.y - tower.y)
      return d1 < d2 ? t : closest
    })
  }
  
  if (target) {
    const now = Date.now()
    if (now - tower.lastAttackTime > 1000) {
      target.hp -= 150
      tower.lastAttackTime = now
    }
  }
}
```

---

## 3. IMPLEMENT CROWN SYSTEM

**Location:** Lines 647–695 (renderArena function, tower rendering)

### Current Code (No Visual Feedback)
```javascript
<div
  className="absolute w-8 h-10 bg-gradient-to-b from-red-400 to-red-600 rounded border-2 border-yellow-400 flex items-center justify-center text-lg"
  style={{ left: towers.enemy.kingTower.x - 16, top: towers.enemy.kingTower.y - 20 }}
>
  👑
</div>
```

### New Code (Crown System + Destruction Feedback)
```javascript
// Helper: Render single tower with crown system
const renderTowerUI = (tower, isEnemyTower) => {
  const isDestroyed = tower.hp <= 0
  
  if (isDestroyed) {
    // ✅ NEW: Show floating crown when destroyed
    return (
      <div
        className={`absolute flex items-center justify-center ${
          tower.isKing ? 'text-6xl' : 'text-3xl opacity-70'
        }`}
        style={{ left: tower.x - 16, top: tower.y - 20 }}
      >
        👑
      </div>
    )
  }
  
  // Normal tower (alive)
  const bgColor = isEnemyTower ? 'from-red-400 to-red-600' : 'from-blue-400 to-blue-600'
  return (
    <div
      className={`absolute w-8 h-10 bg-gradient-to-b ${bgColor} rounded border-2 border-yellow-400 flex items-center justify-center text-lg`}
      style={{ left: tower.x - 16, top: tower.y - 20 }}
    >
      👑
    </div>
  )
}

// In renderArena, replace tower rendering with:
{/* Enemy King Tower */}
{renderTowerUI(towers.enemy.kingTower, true)}

{/* Enemy Princess Towers */}
{renderTowerUI(towers.enemy.princessLeft, true)}
{renderTowerUI(towers.enemy.princessRight, true)}

{/* Player King Tower */}
{renderTowerUI(towers.player.kingTower, false)}

{/* Player Princess Towers */}
{renderTowerUI(towers.player.princessLeft, false)}
{renderTowerUI(towers.player.princessRight, false)}
```

---

## 4. REVAMP ELIXIR SYSTEM (Phase-Based)

**Location:** Lines 491–495 (game loop, elixir regen calculation)

### Current Code (Flat Regen)
```javascript
const doubleElixir = gs.gameTime < 60000
const elixirRegen = doubleElixir ? 0.03 : 0.015

gs.playerElixir = Math.min(10, gs.playerElixir + elixirRegen)
gs.enemyElixir = Math.min(10, gs.enemyElixir + elixirRegen)
```

### New Code (3-Phase Escalation)
```javascript
// ✅ NEW: Phase-based elixir regen
let elixirRegen = 0.015  // Early game: 0.5 elixir/sec
let gamePhase = 'early'

if (gs.gameTime < 120000) {
  elixirRegen = 0.03
  gamePhase = 'mid'
}

if (gs.gameTime < 60000) {
  elixirRegen = 0.045
  gamePhase = 'late'
}

// Add phase transition notifications
if (gs.gameTime === 120000 || gs.gameTime === 120033) {  // Trigger once per phase
  console.log('🎉 DOUBLE ELIXIR! Gameplay accelerates.')
}

if (gs.gameTime === 60000 || gs.gameTime === 60033) {
  console.log('🚀 TRIPLE ELIXIR! All-in time!')
}

gs.playerElixir = Math.min(10, gs.playerElixir + elixirRegen)
gs.enemyElixir = Math.min(10, gs.enemyElixir + elixirRegen)
```

**Optional UI Enhancement:** Add phase indicator to UI state
```javascript
// In setGameStats call (around line 599):
setGameStats({
  // ... existing stats
  gamePhase: gamePhase,  // 'early' | 'mid' | 'late'
})

// In renderUI (line 757), add phase indicator:
<div className="text-yellow-400 text-xs font-bold">
  {gameStats.gamePhase === 'late' && '🚀 TRIPLE ELIXIR'}
  {gameStats.gamePhase === 'mid' && '⚡ DOUBLE ELIXIR'}
  {gameStats.gamePhase === 'early' && '🕐 Normal'}
</div>
```

---

## 5. IMPLEMENT SMART AI (3-Tier Difficulty)

**Location:** Lines 421–453 (botPlayCard function)

### Current Code (Random AI)
```javascript
const botPlayCard = useCallback(() => {
  const gs = gameStateRef.current
  if (gs.gameOver) return

  const now = Date.now()
  const hand = gs.enemyHand
  if (hand.length === 0) return

  let playInterval = 5000
  if (difficulty === 'medium') playInterval = 4000
  if (difficulty === 'hard') playInterval = 2500

  if (now - gs.lastCardPlayTime.enemy < playInterval) return

  const playableCards = hand.filter(h => {
    const card = CARDS[h.cardId]
    return gs.enemyElixir >= card.elixirCost
  })

  if (playableCards.length === 0) return

  let selectedCard = playableCards[0]  // ❌ Just picks first

  if (difficulty === 'hard') {
    const highValue = playableCards.filter(h => CARDS[h.cardId].elixirCost >= 4)
    if (highValue.length > 0 && gs.enemyElixir >= 8) {
      selectedCard = highValue[Math.floor(Math.random() * highValue.length)]
    }
  }

  playCard(selectedCard.cardId, false)
  gs.lastCardPlayTime.enemy = now
}, [difficulty, playCard])
```

### New Code (Smart AI with Personality)

```javascript
const botPlayCard = useCallback(() => {
  const gs = gameStateRef.current
  if (gs.gameOver) return

  const now = Date.now()
  
  // Difficulty-specific play intervals
  let playInterval = 5000
  if (difficulty === 'medium') playInterval = 3000  // Faster mid
  if (difficulty === 'hard') playInterval = 1500    // Reactive hard

  if (now - gs.lastCardPlayTime.enemy < playInterval) return

  const hand = gs.enemyHand
  if (hand.length === 0) return

  // ✅ Phase-aware strategy
  const gamePhase = gs.gameTime > 120000 ? 'early' : 
                    gs.gameTime > 60000 ? 'mid' : 'late'

  // === EASY AI (Reactive, Defensive) ===
  if (difficulty === 'easy') {
    // Check if player is threatening
    const playerThreatTroops = gs.playerTroops.filter(t => t.y > ARENA_HEIGHT * 0.3).length
    
    if (playerThreatTroops >= 3 && gs.enemyElixir >= 3) {
      // Panic play: Arrows or Bomb Tower
      const defensive = hand.filter(h => 
        CARDS[h.cardId].id === 'arrows' || CARDS[h.cardId].id === 'bombTower'
      ).find(h => gs.enemyElixir >= CARDS[h.cardId].elixirCost)
      
      if (defensive) {
        playCard(defensive.cardId, false)
        gs.lastCardPlayTime.enemy = now
        return
      }
    }
    
    // Otherwise: Random cycle card (low cost)
    const playable = hand.filter(h => gs.enemyElixir >= CARDS[h.cardId].elixirCost)
    const cheap = playable.filter(h => CARDS[h.cardId].elixirCost <= 3)
    
    if (cheap.length > 0) {
      const card = cheap[Math.floor(Math.random() * cheap.length)]
      playCard(card.cardId, false)
      gs.lastCardPlayTime.enemy = now
    }
    return
  }

  // === MEDIUM AI (Balanced with Counter-Play) ===
  if (difficulty === 'medium') {
    // Counter-logic: If player played swarm, play Arrows
    const playerHasSwarm = gs.playerTroops.filter(t => 
      (CARDS[t.cardId].stats.count || 1) > 3
    ).length > 0
    
    if (playerHasSwarm && gs.enemyElixir >= 3) {
      const arrows = hand.find(h => h.cardId === 'arrows')
      if (arrows) {
        playCard('arrows', false)
        gs.lastCardPlayTime.enemy = now
        return
      }
    }

    // Push building logic
    if (gs.enemyElixir >= 4 && gamePhase !== 'early') {
      const tanks = hand.filter(h => 
        ['giant', 'valkyrie', 'witch'].includes(h.cardId)
      ).filter(h => gs.enemyElixir >= CARDS[h.cardId].elixirCost)
      
      if (tanks.length > 0) {
        const tank = tanks[Math.floor(Math.random() * tanks.length)]
        playCard(tank.cardId, false)
        gs.lastCardPlayTime.enemy = now
        return
      }
    }

    // Otherwise cycle
    const playable = hand.filter(h => gs.enemyElixir >= CARDS[h.cardId].elixirCost)
    if (playable.length > 0) {
      const card = playable[Math.floor(Math.random() * playable.length)]
      playCard(card.cardId, false)
      gs.lastCardPlayTime.enemy = now
    }
    return
  }

  // === HARD AI (Aggressive, Synergy-Aware) ===
  if (difficulty === 'hard') {
    // Phase 1 (Early): Cycle Hog pressure
    if (gamePhase === 'early' && gs.enemyElixir >= 4) {
      const hogCard = hand.find(h => h.cardId === 'hogRider')
      if (hogCard) {
        playCard('hogRider', false)
        gs.lastCardPlayTime.enemy = now
        return
      }
    }

    // Phase 2 (Mid): Build synergy push or play Freeze + Hog
    if (gamePhase === 'mid' && gs.enemyElixir >= 8) {
      // Hog + Freeze combo (classic aggression)
      const hogCard = hand.find(h => h.cardId === 'hogRider')
      const freezeCard = hand.find(h => h.cardId === 'freeze')
      
      if (hogCard && freezeCard) {
        playCard('hogRider', false)
        gs.lastCardPlayTime.enemy = now
        
        // Play Freeze after a short delay
        setTimeout(() => {
          playCard('freeze', false)
        }, 500)
        return
      }
    }

    // Phase 3 (Late): All-in aggression
    if (gamePhase === 'late' && gs.enemyElixir >= 6) {
      // Build aggressive multi-threat push
      const playable = hand.filter(h => gs.enemyElixir >= CARDS[h.cardId].elixirCost)
      
      if (playable.length > 0) {
        // Prefer high-impact cards
        const highImpact = playable.filter(h => 
          CARDS[h.cardId].elixirCost >= 4 || CARDS[h.cardId].type === 'spell'
        )
        
        const card = (highImpact.length > 0 ? highImpact : playable)[0]
        playCard(card.cardId, false)
        gs.lastCardPlayTime.enemy = now
        return
      }
    }

    // Default: Play any card
    const playable = hand.filter(h => gs.enemyElixir >= CARDS[h.cardId].elixirCost)
    if (playable.length > 0) {
      const card = playable[Math.floor(Math.random() * playable.length)]
      playCard(card.cardId, false)
      gs.lastCardPlayTime.enemy = now
    }
  }
}, [difficulty, playCard])
```

---

## 6. QUICK WIN: Improve AI Starting Decks

**Location:** Line 467 (initializeGame function)

### Current Code
```javascript
gs.enemyHand = CARD_ARRAY.slice(0, 8).map(card => ({ cardId: card.id, id: Math.random() }))
```

### New Code (Difficulty-Specific Decks)
```javascript
// ✅ AI deck varies by difficulty
const getAIDeck = (diff) => {
  if (diff === 'easy') {
    return ['knight', 'archer', 'cannon', 'minions', 'arrows', 'skeleton army', 'baby dragon', 'valkyrie']
  } else if (diff === 'medium') {
    return ['skeleton army', 'arrows', 'hog rider', 'musketeer', 'bomb tower', 'valkyrie', 'giant', 'fireball']
  } else { // hard
    return ['hog rider', 'freeze', 'archer', 'knight', 'skeleton army', 'minions', 'witch', 'fireball']
  }
}

const aiDeck = getAIDeck(difficulty)
gs.enemyHand = aiDeck.map(cardId => ({ cardId, id: Math.random() }))
```

---

## TESTING CHECKLIST

After implementing these changes, test:

- [ ] **Card Balance:**
  - [ ] Skeleton Army dies to single Arrows (value check)
  - [ ] Hog Rider beats Cannon solo (building targeting works)
  - [ ] Giant requires ranged support (can't 1v1 Musketeer)
  - [ ] PEKKA is too expensive for spam

- [ ] **Tower Targeting:**
  - [ ] Towers focus Hog Rider when present
  - [ ] Towers focus flying units first
  - [ ] Towers don't waste shots on low threats

- [ ] **Elixir Phases:**
  - [ ] Early game (first 60s): slow, deliberate
  - [ ] Mid game (60-120s): regen doubled, more plays possible
  - [ ] Late game (120-180s): frantic, both players have resources

- [ ] **AI Difficulty:**
  - [ ] Easy: Predictable, loses easily
  - [ ] Medium: Counters basic plays, defends well
  - [ ] Hard: Builds synergies (Hog + Freeze), aggressive

- [ ] **Crown System:**
  - [ ] Destroyed towers show crowns
  - [ ] Alive towers show normal UI
  - [ ] Win condition clear (all towers vs all towers)

---

## OPTIMIZATION NOTES

**Performance:** These changes are low-overhead
- Tower targeting adds one sort per tower (negligible)
- Phase-aware elixir is a single comparison per frame
- AI logic is already optimized; no perf impact

**Balancing for Future:**
- Keep all stats in CARDS object for easy tweaking
- Use spreadsheet to calculate DPS per elixir for balance checks
- Playtesting will reveal which cards need minor adjustments

---

## NEXT STEPS

1. **Implement** all changes above
2. **Test** each difficulty against other difficulties (Easy vs Hard, etc.)
3. **Tune** card stats if any card feels over/underpowered
4. **Add UI feedback** for phase transitions (optional but recommended)
5. **Polish** with animations and sound (future work)

**Estimated Implementation Time:** 30–45 minutes  
**Estimated Testing Time:** 20–30 minutes  
**Estimated Tuning Time:** 15–20 minutes
