/**
 * CardHand.jsx
 * Card hand UI component
 */

import React from 'react'
import { getCard } from '../cards/cardDatabase.js'

export default function CardHand({ hand, currentElixir, onPlayCard }) {
  return (
    <div style={{
      display: 'flex',
      gap: 8,
      padding: 10,
      background: '#1a1a1a',
      borderTop: '2px solid #333',
    }}>
      {hand.map(cardItem => {
        const card = getCard(cardItem.cardId)
        const canPlay = currentElixir >= card.elixirCost

        return (
          <div
            key={cardItem.id}
            onClick={() => canPlay && onPlayCard(card.id)}
            style={{
              flex: 1,
              padding: 8,
              background: canPlay ? '#2a4a2a' : '#3a2a2a',
              border: '1px solid ' + (canPlay ? '#00ff00' : '#666'),
              borderRadius: 4,
              cursor: canPlay ? 'pointer' : 'default',
              textAlign: 'center',
              opacity: canPlay ? 1 : 0.6,
            }}
          >
            <div style={{ fontSize: 24 }}>{card.emoji}</div>
            <div style={{ fontSize: 12, fontWeight: 'bold' }}>{card.name}</div>
            <div style={{ fontSize: 11, color: '#aaa' }}>Cost: {card.elixirCost}</div>
          </div>
        )
      })}
    </div>
  )
}
