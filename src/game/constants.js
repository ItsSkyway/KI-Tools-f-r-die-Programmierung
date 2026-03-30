/**
 * Game Constants
 * All magic numbers and configuration values in one place
 */

// ============================================================================
// ARENA & RENDERING - CLASH ROYALE ACCURATE
// ============================================================================

export const GAME_WIDTH = 600
export const GAME_HEIGHT = 800
export const ARENA_WIDTH = 600
export const ARENA_HEIGHT = 800

// River divides the arena at y=400
export const RIVER_Y = 400
export const RIVER_WIDTH = 200 // Center lane (x: 200-400)

// Territories
export const ENEMY_TERRITORY_START = 0
export const ENEMY_TERRITORY_END = 400
export const PLAYER_TERRITORY_START = 400
export const PLAYER_TERRITORY_END = 800

// Three-Lane System (Clash Royale accurate)
export const LANES = {
  left: {
    id: 'left',
    x: 100, // Center of left lane (x: 0-200)
    minX: 0,
    maxX: 200,
    color: '#2a5f7f',
  },
  center: {
    id: 'center',
    x: 300, // Center of center lane (x: 200-400)
    minX: 200,
    maxX: 400,
    color: '#3a6f8f',
  },
  right: {
    id: 'right',
    x: 500, // Center of right lane (x: 400-600)
    minX: 400,
    maxX: 600,
    color: '#2a5f7f',
  },
}

// Bridge Crossings (Units können nur über Brücken das River überqueren)
export const BRIDGES = {
  left: {
    x: 150, // Left bridge crossing point
    y: RIVER_Y,
    width: 80,
    height: 40,
  },
  right: {
    x: 450, // Right bridge crossing point
    y: RIVER_Y,
    width: 80,
    height: 40,
  },
}

// River collision zone
export const RIVER_ZONE = {
  startY: RIVER_Y - 20,
  endY: RIVER_Y + 20,
}

// ============================================================================
// GAME LOOP & TIMING
// ============================================================================

export const TARGET_FPS = 30
export const FRAME_TIME = 1000 / TARGET_FPS // ~33ms per frame
export const DOUBLE_ELIXIR_TIME = 180000 // 3 minutes in ms

// ============================================================================
// ELIXIR SYSTEM
// ============================================================================

export const MAX_ELIXIR = 10
export const ELIXIR_REGENERATION_RATE = 1 // per second
export const ELIXIR_REGENERATION_RATE_DOUBLE = 2 // per second during double elixir

// ============================================================================
// TOWERS
// ============================================================================

// ============================================================================
// TOWERS - CLASH ROYALE 3-LANE ACCURATE
// ============================================================================

export const TOWER_POSITIONS = {
  player: {
    kingTower: {
      x: LANES.center.x, // 300 - Center lane
      y: ARENA_HEIGHT - 60,
      isKing: true,
      lane: 'center',
    },
    princessLeft: {
      x: LANES.left.x, // 100 - Left lane
      y: ARENA_HEIGHT - 120,
      isKing: false,
      lane: 'left',
    },
    princessRight: {
      x: LANES.right.x, // 500 - Right lane
      y: ARENA_HEIGHT - 120,
      isKing: false,
      lane: 'right',
    },
  },
  enemy: {
    kingTower: {
      x: LANES.center.x, // 300 - Center lane
      y: 60,
      isKing: true,
      lane: 'center',
    },
    princessLeft: {
      x: LANES.left.x, // 100 - Left lane
      y: 120,
      isKing: false,
      lane: 'left',
    },
    princessRight: {
      x: LANES.right.x, // 500 - Right lane
      y: 120,
      isKing: false,
      lane: 'right',
    },
  },
}

export const INITIAL_TOWER_HP = {
  king: 3500,
  princess: 1800,
}

export const TOWER_STATS = {
  king: {
    range: 400,
    damage: 100,
    attackSpeed: 0.8,
    splashRadius: 0,
  },
  princess: {
    range: 350,
    damage: 80,
    attackSpeed: 0.8,
    splashRadius: 0,
  },
}

// ============================================================================
// COMBAT & PHYSICS
// ============================================================================

export const DEFAULT_UNIT_RANGE = 100
export const DEFAULT_ATTACK_SPEED = 1
export const DEFAULT_SPEED = 1

export const COLLISION_THRESHOLD = 30 // pixels for collision detection

// ============================================================================
// UNIT SPAWNING
// ============================================================================

export const UNIT_SPAWN_DELAY = 300 // ms between spawns of same unit
export const DEFAULT_UNIT_SPAWN_Y_OFFSET = 50 // distance from lane start

// ============================================================================
// BOT AI
// ============================================================================

export const BOT_DECISION_INTERVAL = 1000 // ms between bot decisions
export const BOT_REACTION_TIME = {
  easy: 2000,
  medium: 1000,
  hard: 500,
}

// ============================================================================
// GAME STATES
// ============================================================================

export const GAME_STATES = {
  DECK_BUILDER: 'deckBuilder',
  PLAYING: 'playing',
  GAME_OVER: 'gameOver',
}

export const PLAYER_TYPES = {
  HUMAN: 'human',
  BOT: 'bot',
}

export const DIFFICULTY_LEVELS = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
}

// ============================================================================
// CARD HAND
// ============================================================================

export const HAND_SIZE = 4 // Cards in hand at once
export const HAND_MAX_DECK_SIZE = 8 // Total cards in deck
export const HAND_CARD_WIDTH = 60
export const HAND_CARD_HEIGHT = 80

// ============================================================================
// ANIMATION & EFFECTS
// ============================================================================

export const EFFECT_DURATION = 500 // ms for particles/effects
export const DAMAGE_TEXT_DURATION = 1000 // ms for floating damage numbers

// ============================================================================
// SCREEN DIMENSIONS
// ============================================================================

export const HEADER_HEIGHT = 60 // For stats display
export const FOOTER_HEIGHT = 120 // For card hand
export const PLAYABLE_HEIGHT = ARENA_HEIGHT - HEADER_HEIGHT - FOOTER_HEIGHT
