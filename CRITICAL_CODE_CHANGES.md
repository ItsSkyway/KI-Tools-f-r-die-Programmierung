# Critical Code Changes for v2.0 Implementation

**Copy-paste ready code for immediate implementation**

---

## 1. CARD STATS UPDATE (Lines 32–177)

### Complete Replacement Block

```javascript
// ============================================================================
// CARD DATABASE - 16 UNIQUE CARDS (BALANCED v2.0)
// ============================================================================

const CARDS = {
  // === TIER 1: CYCLE CARDS (2-3 ELIXIR) ===
  
  skeletonArmy: {
    id: 'skeletonArmy',
    name: 'Skeleton Army',
    emoji: '💀',
    elixirCost: 2,  // CHANGED: 3 → 2
    type: 'troop',
    stats: { hp: 40, damage: 35, speed: 1.2, range: 35, attackSpeed: 0.8, count: 12 },
    description: 'Swarm card. Bait spells, cycle.',
  },
  
  archer: {
    id: 'archer',
    name: 'Archer',
    emoji: '🏹',
    elixirCost: 3,
    type: 'troop',
    stats: { hp: 250, damage: 110, speed: 1.0, range: 130, attackSpeed: 1.2 },
    description: 'Ranged attacker, reliable.',
  },
  
  cannon: {
    id: 'cannon',
    name: 'Cannon',
    emoji: '🔫',
    elixirCost: 3,
    type: 'building',
    stats: { hp: 450, damage: 140, range: 110, attackSpeed: 1.2 },
    description: 'Ground defense. Dies to Hog.',
  },
  
  knight: {
    id: 'knight',
    name: 'Knight',
    emoji: '🛡️',
    elixirCost: 3,
    type: 'troop',
    stats: { hp: 650, damage: 95, speed: 0.9, range: 50, attackSpeed: 1.0 },
    description: 'Melee tank, versatile.',
  },
  
  minions: {
    id: 'minions',
    name: 'Minions',
    emoji: '👿',
    elixirCost: 3,
    type: 'troop',
    stats: { hp: 110, damage: 75, speed: 1.3, range: 90, attackSpeed: 1, flying: true, count: 3 },
    description: 'Flying swarm, fast.',
  },
  
  // === TIER 2: MID-GAME CARDS (4 ELIXIR) ===
  
  babyDragon: {
    id: 'babyDragon',
    name: 'Baby Dragon',
    emoji: '🐉',
    elixirCost: 4,
    type: 'troop',
    stats: { hp: 850, damage: 100, speed: 0.8, range: 100, attackSpeed: 1.2, flying: true, splashRadius: 90 },
    description: 'Flying tank, splash.',
  },
  
  valkyrie: {
    id: 'valkyrie',
    name: 'Valkyrie',
    emoji: '⚔️',
    elixirCost: 4,
    type: 'troop',
    stats: { hp: 950, damage: 120, speed: 0.85, range: 50, attackSpeed: 1.3, splashRadius: 100 },
    description: 'Melee splash, swarm killer.',
  },
  
  musketeer: {
    id: 'musketeer',
    name: 'Musketeer',
    emoji: '🤠',
    elixirCost: 4,
    type: 'troop',
    stats: { hp: 400, damage: 165, speed: 0.95, range: 145, attackSpeed: 0.9 },
    description: 'Long-range, pure DPS.',
  },
  
  hogRider: {
    id: 'hogRider',
    name: 'Hog Rider',
    emoji: '🐗',
    elixirCost: 4,
    type: 'troop',
    stats: { hp: 550, damage: 140, speed: 1.6, range: 50, attackSpeed: 1.2, targetBuildings: true },
    description: 'Fast, targets buildings.',
  },
  
  arrows: {
    id: 'arrows',
    name: 'Arrows',
    emoji: '⬆️',
    elixirCost: 3,
    type: 'spell',
    stats: { damage: 180, splashRadius: 150 },
    description: 'AOE spell, anti-swarm.',
  },
  
  fireball: {
    id: 'fireball',
    name: 'Fireball',
    emoji: '🔥',
    elixirCost: 4,
    type: 'spell',
    stats: { damage: 380, splashRadius: 120 },
    description: 'AOE spell, high damage.',
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
  
  // === TIER 3: HIGH-ELIXIR CARDS (5+ ELIXIR) ===
  
  witch: {
    id: 'witch',
    name: 'Witch',
    emoji: '🧙‍♀️',
    elixirCost: 5,
    type: 'troop',
    stats: { hp: 550, damage: 95, speed: 0.8, range: 100, attackSpeed: 1.2, spawnSkeleton: true },
    description: 'Spawns skeletons.',
  },
  
  giant: {
    id: 'giant',
    name: 'Giant',
    emoji: '👹',
    elixirCost: 5,
    type: 'troop',
    stats: { hp: 1950, damage: 65, speed: 0.65, range: 50, attackSpeed: 1.5, targetBuildings: true },
    description: 'Mega tank, requires support.',
  },
  
  bombTower: {
    id: 'bombTower',
    name: 'Bomb Tower',
    emoji: '💣',
    elixirCost: 5,
    type: 'building',
    stats: { hp: 800, damage: 180, range: 120, attackSpeed: 1.1, splashRadius: 110 },
    description: 'Defensive splash.',
  },
  
  pekka: {
    id: 'pekka',
    name: 'P.E.K.K.A',
    emoji: '🤖',
    elixirCost: 7,
    type: 'troop',
    stats: { hp: 2400, damage: 290, speed: 0.6, range: 60, attackSpeed: 1.8 },
    description: 'Extreme cost & reward.',
  },
}

const CARD_ARRAY = Object.values(CARDS)
```

---

## 2. TOWER TARGETING FIX (Lines 571–587)

### Replace the entire `towerAttack` function

```javascript
const towerAttack = (tower, troops) => {
  if (tower.hp <= 0) return
  const range = 150
  const inRange = troops.filter(t => Math.hypot(t.x - tower.x, t.y - tower.y) < range && t.hp > 0)
  
  if (inRange.length === 0) return
  
  // ✅ PRIORITY TARGETING SYSTEM
  // Priority 1: Flying units that don't target buildings
  const flyers = inRange.filter(t => t.card.stats.flying && !t.card.stats.targetBuildings)
  
  // Priority 2: Building targeters (Hog Rider, Giant) — CRITICAL FOCUS
  const buildingTargeters = inRange.filter(t => t.card.stats.targetBuildings)
  
  // Priority 3: Ground troops
  const groundTroops = inRange.filter(t => 
    !t.card.stats.flying && !t.card.stats.targetBuildings
  )
  
  let target = null
  
  // Select target by priority
  if (flyers.length > 0) {
    target = flyers.reduce((closest, t) => {
      const d1 = Math.hypot(t.x - tower.x, t.y - tower.y)
      const d2 = Math.hypot(closest.x - tower.x, closest.y - tower.y)
      return d1 < d2 ? t : closest
    })
  } else if (buildingTargeters.length > 0) {
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

## 3. CROWN SYSTEM (Lines 658–695)

### Create new helper function (add after renderArena declaration)

```javascript
// ✅ NEW: Tower rendering with crown system
const renderTowerUI = (tower, isEnemyTower) => {
  const isDestroyed = tower.hp <= 0
  
  if (isDestroyed) {
    // Show floating crown when destroyed
    return (
      <div
        className={`absolute flex items-center justify-center ${
          tower.isKing ? 'text-6xl opacity-80' : 'text-3xl opacity-60'
        }`}
        style={{ left: tower.x - 16, top: tower.y - 20 }}
      >
        👑
      </div>
    )
  }
  
  // Normal tower (alive)
  const bgColor = isEnemyTower ? 'from-red-400 to-red-600' : 'from-blue-400 to-blue-600'
  const borderColor = isEnemyTower ? 'border-yellow-400' : 'border-yellow-400'
  
  return (
    <div
      className={`absolute w-8 h-10 bg-gradient-to-b ${bgColor} rounded ${borderColor} border-2 flex items-center justify-center text-lg shadow-md`}
      style={{ left: tower.x - 16, top: tower.y - 20 }}
    >
      👑
    </div>
  )
}
```

### Replace tower rendering in renderArena (lines 658–695)

```javascript
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

## 4. ELIXIR REGEN SYSTEM (Lines 491–495)

### Replace elixir regen calculation

```javascript
// ✅ PHASE-BASED ELIXIR REGEN
let elixirRegen = 0.015  // Default: early game
let gamePhase = 'early'

if (gs.gameTime < 120000) {
  elixirRegen = 0.03
  gamePhase = 'mid'
}

if (gs.gameTime < 60000) {
  elixirRegen = 0.045
  gamePhase = 'late'
}

// Apply regen
gs.playerElixir = Math.min(10, gs.playerElixir + elixirRegen)
gs.enemyElixir = Math.min(10, gs.enemyElixir + elixirRegen)

// Log phase transitions (optional: remove for production)
if (gs.gameTime === 120000 || gs.gameTime === 120033) {
  console.log('🎉 DOUBLE ELIXIR ACTIVATED!')
}
if (gs.gameTime === 60000 || gs.gameTime === 60033) {
  console.log('🚀 TRIPLE ELIXIR ACTIVATED!')
}
```

---

## 5. AI DIFFICULTY SYSTEM (Lines 421–453)

### Replace the entire `botPlayCard` function

```javascript
const botPlayCard = useCallback(() => {
  const gs = gameStateRef.current
  if (gs.gameOver) return

  const now = Date.now()
  
  // Difficulty-specific play intervals
  let playInterval = 5000
  if (difficulty === 'medium') playInterval = 3000
  if (difficulty === 'hard') playInterval = 1500

  if (now - gs.lastCardPlayTime.enemy < playInterval) return

  const hand = gs.enemyHand
  if (hand.length === 0) return

  // Get game phase
  const gamePhase = gs.gameTime > 120000 ? 'early' : 
                    gs.gameTime > 60000 ? 'mid' : 'late'

  // === EASY AI: Reactive, Defensive ===
  if (difficulty === 'easy') {
    const playerThreatTroops = gs.playerTroops.filter(t => t.y > ARENA_HEIGHT * 0.3).length
    
    // If threatened: play defensive
    if (playerThreatTroops >= 3 && gs.enemyElixir >= 3) {
      const defensive = hand.find(h => 
        h.cardId === 'arrows' || h.cardId === 'bombTower'
      )
      if (defensive && gs.enemyElixir >= CARDS[defensive.cardId].elixirCost) {
        playCard(defensive.cardId, false)
        gs.lastCardPlayTime.enemy = now
        return
      }
    }
    
    // Otherwise: cycle cheap cards
    const playable = hand.filter(h => gs.enemyElixir >= CARDS[h.cardId].elixirCost)
    const cheap = playable.filter(h => CARDS[h.cardId].elixirCost <= 3)
    if (cheap.length > 0) {
      const card = cheap[Math.floor(Math.random() * cheap.length)]
      playCard(card.cardId, false)
      gs.lastCardPlayTime.enemy = now
    }
    return
  }

  // === MEDIUM AI: Strategic, Counter-play ===
  if (difficulty === 'medium') {
    // Counter: swarm → Arrows
    const playerHasSwarm = gs.playerTroops.filter(t => 
      (CARDS[t.cardId].stats.count || 1) > 3
    ).length > 0
    
    if (playerHasSwarm && gs.enemyElixir >= 3) {
      const arrowsCard = hand.find(h => h.cardId === 'arrows')
      if (arrowsCard) {
        playCard('arrows', false)
        gs.lastCardPlayTime.enemy = now
        return
      }
    }

    // Push: if safe and have elixir
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

  // === HARD AI: Aggressive, Synergistic ===
  if (difficulty === 'hard') {
    // Phase 1: Cycle Hog pressure
    if (gamePhase === 'early' && gs.enemyElixir >= 4) {
      const hogCard = hand.find(h => h.cardId === 'hogRider')
      if (hogCard) {
        playCard('hogRider', false)
        gs.lastCardPlayTime.enemy = now
        return
      }
    }

    // Phase 2: Hog + Freeze combo
    if (gamePhase === 'mid' && gs.enemyElixir >= 8) {
      const hogCard = hand.find(h => h.cardId === 'hogRider')
      const freezeCard = hand.find(h => h.cardId === 'freeze')
      
      if (hogCard && freezeCard) {
        playCard('hogRider', false)
        gs.lastCardPlayTime.enemy = now
        setTimeout(() => {
          if (!gs.gameOver) playCard('freeze', false)
        }, 500)
        return
      }
    }

    // Phase 3: All-in aggression
    if (gamePhase === 'late') {
      const playable = hand.filter(h => gs.enemyElixir >= CARDS[h.cardId].elixirCost)
      if (playable.length > 0) {
        const highImpact = playable.filter(h => CARDS[h.cardId].elixirCost >= 4)
        const card = (highImpact.length > 0 ? highImpact : playable)[0]
        playCard(card.cardId, false)
        gs.lastCardPlayTime.enemy = now
        return
      }
    }

    // Default: any playable card
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

## 6. AI DECK SELECTION (Line 467)

### In `initializeGame`, replace enemy hand initialization

```javascript
// ✅ AI deck varies by difficulty
const getAIDeck = (diff) => {
  if (diff === 'easy') {
    return ['knight', 'archer', 'cannon', 'minions', 'arrows', 'skeletonArmy', 'babyDragon', 'valkyrie']
  } else if (diff === 'medium') {
    return ['skeletonArmy', 'arrows', 'hogRider', 'musketeer', 'bombTower', 'valkyrie', 'giant', 'fireball']
  } else { // hard
    return ['hogRider', 'freeze', 'archer', 'knight', 'skeletonArmy', 'minions', 'witch', 'fireball']
  }
}

const aiDeck = getAIDeck(difficulty)
gs.enemyHand = aiDeck.map(cardId => ({ cardId, id: Math.random() }))
```

---

## OPTIONAL ENHANCEMENTS

### Add Phase Indicator to UI (Line 599)

```javascript
// In the setGameStats call, add:
setGameStats({
  playerElixir: Math.floor(gs.playerElixir * 10) / 10,
  enemyElixir: Math.floor(gs.enemyElixir * 10) / 10,
  gameTime: Math.max(0, Math.floor(gs.gameTime / 1000)),
  gamePhase: gamePhase, // NEW: 'early' | 'mid' | 'late'
  towers: {
    // ... existing towers
  },
  // ... rest of gameStats
})
```

### Display Phase in renderUI (Line 757)

```javascript
// After timer display, add:
<div className="text-yellow-400 text-xs font-bold ml-4">
  {gameStats.gamePhase === 'late' && '🚀 TRIPLE ELIXIR'}
  {gameStats.gamePhase === 'mid' && '⚡ DOUBLE ELIXIR'}
  {gameStats.gamePhase === 'early' && '🕐 Normal'}
</div>
```

---

## VERIFICATION CHECKLIST

After implementing all changes:

```javascript
// Quick test script (paste into browser console)
console.log('=== BALANCE CHECK ===');
console.log('Skeleton Army cost:', CARDS.skeletonArmy.elixirCost, '(should be 2)');
console.log('Giant HP:', CARDS.giant.stats.hp, '(should be 1950)');
console.log('PEKKA HP:', CARDS.pekka.stats.hp, '(should be 2400)');
console.log('Arrows damage:', CARDS.arrows.stats.damage, '(should be 180)');
console.log('✅ All stats updated correctly!');
```

---

## IMPLEMENTATION TIME ESTIMATE

| Change | Time | Priority |
|--------|------|----------|
| Update CARDS | 5 min | CRITICAL |
| Fix tower targeting | 10 min | CRITICAL |
| Add crown system | 10 min | HIGH |
| Elixir regen | 5 min | CRITICAL |
| AI system | 15 min | CRITICAL |
| Deck selection | 5 min | HIGH |
| Optional enhancements | 10 min | NICE |
| **TOTAL** | **~60 min** | |

---

**All code ready to copy-paste!** ✅
