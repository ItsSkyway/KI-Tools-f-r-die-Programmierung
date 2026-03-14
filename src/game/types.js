/**
 * Type Definitions (JSDoc)
 * Comprehensive type documentation for all game objects
 */

// ============================================================================
// CARD TYPES
// ============================================================================

/**
 * @typedef {Object} CardStats
 * @property {number} [hp] - Health points
 * @property {number} [damage] - Damage per hit
 * @property {number} [speed] - Movement speed (pixels/ms)
 * @property {number} [range] - Attack range (pixels)
 * @property {number} [attackSpeed] - Attacks per second
 * @property {number} [splashRadius] - Splash damage radius
 * @property {boolean} [flying] - Can fly over obstacles
 * @property {boolean} [targetBuildings] - Targets buildings/towers
 * @property {boolean} [spawnSkeleton] - Spawns skeletons
 * @property {number} [count] - Number of units spawned
 */

/**
 * @typedef {Object} Card
 * @property {string} id - Unique card identifier
 * @property {string} name - Display name
 * @property {string} emoji - Card emoji/icon
 * @property {number} elixirCost - Cost to play
 * @property {'troop'|'spell'|'building'} type - Card type
 * @property {CardStats} stats - Card statistics
 * @property {string} description - Card description
 */

// ============================================================================
// UNIT TYPES
// ============================================================================

/**
 * @typedef {Object} Unit
 * @property {string} id - Unique unit ID (uuid)
 * @property {string} cardId - Which card spawned this unit
 * @property {string} owner - 'player' or 'enemy'
 * @property {'troop'|'spell'|'building'} type - Unit type
 * @property {number} x - X position (pixels)
 * @property {number} y - Y position (pixels)
 * @property {number} hp - Current health
 * @property {number} maxHp - Maximum health
 * @property {number} lastAttackTime - Timestamp of last attack
 * @property {Unit|Tower|Building} [target] - Current target
 * @property {boolean} [isFlying] - Can fly
 * @property {CardStats} stats - Copy of card stats
 * @property {number} spawnTime - When unit was created
 */

/**
 * @typedef {Object} Tower
 * @property {string} id - Tower identifier
 * @property {string} ownerType - 'player' or 'enemy'
 * @property {'king'|'princess'} type - Tower type
 * @property {number} x - X position
 * @property {number} y - Y position
 * @property {number} hp - Current health
 * @property {number} maxHp - Maximum health
 * @property {number} range - Attack range
 * @property {number} damage - Damage per attack
 * @property {number} attackSpeed - Attacks per second
 * @property {number} lastAttackTime - Timestamp of last attack
 * @property {boolean} [isKing] - Is this the king tower
 * @property {Unit} [target] - Current attack target
 */

/**
 * @typedef {Object} Building
 * @property {string} id - Building ID
 * @property {string} owner - 'player' or 'enemy'
 * @property {'bomb'|'cannon'} type - Building type
 * @property {number} x - X position
 * @property {number} y - Y position
 * @property {number} hp - Current health
 * @property {number} maxHp - Maximum health
 * @property {number} range - Attack range
 * @property {number} damage - Damage per attack
 * @property {number} attackSpeed - Attacks per second
 * @property {number} splashRadius - Splash damage radius
 * @property {number} lastAttackTime - Timestamp of last attack
 * @property {Unit} [target] - Current attack target
 */

// ============================================================================
// GAME STATE TYPES
// ============================================================================

/**
 * @typedef {Object} PlayerState
 * @property {string} type - 'human' or 'bot'
 * @property {string} difficulty - 'easy', 'medium', 'hard' (bot only)
 * @property {number} hp - Current king tower HP
 * @property {number} maxHp - Maximum HP
 * @property {number} elixir - Current elixir
 * @property {number} maxElixir - Maximum elixir
 * @property {string[]} deck - Array of card IDs in deck
 * @property {string[]} hand - Current 4 cards in hand
 * @property {number} handIndex - Next card to cycle in
 * @property {Tower[]} towers - All towers (king + 2 princesses)
 * @property {Unit[]} troops - Spawned troops
 * @property {Building[]} buildings - Placed buildings
 */

/**
 * @typedef {Object} GameState
 * @property {'deckBuilder'|'playing'|'gameOver'} screen - Current screen
 * @property {PlayerState} player - Human player state
 * @property {PlayerState} enemy - Bot/enemy state
 * @property {Unit[]} allUnits - All units on board
 * @property {Effect[]} effects - Active effects/particles
 * @property {number} gameTime - Elapsed time in seconds
 * @property {number} gameStartTime - Timestamp when game started
 * @property {boolean} isDoubleElixir - Is double elixir active
 * @property {string|null} winner - 'player', 'enemy', or null if ongoing
 * @property {string} selectedCard - Card being played (for preview)
 */

/**
 * @typedef {Object} Effect
 * @property {string} id - Effect ID
 * @property {'damage'|'heal'|'stun'|'particle'} type - Effect type
 * @property {number} x - X position
 * @property {number} y - Y position
 * @property {number} value - Damage/heal amount
 * @property {number} createdAt - Timestamp created
 * @property {number} duration - How long to show (ms)
 */

// ============================================================================
// ACTION TYPES
// ============================================================================

/**
 * @typedef {Object} PlayCardAction
 * @property {'playCard'} type
 * @property {string} cardId - Which card to play
 * @property {number} x - Spawn X position
 * @property {number} y - Spawn Y position
 */

/**
 * @typedef {Object} SelectDeckAction
 * @property {'selectDeck'} type
 * @property {string[]} cardIds - Array of 8 card IDs
 */

// ============================================================================
// BOT AI TYPES
// ============================================================================

/**
 * @typedef {Object} BotStrategy
 * @property {'aggressive'|'defensive'|'balanced'} style
 * @property {number} cardPlayThreshold - Elixir threshold to play cards
 * @property {number} defendThreshold - Health threshold to prioritize defense
 * @property {number} reactionTime - ms to wait before acting
 */

/**
 * @typedef {Object} AIDecision
 * @property {boolean} shouldPlay - Should play a card
 * @property {string} [cardId] - Which card to play
 * @property {number} [x] - Spawn X
 * @property {number} [y] - Spawn Y
 */
