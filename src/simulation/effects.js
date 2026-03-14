/**
 * Effects System
 * Particle effects, animations, floating damage, projectiles, screen shake
 */

/**
 * Create a new effect
 * @param {string} type - 'damage', 'heal', 'freeze', 'hit', etc.
 * @param {number} x
 * @param {number} y
 * @param {number} value - Damage/heal amount
 * @returns {Effect}
 */
export const createEffect = (type, x, y, value = 0) => {
  return {
    id: `effect_${Date.now()}_${Math.random()}`,
    type,
    x,
    y,
    value,
    createdAt: Date.now(),
    duration: 500, // ms to display
  }
}

/**
 * Create projectile (spell traveling to target)
 */
export const createProjectile = (startX, startY, endX, endY, spellType = 'fireball', duration = 300) => {
  return {
    id: `projectile_${Date.now()}_${Math.random()}`,
    type: 'projectile',
    startX,
    startY,
    endX,
    endY,
    spellType,
    createdAt: Date.now(),
    duration, // Travel time in ms
    progress: 0,
  }
}

/**
 * Create destruction effect (tower destroyed)
 */
export const createDestructionEffect = (x, y, type = 'tower') => {
  return {
    id: `destruction_${Date.now()}_${Math.random()}`,
    type: 'destruction',
    x,
    y,
    targetType: type,
    createdAt: Date.now(),
    duration: 600,
    flashCount: 0,
    lastFlashTime: Date.now(),
  }
}

/**
 * Create screen shake effect
 */
export const createScreenShake = (intensity = 5, duration = 150) => {
  return {
    id: `shake_${Date.now()}_${Math.random()}`,
    type: 'shake',
    intensity,
    createdAt: Date.now(),
    duration,
    offsetX: 0,
    offsetY: 0,
  }
}

/**
 * Create card play animation
 */
export const createCardPlayAnimation = (cardX, cardY, targetX, targetY, duration = 400) => {
  return {
    id: `cardPlay_${Date.now()}_${Math.random()}`,
    type: 'cardPlay',
    startX: cardX,
    startY: cardY,
    endX: targetX,
    endY: targetY,
    createdAt: Date.now(),
    duration,
    progress: 0,
  }
}

/**
 * Create damage effect (floating number)
 */
export const createDamageEffect = (damage, x, y, isCritical = false) => {
  return {
    id: `effect_${Date.now()}_${Math.random()}`,
    type: 'damage',
    x,
    y,
    value: damage,
    createdAt: Date.now(),
    duration: 1000,
    isCritical,
    color: isCritical ? '#ff6600' : '#ff0000',
  }
}

/**
 * Create heal effect
 */
export const createHealEffect = (amount, x, y) => {
  return {
    id: `effect_${Date.now()}_${Math.random()}`,
    type: 'heal',
    x,
    y,
    value: amount,
    createdAt: Date.now(),
    duration: 800,
    color: '#00ff00',
  }
}

/**
 * Create freeze effect
 */
export const createFreezeEffect = (x, y) => {
  return {
    id: `effect_${Date.now()}_${Math.random()}`,
    type: 'freeze',
    x,
    y,
    createdAt: Date.now(),
    duration: 600,
  }
}

/**
 * Create explosion effect
 */
export const createExplosionEffect = (x, y) => {
  return {
    id: `effect_${Date.now()}_${Math.random()}`,
    type: 'explosion',
    x,
    y,
    createdAt: Date.now(),
    duration: 400,
    size: 60,
  }
}

/**
 * Create hit effect (screen shake, flash)
 */
export const createHitEffect = (x, y) => {
  return {
    id: `effect_${Date.now()}_${Math.random()}`,
    type: 'hit',
    x,
    y,
    createdAt: Date.now(),
    duration: 100,
    intensity: 2,
  }
}

/**
 * Get all active effects
 */
export const getActiveEffects = effects => {
  const now = Date.now()
  return effects.filter(effect => now - effect.createdAt < effect.duration)
}

/**
 * Remove expired effects
 */
export const removeExpiredEffects = effects => {
  return getActiveEffects(effects)
}

/**
 * Get effect progress (0-1)
 */
export const getEffectProgress = effect => {
  const now = Date.now()
  const age = now - effect.createdAt
  const progress = Math.min(1, age / effect.duration)
  return progress
}

/**
 * Get effect opacity (fades out)
 */
export const getEffectOpacity = effect => {
  const progress = getEffectProgress(effect)
  return 1 - progress
}

/**
 * Update projectile position
 */
export const updateProjectile = projectile => {
  const now = Date.now()
  const age = now - projectile.createdAt
  const progress = Math.min(1, age / projectile.duration)

  const currentX = projectile.startX + (projectile.endX - projectile.startX) * progress
  const currentY = projectile.startY + (projectile.endY - projectile.startY) * progress

  return { ...projectile, progress, x: currentX, y: currentY }
}

/**
 * Update screen shake effect
 */
export const updateScreenShake = shake => {
  const progress = getEffectProgress(shake)
  const strength = shake.intensity * (1 - progress) // Fade out shake

  return {
    ...shake,
    offsetX: (Math.random() - 0.5) * strength * 2,
    offsetY: (Math.random() - 0.5) * strength * 2,
  }
}

/**
 * Apply particle effect to canvas
 * @param {CanvasRenderingContext2D} ctx
 * @param {Effect} effect
 */
export const renderEffect = (ctx, effect) => {
  const opacity = getEffectOpacity(effect)
  const progress = getEffectProgress(effect)

  ctx.save()
  ctx.globalAlpha = opacity

  switch (effect.type) {
    case 'damage':
      renderDamageEffect(ctx, effect, progress)
      break
    case 'heal':
      renderHealEffect(ctx, effect, progress)
      break
    case 'explosion':
      renderExplosionEffect(ctx, effect, progress)
      break
    case 'freeze':
      renderFreezeEffect(ctx, effect, progress)
      break
  }

  ctx.restore()
}

/**
 * Render projectile
 */
export const renderProjectile = (ctx, projectile) => {
  ctx.save()

  ctx.fillStyle = '#ff9900'
  if (projectile.spellType === 'freeze') {
    ctx.fillStyle = '#66ccff'
  } else if (projectile.spellType === 'arrow') {
    ctx.fillStyle = '#ffcc66'
  }

  // Draw projectile as moving circle
  ctx.beginPath()
  ctx.arc(projectile.x, projectile.y, 6, 0, Math.PI * 2)
  ctx.fill()

  // Add glow effect
  ctx.strokeStyle = ctx.fillStyle
  ctx.lineWidth = 2
  ctx.globalAlpha = 0.5
  ctx.beginPath()
  ctx.arc(projectile.x, projectile.y, 12, 0, Math.PI * 2)
  ctx.stroke()

  ctx.restore()
}

/**
 * Render destruction effect
 */
export const renderDestructionEffect = (ctx, effect) => {
  const progress = getEffectProgress(effect)
  const flashIntensity = Math.sin(progress * Math.PI * 6) * 0.5 + 0.5 // Oscillate

  ctx.save()
  ctx.globalAlpha = flashIntensity

  // Flash effect
  ctx.fillStyle = '#ff3333'
  ctx.beginPath()
  ctx.arc(effect.x, effect.y, 25, 0, Math.PI * 2)
  ctx.fill()

  // Shake particles
  for (let i = 0; i < 3; i++) {
    const angle = (i / 3) * Math.PI * 2
    const distance = (1 - progress) * 20
    const px = effect.x + Math.cos(angle) * distance
    const py = effect.y + Math.sin(angle) * distance

    ctx.fillStyle = '#ff6600'
    ctx.globalAlpha = (1 - progress) * 0.7
    ctx.fillRect(px - 3, py - 3, 6, 6)
  }

  ctx.restore()
}

/**
 * Render screen shake offset
 */
export const applyScreenShake = (ctx, shakes) => {
  if (!shakes || shakes.length === 0) return { x: 0, y: 0 }

  const activeShakes = shakes.filter(s => Date.now() - s.createdAt < s.duration)
  if (activeShakes.length === 0) return { x: 0, y: 0 }

  const totalOffsetX = activeShakes.reduce((sum, s) => sum + s.offsetX, 0)
  const totalOffsetY = activeShakes.reduce((sum, s) => sum + s.offsetY, 0)

  ctx.translate(totalOffsetX, totalOffsetY)

  return { x: totalOffsetX, y: totalOffsetY }
}

const renderDamageEffect = (ctx, effect, progress) => {
  const y = effect.y - progress * 30
  const size = 16 + progress * 4

  ctx.fillStyle = effect.color || '#ff0000'
  ctx.font = `bold ${size}px Arial`
  ctx.textAlign = 'center'
  ctx.fillText(effect.value, effect.x, y)

  if (effect.isCritical) {
    ctx.strokeStyle = effect.color
    ctx.lineWidth = 2
    ctx.strokeText(effect.value, effect.x, y)
  }
}

const renderHealEffect = (ctx, effect, progress) => {
  const y = effect.y - progress * 25
  const size = 14

  ctx.fillStyle = '#00ff00'
  ctx.font = `bold ${size}px Arial`
  ctx.textAlign = 'center'
  ctx.fillText('+' + effect.value, effect.x, y)
}

const renderExplosionEffect = (ctx, effect, progress) => {
  const size = effect.size * (1 - progress)
  const radius = size / 2

  ctx.fillStyle = `rgba(255, 100, 0, ${1 - progress})`
  ctx.beginPath()
  ctx.arc(effect.x, effect.y, radius, 0, Math.PI * 2)
  ctx.fill()

  // Outer ring
  ctx.strokeStyle = `rgba(255, 200, 0, ${1 - progress})`
  ctx.lineWidth = 2
  ctx.stroke()
}

const renderFreezeEffect = (ctx, effect, progress) => {
  const radius = 50 * (1 - progress)

  ctx.strokeStyle = `rgba(100, 200, 255, ${1 - progress})`
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.arc(effect.x, effect.y, radius, 0, Math.PI * 2)
  ctx.stroke()
}

/**
 * Particle system (for more complex effects)
 */
export const createParticleSystem = (type, x, y, count = 10) => {
  const particles = []

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2
    const velocity = 100 + Math.random() * 150

    particles.push({
      x,
      y,
      vx: Math.cos(angle) * velocity,
      vy: Math.sin(angle) * velocity,
      life: 1,
      size: 4 + Math.random() * 4,
      type,
    })
  }

  return particles
}

/**
 * Update particles (physics simulation)
 */
export const updateParticles = (particles, deltaMs) => {
  const deltaS = deltaMs / 1000

  return particles
    .map(p => ({
      ...p,
      x: p.x + p.vx * deltaS,
      y: p.y + p.vy * deltaS,
      vy: p.vy + 200 * deltaS, // gravity
      life: p.life - deltaS,
    }))
    .filter(p => p.life > 0)
}
