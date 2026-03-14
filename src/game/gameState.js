/**
 * Game State Hook
 * Core game state management with useGameState
 */

import { useState, useRef, useCallback, useEffect } from 'react'
import { initializeTowers } from '../simulation/towers.js'
import { createInitialHand } from '../players/deckBuilder.js'
import {
  GAME_STATES,
  DOUBLE_ELIXIR_TIME,
  MAX_ELIXIR,
  ELIXIR_REGENERATION_RATE,
  ELIXIR_REGENERATION_RATE_DOUBLE,
} from './constants.js'

/**
 * Main game state hook
 */
export const useGameState = initialDeck => {
  const [screen, setScreen] = useState(GAME_STATES.DECK_BUILDER)
  const [difficulty, setDifficulty] = useState('medium')
  const [selectedDeck, setSelectedDeck] = useState(initialDeck || [])

  // Game state (mutable ref - no re-render)
  const gameStateRef = useRef({
    playerElixir: 10,
    enemyElixir: 10,
    gameTime: 180000, // 3 minutes
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
    activeSpells: [], // PHASE 1: Track active spells in flight
    // Animation systems
    floatingDamageNumbers: [],
    projectiles: [],
    screenShakes: [],
    destructionEffects: [],
    cardPlayAnimations: [],
    particleSystems: [],
  })

  // Tower state (mutable ref)
  const towerStateRef = useRef({
    player: {},
    enemy: {},
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

  /**
   * Initialize game
   */
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
    gs.playerHand = selectedDeck.map((cardId, idx) => ({ cardId, id: idx }))
    gs.enemyHand = selectedDeck.slice(0, 8).map((cardId, idx) => ({ cardId, id: idx }))
    gs.lastCardPlayTime = { player: 0, enemy: 0 }
    gs.freezeZones = []
    gs.activeSpells = [] // PHASE 1: Initialize spell tracking

    // Initialize towers
    towerStateRef.current.player = initializeTowers('player')
    towerStateRef.current.enemy = initializeTowers('enemy')

    setScreen(GAME_STATES.PLAYING)
  }, [selectedDeck])

  /**
   * Start game with selected deck
   */
  const startGame = useCallback(
    deck => {
      setSelectedDeck(deck)
      initializeGame()
    },
    [initializeGame]
  )

  /**
   * Update elixir for player
   */
  const updateElixir = useCallback((isDoubleElixir, deltaMs = 33) => {
    const gs = gameStateRef.current
    const rate = isDoubleElixir ? ELIXIR_REGENERATION_RATE_DOUBLE : ELIXIR_REGENERATION_RATE
    const regenAmount = (rate * deltaMs) / 1000

    gs.playerElixir = Math.min(MAX_ELIXIR, gs.playerElixir + regenAmount)
    gs.enemyElixir = Math.min(MAX_ELIXIR, gs.enemyElixir + regenAmount)

    // Trigger UI update
    setUiState(prev => prev + 1)
  }, [])

  /**
   * Spend player elixir
   */
  const spendPlayerElixir = useCallback(amount => {
    const gs = gameStateRef.current
    if (gs.playerElixir >= amount) {
      gs.playerElixir -= amount
      setUiState(prev => prev + 1)
      return true
    }
    return false
  }, [])

  /**
   * Spend enemy elixir
   */
  const spendEnemyElixir = useCallback(amount => {
    const gs = gameStateRef.current
    if (gs.enemyElixir >= amount) {
      gs.enemyElixir -= amount
      return true
    }
    return false
  }, [])

  /**
   * End game
   */
  const endGame = useCallback(winner => {
    const gs = gameStateRef.current
    gs.gameOver = true
    gs.winner = winner
    setScreen(GAME_STATES.GAME_OVER)
  }, [])

  /**
   * Get current game state (for UI)
   */
  const getGameState = useCallback(() => {
    return {
      screen,
      difficulty,
      selectedDeck,
      gameState: gameStateRef.current,
      towerState: towerStateRef.current,
    }
  }, [screen, difficulty, selectedDeck])

  return {
    screen,
    setScreen,
    difficulty,
    setDifficulty,
    selectedDeck,
    gameStateRef,
    towerStateRef,
    uiState,
    gameStats,
    setGameStats,
    initializeGame,
    startGame,
    updateElixir,
    spendPlayerElixir,
    spendEnemyElixir,
    endGame,
    getGameState,
  }
}

/**
 * Export for testing
 */
export default useGameState
