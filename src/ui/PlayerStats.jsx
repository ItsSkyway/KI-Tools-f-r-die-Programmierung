/**
 * PlayerStats.jsx
 * Player stats display (HP, Elixir)
 */

import React from 'react'

export default function PlayerStats({ playerHp, maxHp, playerElixir, maxElixir, gameTime, isPlayer = true }) {
  const hpPercent = (playerHp / maxHp) * 100
  const elixirPercent = (playerElixir / maxElixir) * 100

  return (
    <div style={{
      padding: 10,
      background: isPlayer ? '#1a2a1a' : '#2a1a1a',
      borderBottom: '1px solid #333',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, color: '#aaa' }}>HP</div>
        <div style={{
          width: 150,
          height: 20,
          background: '#1a1a1a',
          border: '1px solid #333',
          borderRadius: 4,
          overflow: 'hidden',
        }}>
          <div
            style={{
              width: hpPercent + '%',
              height: '100%',
              background: hpPercent > 50 ? '#00ff00' : hpPercent > 25 ? '#ffcc00' : '#ff0000',
              transition: 'width 0.3s',
            }}
          />
        </div>
        <div style={{ fontSize: 11, marginTop: 4 }}>{Math.floor(playerHp)}/{maxHp}</div>
      </div>

      <div style={{ flex: 1, marginLeft: 20 }}>
        <div style={{ fontSize: 12, color: '#aaa' }}>Elixir</div>
         <div style={{
          width: 150,
          height: 20,
          background: '#1a1a1a',
          border: '1px solid #333',
          borderRadius: 4,
          overflow: 'hidden',
        }}>
          <div
            style={{
              width: elixirPercent + '%',
              height: '100%',
              background: '#3366ff',
              transition: 'width 0.3s',
            }}
          />
        </div>
        <div style={{ fontSize: 11, marginTop: 4 }}>{playerElixir.toFixed(1)}/{maxElixir}</div>
      </div>

      {gameTime !== undefined && (
        <div style={{ marginLeft: 20, textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 'bold' }}>{Math.ceil(gameTime)}</div>
          <div style={{ fontSize: 11, color: '#aaa' }}>seconds</div>
        </div>
      )}
    </div>
  )
}
