/**
 * Card Database
 * All 16 cards with stats and descriptions
 */

export const CARDS = {
  // ========== TROOPS ==========

  knight: {
    id: 'knight',
    name: 'Knight',
    emoji: '🛡️',
    elixirCost: 3,
    type: 'troop',
    stats: { hp: 600, damage: 100, speed: 1, range: 50, attackSpeed: 1 },
    description: 'Melee tank with solid HP',
  },

  archer: {
    id: 'archer',
    name: 'Archer',
    emoji: '🏹',
    elixirCost: 3,
    type: 'troop',
    stats: { hp: 200, damage: 120, speed: 1.2, range: 120, attackSpeed: 1.2 },
    description: 'Ranged attacker, low HP',
  },

  giant: {
    id: 'giant',
    name: 'Giant',
    emoji: '👹',
    elixirCost: 5,
    type: 'troop',
    stats: { hp: 1800, damage: 60, speed: 0.7, range: 50, attackSpeed: 1.5, targetBuildings: true },
    description: 'Slow, tanky, targets buildings',
  },

  minions: {
    id: 'minions',
    name: 'Minions',
    emoji: '👿',
    elixirCost: 3,
    type: 'troop',
    stats: { hp: 100, damage: 80, speed: 1.4, range: 100, attackSpeed: 1, flying: true, count: 3 },
    description: 'Flying units, fast',
  },

  skeletonArmy: {
    id: 'skeletonArmy',
    name: 'Skeleton Army',
    emoji: '💀',
    elixirCost: 3,
    type: 'troop',
    stats: { hp: 60, damage: 40, speed: 1.3, range: 40, attackSpeed: 0.8, count: 10 },
    description: 'Spawns 10 weak skeletons',
  },

  babyDragon: {
    id: 'babyDragon',
    name: 'Baby Dragon',
    emoji: '🐉',
    elixirCost: 4,
    type: 'troop',
    stats: { hp: 800, damage: 120, speed: 0.9, range: 100, attackSpeed: 1.2, flying: true, splashRadius: 80 },
    description: 'Flying, splash damage',
  },

  valkyrie: {
    id: 'valkyrie',
    name: 'Valkyrie',
    emoji: '⚔️',
    elixirCost: 4,
    type: 'troop',
    stats: { hp: 900, damage: 130, speed: 0.9, range: 50, attackSpeed: 1.3, splashRadius: 100 },
    description: 'Melee, circular splash',
  },

  musketeer: {
    id: 'musketeer',
    name: 'Musketeer',
    emoji: '🤠',
    elixirCost: 4,
    type: 'troop',
    stats: { hp: 400, damage: 160, speed: 0.95, range: 140, attackSpeed: 1 },
    description: 'Long-range single target',
  },

  hogRider: {
    id: 'hogRider',
    name: 'Hog Rider',
    emoji: '🐗',
    elixirCost: 4,
    type: 'troop',
    stats: { hp: 500, damage: 150, speed: 1.5, range: 50, attackSpeed: 1.2, targetBuildings: true },
    description: 'Fast, targets buildings',
  },

  witch: {
    id: 'witch',
    name: 'Witch',
    emoji: '🧙‍♀️',
    elixirCost: 5,
    type: 'troop',
    stats: { hp: 500, damage: 100, speed: 0.85, range: 100, attackSpeed: 1.2, spawnSkeleton: true },
    description: 'Spawns skeletons, ranged',
  },

  pekka: {
    id: 'pekka',
    name: 'P.E.K.K.A',
    emoji: '🤖',
    elixirCost: 7,
    type: 'troop',
    stats: { hp: 2000, damage: 300, speed: 0.6, range: 60, attackSpeed: 1.8 },
    description: 'Extreme damage & HP',
  },

  // ========== SPELLS ==========

  fireball: {
    id: 'fireball',
    name: 'Fireball',
    emoji: '🔥',
    elixirCost: 4,
    type: 'spell',
    stats: { damage: 400, splashRadius: 120 },
    description: 'AOE spell, damages area',
  },

  arrows: {
    id: 'arrows',
    name: 'Arrows',
    emoji: '⬆️',
    elixirCost: 3,
    type: 'spell',
    stats: { damage: 200, splashRadius: 150 },
    description: 'Cheap AOE spell',
  },

  freeze: {
    id: 'freeze',
    name: 'Freeze Spell',
    emoji: '❄️',
    elixirCost: 4,
    type: 'spell',
    stats: { splashRadius: 120, freezeDuration: 2000 },
    description: 'Freezes enemies for 2s',
  },

  // ========== BUILDINGS ==========

  bombTower: {
    id: 'bombTower',
    name: 'Bomb Tower',
    emoji: '💣',
    elixirCost: 5,
    type: 'building',
    stats: { hp: 700, damage: 200, range: 130, attackSpeed: 1.2, splashRadius: 100 },
    description: 'Defensive building, splash',
  },

  cannon: {
    id: 'cannon',
    name: 'Cannon',
    emoji: '🔫',
    elixirCost: 3,
    type: 'building',
    stats: { hp: 400, damage: 150, range: 100, attackSpeed: 1 },
    description: 'Defensive building',
  },
}

/**
 * Get card by ID
 * @param {string} cardId
 * @returns {Card|null}
 */
export const getCard = cardId => CARDS[cardId] || null

/**
 * Get all cards as array
 * @returns {Card[]}
 */
export const getCardArray = () => Object.values(CARDS)

/**
 * Get cards by type
 * @param {'troop'|'spell'|'building'} type
 * @returns {Card[]}
 */
export const getCardsByType = type => getCardArray().filter(card => card.type === type)

/**
 * Get random card
 * @returns {Card}
 */
export const getRandomCard = () => {
  const cards = getCardArray()
  return cards[Math.floor(Math.random() * cards.length)]
}
