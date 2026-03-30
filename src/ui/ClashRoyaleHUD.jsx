/**
 * ClashRoyaleHUD.jsx
 * Complete Clash Royale HUD System
 * Includes: Top Tower Health, Bottom Elixir, Arena, Match States
 */

import React, { useState, useEffect } from 'react'
import './ClashRoyaleHUD.css'

// ============================================================================
// TOP HUD - TOWER HEALTH DISPLAY
// ============================================================================
export function TopHUD({ playerHP = { king: 1000, princess1: 500, princess2: 500 }, 
                         enemyHP = { king: 1000, princess1: 500, princess2: 500 },
                         timeRemaining = 180 }) {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getTowerEmoji = (type) => {
    if (type === 'king') return '👑'
    return '🏰'
  }

  const getTowerBarWidth = (current, max) => (current / max) * 100

  return (
    <div className="cr-hud-top">
      {/* LEFT: ENEMY HP */}
      <div className="cr-hp-section cr-enemy-section">
        <div className="cr-hp-stack">
          {/* Enemy King */}
          <div className="cr-hp-tower enemy-king">
            <span className="cr-tower-emoji">👑</span>
            <div className="cr-hp-bar-container">
              <div 
                className="cr-hp-bar cr-hp-bar-red" 
                style={{ width: `${getTowerBarWidth(enemyHP.king, 1000)}%` }}
              />
            </div>
            <span className="cr-hp-text">{enemyHP.king}</span>
          </div>

          {/* Enemy Princesses */}
          <div className="cr-hp-duo">
            <div className="cr-hp-tower enemy-princess">
              <span className="cr-tower-emoji">🏰</span>
              <div className="cr-hp-bar-container">
                <div 
                  className="cr-hp-bar cr-hp-bar-red" 
                  style={{ width: `${getTowerBarWidth(enemyHP.princess1, 500)}%` }}
                />
              </div>
              <span className="cr-hp-text-small">{enemyHP.princess1}</span>
            </div>
            <div className="cr-hp-tower enemy-princess">
              <span className="cr-tower-emoji">🏰</span>
              <div className="cr-hp-bar-container">
                <div 
                  className="cr-hp-bar cr-hp-bar-red" 
                  style={{ width: `${getTowerBarWidth(enemyHP.princess2, 500)}%` }}
                />
              </div>
              <span className="cr-hp-text-small">{enemyHP.princess2}</span>
            </div>
          </div>
        </div>
      </div>

      {/* CENTER: TIMER */}
      <div className="cr-timer-display">
        <div className="cr-timer-value">{formatTime(timeRemaining)}</div>
      </div>

      {/* RIGHT: PLAYER HP */}
      <div className="cr-hp-section cr-player-section">
        <div className="cr-hp-stack">
          {/* Player King */}
          <div className="cr-hp-tower player-king">
            <span className="cr-tower-emoji">👑</span>
            <div className="cr-hp-bar-container">
              <div 
                className="cr-hp-bar cr-hp-bar-green" 
                style={{ width: `${getTowerBarWidth(playerHP.king, 1000)}%` }}
              />
            </div>
            <span className="cr-hp-text">{playerHP.king}</span>
          </div>

          {/* Player Princesses */}
          <div className="cr-hp-duo">
            <div className="cr-hp-tower player-princess">
              <span className="cr-tower-emoji">🏰</span>
              <div className="cr-hp-bar-container">
                <div 
                  className="cr-hp-bar cr-hp-bar-green" 
                  style={{ width: `${getTowerBarWidth(playerHP.princess1, 500)}%` }}
                />
              </div>
              <span className="cr-hp-text-small">{playerHP.princess1}</span>
            </div>
            <div className="cr-hp-tower player-princess">
              <span className="cr-tower-emoji">🏰</span>
              <div className="cr-hp-bar-container">
                <div 
                  className="cr-hp-bar cr-hp-bar-green" 
                  style={{ width: `${getTowerBarWidth(playerHP.princess2, 500)}%` }}
                />
              </div>
              <span className="cr-hp-text-small">{playerHP.princess2}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// BOTTOM HUD - ELIXIR BAR & PHASE INDICATOR
// ============================================================================
export function BottomHUD({ elixir = 5.2, maxElixir = 10, gamePhase = 'mid' }) {
  const getPhaseColor = () => {
    if (gamePhase === 'early') return '#10b981' // Green
    if (gamePhase === 'mid') return '#f59e0b'   // Yellow
    if (gamePhase === 'late') return '#ef4444'  // Red
    return '#8b5cf6'
  }

  const getPhaseLabel = () => {
    if (gamePhase === 'early') return '⏰ Early'
    if (gamePhase === 'mid') return '⚡ Mid'
    if (gamePhase === 'late') return '🔥 Late'
    return 'Phase'
  }

  return (
    <div className="cr-hud-bottom">
      {/* LEFT: ELIXIR BAR */}
      <div className="cr-elixir-section">
        <div className="cr-elixir-bar-wrapper">
          <div className="cr-elixir-bar-bg">
            {/* Grid Background */}
            <div className="cr-elixir-grid">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="cr-elixir-segment" />
              ))}
            </div>
            
            {/* Fill Bar */}
            <div 
              className="cr-elixir-fill"
              style={{ 
                width: `${(elixir / maxElixir) * 100}%`,
                backgroundColor: getPhaseColor()
              }}
            >
              <div className="cr-elixir-shine" />
            </div>
          </div>
          
          {/* Elixir Text */}
          <div className="cr-elixir-text">
            <span className="cr-elixir-value">{elixir.toFixed(1)}</span>
            <span className="cr-elixir-max">/{maxElixir}</span>
          </div>
        </div>

        {/* Elixir Label */}
        <div className="cr-elixir-label">⚡ ELIXIR</div>
      </div>

      {/* RIGHT: STATUS INDICATORS */}
      <div className="cr-status-section">
        {/* Phase Indicator */}
        <div className="cr-phase-indicator" style={{ borderColor: getPhaseColor() }}>
          <div className="cr-phase-dot" style={{ backgroundColor: getPhaseColor() }} />
          <span className="cr-phase-label">{getPhaseLabel()}</span>
        </div>

        {/* Match Timer Phase */}
        <div className="cr-match-timer">
          <span className="cr-timer-icon">📊</span>
          <span>Match Active</span>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// MATCH RESULT SCREEN
// ============================================================================
export function MatchResultScreen({ 
  victory = true, 
  playerTowersDestroyed = 2,
  enemyTowersDestroyed = 1,
  onPlayAgain = () => {},
  onMenu = () => {}
}) {
  return (
    <div className="cr-result-overlay">
      <div className="cr-result-container">
        {/* Victory/Defeat Header */}
        <div className={`cr-result-header ${victory ? 'victory' : 'defeat'}`}>
          <div className="cr-result-title">
            {victory ? '🏆 VICTORY!' : '💀 DEFEAT'}
          </div>
          <div className="cr-result-subtitle">
            {victory 
              ? `You destroyed ${playerTowersDestroyed} tower${playerTowersDestroyed !== 1 ? 's' : ''}. Enemy destroyed ${enemyTowersDestroyed}.`
              : `Enemy destroyed ${enemyTowersDestroyed} tower${enemyTowersDestroyed !== 1 ? 's' : ''}. You destroyed ${playerTowersDestroyed}.`
            }
          </div>
        </div>

        {/* Stats Comparison */}
        <div className="cr-result-stats">
          <div className="cr-stat-row">
            <div className="cr-stat-item player">
              <span className="cr-stat-label">YOUR TOWERS</span>
              <span className="cr-stat-value">{3 - playerTowersDestroyed}</span>
            </div>
            <div className="cr-stat-separator">vs</div>
            <div className="cr-stat-item enemy">
              <span className="cr-stat-label">ENEMY TOWERS</span>
              <span className="cr-stat-value">{3 - enemyTowersDestroyed}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="cr-result-buttons">
          <button className="cr-button cr-button-primary" onClick={onPlayAgain}>
            ▶️ Play Again
          </button>
          <button className="cr-button cr-button-secondary" onClick={onMenu}>
            🏠 Menu
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// COMPLETE CLASH ROYALE HUD COMPONENT
// ============================================================================
export function ClashRoyaleHUD({ 
  gameState = 'battle',
  playerHP = { king: 1000, princess1: 500, princess2: 500 },
  enemyHP = { king: 1000, princess1: 500, princess2: 500 },
  timeRemaining = 180,
  elixir = 5.2,
  gamePhase = 'mid'
}) {
  return (
    <div className="cr-hud-wrapper">
      {/* Top HUD */}
      <TopHUD 
        playerHP={playerHP}
        enemyHP={enemyHP}
        timeRemaining={timeRemaining}
      />

      {/* Bottom HUD */}
      <BottomHUD 
        elixir={elixir}
        gamePhase={gamePhase}
      />
    </div>
  )
}

export default ClashRoyaleHUD
