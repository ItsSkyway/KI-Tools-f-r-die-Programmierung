/**
 * Projectile System
 * Handles arrow projectiles from towers to targets
 * Features:
 * - Arrow flight simulation with physics
 * - Visual rendering with rotation and trail effects
 * - Collision detection and damage application
 * - Support for both player and enemy projectiles
 */

/**
 * Create a new arrow projectile
 * @param {number} fromX - Starting X position (tower)
 * @param {number} fromY - Starting Y position (tower)
 * @param {number} toX - Target X position
 * @param {number} toY - Target Y position
 * @param {number} damage - Damage dealt on hit
 * @param {number} travelTime - Travel time in milliseconds (default 300ms)
 * @param {string} owner - 'player' or 'enemy' for color distinction
 * @param {Object} target - Target unit/tower object (for collision detection)
 * @returns {Object} Arrow projectile object
 */
export const createArrow = (fromX, fromY, toX, toY, damage = 50, travelTime = 300, owner = 'player', target = null) => {
  const dx = toX - fromX
  const dy = toY - fromY
  const distance = Math.hypot(dx, dy)
  const speed = distance / (travelTime / 1000) // pixels per second

  return {
    id: `arrow_${Date.now()}_${Math.random()}`,
    type: 'arrow',
    owner, // 'player' or 'enemy'
    
    // Position
    x: fromX,
    y: fromY,
    
    // Velocity (pixels per second)
    vx: (dx / distance) * speed,
    vy: (dy / distance) * speed,
    
    // Target information
    fromX,
    fromY,
    toX,
    toY,
    targetObject: target, // Reference to target unit/tower
    
    // Physics
    damage,
    travelTime, // Original travel time (ms)
    elapsed: 0, // Elapsed time (ms)
    speed, // Pixels per second
    distance, // Total distance to travel
    
    // Rotation angle for visual
    angle: Math.atan2(dy, dx),
    
    // Trail effect
    trail: [], // Array of previous positions for trail
    trailLength: 10, // Number of trail segments
    trailMaxAge: 200, // How long trail stays visible (ms)
    
    // Creation time for cleanup
    createdAt: Date.now(),
    
    // Hit tracking
    hasHit: false,
    hitAt: null,
  }
}

/**
 * Update arrow position and state
 * @param {Object} arrow - Arrow projectile
 * @param {number} deltaMs - Time since last update (milliseconds)
 * @returns {Object} Updated arrow
 */
export const updateArrow = (arrow, deltaMs = 33) => {
  if (arrow.hasHit) {
    return arrow
  }

  // Update elapsed time
  arrow.elapsed += deltaMs
  
  // Calculate new position
  const prevX = arrow.x
  const prevY = arrow.y
  
  arrow.x += (arrow.vx * deltaMs) / 1000
  arrow.y += (arrow.vy * deltaMs) / 1000
  
  // Update trail
  arrow.trail.push({
    x: prevX,
    y: prevY,
    age: 0,
    maxAge: arrow.trailMaxAge,
  })
  
  // Remove old trail segments
  if (arrow.trail.length > arrow.trailLength) {
    arrow.trail.shift()
  }
  
  // Age trail segments
  arrow.trail = arrow.trail.map(segment => ({
    ...segment,
    age: segment.age + deltaMs,
  }))
  
  // Check if arrow reached target location (within tolerance)
  const distToTarget = Math.hypot(arrow.toX - arrow.x, arrow.toY - arrow.y)
  const distTraveled = Math.hypot(arrow.x - arrow.fromX, arrow.y - arrow.fromY)
  
  if (distTraveled >= arrow.distance || arrow.elapsed >= arrow.travelTime) {
    arrow.hasHit = true
    arrow.hitAt = arrow.elapsed
    arrow.x = arrow.toX
    arrow.y = arrow.toY
  }
  
  return arrow
}

/**
 * Render a single arrow on canvas
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Object} arrow - Arrow projectile
 */
export const renderArrow = (ctx, arrow) => {
  ctx.save()
  
  // Arrow color based on owner
  const arrowColor = arrow.owner === 'player' ? '#FFD700' : '#FF6B6B'
  
  // Render trail first (behind arrow)
  if (arrow.trail.length > 0) {
    arrow.trail.forEach((segment, index) => {
      const opacity = 1 - (segment.age / segment.maxAge)
      if (opacity > 0) {
        ctx.globalAlpha = opacity * 0.4
        ctx.strokeStyle = arrowColor
        ctx.lineWidth = 2
        
        if (index === 0) {
          ctx.beginPath()
          ctx.moveTo(segment.x, segment.y)
        } else {
          ctx.lineTo(segment.x, segment.y)
        }
      }
    })
    
    if (arrow.trail.length > 0) {
      ctx.lineTo(arrow.x, arrow.y)
      ctx.stroke()
    }
  }
  
  ctx.globalAlpha = 1
  
  // Translate to arrow position
  ctx.translate(arrow.x, arrow.y)
  ctx.rotate(arrow.angle)
  
  // Draw arrow shaft (line)
  ctx.strokeStyle = arrowColor
  ctx.lineWidth = 2
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(-8, 0)
  ctx.lineTo(8, 0)
  ctx.stroke()
  
  // Draw arrow head (triangle)
  ctx.fillStyle = arrowColor
  ctx.beginPath()
  ctx.moveTo(8, 0) // Point
  ctx.lineTo(4, -3) // Top left
  ctx.lineTo(4, 3) // Bottom left
  ctx.closePath()
  ctx.fill()
  
  // Draw arrow fletching (back)
  ctx.fillStyle = adjustColor(arrowColor, -30)
  ctx.beginPath()
  ctx.moveTo(-8, 0)
  ctx.lineTo(-6, -4)
  ctx.lineTo(-6, 4)
  ctx.closePath()
  ctx.fill()
  
  // Add glow effect
  ctx.strokeStyle = arrowColor
  ctx.lineWidth = 1
  ctx.globalAlpha = 0.3
  ctx.beginPath()
  ctx.arc(0, 0, 12, 0, Math.PI * 2)
  ctx.stroke()
  
  ctx.restore()
}

/**
 * Batch render all arrows
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Object[]} arrows - Array of arrow projectiles
 */
export const renderProjectiles = (ctx, arrows = []) => {
  if (!Array.isArray(arrows)) return
  
  arrows.forEach(arrow => {
    if (!arrow.hasHit || (arrow.hasHit && arrow.elapsed < 100)) {
      renderArrow(ctx, arrow)
    }
  })
}

/**
 * Update all projectiles
 * @param {Object[]} arrows - Array of arrow projectiles
 * @param {number} deltaMs - Time since last update
 * @returns {Object[]} Updated arrows
 */
export const updateProjectiles = (arrows = [], deltaMs = 33) => {
  return arrows.map(arrow => updateArrow(arrow, deltaMs))
}

/**
 * Filter out arrows that have completed their animation (hit + fade)
 * @param {Object[]} arrows - Array of arrows
 * @returns {Object[]} Active arrows
 */
export const filterCompletedArrows = (arrows = []) => {
  return arrows.filter(arrow => {
    if (!arrow.hasHit) return true // Not hit yet, keep it
    
    // If hit, keep for 100ms for visual feedback, then remove
    const timeSinceHit = arrow.elapsed - arrow.hitAt
    return timeSinceHit < 100
  })
}

/**
 * Detect collision between arrow and unit
 * Arrow hits when it reaches target area
 * @param {Object} arrow - Arrow projectile
 * @param {Object} unit - Unit to check collision with
 * @param {number} hitRadius - Collision radius (default 15)
 * @returns {boolean} True if arrow hit unit
 */
export const checkArrowCollision = (arrow, unit, hitRadius = 15) => {
  if (arrow.hasHit) return false
  if (!unit || unit.hp <= 0) return false
  
  const dist = Math.hypot(unit.x - arrow.x, unit.y - arrow.y)
  return dist < hitRadius
}

/**
 * Process arrow hits against all units
 * Returns list of arrows that hit
 * @param {Object[]} arrows - Array of arrows
 * @param {Object[]} units - Array of units to check
 * @param {number} hitRadius - Collision radius
 * @returns {Array} [arrowsHit, damageEvents]
 */
export const processArrowCollisions = (arrows = [], units = [], hitRadius = 15) => {
  const arrowsHit = []
  const damageEvents = []
  
  arrows.forEach(arrow => {
    units.forEach(unit => {
      if (checkArrowCollision(arrow, unit, hitRadius)) {
        arrow.hasHit = true
        arrow.hitAt = arrow.elapsed
        
        arrowsHit.push({
          arrow,
          target: unit,
          damage: arrow.damage,
          x: arrow.x,
          y: arrow.y,
        })
        
        damageEvents.push({
          type: 'arrow_hit',
          damage: arrow.damage,
          target: unit,
          position: { x: arrow.x, y: arrow.y },
          isArrow: true,
        })
      }
    })
  })
  
  return [arrowsHit, damageEvents]
}

/**
 * Apply damage from arrow hits
 * @param {Object[]} damageEvents - Array of damage events
 * @returns {number} Total damage applied
 */
export const applyArrowDamage = (damageEvents = []) => {
  let totalDamage = 0
  
  damageEvents.forEach(event => {
    if (event.target && event.target.hp > 0) {
      event.target.hp = Math.max(0, event.target.hp - event.damage)
      totalDamage += event.damage
    }
  })
  
  return totalDamage
}

/**
 * Utility: Adjust color brightness
 * @param {string} color - Hex color (e.g., '#FF0000')
 * @param {number} percent - Adjustment percentage (-100 to 100)
 * @returns {string} Adjusted color hex
 */
const adjustColor = (color, percent) => {
  const num = parseInt(color.replace('#', ''), 16)
  const amt = Math.round(2.55 * percent)
  const R = Math.min(255, (num >> 16) + amt)
  const G = Math.min(255, (num >> 8 & 0x00FF) + amt)
  const B = Math.min(255, (num & 0x0000FF) + amt)
  return `#${(0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 + (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1)}`
}

/**
 * Get arrow statistics
 * Useful for debugging and visualization
 */
export const getProjectileStats = (arrows = []) => {
  return {
    total: arrows.length,
    active: arrows.filter(a => !a.hasHit).length,
    hit: arrows.filter(a => a.hasHit).length,
    inFlight: arrows.filter(a => a.elapsed < a.travelTime).length,
  }
}
