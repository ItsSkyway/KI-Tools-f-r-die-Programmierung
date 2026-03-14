# 🎮 Clash Royale Game - Refactored Architecture

## 📊 Project Overview

**Stats:**
- **32 Files** with **3,189 Lines of Code**
- **Fully Modular** - Each file has single responsibility
- **SOLID & DRY** - Clean, testable, maintainable
- **Scalable** - Easy to add new cards, features, AI strategies

## 📁 Directory Structure

```
src/
├── game/                  # 🎮 Core game logic (586 lines)
│   ├── constants.js      # Magic numbers, arena config
│   ├── types.js          # JSDoc type definitions
│   ├── gameState.js      # useGameState hook
│   ├── gameLoop.js       # Main simulation loop
│   └── index.js          # Barrel exports
│
├── cards/                # 🃏 Card system (509 lines)
│   ├── cardDatabase.js   # All 16 cards
│   ├── cardEffects.js    # Spell effects
│   ├── cardBalance.js    # Balance config
│   └── index.js
│
├── simulation/           # ⚙️ Game mechanics (876 lines)
│   ├── combat.js         # Damage, targeting, attacks
│   ├── unitMovement.js   # Pathfinding, movement
│   ├── unitSpawning.js   # Unit creation
│   ├── towers.js         # Tower management
│   ├── effects.js        # Particles, animations
│   ├── elixirSystem.js   # Elixir management
│   └── index.js
│
├── players/              # 🤖 Player & AI (500 lines)
│   ├── botAI.js          # AI decision-making
│   ├── deckBuilder.js    # Deck selection
│   ├── playerManager.js  # Player state
│   └── index.js
│
├── ui/                   # 🎨 React components (421 lines)
│   ├── Game.jsx          # Main game component
│   ├── GameBoard.jsx     # Arena rendering
│   ├── CardHand.jsx      # Card UI
│   ├── PlayerStats.jsx   # Stats display
│   ├── DeckBuilder.jsx   # Deck selection screen
│   ├── GameOver.jsx      # End screen
│   └── index.js
│
├── utils/                # 🔧 Utilities (297 lines)
│   ├── math.js           # Distance, angles, collision
│   ├── random.js         # RNG utilities
│   ├── pathfinding.js    # Lane selection
│   ├── logger.js         # Logging
│   └── index.js
│
├── assets/               # 🎵 Static assets
│   ├── sounds/
│   └── animations/
│
├── App.jsx              # Root component
└── App.css              # Root styles
```

## 🎯 Design Principles

### ✅ SOLID

| Principle | Implementation |
|-----------|---|
| **S** - Single Responsibility | Each file does ONE thing (cards, combat, AI, UI, etc.) |
| **O** - Open/Closed | Add new cards without changing core logic |
| **L** - Liskov Substitution | All units implement same interface |
| **I** - Interface Segregation | Focused exports (math, random, pathfinding) |
| **D** - Dependency Inversion | Abstractions over concrete types |

### ✅ DRY (Don't Repeat Yourself)

- **Constants** centralized in `game/constants.js`
- **Types** documented once in `game/types.js`
- **Shared utilities** in `utils/`
- **Card effects** in `cards/cardEffects.js`

### ✅ Scalability

**Adding a new card?**
```javascript
// 1. Add to cardDatabase.js
// 2. (Optional) Add effects to cardEffects.js
// Done! ✨
```

**Adding new AI strategy?**
```javascript
// 1. Add function to botAI.js
// Done! ✨
```

**New game mechanic?**
```javascript
// 1. Add to appropriate simulation/ file
// 2. Call from gameLoop.js
// Done! ✨
```

## 📦 Module Responsibilities

### `game/`
Manages game state, constants, and main loop

- **constants.js**: All magic numbers (FPS, elixir rates, tower HP, etc.)
- **types.js**: JSDoc type definitions for IDE autocomplete
- **gameState.js**: `useGameState` hook for React
- **gameLoop.js**: Main simulation loop (unit movement, combat, etc.)

### `cards/`
Card system and effects

- **cardDatabase.js**: CARDS object + helper functions
- **cardEffects.js**: Spell effects (fireball, freeze, witch skeletons)
- **cardBalance.js**: Balance tuning (multipliers, matchups)

### `simulation/`
Game mechanics

- **combat.js**: Damage, targeting, attacks, tower destruction
- **unitMovement.js**: Movement, pathfinding, collision
- **unitSpawning.js**: Unit creation (troops, spells, buildings)
- **towers.js**: Tower initialization, health, attacks
- **effects.js**: Particles, damage numbers, animations
- **elixirSystem.js**: Elixir regen, spending

### `players/`
Player management and AI

- **botAI.js**: AI decision-making (easy/medium/hard strategies)
- **deckBuilder.js**: Deck validation, cycling, presets
- **playerManager.js**: Player state, stats, damage tracking

### `ui/`
React components

- **Game.jsx**: Root game component, event loop
- **GameBoard.jsx**: Canvas rendering
- **CardHand.jsx**: Card UI in hand
- **PlayerStats.jsx**: HP/Elixir bars, timer
- **DeckBuilder.jsx**: Deck selection screen
- **GameOver.jsx**: Win/lose screen

### `utils/`
Shared utilities

- **math.js**: Distance, angle, collision, lerp, clamp
- **random.js**: RNG, weighted random, shuffle
- **pathfinding.js**: Lane selection, waypoints
- **logger.js**: Debug logging with levels

## 🔄 Data Flow

```
User Input
    ↓
ui/Game.jsx
    ↓
gameState/gameLoop (runGameFrame)
    ↓
simulation/* (combat, movement, effects)
    ↓
setGameStats → React re-render
    ↓
ui/* (GameBoard, PlayerStats, etc.)
```

## 🧪 Testing Examples

```javascript
// Test card balance
import { getBalancedCard } from './cards/cardBalance.js'
const knight = getBalancedCard(CARDS.knight)
expect(knight.stats.damage).toBe(100)

// Test combat
import { performAttack } from './simulation/combat.js'
const damage = performAttack(archer, knight)
expect(knight.hp).toBeLessThan(600)

// Test deck validation
import { validateDeck } from './players/deckBuilder.js'
const { isValid } = validateDeck(['knight', 'archer', ...])
expect(isValid).toBe(true)

// Test AI
import { makeDecision } from './players/botAI.js'
const decision = makeDecision(botState, playerState, gameState, 'hard')
expect(decision.shouldPlay).toBe(true)
```

## 📈 Adding Features

### New Card
1. Add to `cards/cardDatabase.js`
2. (Optional) Add effects to `cards/cardEffects.js`
3. Test via DeckBuilder

### New AI Difficulty
1. Add strategy function in `players/botAI.js`
2. Add to `makeDecision` switch
3. Update constants if needed

### New Game Mechanic
1. Add logic to appropriate `simulation/` file
2. Call from `game/gameLoop.js`
3. Update UI if needed

### New Visual Effect
1. Add to `simulation/effects.js`
2. Create rendering function
3. Trigger from combat/spells

## 🚀 Migration Notes

**Original file**: `ClashRoyaleGame.jsx` (~950 lines, monolithic)

**New structure**: 32 files across 6 modules (~3,189 lines, modular)

**Benefits**:
- ✅ Each file ~100 lines (readable)
- ✅ Easy to find code
- ✅ Easy to test
- ✅ Easy to extend
- ✅ Easy to debug

## 📝 Next Steps

1. **Phase 8 Validation**: Verify no regressions
2. **Integrate with UI**: Connect Game.jsx to canvas
3. **Add Tests**: Create test suite for simulation
4. **Optimize**: Profile rendering, combat loops
5. **Polish**: Animations, sounds, visual effects

## 🎮 Usage

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Run tests
npm run test

# Build
npm run build
```

## 📚 Documentation Index

- **AGENTS.md** - AI agent responsibilities
- **This file** - Architecture overview
- Code comments in each module

---

**Status**: ✅ Refactoring Complete - Ready for Integration
