# 🚀 Quick Reference - Project Structure

## Where to Find Things

| Need | File |
|------|------|
| Magic numbers (FPS, costs, etc.) | `game/constants.js` |
| Type definitions | `game/types.js` |
| All 16 cards | `cards/cardDatabase.js` |
| Spell effects (freeze, fireball) | `cards/cardEffects.js` |
| Unit combat logic | `simulation/combat.js` |
| Unit movement | `simulation/unitMovement.js` |
| Tower logic | `simulation/towers.js` |
| Bot AI strategies | `players/botAI.js` |
| Deck management | `players/deckBuilder.js` |
| Elixir system | `simulation/elixirSystem.js` |
| Math utilities | `utils/math.js` |
| RNG utilities | `utils/random.js` |

## Common Tasks

### Add a New Card

```javascript
// 1. Open: cards/cardDatabase.js
// 2. Add to CARDS object:
export const CARDS = {
  newCard: {
    id: 'newCard',
    name: 'New Card',
    emoji: '🎯',
    elixirCost: 4,
    type: 'troop', // or 'spell', 'building'
    stats: { hp: 500, damage: 100, speed: 1, range: 100 },
    description: 'Your description',
  },
  // ... rest
}
// 3. Done! Available in deck builder immediately
```

### Adjust Card Balance

```javascript
// 1. Open: cards/cardBalance.js
// 2. Add to CARD_TWEAKS:
export const CARD_TWEAKS = {
  knight: { damage: 1.1, hp: 0.95 }, // +10% damage, -5% hp
  // Format: multiplier (1.0 = no change)
}
```

### Add AI Strategy

```javascript
// 1. Open: players/botAI.js
// 2. Create strategy function:
const myStrategy = (botState, playableCards, playerState) => {
  // Your logic here
  return { shouldPlay: true, cardId, x, y }
}
// 3. Add to makeDecision switch:
case 'myDifficulty':
  return myStrategy(...)
```

### Add Game Mechanic

```javascript
// 1. Create in appropriate simulation/*.js file
// 2. Call from game/gameLoop.js runGameFrame()
// 3. Add UI if needed
```

### Add UI Component

```javascript
// 1. Create in ui/
// 2. Export from ui/index.js
// 3. Import in ui/Game.jsx
```

## Import Examples

```javascript
// From barrel exports
import { CARDS, getCard } from '../cards'
import { updateElixir, spendElixir } from '../simulation'
import { makeDecision } from '../players'
import { distance, clamp } from '../utils'

// Or specific
import { ARENA_WIDTH } from '../game/constants.js'
import { performAttack } from '../simulation/combat.js'
```

## Testing Pattern

```javascript
// Pure functions = easy to test
import { performAttack } from '../simulation/combat.js'

const archer = { stats: { damage: 120 }, ... }
const knight = { hp: 600, stats: { range: 50 }, ... }

const damage = performAttack(archer, knight)
expect(knight.hp).toBe(480) // 600 - 120
```

## File Naming

- **Database/Config**: `*Database.js`, `*Config.js`
- **Logic Functions**: `*.js` (combat.js, movement.js)
- **React Components**: `*.jsx`
- **Utilities**: `utils/*.js`
- **Barrel Exports**: `index.js` in each folder

## Module Dependencies

```
ui/
  └─ game/ (hooks, constants, types)
     ├─ simulation/ (combat, movement)
     ├─ cards/ (database, effects)
     ├─ players/ (AI, deck)
     └─ utils/ (math, random)
```

**Key Rule**: No circular imports. Lower-level modules (simulation, utils) don't import from higher (ui).

## Hot Reload Pattern

```javascript
// Changes to pure functions = instant reload
// Changes to constants = instant reload
// Changes to React components = React HMR
// Changes to game state = restart battle
```

## Debugging

```javascript
// Use logger for debugging
import { debug, info, warn, error } from '../utils/logger.js'

debug('Unit position', { x: 100, y: 200 })
warn('Low elixir', { current: 2, needed: 5 })
```

---

**Need more help?** Check `REFACTORING_COMPLETE.md` for detailed guide.
