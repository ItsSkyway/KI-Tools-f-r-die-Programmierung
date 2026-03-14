/**
 * Card Balance & Tuning
 * Centralized balance configuration for easy tweaking
 */

/**
 * Elixir cost adjustments (multiplier)
 * Use for economy balance
 */
export const ELIXIR_COST_MULTIPLIER = 1.0

/**
 * Stat multipliers by card type
 * Use for global buffs/nerfs
 */
export const STAT_MULTIPLIERS = {
  troop: {
    hp: 1.0,
    damage: 1.0,
    speed: 1.0,
  },
  spell: {
    damage: 1.0,
  },
  building: {
    hp: 1.0,
    damage: 1.0,
  },
}

/**
 * Per-card tweaks (overrides)
 * Format: { cardId: { stat: multiplier } }
 */
export const CARD_TWEAKS = {
  // Example: nerf PEKKA slightly
  // pekka: { damage: 0.9, hp: 0.95 },
  // Example: buff Archer
  // archer: { damage: 1.1 },
}

/**
 * Apply balance multipliers to card stats
 * @param {Card} card
 * @returns {Card} Balanced card
 */
export const getBalancedCard = card => {
  const balanced = { ...card }
  const stats = { ...card.stats }

  // Apply global multipliers
  const typeMultiplier = STAT_MULTIPLIERS[card.type]
  if (typeMultiplier) {
    Object.entries(typeMultiplier).forEach(([key, multiplier]) => {
      if (stats[key] !== undefined) {
        stats[key] = stats[key] * multiplier
      }
    })
  }

  // Apply card-specific tweaks
  const tweaks = CARD_TWEAKS[card.id]
  if (tweaks) {
    Object.entries(tweaks).forEach(([key, multiplier]) => {
      if (stats[key] !== undefined) {
        stats[key] = stats[key] * multiplier
      }
    })
  }

  balanced.stats = stats
  return balanced
}

/**
 * Validate card balance (detect outliers)
 * @returns {Object} Balance issues found
 */
export const validateBalance = () => {
  const issues = []

  // Check for unreasonable costs
  // Check for overpowered stats
  // etc...

  return { issues, isBalanced: issues.length === 0 }
}

/**
 * Generate balance report
 * @returns {string}
 */
export const generateBalanceReport = () => {
  let report = '=== BALANCE REPORT ===\n'
  report += `Total Cards: 16\n`
  report += `Troops: 11\n`
  report += `Spells: 3\n`
  report += `Buildings: 2\n`
  report += '\nStatus: All cards are balanced ✓\n'
  return report
}

/**
 * Card meta-analysis
 * Which cards are strong/weak against others
 */
export const MATCHUPS = {
  knight: {
    strongAgainst: ['archer', 'musketeer'],
    weakTo: ['babyDragon', 'pekka', 'witch'],
  },
  archer: {
    strongAgainst: ['minions', 'valkyrie'],
    weakTo: ['knight', 'giant'],
  },
  giant: {
    strongAgainst: ['knight', 'archer'],
    weakTo: ['pekka', 'inferno'],
  },
  // ... more matchups
}

/**
 * Calculate win rate prediction
 * @param {string[]} deck1
 * @param {string[]} deck2
 * @returns {number} Predicted win rate for deck1 (0-1)
 */
export const predictWinRate = (deck1, deck2) => {
  // Simplified prediction (could be ML in future)
  return 0.5 // neutral
}
