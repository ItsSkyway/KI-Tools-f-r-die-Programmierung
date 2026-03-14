# Clash Royale Browser Game

A fully functional, single-file React-based Clash Royale-inspired card battle game. Play against three difficulty levels of AI opponents in a tower defense card game.

## 🎮 Quick Start

### Option 1: Direct HTML File (Easiest)
1. Open `index.html` in your web browser
2. Select difficulty
3. Build your deck (select 8 cards)
4. Battle the AI opponent

### Option 2: Local Server (Recommended for development)
```bash
# Using Python 3
python -m http.server 8000

# Or Node.js
npx http-server

# Or Ruby
ruby -run -ehttpd . -p8000
```
Then visit: `http://localhost:8000`

### Option 3: Deploy
- Deploy `index.html` and `ClashRoyaleGame.jsx` to any web server
- No backend required - fully client-side

## 🏗️ Architecture

**Single File Component:** `ClashRoyaleGame.jsx`
- All game logic, UI, and state in one React component
- ~1100 lines of optimized code
- No external dependencies beyond React + Tailwind (via CDN)

**Tech Stack:**
- React 18 (via CDN)
- Tailwind CSS (via CDN)
- Vanilla JavaScript game loop

## 🎯 Game Features

### 16 Unique Cards
1. **Knight** (3) - Melee tank
2. **Archer** (3) - Ranged attacker
3. **Giant** (5) - Slow tank, targets buildings
4. **Fireball** (4) - AOE spell
5. **Arrows** (3) - Cheap AOE spell
6. **Minions** (3) - Flying units
7. **Skeleton Army** (3) - 10 weak skeletons
8. **Baby Dragon** (4) - Flying with splash
9. **Valkyrie** (4) - Melee with splash
10. **Musketeer** (4) - Long-range attacker
11. **Hog Rider** (4) - Fast, targets buildings
12. **Witch** (5) - Ranged, spawns skeletons
13. **P.E.K.K.A** (7) - Ultra-high damage
14. **Bomb Tower** (5) - Defensive building
15. **Cannon** (3) - Defensive building
16. **Freeze Spell** (4) - Freezes enemies 2s

### Gameplay Mechanics
- **Elixir System:** 0-10 elixir, regenerates at 1/sec (2/sec in final minute)
- **Towers:** 3 per side (2 Princess towers + 1 King tower)
- **Win Condition:** Destroy enemy King Tower OR most tower HP when time runs out
- **Match Duration:** 3 minutes (180 seconds)
- **Combat:** Real-time unit pathfinding, targeting, and damage

### AI Difficulties

**Easy Bot**
- Plays cards randomly every 5-8 seconds
- No targeting strategy
- Good for learning

**Medium Bot**
- Plays every 3-5 seconds
- Waits for elixir > 6 before major plays
- Occasional counter-plays

**Hard Bot**
- Plays every 2-3 seconds
- Actively counters card types
- Builds strategic pushes
- Reactive spell usage

## 🎨 Visual Style

- Dark fantasy theme (deep blue/red gradient)
- Responsive layout (mobile-first)
- Color-coded teams: Blue (player) vs Red (enemy)
- Real-time HP bars for all units
- Animated elixir bar with glow effect
- Tower status displayed with emoji indicators

## 🔄 Game Flow

```
Main Menu
  ↓ [Select Difficulty]
Deck Builder
  ↓ [Select 8 Cards]
Battle Arena
  ↓ [Play 3 minutes]
Result Screen
  ↓ [Play Again or Back to Menu]
```

## 🕹️ How to Play

### Deck Building
- Select exactly 8 cards from the 16-card roster
- Mix of different costs (2-7 elixir) for variety
- Average elixir cost is displayed
- "Start Battle" enabled when 8 cards selected

### During Battle
- **Hand:** Bottom of screen shows your 4 current cards
- **Play Card:** Click to play (if you have enough elixir)
- **Spells:** Cast instantly to damaged area
- **Troops/Buildings:** Spawn on your side, move to attack enemy
- **Elixir Bar:** Shows current elixir (purple bar fills as you regenerate)
- **Timer:** Top shows remaining time

### Strategy Tips
- **Balance:** Mix troops and spells for flexibility
- **Elixir Trade:** Don't overspend early
- **Countering:** Watch enemy cards and respond with counters
- **Tower Priority:** Focus fire on one tower at a time
- **Double Elixir:** Last minute doubles elixir regen - prepare for intensive plays

## ⚙️ Performance

- Optimized for 30fps+ on modern browsers
- Keeps unit count <50 per side
- Uses React refs for mutable game state (no unnecessary re-renders)
- requestAnimationFrame-based game loop
- Mobile-friendly with touch support

## 📋 Development Notes

### Game State Management
- **React hooks:** useState (UI), useRef (game logic), useEffect (game loop)
- **Refs:** Prevents re-renders for high-frequency updates
- **State updates:** Batched at ~30fps

### Unit AI
- Pathfinding toward nearest enemy
- Range-based targeting
- Building prioritization for certain units
- Freeze status tracking

### Combat System
- Distance-based attack detection
- Splash damage radius calculation
- Tower targeting (distinct logic from units)
- Death handling and cleanup

## 🚀 Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📝 File Structure

```
ClashRoyaleGame.jsx    # Main game component (1100 lines)
index.html             # HTML wrapper with CDN links
```

That's it! No build process, no dependencies to install.

## 🐛 Troubleshooting

**Game doesn't load?**
- Check browser console for errors (F12)
- Ensure JavaScript is enabled
- Try a different browser

**Performance issues?**
- Close other tabs
- Try a faster device
- Reduce browser zoom level

**Cards not playing?**
- Check elixir cost (displayed on card)
- Make sure you have enough elixir
- Wait for game to load fully

## 📖 Code Organization

```javascript
// Card Database (16 cards with stats)
CARDS = { knight, archer, giant, ... }

// Arena Configuration
ARENA_WIDTH, LANE_WIDTH, getTowerPositions()

// Unit AI & Movement
findNearestEnemy(), moveUnit()

// Main Component
ClashRoyaleGame()
  ├─ Screen: Menu
  ├─ Screen: Deck Builder
  ├─ Screen: Battle
  └─ Screen: Results
```

## 🎓 Learning Resources

This game demonstrates:
- React hooks (useState, useRef, useCallback, useEffect)
- Real-time game loop (setInterval + state updates)
- Collision detection and pathfinding
- AI decision-making
- Game state management
- Responsive UI design
- Tailwind CSS styling

## 📄 License

Built as an educational game project. Clash Royale is a trademark of Supercell.

---

**Enjoy the game! 🎮⚔️**
