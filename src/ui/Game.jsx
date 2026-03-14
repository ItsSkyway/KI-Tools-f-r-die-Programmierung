/**
 * Game.jsx
 * Main Game Component (refactored)
 * 
 * This is now a thin wrapper around modular game logic
 */

import React, { useState, useEffect, useRef } from 'react'
import { useGameState } from '../game/gameState.js'
import { runGameFrame } from '../game/gameLoop.js'
import { makeDecision, shouldPlayCard } from '../players/botAI.js'
import { spawnCard } from '../simulation/unitSpawning.js'
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

  // Game loop
  useEffect(() => {
    if (screen !== 'playing') return

    const gameInterval = setInterval(() => {
      const gs = gameStateRef.current
      const towers = towerStateRef.current

      if (gs.gameOver) {
        clearInterval(gameInterval)
        endGame(gs.winner)
        return
      }

      // Update elixir regeneration (FIXED: Was imported but never called)
      const isDoubleElixir = gs.gameTime < 60000
      updateElixir(isDoubleElixir, 33)

      // Run simulation
      runGameFrame(gs, towers)
    }, 33)

    return () => clearInterval(gameInterval)
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
      const units = spawnCard(cardId, 'player', 300, 700) // BUG #4: Get spawned units
      gs.playerTroops.push(...units) // BUG #4: Add units to game state
      gameStateRef.current = gs // Update ref
      gs.lastCardPlayTime.player = Date.now()
      
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
    }
  }

  // Get player hand from game state
  const playerHand = gameStateRef.current?.playerHand || []

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
    <div style={{ width: 600, height: 800, margin: '0 auto', background: '#1a1a1a', color: '#fff', fontFamily: 'Arial', display: 'flex', flexDirection: 'column' }}>
      {screen === 'deckBuilder' && (
        <DeckBuilder onDeckSelect={handleDeckSelect} />
      )}

      {screen === 'playing' && (
        <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
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
          }}
        />
      )}
    </div>
  )
}
