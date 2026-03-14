/**
 * DeckBuilder.jsx
 * Deck selection screen
 */

import React, { useState } from 'react'
import { getAvailableCards, validateDeck } from '../players/deckBuilder.js'

export default function DeckBuilder({ onDeckSelect }) {
  const [selectedCards, setSelectedCards] = useState([])
  const cards = getAvailableCards()

  const toggleCard = cardId => {
    if (selectedCards.includes(cardId)) {
      setSelectedCards(selectedCards.filter(id => id !== cardId))
    } else if (selectedCards.length < 8) {
      setSelectedCards([...selectedCards, cardId])
    }
  }

  const handleStart = () => {
    const { isValid, errors } = validateDeck(selectedCards)
    if (isValid) {
      onDeckSelect(selectedCards)
    } else {
      alert('Invalid deck: ' + errors.join(', '))
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Select Your 8-Card Deck</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
        {cards.map(card => (
          <div
            key={card.id}
            onClick={() => toggleCard(card.id)}
            style={{
              padding: 10,
              background: selectedCards.includes(card.id) ? '#2a4a2a' : '#1a1a1a',
              border: '2px solid ' + (selectedCards.includes(card.id) ? '#00ff00' : '#333'),
              borderRadius: 4,
              cursor: 'pointer',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 32 }}>{card.emoji}</div>
            <div style={{ fontSize: 12, fontWeight: 'bold' }}>{card.name}</div>
            <div style={{ fontSize: 10, color: '#aaa' }}>Cost: {card.elixirCost}</div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center' }}>
        <div>Selected: {selectedCards.length}/8</div>
        <button
          onClick={handleStart}
          disabled={selectedCards.length !== 8}
          style={{
            marginTop: 10,
            padding: '10px 20px',
            background: selectedCards.length === 8 ? '#00ff00' : '#333',
            color: selectedCards.length === 8 ? '#000' : '#666',
            border: 'none',
            borderRadius: 4,
            cursor: selectedCards.length === 8 ? 'pointer' : 'default',
            fontWeight: 'bold',
          }}
        >
          Start Battle
        </button>
      </div>
    </div>
  )
}
