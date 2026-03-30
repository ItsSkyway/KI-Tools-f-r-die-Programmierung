/**
 * Game.jsx
 * Main Game Component (refactored)
 * 
 * This is now a thin wrapper around modular game logic
 * Enhanced with audio and animation systems
 */

import React, { useState, useEffect, useRef } from 'react'
import { useGameState } from '../game/gameState.js'
import { runGameFrame } from '../game/gameLoop.js'
import { makeDecision, shouldPlayCard } from '../players/botAI.js'
import { spawnCard } from '../simulation/unitSpawning.js'
import { soundManager } from '../audio/soundManager.js'
import { animationManager } from '../animation/animationManager.js'
import * as spriteAnimations from '../animation/spriteAnimations.js'
import GameBoard from './GameBoard'
import PlayerStats from './PlayerStats'
import CardHand from './CardHand'
import DeckBuilder from './DeckBuilder'
import GameOver from './GameOver'

export default function Game() {
  // Game state
  const {
    screen,
    setScreen,
    difficulty,
    setDifficulty,
    selectedDeck,
    gameStateRef,
    towerStateRef,
    uiState,
    startGame,
    updateElixir,
    spendPlayerElixir,
    spendEnemyElixir,
    endGame,
  } = useGameState()

  const [selectedCards, setSelectedCards] = useState([])
  const [selectedSpellCard, setSelectedSpellCard] = useState(null) // PHASE 6: Track selected spell
  const canvasRef = useRef(null) // PHASE 6: Reference to canvas for click handling
  const audioInitializedRef = useRef(false)
  const lastUnitCountRef = useRef({ player: 0, enemy: 0 })
  const lastTowerHpRef = useRef({ player: {}, enemy: {} })

  // Game loop
  useEffect(() => {
    if (screen !== 'playing') return

    // Initialize audio on first playing (triggered by user)
    if (!audioInitializedRef.current) {
      soundManager.initialize()
      audioInitializedRef.current = true
      soundManager.playSfx('matchStart')
      console.log('🎮 Game started - Audio & Animation systems ready')
      
      // TESTING: Expose game state to window for integration tests
      window.__gameState__ = gameStateRef.current
      window.__towers__ = towerStateRef.current
      console.log('🧪 Test access enabled: window.__gameState__ and window.__towers__')
      console.log('📝 Run: runIntegrationTests() to start testing')
    }

    // Start animation loop
    animationManager.start()

    const gameInterval = setInterval(() => {
      const gs = gameStateRef.current
      const towers = towerStateRef.current

      if (gs.gameOver) {
        clearInterval(gameInterval)
        
        // Play game end audio
        if (gs.winner === 'player') {
          soundManager.playSfx('victory')
        } else {
          soundManager.playSfx('defeat')
        }
        
        endGame(gs.winner)
        return
      }

      // Update elixir regeneration (FIXED: Was imported but never called)
      const isDoubleElixir = gs.gameTime < 60000
      updateElixir(isDoubleElixir, 33)

      // Run simulation
      runGameFrame(gs, towers)

      // Track unit spawns and deaths
      _detectGameEvents(gs, towers)
    }, 33)

    return () => {
      clearInterval(gameInterval)
      animationManager.stop()
    }
  }, [screen, endGame, gameStateRef, towerStateRef])

  // Bot AI loop
  useEffect(() => {
    if (screen !== 'playing') return

    const botInterval = setInterval(() => {
      const gs = gameStateRef.current

      if (shouldPlayCard(gs.lastCardPlayTime.enemy, difficulty)) {
        const decision = makeDecision(
          { hand: gs.enemyHand, elixir: gs.enemyElixir, hp: 3500 },
          { hand: gs.playerHand, elixir: gs.playerElixir, hp: 3500 },
          gs,
          difficulty
        )

        if (decision && decision.shouldPlay) {
          const { getCard } = require('../cards/cardDatabase.js')
          const card = getCard(decision.cardId)
          if (card) {
            spendEnemyElixir(card.elixirCost) // BUG #1 FIXED: Use actual card cost
            const units = spawnCard(decision.cardId, 'enemy', decision.x, decision.y) // BUG #5: Spawn units
            gs.enemyTroops.push(...units) // BUG #5: Add units to game state
            gs.lastCardPlayTime.enemy = Date.now()
          }
        }
      }
    }, 1000)

    return () => clearInterval(botInterval)
  }, [screen, difficulty, gameStateRef, spendEnemyElixir])

  const handleDeckSelect = deck => {
    setSelectedCards(deck)
    startGame(deck)
  }

  const handleCardPlay = cardId => {
    const gs = gameStateRef.current
    const { getCard } = require('../cards/cardDatabase.js')
    const card = getCard(cardId) // BUG #2 FIXED: Get actual card instead of hardcoded

    if (card && spendPlayerElixir(card.elixirCost)) {
      // Play card placement sound
      soundManager.playSfx('cardPlaced')

      const units = spawnCard(cardId, 'player', 300, 700) // BUG #4: Get spawned units
      gs.playerTroops.push(...units) // BUG #4: Add units to game state
      gameStateRef.current = gs // Update ref
      gs.lastCardPlayTime.player = Date.now()
      
      // Animate unit spawns
      units.forEach((unit, index) => {
        setTimeout(() => {
          spriteAnimations.spawnUnitAnimation(unit)
          soundManager.playSfx('unitSpawn')
        }, index * 100) // Stagger spawn animations
      })
      
      // PHASE 5: Cycle hand - remove played card and add new card from full deck
      if (selectedCards && selectedCards.length > 0) {
        const handIndex = gs.playerHand.findIndex(c => c.cardId === cardId)
        if (handIndex !== -1) {
          // Remove from hand
          gs.playerHand.splice(handIndex, 1)
          // Add random card from selected deck
          const randomCardId = selectedCards[Math.floor(Math.random() * selectedCards.length)]
          gs.playerHand.push({ 
            cardId: randomCardId, 
            id: Date.now() + Math.random() 
          })
        }
      }
    } else if (card) {
      // Not enough elixir - play error sound and shake animation
      soundManager.playSfx('cardError')
    }
  }

  // Get player hand from game state
  const playerHand = gameStateRef.current?.playerHand || []

  /**
   * Detect game events and trigger audio/animations
   */
  const _detectGameEvents = (gs, towers) => {
    // Detect unit deaths
    const playerUnitCount = gs.playerTroops.length
    const enemyUnitCount = gs.enemyTroops.length

    if (playerUnitCount < lastUnitCountRef.current.player) {
      // Player unit died
      const deadCount = lastUnitCountRef.current.player - playerUnitCount
      for (let i = 0; i < deadCount; i++) {
        soundManager.playSfx('unitDeath')
      }
    }

    if (enemyUnitCount < lastUnitCountRef.current.enemy) {
      // Enemy unit died
      const deadCount = lastUnitCountRef.current.enemy - enemyUnitCount
      for (let i = 0; i < deadCount; i++) {
        soundManager.playSfx('unitDeath')
      }
    }

    lastUnitCountRef.current = { player: playerUnitCount, enemy: enemyUnitCount }

    // Detect tower damage
    Object.entries(towers.player).forEach(([key, tower]) => {
      const lastHp = lastTowerHpRef.current.player[key]
      if (lastHp && lastHp > tower.hp) {
        soundManager.playSfx('towerDamage')
      }
      lastTowerHpRef.current.player[key] = tower.hp
    })

    Object.entries(towers.enemy).forEach(([key, tower]) => {
      const lastHp = lastTowerHpRef.current.enemy[key]
      if (lastHp && lastHp > tower.hp) {
        soundManager.playSfx('towerDamage')
      }
      lastTowerHpRef.current.enemy[key] = tower.hp
    })
  }

  /**
   * Handle sound toggle
   */
  const _handleSoundToggle = () => {
    const isMuted = soundManager.toggleMute()
    soundManager.playSfx(isMuted ? 'cardError' : 'cardPlaced')
  }

  // Calculate game over stats
  const gameOverStats = gameStateRef.current && {
    playerStats: {
      finalHp: gameStateRef.current.playerTower?.hp || 0,
      cardsPlayed: gameStateRef.current.playerTroops?.length || 0,
      damageDealt: (gameStateRef.current.playerTower?.maxHp || 3500) - (gameStateRef.current.enemyTower?.hp || 0),
      damageTaken: (gameStateRef.current.playerTower?.maxHp || 3500) - (gameStateRef.current.playerTower?.hp || 0),
    },
    enemyStats: {
      finalHp: gameStateRef.current.enemyTower?.hp || 0,
      cardsPlayed: gameStateRef.current.enemyTroops?.length || 0,
      damageDealt: (gameStateRef.current.enemyTower?.maxHp || 3500) - (gameStateRef.current.playerTower?.hp || 0),
      damageTaken: (gameStateRef.current.enemyTower?.maxHp || 3500) - (gameStateRef.current.enemyTower?.hp || 0),
    },
    winner: gameStateRef.current.winner,
  }

  return (
    <div style={{ 
      width: 800, 
      height: 1000, 
      margin: '0 auto', 
      background: 'var(--color-bg-darkest)', 
      color: 'var(--color-text-primary)', 
      fontFamily: 'var(--font-family-body)', 
      display: 'flex', 
      flexDirection: 'column' 
    }}>
      {screen === 'deckBuilder' && (
        <DeckBuilder onDeckSelect={handleDeckSelect} />
      )}

      {screen === 'playing' && (
        <div style={{ position: 'relative', width: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Sound Control Button */}
          <button
            onClick={_handleSoundToggle}
            style={{
              position: 'absolute',
              top: 10,
              right: 10,
              zIndex: 1000,
              background: 'rgba(0, 0, 0, 0.7)',
              border: '2px solid var(--color-border-highlight)',
              color: 'var(--color-text-primary)',
              width: 44,
              height: 44,
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              fontSize: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all var(--transition-smooth)',
              boxShadow: 'var(--shadow-md)',
              backdropFilter: `blur(${4}px)`,
            }}
            onMouseEnter={(e) => {
              e.target.style.boxShadow = 'var(--shadow-lg), var(--shadow-glow-purple)';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.boxShadow = 'var(--shadow-md)';
              e.target.style.transform = 'translateY(0)';
            }}
            title={soundManager.isMuted ? 'Unmute' : 'Mute'}
          >
            {soundManager.isMuted ? '🔇' : '🔊'}
          </button>

          <GameBoard gameState={gameStateRef.current} towers={towerStateRef.current} />
          <PlayerStats 
            playerHp={gameStateRef.current?.playerTower?.hp || 0}
            maxHp={gameStateRef.current?.playerTower?.maxHp || 3500}
            playerElixir={gameStateRef.current?.playerElixir || 0}
            maxElixir={10}
            gameTime={Math.ceil((gameStateRef.current?.gameTime || 0) / 1000)}
            isPlayer={true}
          />
          <CardHand 
            hand={playerHand}
            currentElixir={gameStateRef.current?.playerElixir || 0}
            onPlayCard={handleCardPlay}
          />
        </div>
      )}

      {screen === 'gameOver' && gameOverStats && (
        <GameOver 
          playerStats={gameOverStats.playerStats}
          enemyStats={gameOverStats.enemyStats}
          winner={gameOverStats.winner}
          onPlayAgain={() => {
            setScreen('deckBuilder')
            // Reset audio/animation for next game
            soundManager.stopAll()
            animationManager.cancelAll()
          }}
        />
      )}
    </div>
  )
}
