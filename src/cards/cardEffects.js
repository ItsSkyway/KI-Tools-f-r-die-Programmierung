/**
 * Card Effects
 * Spell and ability effects for special cards
 */

import { CARDS } from './cardDatabase.js'

/**
 * Handle spell effects (Fireball, Arrows, Freeze)
 * @param {Object} spell - The spell unit
 * @param {Unit[]} targetUnits - Units in splash area
 * @param {Tower[]} targetTowers - Towers in splash area
 * @returns {Object} Effect data for particles
 */
export const applySpellEffect = (spell, targetUnits = [], targetTowers = []) => {
  const card = CARDS[spell.cardId]
  const effects = []

  if (!card) return { effects }

  switch (spell.cardId) {
    case 'fireball':
      return applyFireball(spell, targetUnits, targetTowers)
    case 'arrows':
      return applyArrows(spell, targetUnits, targetTowers)
    case 'freeze':
      return applyFreeze(spell, targetUnits, targetTowers)
    default:
      return { effects }
  }
}

/**
 * Fireball: Deals damage in AOE
 */
const applyFireball = (spell, targetUnits, targetTowers) => {
  const damage = CARDS.fireball.stats.damage

  const effects = []

  // Damage units
  targetUnits.forEach(unit => {
    if (unit.owner !== spell.owner) {
      unit.hp -= damage
      effects.push({
        type: 'damage',
        value: damage,
        x: unit.x,
        y: unit.y,
      })
    }
  })

  // Damage towers
  targetTowers.forEach(tower => {
    if (tower.ownerType !== spell.owner) {
      tower.hp -= damage
      effects.push({
        type: 'damage',
        value: damage,
        x: tower.x,
        y: tower.y,
      })
    }
  })

  return {
    effects,
    particles: [
      {
        type: 'explosion',
        x: spell.x,
        y: spell.y,
        color: '#ff6600',
        size: 40,
      },
    ],
  }
}

/**
 * Arrows: Deals less damage but cheaper
 */
const applyArrows = (spell, targetUnits, targetTowers) => {
  const damage = CARDS.arrows.stats.damage

  const effects = []

  targetUnits.forEach(unit => {
    if (unit.owner !== spell.owner) {
      unit.hp -= damage
      effects.push({
        type: 'damage',
        value: damage,
        x: unit.x,
        y: unit.y,
      })
    }
  })

  targetTowers.forEach(tower => {
    if (tower.ownerType !== spell.owner) {
      tower.hp -= damage
      effects.push({
        type: 'damage',
        value: damage,
        x: tower.x,
        y: tower.y,
      })
    }
  })

  return {
    effects,
    particles: [
      {
        type: 'arrows',
        x: spell.x,
        y: spell.y,
        count: 8,
      },
    ],
  }
}

/**
 * Freeze: Stuns enemies temporarily
 */
const applyFreeze = (spell, targetUnits, targetTowers) => {
  const freezeDuration = CARDS.freeze.stats.freezeDuration

  const effects = []

  targetUnits.forEach(unit => {
    if (unit.owner !== spell.owner) {
      unit.frozen = true
      unit.frozenUntil = Date.now() + freezeDuration
      effects.push({
        type: 'freeze',
        x: unit.x,
        y: unit.y,
      })
    }
  })

  return {
    effects,
    particles: [
      {
        type: 'frost',
        x: spell.x,
        y: spell.y,
        radius: CARDS.freeze.stats.splashRadius,
      },
    ],
  }
}

/**
 * Handle special unit abilities (Witch spawns skeletons, etc)
 */
export const applyUnitAbility = (unit, gameState) => {
  const card = CARDS[unit.cardId]

  if (!card) return { units: [] }

  const newUnits = []

  if (card.id === 'witch' && unit.stats.spawnSkeleton) {
    // Periodically spawn skeleton
    const now = Date.now()
    if (!unit.lastSkeletonSpawn) {
      unit.lastSkeletonSpawn = now
    }

    if (now - unit.lastSkeletonSpawn > 3000) {
      // Spawn skeleton every 3 seconds
      newUnits.push({
        cardId: 'skeleton',
        owner: unit.owner,
        x: unit.x + (Math.random() - 0.5) * 50,
        y: unit.y + (Math.random() - 0.5) * 50,
        hp: 60,
        maxHp: 60,
        stats: { damage: 40, range: 40, speed: 1.3, attackSpeed: 0.8 },
      })
      unit.lastSkeletonSpawn = now
    }
  }

  return { units: newUnits }
}

/**
 * Handle damage-dealing effects
 * @param {Unit} attacker
 * @param {Unit|Tower} target
 * @returns {Object} Damage and effect info
 */
export const calculateDamage = (attacker, target) => {
  let damage = attacker.stats.damage || 0

  // Apply modifiers based on attacker type
  if (attacker.cardId === 'pekka') {
    damage *= 1.2 // PEKKA has slightly boosted damage
  }

  // Tower damage reduction? (optional)
  if (target.isKing) {
    // King towers are slightly more resilient
    damage *= 0.95
  }

  return {
    damage: Math.floor(damage),
    isCritical: Math.random() < 0.05, // 5% crit chance
  }
}

/**
 * Check if card has splash damage
 */
export const hasSplash = cardId => {
  const card = CARDS[cardId]
  return card && card.stats.splashRadius > 0
}

/**
 * Get units/towers in splash radius
 */
export const getUnitsInRadius = (units, x, y, radius) => {
  return units.filter(unit => {
    const dist = Math.hypot(unit.x - x, unit.y - y)
    return dist <= radius
  })
}
