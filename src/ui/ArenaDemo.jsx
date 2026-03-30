/**
 * arenaDemo.jsx
 * Complete example integration showing Arena + Lanes + River System in action
 * This demonstrates the full system with sample game state
 */

import React, { useState, useEffect, useRef } from 'react'
import ArenaRenderer from './ArenaRenderer'
import { getSpawnPosition, updateUnitPosition, calculateAIPath, getNextWaypoint } from '../game/unitMovement'
import { LANES, BRIDGES } from '../game/constants'
import '../styles/arenaDemo.css'

/**
 * Complete Arena Demo Component
 */
export default function ArenaDemo() {
  const [gameState, setGameState] = useState(null)
  const [towers, setTowers] = useState(null)
  const [selectedCard, setSelectedCard] = useState(null)
  const gameLoopRef = useRef(null)
  const unitsRef = useRef({
    player: [],
    enemy: [],
  })
  const waypointsRef = useRef({})

  // Initialize demo game state
  useEffect(() => {
    const initialGameState = {
      playerElixir: 5,
      maxElixir: 10,
      playerHp: 3000,
      enemyHp: 3000,
      playerTroops: [],
      enemyTroops: [],
      gameTime: 0,
      debug: false,
    }

    const initialTowers = {
      player: {
        kingTower: {
          x: 300,
          y: 740,
          hp: 3000,
          maxHp: 3000,
          isKing: true,
          range: 400,
        },
        princessLeft: {
          x: 100,
          y: 680,
          hp: 1500,
          maxHp: 1500,
          isKing: false,
          range: 350,
        },
        princessRight: {
          x: 500,
          y: 680,
          hp: 1500,
          maxHp: 1500,
          isKing: false,
          range: 350,
        },
      },
      enemy: {
        kingTower: {
          x: 300,
          y: 60,
          hp: 3000,
          maxHp: 3000,
          isKing: true,
          range: 400,
        },
        princessLeft: {
          x: 100,
          y: 120,
          hp: 1500,
          maxHp: 1500,
          isKing: false,
          range: 350,
        },
        princessRight: {
          x: 500,
          y: 120,
          hp: 1500,
          maxHp: 1500,
          isKing: false,
          range: 350,
        },
      },
    }

    setGameState(initialGameState)
    setTowers(initialTowers)

    // Start game loop
    startGameLoop()

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current)
      }
    }
  }, [])

  /**
   * Game loop - updates units and state
   */
  const startGameLoop = () => {
    let lastTime = Date.now()

    const gameLoop = () => {
      const now = Date.now()
      const deltaTime = (now - lastTime) / 1000
      lastTime = now

      // Update units
      updateUnits(deltaTime)

      // Update game state
      setGameState((prevState) => ({
        ...prevState,
        gameTime: prevState.gameTime + deltaTime * 1000,
        playerTroops: unitsRef.current.player,
        enemyTroops: unitsRef.current.enemy,
      }))

      gameLoopRef.current = requestAnimationFrame(gameLoop)
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop)
  }

  /**
   * Update all units - movement, pathfinding, collisions
   */
  const updateUnits = (deltaTime) => {
    const speed = 40 * deltaTime // pixels per second

    // Update player units
    unitsRef.current.player = unitsRef.current.player.map((unit) => updateUnit(unit, speed, 'player'))

    // Update enemy units
    unitsRef.current.enemy = unitsRef.current.enemy.map((unit) => updateUnit(unit, speed, 'enemy'))

    // Remove dead units
    unitsRef.current.player = unitsRef.current.player.filter((u) => u.hp > 0)
    unitsRef.current.enemy = unitsRef.current.enemy.filter((u) => u.hp > 0)
  }

  /**
   * Update single unit
   */
  const updateUnit = (unit, speed, side) => {
    // Get target
    const target = side === 'player' ? { x: 300, y: 50 } : { x: 300, y: 750 }

    // Calculate path if needed
    if (!waypointsRef.current[unit.id]) {
      waypointsRef.current[unit.id] = calculateAIPath(unit, target.x, target.y)
    }

    // Get current waypoint
    const waypoints = waypointsRef.current[unit.id]
    const nextWaypoint = getNextWaypoint(unit, waypoints)

    if (!nextWaypoint) {
      return unit
    }

    // Update position
    const updatedUnit = updateUnitPosition(unit, nextWaypoint.x, nextWaypoint.y, speed)

    // Check if reached target
    const distance = Math.hypot(updatedUnit.x - target.x, updatedUnit.y - target.y)
    if (distance < 20) {
      // Reached target - apply damage to tower or base
      updatedUnit.hp = Math.max(0, updatedUnit.hp - 1) // Unit dies after reaching base (for demo)
    }

    // Apply drowning damage if applicable
    if (updatedUnit.isDrowning) {
      updatedUnit.hp = Math.max(0, updatedUnit.hp - 0.5)
    }

    return updatedUnit
  }

  /**
   * Handle canvas click - spawn unit or cast spell
   */
  const handleCanvasClick = ({ x, y, card }) => {
    if (!card) {
      // Just a click - no action
      return
    }

    // Spawn unit at clicked position
    const unitId = `${card.name}-${Date.now()}`

    // Determine side based on Y position
    const side = y > 400 ? 'player' : 'enemy'

    if (side !== 'player') {
      // Demo: player can only spawn on own side
      return
    }

    const newUnit = {
      id: unitId,
      name: card.name,
      x,
      y,
      hp: 50,
      maxHp: 50,
      speed: 40,
      radius: 8,
      side: 'player',
      isDrowning: false,
    }

    unitsRef.current.player.push(newUnit)
    waypointsRef.current[unitId] = calculateAIPath(newUnit, 300, 50)

    setSelectedCard(null) // Clear selection after placing
  }

  /**
   * Spawn unit button - auto selects a card for demo
   */
  const spawnPlayerUnit = (lane = 'center') => {
    const position = getSpawnPosition('player', lane)
    const unitId = `player-unit-${Date.now()}`

    const newUnit = {
      id: unitId,
      name: 'Skeleton',
      x: position.x,
      y: position.y,
      hp: 50,
      maxHp: 50,
      speed: 40,
      radius: 8,
      side: 'player',
      isDrowning: false,
    }

    unitsRef.current.player.push(newUnit)
    waypointsRef.current[unitId] = calculateAIPath(newUnit, 300, 50)
  }

  const spawnEnemyUnit = (lane = 'center') => {
    const position = getSpawnPosition('enemy', lane)
    const unitId = `enemy-unit-${Date.now()}`

    const newUnit = {
      id: unitId,
      name: 'Archer',
      x: position.x,
      y: position.y,
      hp: 60,
      maxHp: 60,
      speed: 40,
      radius: 8,
      side: 'enemy',
      isDrowning: false,
    }

    unitsRef.current.enemy.push(newUnit)
    waypointsRef.current[unitId] = calculateAIPath(newUnit, 300, 750)
  }

  const toggleDebug = () => {
    setGameState((prev) => ({
      ...prev,
      debug: !prev.debug,
    }))
  }

  if (!gameState || !towers) {
    return <div>Loading...</div>
  }

  return (
    <div className="arena-demo">
      <div className="arena-container">
        <h1>⚔️ Arena Lanes + River System Demo</h1>

        <div className="arena-wrapper">
          <ArenaRenderer gameState={gameState} towers={towers} selectedCard={selectedCard} onCanvasClick={handleCanvasClick} />
        </div>

        <div className="controls">
          <div className="spawn-controls">
            <h3>Spawn Units</h3>

            <div className="button-group">
              <p>Player Units:</p>
              <button onClick={() => spawnPlayerUnit('left')} className="btn btn-left">
                Left Lane ➡️
              </button>
              <button onClick={() => spawnPlayerUnit('center')} className="btn btn-center">
                Center Lane ⬆️
              </button>
              <button onClick={() => spawnPlayerUnit('right')} className="btn btn-right">
                Right Lane ➡️
              </button>
            </div>

            <div className="button-group">
              <p>Enemy Units:</p>
              <button onClick={() => spawnEnemyUnit('left')} className="btn btn-left">
                Left Lane ➡️
              </button>
              <button onClick={() => spawnEnemyUnit('center')} className="btn btn-center">
                Center Lane ⬇️
              </button>
              <button onClick={() => spawnEnemyUnit('right')} className="btn btn-right">
                Right Lane ➡️
              </button>
            </div>
          </div>

          <div className="debug-section">
            <button onClick={toggleDebug} className="btn btn-debug">
              {gameState.debug ? '🔍 Debug: ON' : '🔍 Debug: OFF'}
            </button>

            <div className="stats">
              <p>
                <strong>Units:</strong> {gameState.playerTroops.length} Player | {gameState.enemyTroops.length} Enemy
              </p>
              <p>
                <strong>Time:</strong> {Math.floor(gameState.gameTime / 1000)}s
              </p>
            </div>
          </div>
        </div>

        <div className="info">
          <h3>📋 Arena System Features</h3>
          <ul>
            <li>✅ <strong>3-Lane System:</strong> Left (x:0-200), Center (x:200-400), Right (x:400-600)</li>
            <li>✅ <strong>River Crossing:</strong> Units can only cross at Bridges (x:150, x:450)</li>
            <li>✅ <strong>Drowning Mechanic:</strong> Units that cross river outside bridges take damage</li>
            <li>✅ <strong>Lane-Based Movement:</strong> Units follow their lane with soft constraints</li>
            <li>✅ <strong>Bridge Pathfinding:</strong> Units automatically navigate to nearest bridge</li>
            <li>✅ <strong>Tower Integration:</strong> Towers positioned in lanes (Left, Center, Right)</li>
            <li>✅ <strong>Animated River:</strong> Water waves and particles in real-time</li>
            <li>✅ <strong>Territory Separation:</strong> Player territory (y:400-800), Enemy territory (y:0-400)</li>
          </ul>

          <h3>🎮 Controls</h3>
          <ul>
            <li>Click <strong>"Left/Center/Right Lane"</strong> buttons to spawn units</li>
            <li>Units will automatically navigate through lanes and cross via bridges</li>
            <li>Try spawning units in Center lane to see bridge crossing</li>
            <li>Click <strong>Debug</strong> to see additional info</li>
          </ul>

          <h3>🔍 What to Observe</h3>
          <ul>
            <li>Units move through their lane toward enemy base</li>
            <li>Units cross river only at bridge positions (x:150, x:450)</li>
            <li>River has animated water waves effect</li>
            <li>Bridges have wooden texture and glow effect</li>
            <li>Towers are positioned correctly in each lane</li>
            <li>Lane boundaries shown as dashed lines</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
