/**
 * ClashArena.jsx
 * Complete Arena UI with Card Hand, Drag & Drop, and Match States
 */

import React, { useState, useRef } from 'react'
import './ClashArena.css'

// ============================================================================
// CARD HAND COMPONENT
// ============================================================================
export function CardHand({ 
  cards = [],
  onCardSelect = () => {},
  onCardDrag = () => {},
  onCardDrop = () => {},
  disabledCards = [],
  draggedCard = null
}) {
  const [dragSource, setDragSource] = useState(null)

  const handleDragStart = (card, index) => {
    setDragSource(index)
    onCardDrag({ card, index })
  }

  const handleDragEnd = () => {
    setDragSource(null)
  }

  const getRarityClass = (rarity) => {
    const rarityMap = {
      'common': 'rarity-common',
      'rare': 'rarity-rare',
      'epic': 'rarity-epic',
      'legendary': 'rarity-legendary'
    }
    return rarityMap[rarity] || 'rarity-common'
  }

  const canPlay = (card) => !disabledCards.includes(card.id)

  return (
    <div className="cr-card-hand">
      {cards.map((card, index) => (
        <div
          key={card.id}
          className={`cr-card ${getRarityClass(card.rarity)} ${
            dragSource === index ? 'dragging' : ''
          } ${!canPlay(card) ? 'cannot-play' : 'can-play'}`}
          draggable={canPlay(card)}
          onDragStart={() => handleDragStart(card, index)}
          onDragEnd={handleDragEnd}
          onClick={() => canPlay(card) && onCardSelect(card)}
        >
          {/* Card Background */}
          <div className="cr-card-background">
            <div className="cr-card-shine" />
          </div>

          {/* Rarity Badge */}
          <div className="cr-card-rarity">
            {card.rarity.toUpperCase()}
          </div>

          {/* Card Content */}
          <div className="cr-card-content">
            {/* Card Emoji/Icon */}
            <div className="cr-card-emoji">{card.emoji}</div>

            {/* Card Name */}
            <div className="cr-card-name">{card.name}</div>

            {/* Card Elixir Cost */}
            <div className="cr-card-elixir">
              <span className="cr-elixir-icon">⚡</span>
              <span className="cr-elixir-cost">{card.elixir}</span>
            </div>
          </div>

          {/* Disabled State */}
          {!canPlay(card) && (
            <div className="cr-card-disabled-overlay">
              <span className="cr-disabled-text">NOT ENOUGH ELIXIR</span>
            </div>
          )}

          {/* Drag Ghost */}
          {dragSource === index && (
            <div className="cr-card-ghost">
              <div className="cr-ghost-content">
                {card.emoji} {card.name}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ============================================================================
// ARENA COMPONENT
// ============================================================================
export function Arena({ 
  playerUnits = [],
  enemyUnits = [],
  width = 600,
  height = 800,
  onArenaClick = () => {},
  dropZoneActive = false,
  dropZoneValid = false
}) {
  const canvasRef = useRef(null)

  return (
    <div className="cr-arena-wrapper">
      {/* Arena Background */}
      <div className="cr-arena-container" style={{ width, height }}>
        {/* River/Center Line */}
        <div className="cr-river" />

        {/* Towers - Left (Enemy) */}
        <div className="cr-tower-zone cr-enemy-towers">
          <div className="cr-tower cr-tower-king">
            <span className="cr-tower-icon">👑</span>
            <span className="cr-tower-label">King</span>
          </div>
          <div className="cr-tower-duo">
            <div className="cr-tower cr-tower-princess">
              <span className="cr-tower-icon">🏰</span>
            </div>
            <div className="cr-tower cr-tower-princess">
              <span className="cr-tower-icon">🏰</span>
            </div>
          </div>
        </div>

        {/* Towers - Right (Player) */}
        <div className="cr-tower-zone cr-player-towers">
          <div className="cr-tower cr-tower-king">
            <span className="cr-tower-icon">👑</span>
            <span className="cr-tower-label">King</span>
          </div>
          <div className="cr-tower-duo">
            <div className="cr-tower cr-tower-princess">
              <span className="cr-tower-icon">🏰</span>
            </div>
            <div className="cr-tower cr-tower-princess">
              <span className="cr-tower-icon">🏰</span>
            </div>
          </div>
        </div>

        {/* Player Units */}
        <div className="cr-units-container cr-player-units">
          {playerUnits.map((unit) => (
            <div
              key={unit.id}
              className="cr-unit cr-player-unit"
              style={{
                left: `${unit.x}px`,
                top: `${unit.y}px`
              }}
            >
              <div className="cr-unit-emoji">{unit.emoji}</div>
              <div className="cr-unit-hp-bar">
                <div 
                  className="cr-unit-hp-fill"
                  style={{ width: `${(unit.hp / unit.maxHp) * 100}%` }}
                />
              </div>
              <div className="cr-unit-damage" style={{ opacity: unit.damageActive ? 1 : 0 }}>
                -{unit.damage}
              </div>
            </div>
          ))}
        </div>

        {/* Enemy Units */}
        <div className="cr-units-container cr-enemy-units">
          {enemyUnits.map((unit) => (
            <div
              key={unit.id}
              className="cr-unit cr-enemy-unit"
              style={{
                left: `${unit.x}px`,
                top: `${unit.y}px`
              }}
            >
              <div className="cr-unit-emoji">{unit.emoji}</div>
              <div className="cr-unit-hp-bar">
                <div 
                  className="cr-unit-hp-fill"
                  style={{ width: `${(unit.hp / unit.maxHp) * 100}%` }}
                />
              </div>
              <div className="cr-unit-damage" style={{ opacity: unit.damageActive ? 1 : 0 }}>
                -{unit.damage}
              </div>
            </div>
          ))}
        </div>

        {/* Drop Zone Indicator */}
        {dropZoneActive && (
          <div className={`cr-drop-zone ${dropZoneValid ? 'valid' : 'invalid'}`}>
            <div className="cr-drop-zone-circle" />
            <div className="cr-drop-zone-label">
              {dropZoneValid ? '✓ DROP HERE' : '✗ INVALID ZONE'}
            </div>
          </div>
        )}

        {/* Click Overlay for Drop Detection */}
        <div
          className="cr-arena-overlay"
          onClick={onArenaClick}
          onDragOver={(e) => e.preventDefault()}
          onDrop={onArenaClick}
        />
      </div>
    </div>
  )
}

// ============================================================================
// DECK BUILDER COMPONENT
// ============================================================================
export function DeckBuilder({ 
  availableCards = [],
  selectedCards = [],
  onCardToggle = () => {},
  onComplete = () => {}
}) {
  const canAddCard = selectedCards.length < 8
  const isComplete = selectedCards.length === 8

  const getRarityClass = (rarity) => {
    const rarityMap = {
      'common': 'rarity-common',
      'rare': 'rarity-rare',
      'epic': 'rarity-epic',
      'legendary': 'rarity-legendary'
    }
    return rarityMap[rarity] || 'rarity-common'
  }

  return (
    <div className="cr-deck-builder-overlay">
      <div className="cr-deck-builder-container">
        {/* Header */}
        <div className="cr-deck-header">
          <h1 className="cr-deck-title">🎴 BUILD YOUR DECK</h1>
          <p className="cr-deck-subtitle">Select 8 cards to battle with</p>
          <div className="cr-deck-progress">
            <div className="cr-progress-bar">
              <div 
                className="cr-progress-fill"
                style={{ width: `${(selectedCards.length / 8) * 100}%` }}
              />
            </div>
            <span className="cr-progress-text">{selectedCards.length}/8</span>
          </div>
        </div>

        {/* Available Cards Grid */}
        <div className="cr-available-cards">
          {availableCards.map((card) => {
            const isSelected = selectedCards.some(c => c.id === card.id)
            const canSelect = !isSelected && canAddCard

            return (
              <div
                key={card.id}
                className={`cr-deck-card ${getRarityClass(card.rarity)} ${
                  isSelected ? 'selected' : ''
                } ${!canSelect && !isSelected ? 'disabled' : ''}`}
                onClick={() => {
                  if (isSelected || canSelect) {
                    onCardToggle(card)
                  }
                }}
              >
                {/* Selection Checkmark */}
                {isSelected && (
                  <div className="cr-deck-card-check">✓</div>
                )}

                {/* Card Content */}
                <div className="cr-deck-card-emoji">{card.emoji}</div>
                <div className="cr-deck-card-name">{card.name}</div>
                <div className="cr-deck-card-elixir">⚡{card.elixir}</div>
              </div>
            )
          })}
        </div>

        {/* Selected Cards Display */}
        <div className="cr-selected-cards">
          <h3 className="cr-selected-title">📋 YOUR DECK</h3>
          <div className="cr-selected-list">
            {selectedCards.map((card) => (
              <div key={card.id} className="cr-selected-item">
                <span className="cr-selected-emoji">{card.emoji}</span>
                <span className="cr-selected-name">{card.name}</span>
                <span className="cr-selected-elixir">⚡{card.elixir}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="cr-deck-actions">
          <button 
            className="cr-button cr-button-primary"
            disabled={!isComplete}
            onClick={onComplete}
          >
            {isComplete ? '⚔️ START BATTLE' : `SELECT ${8 - selectedCards.length} MORE CARD${8 - selectedCards.length !== 1 ? 'S' : ''}`}
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// DIFFICULTY SELECTOR COMPONENT
// ============================================================================
export function DifficultySelector({ 
  onDifficultySelect = () => {}
}) {
  const difficulties = [
    { 
      id: 'easy', 
      name: 'Easy', 
      description: 'Perfect for beginners', 
      emoji: '🟢',
      stats: '6/10 difficulty'
    },
    { 
      id: 'medium', 
      name: 'Medium', 
      description: 'Balanced challenge', 
      emoji: '🟡',
      stats: '8/10 difficulty'
    },
    { 
      id: 'hard', 
      name: 'Hard', 
      description: 'Extreme challenge', 
      emoji: '🔴',
      stats: '10/10 difficulty'
    },
    { 
      id: 'legendary', 
      name: 'Legendary', 
      description: 'Master difficulty', 
      emoji: '⭐',
      stats: '12/10 difficulty'
    }
  ]

  return (
    <div className="cr-difficulty-overlay">
      <div className="cr-difficulty-container">
        {/* Header */}
        <div className="cr-difficulty-header">
          <h1 className="cr-difficulty-title">⚔️ SELECT DIFFICULTY</h1>
          <p className="cr-difficulty-subtitle">Choose your battle difficulty</p>
        </div>

        {/* Difficulty Cards Grid */}
        <div className="cr-difficulty-grid">
          {difficulties.map((difficulty) => (
            <button
              key={difficulty.id}
              className={`cr-difficulty-card ${difficulty.id}`}
              onClick={() => onDifficultySelect(difficulty.id)}
            >
              <div className="cr-difficulty-emoji">{difficulty.emoji}</div>
              <div className="cr-difficulty-name">{difficulty.name}</div>
              <div className="cr-difficulty-description">{difficulty.description}</div>
              <div className="cr-difficulty-stats">{difficulty.stats}</div>
              <div className="cr-difficulty-hover">TAP TO SELECT</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default { CardHand, Arena, DeckBuilder, DifficultySelector }
