/**
 * Clash Royale Browser Game
 * 
 * Architecture:
 * - Single-file React component with all game logic
 * - Game state managed via React hooks (useState, useRef, useCallback, useEffect)
 * - Main game loop runs at ~30fps using requestAnimationFrame
 * - Two lane arena with 3 towers per side (2 princess + 1 king)
 * - 16 unique cards with stats, abilities, AI behavior
 * - Bot opponent with 3 difficulty levels
 * - Deck builder to select 8 cards before battle
 * - Elixir system: 0-10, regenerates at 1/sec (2/sec double elixir)
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'

// ============================================================================
// CARD DATABASE - 16 UNIQUE CARDS
// ============================================================================

const CARDS = {
  knight: {
    id: 'knight',
    name: 'Knight',
    emoji: '🛡️',
    elixirCost: 3,
    type: 'troop',
    stats: { hp: 600, damage: 100, speed: 1, range: 50, attackSpeed: 1 },
    description: 'Melee tank with solid HP',
  },
  archer: {
    id: 'archer',
    name: 'Archer',
    emoji: '🏹',
    elixirCost: 3,
    type: 'troop',
    stats: { hp: 200, damage: 120, speed: 1.2, range: 120, attackSpeed: 1.2 },
    description: 'Ranged attacker, low HP',
  },
  giant: {
    id: 'giant',
    name: 'Giant',
    emoji: '👹',
    elixirCost: 5,
    type: 'troop',
    stats: { hp: 1800, damage: 60, speed: 0.7, range: 50, attackSpeed: 1.5, targetBuildings: true },
    description: 'Slow, tanky, targets buildings',
  },
  fireball: {
    id: 'fireball',
    name: 'Fireball',
    emoji: '🔥',
    elixirCost: 4,
    type: 'spell',
    stats: { damage: 400, splashRadius: 120 },
    description: 'AOE spell, damages area',
  },
  arrows: {
    id: 'arrows',
    name: 'Arrows',
    emoji: '⬆️',
    elixirCost: 3,
    type: 'spell',
    stats: { damage: 200, splashRadius: 150 },
    description: 'Cheap AOE spell',
  },
  minions: {
    id: 'minions',
    name: 'Minions',
    emoji: '👿',
    elixirCost: 3,
    type: 'troop',
    stats: { hp: 100, damage: 80, speed: 1.4, range: 100, attackSpeed: 1, flying: true, count: 3 },
    description: 'Flying units, fast',
  },
  skeletonArmy: {
    id: 'skeletonArmy',
    name: 'Skeleton Army',
    emoji: '💀',
    elixirCost: 3,
    type: 'troop',
    stats: { hp: 60, damage: 40, speed: 1.3, range: 40, attackSpeed: 0.8, count: 10 },
    description: 'Spawns 10 weak skeletons',
  },
  babyDragon: {
    id: 'babyDragon',
    name: 'Baby Dragon',
    emoji: '🐉',
    elixirCost: 4,
    type: 'troop',
    stats: { hp: 800, damage: 120, speed: 0.9, range: 100, attackSpeed: 1.2, flying: true, splashRadius: 80 },
    description: 'Flying, splash damage',
  },
  valkyrie: {
    id: 'valkyrie',
    name: 'Valkyrie',
    emoji: '⚔️',
    elixirCost: 4,
    type: 'troop',
    stats: { hp: 900, damage: 130, speed: 0.9, range: 50, attackSpeed: 1.3, splashRadius: 100 },
    description: 'Melee, circular splash',
  },
  musketeer: {
    id: 'musketeer',
    name: 'Musketeer',
    emoji: '🤠',
    elixirCost: 4,
    type: 'troop',
    stats: { hp: 400, damage: 160, speed: 0.95, range: 140, attackSpeed: 1 },
    description: 'Long-range single target',
  },
  hogRider: {
    id: 'hogRider',
    name: 'Hog Rider',
    emoji: '🐗',
    elixirCost: 4,
    type: 'troop',
    stats: { hp: 500, damage: 150, speed: 1.5, range: 50, attackSpeed: 1.2, targetBuildings: true },
    description: 'Fast, targets buildings',
  },
  witch: {
    id: 'witch',
    name: 'Witch',
    emoji: '🧙‍♀️',
    elixirCost: 5,
    type: 'troop',
    stats: { hp: 500, damage: 100, speed: 0.85, range: 100, attackSpeed: 1.2, spawnSkeleton: true },
    description: 'Spawns skeletons, ranged',
  },
  pekka: {
    id: 'pekka',
    name: 'P.E.K.K.A',
    emoji: '🤖',
    elixirCost: 7,
    type: 'troop',
    stats: { hp: 2000, damage: 300, speed: 0.6, range: 60, attackSpeed: 1.8 },
    description: 'Extreme damage & HP',
  },
  bombTower: {
    id: 'bombTower',
    name: 'Bomb Tower',
    emoji: '💣',
    elixirCost: 5,
    type: 'building',
    stats: { hp: 700, damage: 200, range: 130, attackSpeed: 1.2, splashRadius: 100 },
    description: 'Defensive building, splash',
  },
  cannon: {
    id: 'cannon',
    name: 'Cannon',
    emoji: '🔫',
    elixirCost: 3,
    type: 'building',
    stats: { hp: 400, damage: 150, range: 100, attackSpeed: 1 },
    description: 'Defensive building',
  },
  freeze: {
    id: 'freeze',
    name: 'Freeze Spell',
    emoji: '❄️',
    elixirCost: 4,
    type: 'spell',
    stats: { splashRadius: 120, freezeDuration: 2000 },
    description: 'Freezes enemies for 2s',
  },
}

const CARD_ARRAY = Object.values(CARDS)

// ============================================================================
// ARENA & TOWER CONFIGURATION
// ============================================================================

const ARENA_WIDTH = 600
const ARENA_HEIGHT = 800
const LANE_WIDTH = ARENA_WIDTH / 2

const getTowerPositions = () => ({
  player: {
    kingTower: { x: ARENA_WIDTH / 2, y: ARENA_HEIGHT - 60, isKing: true },
    princessLeft: { x: LANE_WIDTH / 2 - 80, y: ARENA_HEIGHT - 120 },
    princessRight: { x: LANE_WIDTH / 2 + 80, y: ARENA_HEIGHT - 120 },
  },
  enemy: {
    kingTower: { x: ARENA_WIDTH / 2, y: 60, isKing: true },
    princessLeft: { x: LANE_WIDTH / 2 - 80, y: 120 },
    princessRight: { x: LANE_WIDTH / 2 + 80, y: 120 },
  },
})

const INITIAL_TOWER_HP = {
  king: 3500,
  princess: 1800,
}

// ============================================================================
// UNIT SIMULATION & TARGETING
// ============================================================================

const findNearestEnemy = (unit, enemies, towers) => {
  let nearest = null
  let minDist = Infinity

  const range = unit.stats.range || 100

  // Check buildings first if unit targets buildings
  if (unit.stats.targetBuildings && enemies.buildings) {
    enemies.buildings.forEach(building => {
      const dist = Math.hypot(building.x - unit.x, building.y - unit.y)
      if (dist < range && dist < minDist) {
        nearest = building
        minDist = dist
      }
    })
  }

  // Check towers if unit targets buildings
  if (unit.stats.targetBuildings && towers) {
    towers.forEach(tower => {
      if (tower.hp > 0) {
        const dist = Math.hypot(tower.x - unit.x, tower.y - unit.y)
        if (dist < range && dist < minDist) {
          nearest = tower
          minDist = dist
        }
      }
    })
  }

  // Check troops
  if (enemies.troops) {
    enemies.troops.forEach(troop => {
      if (troop.hp > 0) {
        const dist = Math.hypot(troop.x - unit.x, troop.y - unit.y)
        if (dist < range && dist < minDist) {
          nearest = troop
          minDist = dist
        }
      }
    })
  }

  return nearest
}

const moveUnit = (unit, targetX, targetY, speed = 1) => {
  const dist = Math.hypot(targetX - unit.x, targetY - unit.y)
  if (dist < speed) {
    unit.x = targetX
    unit.y = targetY
    return true
  }
  const ratio = speed / dist
  unit.x += (targetX - unit.x) * ratio
  unit.y += (targetY - unit.y) * ratio
  return false
}

// ============================================================================
// MAIN GAME COMPONENT
// ============================================================================

export default function ClashRoyaleGame() {
  // Screen state
  const [screen, setScreen] = useState('menu') // menu, deckBuilder, battle, result
  const [difficulty, setDifficulty] = useState('medium')
  const [selectedDeck, setSelectedDeck] = useState([])

  // Game state refs (mutable, no re-render triggers)
  const gameStateRef = useRef({
    playerElixir: 10,
    enemyElixir: 10,
    gameTime: 180000, // 3 minutes in ms
    gameOver: false,
    winner: null,
    playerTroops: [],
    playerBuildings: [],
    enemyTroops: [],
    enemyBuildings: [],
    playerHand: [],
    enemyHand: [],
    lastCardPlayTime: { player: 0, enemy: 0 },
    freezeZones: [],
  })

  const towerStateRef = useRef({
    player: {
      kingTower: { x: ARENA_WIDTH / 2, y: ARENA_HEIGHT - 60, hp: INITIAL_TOWER_HP.king, isKing: true, destroyed: false },
      princessLeft: { x: LANE_WIDTH / 2 - 80, y: ARENA_HEIGHT - 120, hp: INITIAL_TOWER_HP.princess, destroyed: false },
      princessRight: { x: LANE_WIDTH / 2 + 80, y: ARENA_HEIGHT - 120, hp: INITIAL_TOWER_HP.princess, destroyed: false },
    },
    enemy: {
      kingTower: { x: ARENA_WIDTH / 2, y: 60, hp: INITIAL_TOWER_HP.king, isKing: true, destroyed: false },
      princessLeft: { x: LANE_WIDTH / 2 - 80, y: 120, hp: INITIAL_TOWER_HP.princess, destroyed: false },
      princessRight: { x: LANE_WIDTH / 2 + 80, y: 120, hp: INITIAL_TOWER_HP.princess, destroyed: false },
    },
  })

  // UI state (triggers re-render)
  const [uiState, setUiState] = useState(0)
  const [gameStats, setGameStats] = useState({
    playerHPBars: [],
    playerBuildingBars: [],
    enemyHPBars: [],
    enemyBuildingBars: [],
    playerElixir: 10,
    enemyElixir: 10,
    gameTime: 180,
    towers: {},
  })

  // Deal damage with splash
  const dealDamage = useCallback(
    (targets, damage, splashRadius = 0, isSpell = false) => {
      if (Array.isArray(targets)) {
        targets.forEach(target => {
          if (target && target.hp !== undefined) {
            target.hp -= damage
          }
        })
      }
    },
    []
  )

  // Game initialization
  const initializeGame = useCallback(() => {
    const gs = gameStateRef.current
    gs.playerElixir = 10
    gs.enemyElixir = 10
    gs.gameTime = 180000
    gs.gameOver = false
    gs.winner = null
    gs.playerTroops = []
    gs.playerBuildings = []
    gs.enemyTroops = []
    gs.enemyBuildings = []
    gs.playerHand = selectedDeck.map(cardId => ({ cardId, id: Math.random() }))
    gs.enemyHand = CARD_ARRAY.slice(0, 8).map(card => ({ cardId: card.id, id: Math.random() }))
    gs.lastCardPlayTime = { player: 0, enemy: 0 }
    gs.freezeZones = []

    const towers = getTowerPositions()
    Object.entries(towers.player).forEach(([key, pos]) => {
      towerStateRef.current.player[key === 'kingTower' ? 'kingTower' : key].x = pos.x
      towerStateRef.current.player[key === 'kingTower' ? 'kingTower' : key].y = pos.y
    })
    Object.entries(towers.enemy).forEach(([key, pos]) => {
      towerStateRef.current.enemy[key === 'kingTower' ? 'kingTower' : key].x = pos.x
      towerStateRef.current.enemy[key === 'kingTower' ? 'kingTower' : key].y = pos.y
    })
  }, [selectedDeck])

  // Play card handler
  const playCard = useCallback(
    (cardId, isPlayer = true) => {
      const gs = gameStateRef.current
      const card = CARDS[cardId]
      if (!card) return

      const elixir = isPlayer ? gs.playerElixir : gs.enemyElixir
      if (elixir < card.elixirCost) return

      if (isPlayer) {
        gs.playerElixir -= card.elixirCost
      } else {
        gs.enemyElixir -= card.elixirCost
      }

      // Remove from hand
      const hand = isPlayer ? gs.playerHand : gs.enemyHand
      const handIdx = hand.findIndex(h => h.cardId === cardId)
      if (handIdx >= 0) hand.splice(handIdx, 1)

      // Spell: cast instantly
      if (card.type === 'spell') {
        const side = isPlayer ? 'enemy' : 'player'
        const targetTroops =
          side === 'enemy' ? gs.enemyTroops : gs.playerTroops
        const targetBuildings =
          side === 'enemy' ? gs.enemyBuildings : gs.playerBuildings

        if (cardId === 'fireball') {
          const centerX = isPlayer ? ARENA_WIDTH * 0.75 : ARENA_WIDTH * 0.25
          const centerY = isPlayer ? ARENA_HEIGHT * 0.3 : ARENA_HEIGHT * 0.7
          targetTroops.forEach(troop => {
            const dist = Math.hypot(troop.x - centerX, troop.y - centerY)
            if (dist < 120) {
              troop.hp -= 400
            }
          })
          targetBuildings.forEach(building => {
            const dist = Math.hypot(building.x - centerX, building.y - centerY)
            if (dist < 120) {
              building.hp -= 400
            }
          })
        } else if (cardId === 'arrows') {
          const centerX = isPlayer ? ARENA_WIDTH * 0.75 : ARENA_WIDTH * 0.25
          const centerY = isPlayer ? ARENA_HEIGHT * 0.3 : ARENA_HEIGHT * 0.7
          targetTroops.forEach(troop => {
            const dist = Math.hypot(troop.x - centerX, troop.y - centerY)
            if (dist < 150) {
              troop.hp -= 200
            }
          })
        } else if (cardId === 'freeze') {
          const centerX = isPlayer ? ARENA_WIDTH * 0.75 : ARENA_WIDTH * 0.25
          const centerY = isPlayer ? ARENA_HEIGHT * 0.3 : ARENA_HEIGHT * 0.7
          gs.freezeZones.push({ x: centerX, y: centerY, radius: 120, duration: 2000, side: side })
          targetTroops.forEach(troop => {
            const dist = Math.hypot(troop.x - centerX, troop.y - centerY)
            if (dist < 120) {
              troop.frozen = 2000
            }
          })
        }
      } else {
        // Troop or building
        const troops = isPlayer ? gs.playerTroops : gs.enemyTroops
        const buildings = isPlayer ? gs.playerBuildings : gs.enemyBuildings
        const spawnX = isPlayer ? LANE_WIDTH / 2 : LANE_WIDTH + LANE_WIDTH / 2
        const spawnY = isPlayer ? ARENA_HEIGHT - 200 : 200

        if (card.type === 'building') {
          buildings.push({
            id: Math.random(),
            cardId: cardId,
            card: card,
            x: spawnX,
            y: spawnY,
            hp: card.stats.hp || 500,
            lastAttackTime: 0,
            isPlayer: isPlayer,
          })
        } else {
          const count = card.stats.count || 1
          for (let i = 0; i < count; i++) {
            const offsetX = (Math.random() - 0.5) * 80
            const offsetY = (Math.random() - 0.5) * 40
            troops.push({
              id: Math.random(),
              cardId: cardId,
              card: card,
              x: spawnX + offsetX,
              y: spawnY + offsetY,
              hp: card.stats.hp || 100,
              targetId: null,
              lastAttackTime: 0,
              isPlayer: isPlayer,
            })
          }
        }
      }
    },
    []
  )

  // Bot AI
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

    let selectedCard = playableCards[0]

    if (difficulty === 'hard') {
      // Strategy: play high-impact cards when elixir is high
      const highValue = playableCards.filter(h => CARDS[h.cardId].elixirCost >= 4)
      if (highValue.length > 0 && gs.enemyElixir >= 8) {
        selectedCard = highValue[Math.floor(Math.random() * highValue.length)]
      }
    }

    playCard(selectedCard.cardId, false)
    gs.lastCardPlayTime.enemy = now
  }, [difficulty, playCard])

  // Main game loop
  useEffect(() => {
    if (screen !== 'battle') return

    const gameLoopInterval = setInterval(() => {
      const gs = gameStateRef.current
      const towers = towerStateRef.current

      if (gs.gameOver) return

      // Update game time
      gs.gameTime -= 33 // ~30fps
      if (gs.gameTime <= 0) {
        gs.gameTime = 0
        gs.gameOver = true
        const playerTowerHp = Object.values(towers.player).reduce((sum, t) => sum + t.hp, 0)
        const enemyTowerHp = Object.values(towers.enemy).reduce((sum, t) => sum + t.hp, 0)
        gs.winner = enemyTowerHp < playerTowerHp ? 'player' : enemyTowerHp > playerTowerHp ? 'enemy' : 'tie'
      }

      // Double elixir at 60s remaining
      const doubleElixir = gs.gameTime < 60000
      const elixirRegen = doubleElixir ? 0.03 : 0.015

      // Regenerate elixir
      gs.playerElixir = Math.min(10, gs.playerElixir + elixirRegen)
      gs.enemyElixir = Math.min(10, gs.enemyElixir + elixirRegen)

      // Remove dead units
      gs.playerTroops = gs.playerTroops.filter(u => u.hp > 0)
      gs.enemyTroops = gs.enemyTroops.filter(u => u.hp > 0)
      gs.playerBuildings = gs.playerBuildings.filter(u => u.hp > 0)
      gs.enemyBuildings = gs.enemyBuildings.filter(u => u.hp > 0)

      // Unfreeze units
      gs.playerTroops.forEach(u => {
        if (u.frozen) u.frozen -= 33
      })
      gs.enemyTroops.forEach(u => {
        if (u.frozen) u.frozen -= 33
      })

      // Unit movement & combat
      ;[
        { units: gs.playerTroops, enemies: { troops: gs.enemyTroops, buildings: gs.enemyBuildings }, enemyTowers: towers.enemy },
        { units: gs.enemyTroops, enemies: { troops: gs.playerTroops, buildings: gs.playerBuildings }, enemyTowers: towers.player },
      ].forEach(({ units, enemies, enemyTowers }) => {
        units.forEach(unit => {
          if (unit.frozen && unit.frozen > 0) return

          const target = findNearestEnemy(unit, enemies, Object.values(enemyTowers))
          if (target) {
            const dist = Math.hypot(target.x - unit.x, target.y - unit.y)
            const range = unit.card.stats.range || 100

            if (dist < range) {
              const now = Date.now()
              const attackSpeed = unit.card.stats.attackSpeed || 1
              if (now - unit.lastAttackTime > 1000 / attackSpeed) {
                const damage = unit.card.stats.damage || 50
                target.hp -= damage
                unit.lastAttackTime = now
              }
            } else {
              const speed = unit.card.stats.speed || 1
              moveUnit(unit, target.x, target.y, speed)
            }
          } else {
            // Move toward enemy side
            const targetY = unit.isPlayer ? 0 : ARENA_HEIGHT
            const speed = unit.card.stats.speed || 1
            moveUnit(unit, unit.x, targetY, speed * 0.5)
          }
        })
      })

      // Building attacks
      ;[
        { buildings: gs.playerBuildings, enemies: { troops: gs.enemyTroops }, towers: towers.enemy },
        { buildings: gs.enemyBuildings, enemies: { troops: gs.playerTroops }, towers: towers.player },
      ].forEach(({ buildings, enemies, towers: enemyTowers }) => {
        buildings.forEach(building => {
          const targets = enemies.troops.filter(t => t.hp > 0)
          const range = building.card.stats.range || 100

          const nearest = targets.length > 0
            ? targets.reduce((closest, t) => {
                const d = Math.hypot(t.x - building.x, t.y - building.y)
                const dc = Math.hypot(closest.x - building.x, closest.y - building.y)
                return d < dc ? t : closest
              })
            : null

          if (nearest && Math.hypot(nearest.x - building.x, nearest.y - building.y) < range) {
            const now = Date.now()
            if (now - building.lastAttackTime > 1000 / (building.card.stats.attackSpeed || 1)) {
              const damage = building.card.stats.damage || 50
              nearest.hp -= damage
              if (building.card.stats.splashRadius) {
                targets.forEach(t => {
                  if (Math.hypot(t.x - nearest.x, t.y - nearest.y) < building.card.stats.splashRadius) {
                    t.hp -= damage * 0.6
                  }
                })
              }
              building.lastAttackTime = now
            }
          }
        })
      })

      // Tower attacks on nearby units
      const towerAttack = (tower, troops) => {
        if (tower.hp <= 0) return
        const range = 150
        const targets = troops.filter(t => Math.hypot(t.x - tower.x, t.y - tower.y) < range && t.hp > 0)
        if (targets.length > 0) {
          const target = targets[0]
          const now = Date.now()
          if (now - tower.lastAttackTime > 1000) {
            target.hp -= 150
            tower.lastAttackTime = now
          }
        }
      }

      Object.values(towers.player).forEach(tower => towerAttack(tower, gs.enemyTroops))
      Object.values(towers.enemy).forEach(tower => towerAttack(tower, gs.playerTroops))

      // Check king tower destruction
      if (towers.player.kingTower.hp <= 0) {
        gs.gameOver = true
        gs.winner = 'enemy'
      }
      if (towers.enemy.kingTower.hp <= 0) {
        gs.gameOver = true
        gs.winner = 'player'
      }

      // Bot AI
      botPlayCard()

      // Update UI
      setGameStats({
        playerElixir: Math.floor(gs.playerElixir * 10) / 10,
        enemyElixir: Math.floor(gs.enemyElixir * 10) / 10,
        gameTime: Math.max(0, Math.floor(gs.gameTime / 1000)),
        towers: {
          playerKing: towers.player.kingTower.hp,
          playerLeftPrincess: towers.player.princessLeft.hp,
          playerRightPrincess: towers.player.princessRight.hp,
          enemyKing: towers.enemy.kingTower.hp,
          enemyLeftPrincess: towers.enemy.princessLeft.hp,
          enemyRightPrincess: towers.enemy.princessRight.hp,
        },
        playerHPBars: gs.playerTroops.map(u => ({
          id: u.id,
          hp: u.hp,
          maxHp: u.card.stats.hp,
          x: u.x,
          y: u.y,
        })),
        playerBuildingBars: gs.playerBuildings.map(b => ({
          id: b.id,
          hp: b.hp,
          maxHp: b.card.stats.hp,
          x: b.x,
          y: b.y,
        })),
        enemyHPBars: gs.enemyTroops.map(u => ({
          id: u.id,
          hp: u.hp,
          maxHp: u.card.stats.hp,
          x: u.x,
          y: u.y,
        })),
        enemyBuildingBars: gs.enemyBuildings.map(b => ({
          id: b.id,
          hp: b.hp,
          maxHp: b.card.stats.hp,
          x: b.x,
          y: b.y,
        })),
      })

      setUiState(prev => prev + 1)
    }, 33)

    return () => clearInterval(gameLoopInterval)
  }, [screen, botPlayCard])

  // Render methods
  const renderArena = () => {
    const gs = gameStateRef.current
    const towers = towerStateRef.current

    return (
      <div
        className="relative bg-gradient-to-b from-red-900 to-red-950 border-4 border-yellow-600 shadow-2xl"
        style={{ width: ARENA_WIDTH, height: ARENA_HEIGHT }}
      >
        {/* Midfield separator */}
        <div className="absolute w-full h-px bg-yellow-600" style={{ top: ARENA_HEIGHT / 2 }} />

        {/* Enemy towers */}
        <div
          className="absolute w-8 h-10 bg-gradient-to-b from-red-400 to-red-600 rounded border-2 border-yellow-400 flex items-center justify-center text-lg"
          style={{ left: towers.enemy.kingTower.x - 16, top: towers.enemy.kingTower.y - 20 }}
        >
          👑
        </div>
        <div
          className="absolute w-6 h-8 bg-red-500 rounded border border-yellow-300 flex items-center justify-center text-sm"
          style={{ left: towers.enemy.princessLeft.x - 12, top: towers.enemy.princessLeft.y - 16 }}
        >
          🏰
        </div>
        <div
          className="absolute w-6 h-8 bg-red-500 rounded border border-yellow-300 flex items-center justify-center text-sm"
          style={{ left: towers.enemy.princessRight.x - 12, top: towers.enemy.princessRight.y - 16 }}
        >
          🏰
        </div>

        {/* Player towers */}
        <div
          className="absolute w-8 h-10 bg-gradient-to-b from-blue-400 to-blue-600 rounded border-2 border-yellow-400 flex items-center justify-center text-lg"
          style={{ left: towers.player.kingTower.x - 16, top: towers.player.kingTower.y - 20 }}
        >
          👑
        </div>
        <div
          className="absolute w-6 h-8 bg-blue-500 rounded border border-yellow-300 flex items-center justify-center text-sm"
          style={{ left: towers.player.princessLeft.x - 12, top: towers.player.princessLeft.y - 16 }}
        >
          🏰
        </div>
        <div
          className="absolute w-6 h-8 bg-blue-500 rounded border border-yellow-300 flex items-center justify-center text-sm"
          style={{ left: towers.player.princessRight.x - 12, top: towers.player.princessRight.y - 16 }}
        >
          🏰
        </div>

        {/* Enemy units */}
        {gs.enemyTroops.map(unit => (
          <div
            key={unit.id}
            className="absolute w-6 h-6 bg-red-500 rounded-full border border-yellow-300 flex items-center justify-center text-xs font-bold shadow-lg"
            style={{ left: unit.x - 12, top: unit.y - 12 }}
          >
            {unit.card.emoji}
          </div>
        ))}

        {/* Player units */}
        {gs.playerTroops.map(unit => (
          <div
            key={unit.id}
            className="absolute w-6 h-6 bg-blue-500 rounded-full border border-yellow-300 flex items-center justify-center text-xs font-bold shadow-lg"
            style={{ left: unit.x - 12, top: unit.y - 12 }}
          >
            {unit.card.emoji}
          </div>
        ))}

        {/* Enemy buildings */}
        {gs.enemyBuildings.map(building => (
          <div
            key={building.id}
            className="absolute w-8 h-8 bg-red-600 rounded border-2 border-yellow-500 flex items-center justify-center text-xs font-bold shadow-lg"
            style={{ left: building.x - 14, top: building.y - 14 }}
          >
            {building.card.emoji}
          </div>
        ))}

        {/* Player buildings */}
        {gs.playerBuildings.map(building => (
          <div
            key={building.id}
            className="absolute w-8 h-8 bg-blue-600 rounded border-2 border-yellow-500 flex items-center justify-center text-xs font-bold shadow-lg"
            style={{ left: building.x - 14, top: building.y - 14 }}
          >
            {building.card.emoji}
          </div>
        ))}

        {/* HP bars */}
        {gameStats.playerHPBars.map(bar => (
          <div key={`hp-${bar.id}`} className="absolute w-10 h-1 bg-red-900 rounded" style={{ left: bar.x - 20, top: bar.y - 20 }}>
            <div
              className="h-full bg-green-500 rounded transition-all"
              style={{ width: `${(bar.hp / bar.maxHp) * 100}%` }}
            />
          </div>
        ))}

        {gameStats.enemyHPBars.map(bar => (
          <div key={`hp-${bar.id}`} className="absolute w-10 h-1 bg-red-900 rounded" style={{ left: bar.x - 20, top: bar.y - 20 }}>
            <div
              className="h-full bg-green-500 rounded transition-all"
              style={{ width: `${(bar.hp / bar.maxHp) * 100}%` }}
            />
          </div>
        ))}
      </div>
    )
  }

  const renderUI = () => {
    const gs = gameStateRef.current
    const towers = towerStateRef.current

    return (
      <div className="w-full max-w-2xl">
        {/* Top bar */}
        <div className="flex justify-between items-center bg-gray-900 text-white p-3 rounded-t border-2 border-yellow-600">
          <div className="flex gap-4">
            <div className="flex gap-2 items-center">
              <span className="text-lg">❤️</span>
              <span className="text-sm font-bold">{Math.max(0, Math.floor(towers.enemy.kingTower.hp))}</span>
            </div>
            <div className="flex gap-2 items-center">
              <span className="text-lg">🏰</span>
              <span className="text-sm font-bold">{Math.max(0, Math.floor(towers.enemy.princessLeft.hp))}</span>
            </div>
            <div className="flex gap-2 items-center">
              <span className="text-lg">🏰</span>
              <span className="text-sm font-bold">{Math.max(0, Math.floor(towers.enemy.princessRight.hp))}</span>
            </div>
          </div>
          <div className="text-xl font-bold text-yellow-400">{gameStats.gameTime}s</div>
          <div className="flex gap-4">
            <div className="flex gap-2 items-center">
              <span className="text-lg">❤️</span>
              <span className="text-sm font-bold">{Math.max(0, Math.floor(towers.player.kingTower.hp))}</span>
            </div>
            <div className="flex gap-2 items-center">
              <span className="text-lg">🏰</span>
              <span className="text-sm font-bold">{Math.max(0, Math.floor(towers.player.princessLeft.hp))}</span>
            </div>
            <div className="flex gap-2 items-center">
              <span className="text-lg">🏰</span>
              <span className="text-sm font-bold">{Math.max(0, Math.floor(towers.player.princessRight.hp))}</span>
            </div>
          </div>
        </div>

        {/* Arena */}
        <div className="flex justify-center">{renderArena()}</div>

        {/* Elixir bar */}
        <div className="bg-gray-900 text-white p-3 flex items-center gap-2 border-x-2 border-yellow-600">
          <span className="text-sm font-bold w-12">Elixir</span>
          <div className="flex-1 bg-gray-800 rounded h-6 border-2 border-purple-500 relative overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-600 to-purple-400 transition-all"
              style={{ width: `${(gameStats.playerElixir / 10) * 100}%` }}
            />
            <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold">
              {Math.floor(gameStats.playerElixir)}/10
            </span>
          </div>
        </div>

        {/* Hand */}
        <div className="bg-gray-800 text-white p-3 border-2 border-yellow-600 rounded-b">
          <div className="grid grid-cols-4 gap-2">
            {gs.playerHand.map(handItem => {
              const card = CARDS[handItem.cardId]
              return (
                <button
                  key={handItem.id}
                  onClick={() => playCard(handItem.cardId, true)}
                  disabled={gameStats.playerElixir < card.elixirCost || gs.gameOver}
                  className={`p-2 rounded border-2 transition-all text-center ${
                    gameStats.playerElixir < card.elixirCost
                      ? 'bg-gray-700 border-gray-600 opacity-50 cursor-not-allowed'
                      : 'bg-gradient-to-b from-purple-600 to-purple-800 border-yellow-400 hover:shadow-lg hover:scale-105 cursor-pointer'
                  }`}
                >
                  <div className="text-2xl">{card.emoji}</div>
                  <div className="text-xs font-bold">{card.name.slice(0, 8)}</div>
                  <div className="text-xs text-yellow-300">{card.elixirCost}</div>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // Screen renderers
  if (screen === 'menu') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-4">
        <div className="text-6xl font-bold mb-4 text-yellow-400">⚔️ Clash Royale</div>
        <div className="text-2xl mb-8 text-gray-300">Browser Game</div>

        <div className="mb-6">
          <p className="text-lg mb-4">Select Difficulty:</p>
          <div className="flex gap-4">
            {['easy', 'medium', 'hard'].map(diff => (
              <button
                key={diff}
                onClick={() => setDifficulty(diff)}
                className={`px-6 py-3 rounded-lg font-bold transition-all ${
                  difficulty === diff
                    ? 'bg-yellow-500 text-black scale-110'
                    : 'bg-gray-700 text-white hover:bg-gray-600'
                }`}
              >
                {diff.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => {
            setSelectedDeck([])
            setScreen('deckBuilder')
          }}
          className="px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold text-lg rounded-lg hover:shadow-lg hover:scale-105 transition-all"
        >
          Build Deck
        </button>
      </div>
    )
  }

  if (screen === 'deckBuilder') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-4">
        <h1 className="text-4xl font-bold mb-2 text-yellow-400">Build Your Deck</h1>
        <p className="text-lg mb-6">Select exactly 8 cards (Current: {selectedDeck.length}/8)</p>

        <div className="mb-6 text-center">
          <p className="text-lg">Average Elixir Cost: {selectedDeck.length > 0 ? (selectedDeck.reduce((sum, cardId) => sum + CARDS[cardId].elixirCost, 0) / selectedDeck.length).toFixed(1) : 0}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 max-w-4xl">
          {CARD_ARRAY.map(card => {
            const isSelected = selectedDeck.includes(card.id)
            const canRemove = selectedDeck.filter(cid => cid === card.id).length > (selectedDeck.filter(cid => cid === card.id).length > 1 ? 1 : 0)

            return (
              <button
                key={card.id}
                onClick={() => {
                  if (isSelected && selectedDeck.filter(cid => cid === card.id).length > 0) {
                    setSelectedDeck(selectedDeck.filter((cid, idx) => !(cid === card.id && selectedDeck.indexOf(cid) === idx)))
                  } else if (!isSelected && selectedDeck.length < 8) {
                    setSelectedDeck([...selectedDeck, card.id])
                  }
                }}
                className={`p-3 rounded-lg border-2 transition-all ${
                  isSelected
                    ? 'border-yellow-400 bg-gradient-to-b from-purple-600 to-purple-800 shadow-lg scale-105'
                    : 'border-gray-600 bg-gray-800 hover:border-gray-400'
                }`}
              >
                <div className="text-3xl mb-2">{card.emoji}</div>
                <div className="text-xs font-bold">{card.name}</div>
                <div className="text-xs text-yellow-300">{card.elixirCost} elixir</div>
                <div className="text-xs text-gray-400">{card.type}</div>
              </button>
            )
          })}
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => {
              setSelectedDeck([])
              setScreen('menu')
            }}
            className="px-6 py-3 bg-gray-700 text-white font-bold rounded-lg hover:bg-gray-600 transition-all"
          >
            Back
          </button>
          <button
            onClick={() => {
              if (selectedDeck.length === 8) {
                initializeGame()
                setScreen('battle')
              }
            }}
            disabled={selectedDeck.length !== 8}
            className={`px-8 py-3 font-bold rounded-lg transition-all ${
              selectedDeck.length === 8
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:shadow-lg hover:scale-105 cursor-pointer'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-50'
            }`}
          >
            Start Battle
          </button>
        </div>
      </div>
    )
  }

  if (screen === 'battle') {
    if (gameStateRef.current.gameOver) {
      const gs = gameStateRef.current
      const towers = towerStateRef.current
      const playerTowerHp = Object.values(towers.player).reduce((sum, t) => sum + t.hp, 0)
      const enemyTowerHp = Object.values(towers.enemy).reduce((sum, t) => sum + t.hp, 0)
      const actualWinner = enemyTowerHp < playerTowerHp ? 'player' : enemyTowerHp > playerTowerHp ? 'enemy' : 'tie'

      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-4">
          <div className={`text-5xl font-bold mb-4 ${actualWinner === 'player' ? 'text-green-400' : 'text-red-400'}`}>
            {actualWinner === 'player' ? '🎉 Victory!' : actualWinner === 'tie' ? '⚔️ Tie!' : '💀 Defeat!'}
          </div>
          <div className="text-2xl mb-6">
            Your Towers: {Math.max(0, Math.floor(playerTowerHp))} HP
            <br />
            Enemy Towers: {Math.max(0, Math.floor(enemyTowerHp))} HP
          </div>
          <button
            onClick={() => {
              setScreen('menu')
            }}
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold text-lg rounded-lg hover:shadow-lg hover:scale-105 transition-all"
          >
            Play Again
          </button>
        </div>
      )
    }

    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-4">
        {renderUI()}
      </div>
    )
  }

  return null
}
