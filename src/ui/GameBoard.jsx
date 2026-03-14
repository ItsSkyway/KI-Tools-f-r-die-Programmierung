/**
 * GameBoard.jsx
 * Arena rendering component
 */

import React, { useEffect, useRef } from 'react'

export default function GameBoard({ gameState, towers }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')

    // Clear canvas
    ctx.fillStyle = '#0a0e27'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw lanes
    ctx.strokeStyle = '#333'
    ctx.lineWidth = 2
    ctx.setLineDash([5, 5])
    ctx.beginPath()
    ctx.moveTo(300, 0)
    ctx.lineTo(300, canvas.height)
    ctx.stroke()
    ctx.setLineDash([])

    // Draw towers
    if (towers) {
      drawTowers(ctx, towers)
    }

    // Draw units
    if (gameState) {
      drawUnits(ctx, gameState.playerTroops, '#00ff00')
      drawUnits(ctx, gameState.enemyTroops, '#ff0000')
    }
  }, [gameState, towers])

  return <canvas ref={canvasRef} width={600} height={800} style={{ display: 'block' }} />
}

const drawTowers = (ctx, towers) => {
  // Draw player towers (bottom)
  if (towers.player) {
    Object.entries(towers.player).forEach(([key, tower]) => {
      ctx.fillStyle = tower.destroyed ? '#333' : '#ffcc00'
      ctx.beginPath()
      ctx.arc(tower.x, tower.y, 20, 0, Math.PI * 2)
      ctx.fill()
    })
  }

  // Draw enemy towers (top)
  if (towers.enemy) {
    Object.entries(towers.enemy).forEach(([key, tower]) => {
      ctx.fillStyle = tower.destroyed ? '#333' : '#ff0000'
      ctx.beginPath()
      ctx.arc(tower.x, tower.y, 20, 0, Math.PI * 2)
      ctx.fill()
    })
  }
}

const drawUnits = (ctx, units, color) => {
  units.forEach(unit => {
    if (unit.hp <= 0) return

    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(unit.x, unit.y, 10, 0, Math.PI * 2)
    ctx.fill()

    // Health bar
    ctx.fillStyle = '#ff0000'
    ctx.fillRect(unit.x - 10, unit.y - 20, 20, 3)

    ctx.fillStyle = '#00ff00'
    const hpPercent = unit.hp / unit.maxHp
    ctx.fillRect(unit.x - 10, unit.y - 20, 20 * hpPercent, 3)
  })
}
