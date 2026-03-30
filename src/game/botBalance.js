/**
 * Bot AI - Balance & Tuning Spreadsheet
 * All magic numbers with rationale and tuning guide
 */

// ============================================================================
// EASY BOT - TUNING TABLE
// ============================================================================

const EASY_BOT_BALANCE = {
  // Play Rate (How often bot makes decisions)
  PLAY_INTERVAL_MIN: 5000,        // [MIN 2000] Default: 5 seconds minimum
  PLAY_INTERVAL_MAX: 8000,        // [MAX 12000] Default: 8 seconds maximum
  // Rationale: Slow play is predictable. Player has time to counter.
  // Tuning: Increase both to slow down. Decrease to speed up.

  // Reaction Time (Delay before executing decision)
  REACTION_TIME_MIN: 1500,        // [MIN 200] Default: 1.5 seconds minimum
  REACTION_TIME_MAX: 2500,        // [MAX 3000] Default: 2.5 seconds maximum
  // Rationale: Long delay telegraphs move. Player can see it coming.
  // Tuning: Increase to make more obvious. Decrease to make threatening.

  // Sleep Mechanic (Chance bot enters WAITING state)
  SLEEP_CHANCE: 0.20,            // [RANGE 0.0-0.5] Default: 20%
  SLEEP_DURATION: 10000,         // [MIN 5000] Default: 10 seconds
  // Rationale: Sleep makes bot feel lazy/beatable. Satisfying to exploit.
  // Tuning: Increase to make easier. Decrease to remove randomness.

  // Card Selection
  RANDOMNESS: 1.0,               // [RANGE 0.0-1.0] Default: 100%
  // Rationale: 100% random = no strategy = easy to beat
  // Tuning: Keep at 1.0 for difficulty preservation

  // Positioning
  POSITION_MIN_X: 150,
  POSITION_MAX_X: 450,
  POSITION_MIN_Y: 100,
  POSITION_MAX_Y: 300,
  // Rationale: Full-random positioning in playable area
  // Tuning: Keep random for easy difficulty

  // Expected Stats
  WIN_RATE_TARGET: 0.20,         // 20% win rate = loses 4 of 5
  AVG_PLAYS_PER_MINUTE: 8,       // 5-8 sec interval = ~7.5 plays/min
  THREAT_RESPONSE_RATE: 0.0,     // Never responds to threats
}

// ============================================================================
// MEDIUM BOT - TUNING TABLE
// ============================================================================

const MEDIUM_BOT_BALANCE = {
  // Play Rate
  PLAY_INTERVAL_MIN: 3000,       // [MIN 1500] Default: 3 seconds
  PLAY_INTERVAL_MAX: 5000,       // [MAX 8000] Default: 5 seconds
  // Rationale: Medium speed = competitive gameplay
  // Tuning: Increase for slower play. Decrease for faster play.

  // Reaction Time
  REACTION_TIME_MIN: 800,        // [MIN 300] Default: 0.8 seconds
  REACTION_TIME_MAX: 1200,       // [MAX 2000] Default: 1.2 seconds
  // Rationale: Fair delay = player has reaction window
  // Tuning: Increase to be more predictable. Decrease to be threatening.

  // Card Selection Strategy
  RANDOMNESS_THRESHOLD: 0.50,    // [RANGE 0.0-1.0] Default: 50%
  // Rationale: 50/50 split between random and strategic
  // Tuning: Increase to ~0.7 for easier. Decrease to ~0.3 for harder.

  HIGH_VALUE_THRESHOLD: 7,       // [MIN 3, MAX 10] Elixir at which to prefer high-value
  // Rationale: At 7+ elixir, prefer expensive cards
  // Tuning: Decrease to 5 for more aggressive. Increase to 8 for passive.

  // Threat Response
  THREAT_RESPONSE_CHANCE: 0.50,  // [RANGE 0.0-1.0] Default: 50%
  // Rationale: 50% of threats get response = sometimes gets caught off guard
  // Tuning: Increase to 0.75 for harder. Decrease to 0.25 for easier.

  // Elixir Advantage Detection
  ELIXIR_ADVANTAGE_THRESHOLD: 2, // [MIN 1, MAX 4] How much ahead triggers OFFENSE
  // Rationale: 2+ elixir ahead = attack opportunity
  // Tuning: Decrease to 1 for more aggressive. Increase to 3 for passive.

  // Health Thresholds for DEFENSIVE state
  HEAVY_ATTACK_HP_THRESHOLD: 2500, // [MIN 1500, MAX 3000] Below = DEFENSIVE
  // Rationale: Below 2500 HP = under heavy attack
  // Tuning: Increase for more defensive play. Decrease for more risky play.

  MANY_UNITS_THRESHOLD: 3,       // [MIN 2, MAX 5] Enemy unit count triggers DEFENSIVE
  // Rationale: 3+ enemy units = many units
  // Tuning: Decrease to 2 for more defensive. Increase to 4 for more offensive.

  // Expected Stats
  WIN_RATE_TARGET: 0.50,         // 50% win rate = true 50/50 matchup
  AVG_PLAYS_PER_MINUTE: 15,      // 3-5 sec interval = ~14 plays/min
  THREAT_RESPONSE_RATE: 0.50,    // Responds to 50% of threats
}

// ============================================================================
// HARD BOT - TUNING TABLE
// ============================================================================

const HARD_BOT_BALANCE = {
  // Play Rate
  PLAY_INTERVAL_MIN: 2000,       // [MIN 1000] Default: 2 seconds
  PLAY_INTERVAL_MAX: 3000,       // [MAX 5000] Default: 3 seconds
  // Rationale: Fast play = reactive threat
  // Tuning: Decrease for super aggressive. Increase for slower expert.

  // Reaction Time
  REACTION_TIME_MIN: 200,        // [MIN 0] Default: 0.2 seconds (instant feeling)
  REACTION_TIME_MAX: 500,        // [MAX 1000] Default: 0.5 seconds
  // Rationale: Minimal delay = feels threatening
  // Tuning: Decrease for even faster. Increase to tone down.

  // Card Selection Strategy
  COUNTER_EFFECTIVENESS: 0.95,   // [RANGE 0.8-1.0] Default: 95% accurate counters
  // Rationale: 95% of threats get optimal counter
  // Tuning: Decrease to 0.85 to make beatable. Increase to 1.0 for perfect.

  // Threat Analysis Thresholds
  IMMEDIATE_THREAT_HP: 1500,     // [MIN 1000, MAX 2000] Below = immediate threat
  // Rationale: Below 1500 HP = king tower in danger
  // Tuning: Increase to be more defensive. Decrease to be more aggressive.

  MANY_UNITS_THRESHOLD: 4,       // [MIN 3, MAX 6] Enemy units = MANY
  // Rationale: 4+ units = deploy AOE
  // Tuning: Decrease to trigger AOE more often. Increase for less AOE.

  AOE_SPLASH_MIN: 80,            // [MIN 50, MAX 120] Splash radius for AOE classification
  // Rationale: 80+ radius = worth using for clearing
  // Tuning: Decrease to classify more spells as AOE.

  // Game Phase Awareness
  EARLY_PHASE_END: 120,          // [MIN 60, MAX 180] Seconds when early phase ends
  // Rationale: First 2 minutes = learning phase
  // Tuning: Decrease to switch to mid-game faster.

  MID_PHASE_END: 60,             // [MIN 30, MAX 120] Seconds when mid phase ends
  // Rationale: Last minute = finishing phase
  // Tuning: Increase to extend mid-game. Decrease for earlier finish.

  // Defensive Positioning
  DEFEND_HP_THRESHOLD: 2500,     // [MIN 1500, MAX 3000] HP to trigger defensive placement
  KING_TOWER_RANGE: 400,         // [MIN 300, MAX 500] Range to place defensive buildings

  // Offensive Positioning
  ATTACK_HP_THRESHOLD: 2800,     // [MIN 2000, MAX 3000] HP to trigger offensive play
  CENTER_PUSH_CHANCE: 0.70,      // [RANGE 0.5-1.0] Chance to push center lane

  // Expected Stats
  WIN_RATE_TARGET: 0.70,         // 70%+ win rate = dominates
  AVG_PLAYS_PER_MINUTE: 22,      // 2-3 sec interval = ~23 plays/min
  THREAT_RESPONSE_RATE: 1.0,     // Always responds to threats
  COUNTER_SUCCESS_RATE: 0.95,    // 95% counter effectiveness
}

// ============================================================================
// SHARED PARAMETERS (All Difficulties)
// ============================================================================

const SHARED_BALANCE = {
  // Elixir Checks
  MIN_PLAYABLE_ELIXIR: (card) => card.elixirCost,  // Must have elixir for card
  // Rationale: Basic game rule
  // Tuning: No adjustment

  // Hand Size
  HAND_SIZE: 4,                  // [FIXED] 4 cards visible
  DECK_SIZE: 8,                  // [FIXED] 8 total cards

  // Board Analysis
  UPDATE_THREAT_RATE: 33,        // [MS] Update threats every frame
  // Rationale: Per-frame analysis for reactivity
  // Tuning: No adjustment (FPS dependent)

  // Memory Tracking
  PLAY_HISTORY_LENGTH: 10,       // [MIN 5, MAX 20] Remember last X plays
  // Rationale: 10 plays = ~30-50 seconds of memory
  // Tuning: Decrease for shorter memory. Increase for longer.
}

// ============================================================================
// BALANCE VALIDATION FRAMEWORK
// ============================================================================

/**
 * Test script to validate balance
 */
const BALANCE_TEST_CASES = [
  {
    name: 'Easy Bot vs Random Opponent',
    difficulty: 'easy',
    expected_win_rate: 0.20,
    tolerance: 0.10,
    description: 'Easy bot should lose 80% of games against average player',
  },
  {
    name: 'Medium Bot vs Skilled Opponent',
    difficulty: 'medium',
    expected_win_rate: 0.50,
    tolerance: 0.15,
    description: 'Medium bot should be 50/50 against skilled player',
  },
  {
    name: 'Hard Bot vs Expert Opponent',
    difficulty: 'hard',
    expected_win_rate: 0.70,
    tolerance: 0.10,
    description: 'Hard bot should win 70%+ against even expert player',
  },
  {
    name: 'Easy Bot Threat Response',
    difficulty: 'easy',
    metric: 'threat_response_rate',
    expected_value: 0.0,
    description: 'Easy bot never responds to threats',
  },
  {
    name: 'Medium Bot Threat Response',
    difficulty: 'medium',
    metric: 'threat_response_rate',
    expected_value: 0.50,
    tolerance: 0.20,
    description: 'Medium bot responds to ~50% of threats',
  },
  {
    name: 'Hard Bot Threat Response',
    difficulty: 'hard',
    metric: 'threat_response_rate',
    expected_value: 1.0,
    description: 'Hard bot responds to 100% of threats',
  },
  {
    name: 'Play Rate: Easy',
    difficulty: 'easy',
    metric: 'plays_per_minute',
    expected_value: 8,
    tolerance: 2,
    description: 'Easy bot plays ~8 times per minute',
  },
  {
    name: 'Play Rate: Medium',
    difficulty: 'medium',
    metric: 'plays_per_minute',
    expected_value: 15,
    tolerance: 3,
    description: 'Medium bot plays ~15 times per minute',
  },
  {
    name: 'Play Rate: Hard',
    difficulty: 'hard',
    metric: 'plays_per_minute',
    expected_value: 22,
    tolerance: 4,
    description: 'Hard bot plays ~22 times per minute',
  },
]

// ============================================================================
// TUNING GUIDE FOR DESIGNERS
// ============================================================================

const TUNING_GUIDE = `
# Bot AI Balance Tuning Guide

## Want to Make a Difficulty Easier?

### Easy Bot
- Increase SLEEP_CHANCE from 0.20 to 0.30
- Increase PLAY_INTERVAL_MAX from 8000 to 12000
- Increase REACTION_TIME_MAX from 2500 to 3500

### Medium Bot
- Increase RANDOMNESS_THRESHOLD from 0.50 to 0.70
- Decrease THREAT_RESPONSE_CHANCE from 0.50 to 0.25
- Increase ELIXIR_ADVANTAGE_THRESHOLD from 2 to 3

### Hard Bot
- Decrease COUNTER_EFFECTIVENESS from 0.95 to 0.85
- Increase REACTION_TIME_MAX from 0.5 to 1.0
- Increase PLAY_INTERVAL_MAX from 3000 to 4000

## Want to Make a Difficulty Harder?

### Easy Bot
- Decrease SLEEP_CHANCE from 0.20 to 0.05
- Decrease PLAY_INTERVAL_MIN from 5000 to 3000
- Decrease REACTION_TIME_MIN from 1500 to 500
- Decrease RANDOMNESS from 1.0 to 0.50 (adds strategy!)

### Medium Bot
- Decrease RANDOMNESS_THRESHOLD from 0.50 to 0.30
- Increase THREAT_RESPONSE_CHANCE from 0.50 to 0.75
- Decrease ELIXIR_ADVANTAGE_THRESHOLD from 2 to 1

### Hard Bot
- Increase COUNTER_EFFECTIVENESS from 0.95 to 1.0
- Decrease REACTION_TIME_MAX from 0.5 to 0.2
- Decrease PLAY_INTERVAL_MIN from 2000 to 1000

## Key Tuning Principles

1. **Play Rate** controls game speed perception
   - Faster = more threatening
   - Slower = more predictable

2. **Reaction Time** controls fairness
   - Longer = player-friendly
   - Shorter = bot-favorable

3. **Randomness** controls exploitability
   - Higher = less strategic
   - Lower = more strategic

4. **Threat Response** controls adaptation
   - Higher = harder to overcome
   - Lower = easier to exploit

## Testing Workflow

1. Change ONE parameter at a time
2. Play 10 games against that difficulty
3. Track: Win rate, win condition, feeling
4. Adjust and repeat until target met
5. Document change rationale

## Balance Philosophy

DON'T: Make bot do everything perfectly
DO: Make bot efficient within constraints

- Easy is constrained by RANDOMNESS
- Medium is constrained by PARTIAL RESPONSE
- Hard is constrained by LIMITED PREDICTION
`

// ============================================================================
// EXPORT FOR TESTING
// ============================================================================

export {
  EASY_BOT_BALANCE,
  MEDIUM_BOT_BALANCE,
  HARD_BOT_BALANCE,
  SHARED_BALANCE,
  BALANCE_TEST_CASES,
  TUNING_GUIDE,
}

export default {
  easy: EASY_BOT_BALANCE,
  medium: MEDIUM_BOT_BALANCE,
  hard: HARD_BOT_BALANCE,
  shared: SHARED_BALANCE,
  tests: BALANCE_TEST_CASES,
  guide: TUNING_GUIDE,
}
