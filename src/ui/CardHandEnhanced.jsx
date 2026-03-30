/**
 * CardHandEnhanced.jsx
 * Enhanced card hand UI with deck cycling display
 * 
 * Features:
 * - 4 card hand display
 * - Next card preview
 * - Cycle position indicator (e.g., "2/8")
 * - Cycle progress dots
 * - Visual feedback for playable vs. unplayable
 * - Smooth animations on card changes
 */

import React, { useState, useEffect } from 'react'
import { getCard } from '../cards/cardDatabase.js'
import { getCycleInfo } from '../players/deckCycling.js'

export default function CardHandEnhanced({
  hand,
  currentElixir,
  onPlayCard,
  cycleInfo,
  showNextPreview = true,
  showCyclePosition = true,
}) {
  // For smooth card draw animations
  const [prevHandLength, setPrevHandLength] = useState(hand.length)
  const [animatingCard, setAnimatingCard] = useState(null)

  useEffect(() => {
    if (hand.length > prevHandLength) {
      // A card was drawn
      setAnimatingCard(hand[hand.length - 1].instanceId)
      const timer = setTimeout(() => setAnimatingCard(null), 300)
      setPrevHandLength(hand.length)
      return () => clearTimeout(timer)
    }
    setPrevHandLength(hand.length)
  }, [hand, prevHandLength])

  const nextCardId = cycleInfo?.nextCardId
  const nextCard = nextCardId ? getCard(nextCardId) : null
  const cycleDisplay = cycleInfo?.positionDisplay || '0/8'
  const cyclePosition = cycleInfo?.position || 0

  // Rarity color mapping
  const getRarityColor = (rarity) => {
    const colors = {
      common: '#CCCCCC',
      rare: '#0066FF',
      epic: '#9933FF',
      legendary: '#FFAA00',
    }
    return colors[rarity] || '#CCCCCC'
  }

  // Cycle progress indicator (dot representation: ● ○ ○ ●)
  const renderCycleProgress = () => {
    const dots = []
    for (let i = 0; i < 8; i++) {
      dots.push(
        <div
          key={i}
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: i < cyclePosition ? '#FFD700' : '#555',
            margin: '0 2px',
            opacity: i < cyclePosition ? 1 : 0.3,
          }}
        />
      )
    }
    return dots
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* Next Card Preview */}
      {showNextPreview && (
        <div
          style={{
            padding: '8px 12px',
            background: '#1a1a2e',
            border: '1px solid #444',
            borderRadius: 4,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 12,
          }}
        >
          <span style={{ color: '#aaa' }}>Next:</span>
          {nextCard ? (
            <>
              <span style={{ fontSize: 18 }}>{nextCard.emoji}</span>
              <span style={{ color: '#ccc' }}>{nextCard.name}</span>
              <span
                style={{
                  marginLeft: 'auto',
                  color: getRarityColor(nextCard.rarity),
                  fontWeight: 'bold',
                }}
              >
                {nextCard.elixirCost}
              </span>
            </>
          ) : (
            <span style={{ color: '#666' }}>...</span>
          )}
        </div>
      )}

      {/* Cycle Info Bar */}
      {showCyclePosition && (
        <div
          style={{
            padding: '6px 12px',
            background: '#0a0e27',
            border: '1px solid #333',
            borderRadius: 4,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 11,
          }}
        >
          <span style={{ color: '#aaa' }}>Cycle:</span>
          <span style={{ color: '#FFD700', fontWeight: 'bold' }}>{cycleDisplay}</span>
          <div style={{ display: 'flex', gap: 2 }}>
            {renderCycleProgress()}
          </div>
        </div>
      )}

      {/* Hand Cards (4 cards) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 6,
          padding: 8,
          background: '#0a0e27',
          borderRadius: 4,
          minHeight: 140,
        }}
      >
        {hand.map((cardItem) => {
          const card = getCard(cardItem.cardId)
          const canPlay = currentElixir >= card.elixirCost
          const isAnimating = animatingCard === cardItem.instanceId
          const rarityBorderColor = getRarityColor(card.rarity)

          return (
            <div
              key={cardItem.instanceId}
              onClick={() => canPlay && onPlayCard(cardItem.instanceId, card.id)}
              style={{
                padding: 8,
                background: canPlay ? '#1a2a1a' : '#2a1a1a',
                border: `2px solid ${canPlay ? '#00ff00' : '#666'}`,
                borderRadius: 6,
                cursor: canPlay ? 'pointer' : 'default',
                textAlign: 'center',
                opacity: canPlay ? 1 : 0.5,
                transition: 'all 0.2s',
                transform: isAnimating ? 'scale(1.05)' : 'scale(1)',
                boxShadow: isAnimating
                  ? `0 0 12px ${rarityBorderColor}80`
                  : canPlay
                    ? '0 0 6px #00ff0040'
                    : 'none',
                ':hover': {
                  transform: canPlay ? 'scale(1.05)' : 'scale(1)',
                },
              }}
            >
              {/* Rarity indicator (top-right corner) */}
              <div
                style={{
                  position: 'absolute',
                  top: 2,
                  right: 2,
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: rarityBorderColor,
                  opacity: 0.7,
                }}
              />

              {/* Card content */}
              <div style={{ fontSize: 32 }}>{card.emoji}</div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 'bold',
                  color: '#fff',
                  marginTop: 2,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {card.name}
              </div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 'bold',
                  color: '#FFD700',
                  marginTop: 2,
                  background: '#1a1a2e',
                  padding: '2px 4px',
                  borderRadius: 2,
                }}
              >
                {card.elixirCost}
              </div>

              {/* Type indicator */}
              <div
                style={{
                  fontSize: 9,
                  color: '#999',
                  marginTop: 2,
                  textTransform: 'uppercase',
                }}
              >
                {card.type[0].toUpperCase()}
              </div>
            </div>
          )
        })}
      </div>

      {/* Playable/Unplayable indicator message */}
      {hand.some(card => {
        const c = getCard(card.cardId)
        return currentElixir < c.elixirCost
      }) && (
        <div
          style={{
            fontSize: 11,
            color: '#ff6666',
            textAlign: 'center',
            padding: '4px 8px',
          }}
        >
          ⚠ Some cards require more elixir
        </div>
      )}
    </div>
  )
}
