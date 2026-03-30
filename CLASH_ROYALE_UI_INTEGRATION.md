# 🏰 Clash Royale UI System - Integration Guide

## 📋 Quick Start

### 1. Import Components

```jsx
// src/ui/index.js - Export everything
export { TopHUD, BottomHUD, MatchResultScreen, ClashRoyaleHUD } from './ClashRoyaleHUD'
export { CardHand, Arena, DeckBuilder, DifficultySelector } from './ClashArena'
```

### 2. Use in Your Game Component

```jsx
import React, { useState } from 'react'
import {
  TopHUD,
  BottomHUD,
  CardHand,
  Arena,
  DeckBuilder,
  DifficultySelector,
  MatchResultScreen
} from './ui'

export function Game() {
  const [gameState, setGameState] = useState('difficulty') // difficulty | deck | battle | result
  const [playerHP, setPlayerHP] = useState({ king: 1000, princess1: 500, princess2: 500 })
  const [enemyHP, setEnemyHP] = useState({ king: 1000, princess1: 500, princess2: 500 })
  const [timeRemaining, setTimeRemaining] = useState(180)
  const [elixir, setElixir] = useState(5.2)
  const [gamePhase, setGamePhase] = useState('early')
  const [playerUnits, setPlayerUnits] = useState([])
  const [enemyUnits, setEnemyUnits] = useState([])
  const [selectedCards, setSelectedCards] = useState([])
  const [hand, setHand] = useState([])
  const [victory, setVictory] = useState(false)

  // Difficulty selection
  const handleDifficultySelect = (difficulty) => {
    console.log('Selected difficulty:', difficulty)
    setGameState('deck')
  }

  // Deck building
  const handleDeckComplete = (cards) => {
    setSelectedCards(cards)
    setHand(cards.slice(0, 4))
    setGameState('battle')
  }

  // Card interaction
  const handleCardDrag = (card) => {
    console.log('Dragging card:', card)
  }

  const handleCardDrop = (position) => {
    console.log('Dropped at position:', position)
    // Add unit at position
    // Deduct elixir
    // Update game state
  }

  // Match end
  const handleMatchEnd = (playerWon) => {
    setVictory(playerWon)
    setGameState('result')
  }

  // Render states
  if (gameState === 'difficulty') {
    return <DifficultySelector onDifficultySelect={handleDifficultySelect} />
  }

  if (gameState === 'deck') {
    return (
      <DeckBuilder
        availableCards={AVAILABLE_CARDS}
        selectedCards={selectedCards}
        onCardToggle={(card) => {
          if (selectedCards.some(c => c.id === card.id)) {
            setSelectedCards(selectedCards.filter(c => c.id !== card.id))
          } else if (selectedCards.length < 8) {
            setSelectedCards([...selectedCards, card])
          }
        }}
        onComplete={() => handleDeckComplete(selectedCards)}
      />
    )
  }

  if (gameState === 'result') {
    return (
      <MatchResultScreen
        victory={victory}
        playerTowersDestroyed={3 - (playerHP.king > 0 ? 1 : 0) - 
          ((playerHP.princess1 > 0 ? 1 : 0) + (playerHP.princess2 > 0 ? 1 : 0))}
        enemyTowersDestroyed={3 - (enemyHP.king > 0 ? 1 : 0) - 
          ((enemyHP.princess1 > 0 ? 1 : 0) + (enemyHP.princess2 > 0 ? 1 : 0))}
        onPlayAgain={() => {
          setGameState('difficulty')
          // Reset all state
        }}
        onMenu={() => {
          // Go to main menu
        }}
      />
    )
  }

  // Battle state
  return (
    <div className="cr-game-container">
      {/* HUD Components */}
      <TopHUD
        playerHP={playerHP}
        enemyHP={enemyHP}
        timeRemaining={timeRemaining}
      />

      <BottomHUD
        elixir={elixir}
        maxElixir={10}
        gamePhase={gamePhase}
      />

      {/* Arena */}
      <Arena
        playerUnits={playerUnits}
        enemyUnits={enemyUnits}
        onArenaClick={handleCardDrop}
        dropZoneActive={true}
        dropZoneValid={true}
      />

      {/* Card Hand */}
      <CardHand
        cards={hand}
        onCardSelect={(card) => console.log('Selected:', card)}
        onCardDrag={handleCardDrag}
        onCardDrop={handleCardDrop}
        disabledCards={hand.filter(c => c.elixir > elixir).map(c => c.id)}
      />
    </div>
  )
}

export default Game
```

## 🎨 Design System Overview

### Color Tokens
```css
:root {
  /* Primary Colors */
  --cr-primary-purple: #9333ea;
  --cr-bright-purple: #a855f7;
  
  /* Semantic Colors */
  --cr-green: #10b981;
  --cr-red: #ef4444;
  --cr-yellow: #f59e0b;
  --cr-gold: #fbbf24;
  
  /* Backgrounds */
  --cr-dark-bg: #0a0e27;
  --cr-darker-bg: #1a0a2e;
}
```

### Rarity Classes
```html
<!-- Common (Brown) -->
<div class="cr-card rarity-common">...</div>

<!-- Rare (Blue) -->
<div class="cr-card rarity-rare">...</div>

<!-- Epic (Purple) -->
<div class="cr-card rarity-epic">...</div>

<!-- Legendary (Gold) -->
<div class="cr-card rarity-legendary">...</div>
```

## 🎯 Component Props Reference

### TopHUD
```jsx
<TopHUD 
  playerHP={{ 
    king: 1000,      // 0-1000
    princess1: 500,  // 0-500
    princess2: 500   // 0-500
  }}
  enemyHP={{ 
    king: 1000,
    princess1: 500,
    princess2: 500
  }}
  timeRemaining={180}  // seconds
/>
```

### BottomHUD
```jsx
<BottomHUD 
  elixir={5.2}           // 0-10
  maxElixir={10}         // typically 10
  gamePhase="mid"        // 'early' | 'mid' | 'late'
/>
```

### CardHand
```jsx
<CardHand
  cards={[
    {
      id: 'goblin',
      emoji: '🔱',
      name: 'Goblins',
      elixir: 2,
      rarity: 'common'  // 'common' | 'rare' | 'epic' | 'legendary'
    },
    // ... up to 4 cards
  ]}
  onCardSelect={(card) => {}}
  onCardDrag={(card) => {}}
  onCardDrop={(card) => {}}
  disabledCards={['card-id-1']}  // cards that can't be played
  draggedCard={draggedCard}        // for showing drop zone
/>
```

### Arena
```jsx
<Arena
  playerUnits={[
    {
      id: 'unit-1',
      emoji: '🐉',
      x: 100,        // px position
      y: 300,
      hp: 200,
      maxHp: 200,
      damage: 0,
      damageActive: false
    }
  ]}
  enemyUnits={[...]}
  width={600}        // px
  height={800}       // px
  onArenaClick={(e) => {}}
  dropZoneActive={false}
  dropZoneValid={false}
/>
```

### DeckBuilder
```jsx
<DeckBuilder
  availableCards={[...]}    // all card options
  selectedCards={[...]}     // currently selected cards
  onCardToggle={(card) => {}}
  onComplete={() => {}}
/>
```

### MatchResultScreen
```jsx
<MatchResultScreen
  victory={true}
  playerTowersDestroyed={2}      // 0-3
  enemyTowersDestroyed={1}       // 0-3
  onPlayAgain={() => {}}
  onMenu={() => {}}
/>
```

### DifficultySelector
```jsx
<DifficultySelector
  onDifficultySelect={(difficulty) => {}}  // 'easy' | 'medium' | 'hard' | 'legendary'
/>
```

## 🎬 Sample Card Data

```javascript
const AVAILABLE_CARDS = [
  {
    id: 'goblins',
    name: 'Goblins',
    emoji: '🔱',
    elixir: 2,
    rarity: 'common'
  },
  {
    id: 'archer',
    name: 'Archer',
    emoji: '🏹',
    elixir: 3,
    rarity: 'common'
  },
  {
    id: 'giant',
    name: 'Giant',
    emoji: '👹',
    elixir: 5,
    rarity: 'rare'
  },
  {
    id: 'dragon',
    name: 'Dragon',
    emoji: '🐉',
    elixir: 6,
    rarity: 'epic'
  },
  {
    id: 'wizard',
    name: 'Wizard',
    emoji: '🧙',
    elixir: 5,
    rarity: 'rare'
  },
  {
    id: 'hog-rider',
    name: 'Hog Rider',
    emoji: '🏃',
    elixir: 4,
    rarity: 'rare'
  },
  {
    id: 'skeleton-army',
    name: 'Skeleton Army',
    emoji: '💀',
    elixir: 3,
    rarity: 'rare'
  },
  {
    id: 'inferno-dragon',
    name: 'Inferno Dragon',
    emoji: '🔥',
    elixir: 4,
    rarity: 'epic'
  },
  {
    id: 'pekka',
    name: 'P.E.K.K.A',
    emoji: '⚔️',
    elixir: 7,
    rarity: 'epic'
  },
  {
    id: 'electro-giant',
    name: 'Electro Giant',
    emoji: '⚡',
    elixir: 8,
    rarity: 'legendary'
  },
  {
    id: 'princess',
    name: 'Princess',
    emoji: '👸',
    elixir: 3,
    rarity: 'legendary'
  },
  {
    id: 'ice-wizard',
    name: 'Ice Wizard',
    emoji: '❄️',
    elixir: 3,
    rarity: 'legendary'
  }
]
```

## 🔄 Game Flow Example

```
1. START
   ↓
2. DIFFICULTY SELECTOR
   └─→ Select: Easy | Medium | Hard | Legendary
   ↓
3. DECK BUILDER
   └─→ Select 8 cards
   └─→ See rarity distribution
   └─→ See elixir costs
   ↓
4. BATTLE
   ├─→ Top HUD: Shows HP + Timer
   ├─→ Arena: Shows units fighting
   ├─→ Bottom HUD: Shows elixir + phase
   ├─→ Card Hand: Play cards via drag/drop
   └─→ Check: Victory condition or time limit
   ↓
5. MATCH RESULT
   └─→ Victory: "🏆 You destroyed 2 towers"
   └─→ Defeat: "💀 Enemy destroyed 3 towers"
   ├─→ PLAY AGAIN → back to step 2 (same difficulty)
   └─→ MENU → back to step 2 (select difficulty)
```

## 📱 Responsive Breakpoints

```css
/* Desktop (1024px+) */
.cr-card-hand {
  grid-template-columns: repeat(4, 1fr);
}

/* Tablet (768px-1023px) */
@media (max-width: 1024px) {
  .cr-card {
    min-height: 90px;
  }
}

/* Mobile (640px-767px) */
@media (max-width: 640px) {
  .cr-card-hand {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .cr-arena-container {
    width: 90vw;
    aspect-ratio: 4 / 5;
  }
}
```

## 🎨 Animation Reference

All animations are CPU-optimized CSS-only:

```css
/* Fast transitions (UI feedback) */
transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);

/* Normal transitions (interactive elements) */
transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);

/* Slow transitions (important changes) */
transition: all 500ms cubic-bezier(0.4, 0, 0.2, 1);
```

Key animations:
- **hp-shimmer**: 2s infinite (HP bar)
- **timer-pulse**: 1s infinite (Timer glow)
- **elixir-flow**: 2s infinite (Elixir bar shine)
- **phase-pulse**: 1.5s infinite (Phase indicator)
- **unit-float**: 3s infinite (Unit bobbing)
- **damage-pop**: 1.5s (Damage numbers)
- **drop-zone-valid**: 1s infinite (Valid drop zone)
- **result-appear**: 0.6s (Result screen entrance)

## 🚀 Performance Tips

1. **Use React.memo for Card components** to prevent re-renders:
```jsx
const CardHand = React.memo(({ cards, onCardSelect }) => {
  // ...
})
```

2. **Optimize state updates**:
```jsx
// Instead of updating entire object, update only changed properties
setPlayerHP(prev => ({ ...prev, king: newValue }))
```

3. **CSS animations over JS**:
- All HUD animations are CSS-only (GPU accelerated)
- Use `will-change` for animated elements
- Avoid layout thrashing

4. **Image optimization**:
- Use emoji (Unicode) instead of images
- No image assets needed for this UI
- Lightweight and scalable

## ♿ Accessibility Features

All components include:
- ✓ WCAG AA compliant contrast ratios (4.5:1)
- ✓ Keyboard navigation support
- ✓ Focus-visible outlines (#fbbf24)
- ✓ Reduced motion support
- ✓ Touch-friendly sizes (44px minimum)
- ✓ Screen reader friendly (semantic HTML)
- ✓ High contrast mode support

## 🎓 Customization Examples

### Change color scheme
```css
:root {
  --cr-primary-purple: #5a67d8;  /* Blue instead of purple */
  --cr-green: #38a169;            /* Different green */
}
```

### Adjust animation speeds
```css
:root {
  --transition-fast: 100ms;      /* Faster animations */
  --transition-normal: 200ms;
}
```

### Modify card grid
```css
.cr-card-hand {
  grid-template-columns: repeat(3, 1fr);  /* 3 cards instead of 4 */
}
```

## 📚 File Structure

```
src/ui/
├── ClashRoyaleHUD.jsx       (HUD components)
├── ClashRoyaleHUD.css       (HUD styling)
├── ClashArena.jsx            (Arena & card components)
├── ClashArena.css            (Arena styling)
└── index.js                  (exports)
```

## 🆘 Troubleshooting

**Cards not responding to clicks?**
- Check `pointer-events` is not `none` on parent
- Verify `onCardSelect` callback is working

**Drop zone not showing?**
- Set `dropZoneActive={true}` and `dropZoneValid={true}`
- Verify Arena component is rendered

**HP bars not updating?**
- Pass updated `playerHP` and `enemyHP` objects
- Ensure component re-renders on state change

**Animations not smooth?**
- Check for layout thrashing (CSS can cause reflows)
- Use `will-change` on frequently animated elements
- Profile in DevTools Performance tab

## 📖 Further Reading

- See `CLASH_ROYALE_UI_SPECS.md` for detailed design specifications
- Check component source code for inline documentation
- Review CSS comments for styling approaches

---

**Last Updated**: 2024
**UI System Version**: 2.0 (Complete Redesign)
**Status**: ✅ Production Ready
