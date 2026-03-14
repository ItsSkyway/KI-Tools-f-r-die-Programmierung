/**
 * Game Constants
 * All magic numbers and configuration values in one place
 */

// ============================================================================
// ARENA & RENDERING
// ============================================================================

export const GAME_WIDTH = 600
export const GAME_HEIGHT = 800
export const ARENA_WIDTH = 600
export const ARENA_HEIGHT = 800

export const LANE_WIDTH = 300
export const LANE_HEIGHT = 400

// Two lanes: top & bottom
export const LANES = {
  top: { startX: 0, startY: 0, centerX: LANE_WIDTH / 2, centerY: LANE_HEIGHT / 2 },
  bottom: { startX: LANE_WIDTH, startY: 0, centerX: LANE_WIDTH / 2 + LANE_WIDTH, centerY: LANE_HEIGHT / 2 },
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

export const TOWER_POSITIONS = {
  player: {
    kingTower: { x: ARENA_WIDTH / 2, y: ARENA_HEIGHT - 60, isKing: true },
    princessLeft: { x: LANE_WIDTH / 2 - 80, y: ARENA_HEIGHT - 120 },
    princessRight: { x: LANE_WIDTH / 2 + 80, y: ARENA_HEIGHT - 120 },
  },
  enemy: {
    kingTower: { x: ARENA_WIDTH / 2, y: 60, isKing: true },
    princessLeft: { x: LANE_WIDTH / 2 - 80, y: 120 },
    princessRight: { x: LANE_WIDTH / 2 + 80, y: 120 },
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
