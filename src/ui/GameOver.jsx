/**
 * GameOver.jsx
 * Game over / result screen
 */

import React from 'react'

export default function GameOver({ winner, playerStats, enemyStats, onPlayAgain }) {
  const isPlayerWin = winner === 'player'

  return (
    <div style={{
      padding: 40,
      textAlign: 'center',
      background: isPlayerWin ? '#1a2a1a' : '#2a1a1a',
      color: '#fff',
      minHeight: '100%',
    }}>
      <h1 style={{ fontSize: 48, marginBottom: 20 }}>
        {isPlayerWin ? '🎉 YOU WIN! 🎉' : '💀 YOU LOST 💀'}
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 40 }}>
        <div style={{ background: '#1a1a1a', padding: 20, borderRadius: 4 }}>
          <h3>Your Stats</h3>
          <div style={{ textAlign: 'left', fontSize: 14 }}>
            <p>Remaining HP: {playerStats?.finalHp || 0}</p>
            <p>Damage Dealt: {playerStats?.damageDealt || 0}</p>
            <p>Damage Taken: {playerStats?.damageTaken || 0}</p>
            <p>Cards Played: {playerStats?.cardsPlayed || 0}</p>
          </div>
        </div>

        <div style={{ background: '#1a1a1a', padding: 20, borderRadius: 4 }}>
          <h3>Enemy Stats</h3>
          <div style={{ textAlign: 'left', fontSize: 14 }}>
            <p>Remaining HP: {enemyStats?.finalHp || 0}</p>
            <p>Damage Dealt: {enemyStats?.damageDealt || 0}</p>
            <p>Damage Taken: {enemyStats?.damageTaken || 0}</p>
            <p>Cards Played: {enemyStats?.cardsPlayed || 0}</p>
          </div>
        </div>
      </div>

      <button
        onClick={onPlayAgain}
        style={{
          padding: '15px 40px',
          fontSize: 18,
          background: '#00ff00',
          color: '#000',
          border: 'none',
          borderRadius: 4,
          cursor: 'pointer',
          fontWeight: 'bold',
        }}
      >
        Play Again
      </button>
    </div>
  )
}
