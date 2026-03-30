/**
 * ArenaRenderer.jsx
 * Clash Royale accurate arena rendering with lanes, river, and visual effects
 * Features:
 * - 600×800px arena
 * - 3-lane system
 * - Animated river with water effects
 * - Bridge crossings
 * - Tower rendering
 * - Unit rendering with lane indicators
 * - Projectile rendering (arrows)
 */

import React, { useEffect, useRef } from 'react'
import { LANES, BRIDGES, RIVER_Y, ENEMY_TERRITORY_END, PLAYER_TERRITORY_START } from '../game/constants'
import { isUnitDrowning, isBridgeCrossing, isInRiverZone } from '../game/arena'
import { renderProjectiles } from '../simulation/projectiles.js'

/**
 * Main arena renderer component
 */
export default function ArenaRenderer({ gameState, towers, selectedCard, onCanvasClick }) {
  const canvasRef = useRef(null)
  const animationFrameRef = useRef(null)
  const timeRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { alpha: false })

    const renderFrame = () => {
      timeRef.current += 1

      // Clear and render
      renderArena(ctx, canvas, timeRef.current, gameState, towers)

      animationFrameRef.current = requestAnimationFrame(renderFrame)
    }

    renderFrame()

    // Handle click for spell placement
    const handleCanvasClick = (e) => {
      if (!onCanvasClick) return

      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      onCanvasClick({ x, y, card: selectedCard })
    }

    canvas.addEventListener('click', handleCanvasClick)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      canvas.removeEventListener('click', handleCanvasClick)
    }
  }, [gameState, towers, selectedCard, onCanvasClick])

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={800}
      style={{
        display: 'block',
        border: '2px solid #333',
        background: '#0a0e27',
        cursor: selectedCard ? 'crosshair' : 'default',
      }}
    />
  )
}

// ============================================================================
// RENDERING FUNCTIONS
// ============================================================================

/**
 * Main arena rendering function
 */
function renderArena(ctx, canvas, time, gameState, towers) {
  // 1. Background & terrain
  renderBackground(ctx, canvas, time)

  // 2. Lanes and boundaries
  renderLanes(ctx, canvas)

  // 3. River with animation
  renderRiver(ctx, canvas, time)

  // 4. Bridges
  renderBridges(ctx, canvas)

  // 5. Towers
  if (towers) {
    renderTowers(ctx, towers)
  }

  // 6. Units
  if (gameState) {
    renderUnits(ctx, gameState.playerTroops || [])
    renderUnits(ctx, gameState.enemyTroops || [])
  }

  // 7. Projectiles (arrows)
  if (gameState && gameState.projectiles) {
    renderProjectiles(ctx, gameState.projectiles)
  }

  // 8. Debug overlay (optional)
  renderDebugOverlay(ctx, canvas, gameState)
}

/**
 * Render arena background with gradient
 */
function renderBackground(ctx, canvas, time) {
  // Stone texture gradient - dunkelblau/grau
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
  gradient.addColorStop(0, '#1a2844') // Enemy territory - darker
  gradient.addColorStop(0.5, '#2a3f5f') // River center
  gradient.addColorStop(1, '#1a2844') // Player territory - darker

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Add subtle grid pattern
  renderGridPattern(ctx, canvas)
}

/**
 * Render subtle grid pattern for visual interest
 */
function renderGridPattern(ctx, canvas) {
  ctx.strokeStyle = 'rgba(100, 150, 180, 0.05)'
  ctx.lineWidth = 1

  const gridSize = 50

  // Vertical lines
  for (let x = 0; x < canvas.width; x += gridSize) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, canvas.height)
    ctx.stroke()
  }

  // Horizontal lines
  for (let y = 0; y < canvas.height; y += gridSize) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(canvas.width, y)
    ctx.stroke()
  }
}

/**
 * Render lane boundaries
 */
function renderLanes(ctx, canvas) {
  // Left lane boundary (267px)
  ctx.strokeStyle = 'rgba(100, 150, 180, 0.15)'
  ctx.lineWidth = 3
  ctx.setLineDash([10, 10])
  ctx.beginPath()
  ctx.moveTo(267, 0)
  ctx.lineTo(267, canvas.height)
  ctx.stroke()

  // Right lane boundary (533px)
  ctx.beginPath()
  ctx.moveTo(533, 0)
  ctx.lineTo(533, canvas.height)
  ctx.stroke()

  ctx.setLineDash([])

  // Lane labels (subtle)
  ctx.fillStyle = 'rgba(100, 150, 180, 0.2)'
  ctx.font = '12px Arial'
  ctx.textAlign = 'center'
  ctx.fillText('LEFT', 133, 30)
  ctx.fillText('CENTER', 400, 30)
  ctx.fillText('RIGHT', 667, 30)
  ctx.fillText('LEFT', 133, canvas.height - 10)
  ctx.fillText('CENTER', 400, canvas.height - 10)
  ctx.fillText('RIGHT', 667, canvas.height - 10)
}

/**
 * Render animated river
 */
function renderRiver(ctx, canvas, time) {
  const riverHeight = 40
  const riverStart = RIVER_Y - riverHeight / 2
  const riverEnd = RIVER_Y + riverHeight / 2

  // Water gradient
  const waterGradient = ctx.createLinearGradient(0, riverStart, 0, riverEnd)
  waterGradient.addColorStop(0, '#1a5f9f')
  waterGradient.addColorStop(0.5, '#0a4f8f')
  waterGradient.addColorStop(1, '#1a5f9f')

  ctx.fillStyle = waterGradient
  ctx.fillRect(0, riverStart, canvas.width, riverHeight)

  // Water wave animation
  ctx.strokeStyle = 'rgba(200, 220, 255, 0.3)'
  ctx.lineWidth = 2

  const waveAmplitude = 3
  const waveFrequency = 0.02
  const speed = time * 0.05

  ctx.beginPath()
  ctx.moveTo(0, RIVER_Y + Math.sin(0 + speed) * waveAmplitude)

  for (let x = 1; x < canvas.width; x++) {
    const y = RIVER_Y + Math.sin((x * waveFrequency + speed) * Math.PI) * waveAmplitude
    ctx.lineTo(x, y)
  }
  ctx.stroke()

  // Particle effect (water droplets)
  ctx.fillStyle = 'rgba(150, 200, 255, 0.3)'
  for (let i = 0; i < 5; i++) {
    const x = ((time * 0.3 + i * 120) % canvas.width + canvas.width) % canvas.width
    const particleY = RIVER_Y + Math.sin(time * 0.05 + i) * 8
    ctx.beginPath()
    ctx.arc(x, particleY, 2, 0, Math.PI * 2)
    ctx.fill()
  }

  // River glow effect
  ctx.shadowColor = 'rgba(100, 180, 255, 0.5)'
  ctx.shadowBlur = 15
  ctx.shadowOffsetX = 0
  ctx.shadowOffsetY = 0

  ctx.strokeStyle = 'rgba(100, 180, 255, 0.3)'
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.moveTo(0, RIVER_Y)
  ctx.lineTo(canvas.width, RIVER_Y)
  ctx.stroke()

  ctx.shadowColor = 'transparent'
}

/**
 * Render bridge crossings
 */
function renderBridges(ctx, canvas) {
  Object.values(BRIDGES).forEach((bridge) => {
    // Bridge wood texture
    const bridgeX = bridge.x - bridge.width / 2
    const bridgeY = bridge.y - bridge.height / 2

    // Main bridge platform
    ctx.fillStyle = '#8B6914'
    ctx.fillRect(bridgeX, bridgeY, bridge.width, bridge.height)

    // Bridge edge highlight
    ctx.strokeStyle = '#D4A574'
    ctx.lineWidth = 3
    ctx.strokeRect(bridgeX, bridgeY, bridge.width, bridge.height)

    // Wooden planks pattern
    ctx.strokeStyle = 'rgba(100, 70, 0, 0.3)'
    ctx.lineWidth = 1
    for (let i = 0; i < bridge.height; i += 5) {
      ctx.beginPath()
      ctx.moveTo(bridgeX, bridgeY + i)
      ctx.lineTo(bridgeX + bridge.width, bridgeY + i)
      ctx.stroke()
    }

    // Bridge glow
    ctx.shadowColor = 'rgba(212, 165, 116, 0.4)'
    ctx.shadowBlur = 10
    ctx.fillStyle = 'rgba(212, 165, 116, 0.1)'
    ctx.fillRect(bridgeX - 2, bridgeY - 2, bridge.width + 4, bridge.height + 4)

    ctx.shadowColor = 'transparent'
  })
}

/**
 * Render towers
 */
function renderTowers(ctx, towers) {
  if (towers.player) {
    Object.entries(towers.player).forEach(([key, tower]) => {
      renderTower(ctx, tower, 'player')
    })
  }

  if (towers.enemy) {
    Object.entries(towers.enemy).forEach(([key, tower]) => {
      renderTower(ctx, tower, 'enemy')
    })
  }
}

/**
 * Render single tower
 */
function renderTower(ctx, tower, side) {
  if (!tower) return

  const isKing = tower.isKing
  const color = side === 'player' ? '#FFD700' : '#FF4444'
  const shadowColor = side === 'player' ? '#B8860B' : '#8B0000'
  const radius = isKing ? 25 : 20

  // Tower shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
  ctx.shadowBlur = 8
  ctx.shadowOffsetY = 3

  // Tower base circle
  const baseGradient = ctx.createRadialGradient(tower.x, tower.y - 5, 0, tower.x, tower.y, radius)
  baseGradient.addColorStop(0, color)
  baseGradient.addColorStop(1, shadowColor)

  ctx.fillStyle = baseGradient
  ctx.beginPath()
  ctx.arc(tower.x, tower.y, radius, 0, Math.PI * 2)
  ctx.fill()

  // Tower outline
  ctx.strokeStyle = '#FFFFFF'
  ctx.lineWidth = 2
  ctx.stroke()

  ctx.shadowColor = 'transparent'

  // King tower flag
  if (isKing) {
    ctx.fillStyle = '#FF0000'
    ctx.beginPath()
    ctx.moveTo(tower.x, tower.y - radius - 10)
    ctx.lineTo(tower.x + 8, tower.y - radius - 5)
    ctx.lineTo(tower.x, tower.y - radius)
    ctx.closePath()
    ctx.fill()
  }

  // Health bar
  const healthBarWidth = radius * 2
  const healthBarHeight = 4
  const healthBarY = tower.y + radius + 8

  ctx.fillStyle = '#333333'
  ctx.fillRect(tower.x - healthBarWidth / 2, healthBarY, healthBarWidth, healthBarHeight)

  const healthPercent = tower.hp / tower.maxHp
  ctx.fillStyle = healthPercent > 0.5 ? '#00FF00' : healthPercent > 0.25 ? '#FFFF00' : '#FF0000'
  ctx.fillRect(tower.x - healthBarWidth / 2, healthBarY, healthBarWidth * healthPercent, healthBarHeight)

  // Tower label
  ctx.fillStyle = '#FFFFFF'
  ctx.font = 'bold 10px Arial'
  ctx.textAlign = 'center'
  ctx.fillText(Math.ceil(tower.hp), tower.x, tower.y + 5)
}

/**
 * Render units with lane indicators
 */
function renderUnits(ctx, units) {
  units.forEach((unit) => {
    if (unit.hp <= 0) return

    renderUnit(ctx, unit)
  })
}

/**
 * Render single unit
 */
function renderUnit(ctx, unit) {
  const isPlayer = unit.side === 'player'
  const baseColor = isPlayer ? '#00FF00' : '#FF4444'
  const size = unit.radius || 8

  // Check if drowning
  const isDrowning = isUnitDrowning(unit)
  const drowningOpacity = isDrowning ? 0.6 : 1

  // Unit shadow
  ctx.shadowColor = `rgba(0, 0, 0, ${0.4 * drowningOpacity})`
  ctx.shadowBlur = 6

  // Unit body (circle)
  const unitGradient = ctx.createRadialGradient(unit.x - 2, unit.y - 2, 0, unit.x, unit.y, size)
  unitGradient.addColorStop(0, adjustBrightness(baseColor, 30))
  unitGradient.addColorStop(1, baseColor)

  ctx.fillStyle = unitGradient
  ctx.globalAlpha = drowningOpacity
  ctx.beginPath()
  ctx.arc(unit.x, unit.y, size, 0, Math.PI * 2)
  ctx.fill()

  // Unit outline
  ctx.strokeStyle = '#FFFFFF'
  ctx.lineWidth = 1
  ctx.stroke()

  // Lane indicator (subtle)
  const laneIndicatorSize = size / 2
  ctx.fillStyle = isPlayer ? 'rgba(0, 255, 0, 0.5)' : 'rgba(255, 68, 68, 0.5)'
  ctx.fillRect(unit.x - 3, unit.y - 10, 6, 3)

  // Drowning effect
  if (isDrowning) {
    ctx.fillStyle = 'rgba(100, 150, 200, 0.4)'
    ctx.beginPath()
    ctx.arc(unit.x, unit.y, size + 3, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.globalAlpha = 1
  ctx.shadowColor = 'transparent'

  // Health bar
  const healthBarWidth = size * 2
  const healthBarHeight = 2
  const healthBarY = unit.y + size + 4

  ctx.fillStyle = '#333333'
  ctx.fillRect(unit.x - healthBarWidth / 2, healthBarY, healthBarWidth, healthBarHeight)

  const healthPercent = unit.hp / unit.maxHp
  ctx.fillStyle = healthPercent > 0.5 ? '#00FF00' : healthPercent > 0.25 ? '#FFFF00' : '#FF0000'
  ctx.fillRect(unit.x - healthBarWidth / 2, healthBarY, healthBarWidth * healthPercent, healthBarHeight)

  // Unit selection indicator (if applicable)
  if (unit.selected) {
    ctx.strokeStyle = '#FFFF00'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(unit.x, unit.y, size + 5, 0, Math.PI * 2)
    ctx.stroke()
  }
}

/**
 * Render debug overlay
 */
function renderDebugOverlay(ctx, canvas, gameState) {
  if (!gameState || !gameState.debug) return

  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
  ctx.fillRect(0, 0, 120, 80)

  ctx.fillStyle = '#00FF00'
  ctx.font = '10px monospace'
  ctx.textAlign = 'left'

  let y = 10
  ctx.fillText(`Units: ${(gameState.playerTroops || []).length + (gameState.enemyTroops || []).length}`, 5, y)
  y += 12
  ctx.fillText(`Elixir: ${gameState.playerElixir || 0}/${gameState.maxElixir || 10}`, 5, y)
  y += 12
  ctx.fillText(`Time: ${Math.floor((gameState.gameTime || 0) / 1000)}s`, 5, y)
}

/**
 * Utility: adjust brightness of color
 */
function adjustBrightness(color, percent) {
  const num = parseInt(color.replace('#', ''), 16)
  const amt = Math.round(2.55 * percent)
  const R = Math.min(255, (num >> 16) + amt)
  const G = Math.min(255, ((num >> 8) & 0x00ff) + amt)
  const B = Math.min(255, (num & 0x0000ff) + amt)
  return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)
}
