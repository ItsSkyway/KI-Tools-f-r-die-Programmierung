# AGENTS.md — ProjectVibeCodingBehrends

## Project Overview

A **Clash Royale-style browser game** built in React + Tailwind CSS (`ClashRoyaleGame.jsx`).
Agent definitions live in `.claude/agents/` as markdown files with YAML frontmatter.

---

## Available Agents

14 specialized agents are active. Always delegate to the right specialist:

### Engineering
| Agent | Responsibility |
|---|---|
| **engineering-software-architect** | Overall system design, architecture decisions |
| **engineering-senior-developer** | Core implementation, complex game logic |
| **engineering-frontend-developer** | React UI, hooks, component structure |
| **engineering-rapid-prototyper** | Fast proof-of-concept, quick feature spikes |
| **engineering-code-reviewer** | Code quality, correctness, security feedback |

### Design & UX
| Agent | Responsibility |
|---|---|
| **design-ui-designer** | Visual design, component aesthetics, Tailwind styling |
| **design-ux-architect** | Interaction design, CSS systems, layout structure |
| **design-visual-storyteller** | Visual narrative, art direction, animation concepts |
| **design-whimsy-injector** | Delight, personality, playful micro-interactions |

### Game-Specific
| Agent | Responsibility |
|---|---|
| **game-designer** | Game mechanics, balance, economy, player loops |
| **level-designer** | Arena layout, spatial design, encounter flow |
| **narrative-designer** | Story systems, lore, card flavor text, UI copy |
| **game-audio-engineer** | Sound effects, music, audio feedback systems |

### Testing & Performance
| Agent | Responsibility |
|---|---|
| **testing-performance-benchmarker** | FPS, render cost, simulation performance |

---

## Orchestration Mode

The primary coordinator **delegates 95%+ of work** to specialists. Never implement directly when a specialized agent exists.

### Core Principles

1. **Delegation First** — Map tasks to specialist agents before doing anything yourself
2. **Parallel Execution** — Launch independent tasks simultaneously
3. **Sequential for Dependencies** — Task B depends on A? Run in order
4. **Code Review on Critical Changes Only** — See criteria below
5. **Trust Specialist Ownership** — Don't override domain decisions

### Delegation Matrix

#### Implementation
| Task | Agent | Parallel? |
|---|---|---|
| React component / UI bug | **engineering-frontend-developer** | Yes |
| Core game logic / simulation | **engineering-senior-developer** | Yes |
| Architecture / system design | **engineering-software-architect** | Yes |
| Quick spike or prototype | **engineering-rapid-prototyper** | Yes |
| Tailwind styling / visual polish | **design-ui-designer** | Yes |
| Layout structure / CSS system | **design-ux-architect** | Yes |

#### Game Design
| Task | Agent | Parallel? |
|---|---|---|
| Card balance / economy | **game-designer** | Yes |
| Arena layout / encounter design | **level-designer** | Yes |
| Lore / flavor text / copy | **narrative-designer** | Yes |
| Sound / audio feedback | **game-audio-engineer** | Yes |
| Delight moments / animations | **design-whimsy-injector** | Yes |
| Visual style / art direction | **design-visual-storyteller** | Yes |

#### Review & Validation
| Task | Agent | Parallel? |
|---|---|---|
| Code quality check | **engineering-code-reviewer** | After implementation |
| Render / FPS analysis | **testing-performance-benchmarker** | Yes |

### When to Apply Code Review

**Apply `engineering-code-reviewer`:**
- Core game simulation changes (combat, spawning, AI)
- React hooks / state management refactors
- Any shared utility function

**Skip for:**
- Tailwind class tweaks
- Comment or copy changes
- Isolated UI-only components

### Orchestration Workflow

```
User Request
    ↓
[Orchestrator: Identify & map to specialists]
    ↓
[Parallel Delegation — independent tasks]
    ├─ Specialist A
    ├─ Specialist B
    └─ Specialist C
    ↓
[Sequential Delegation — dependent tasks]
    └─ Specialist D (uses results from above)
    ↓
[Quality Gate — critical change? → code-reviewer]
    ↓
[Synthesize & report to user]
```

### Example Scenarios

**Feature: New card with sound and balance**
```
Orchestrator launches in parallel:
    ├─ game-designer        → Define card stats and balance
    ├─ narrative-designer   → Write flavor text
    └─ game-audio-engineer  → Design sound trigger
Then sequentially:
    └─ engineering-senior-developer → Implement card logic
    └─ design-ui-designer           → Style card component
    └─ engineering-code-reviewer    → Review implementation
```

**Bug: Performance drop in arena**
```
Orchestrator launches in parallel:
    ├─ testing-performance-benchmarker → Profile render cost
    └─ engineering-software-architect  → Identify architectural cause
Then:
    └─ engineering-senior-developer → Apply fix
    └─ testing-performance-benchmarker → Verify improvement
```

**Polish pass: Make the UI feel alive**
```
Orchestrator launches in parallel:
    ├─ design-whimsy-injector    → Add micro-interactions
    ├─ design-visual-storyteller → Review visual coherence
    └─ design-ui-designer        → Refine spacing and color
```

---

## Code Style & Conventions

### Stack
- React (functional components + hooks) + Tailwind CSS
- JavaScript (JSDoc types preferred; TypeScript welcome for new modules)
- Vite + Vitest for tooling

### Formatting (Prettier)
```json
{
  "singleQuote": true,
  "semi": false,
  "trailingComma": "es5",
  "arrowParens": "avoid",
  "printWidth": 100,
  "tabWidth": 2
}
```

### Naming
- Components: `PascalCase` — `ClashRoyaleGame`, `CardHand`
- Functions/variables: `camelCase` — `spawnUnit`, `playCardAt`
- Global constants: `UPPER_SNAKE_CASE` — `ARENA`, `CARD_BY_ID`

### React Hooks Rules
- `useRef` for mutable game state that must not trigger renders (`unitsRef`, `effectsRef`)
- `useState` for UI-driven state (selected card, screen)
- `useCallback`/`useMemo` for stable callbacks — include all deps
- Always return cleanup functions from `useEffect` (timers, RAF, subscriptions)
- Never silence eslint-hooks warnings — fix the dep list or document why

### Component Structure
- One component per file; extract game logic from UI into separate modules
- Split large components into: UI layer / simulation / AI / utils

### Performance
- Keep render path minimal; memoize derived data
- Write pure functions for simulation logic — makes testing easy

### Error Handling
- Fail loudly during development: `console.error('context', err)`
- Always handle async rejection with try/catch
- Show a small UI message for user-facing errors; never leak internals

---

## Testing

```bash
npx vitest run path/to/file.test.js        # single file
npx vitest -t "should spawn witch skeleton" # by test name
npm run test -- --coverage                  # full suite with coverage
```

Focus tests on:
- Simulation functions (spawn, combat, targeting logic)
- AI decision heuristics
- UI interactions (play card, select deck)

Mock timers and randomness for deterministic tests:
```js
vi.useFakeTimers()
vi.spyOn(Math, 'random').mockReturnValue(0.5)
```

---

## Dev Scripts

```json
"scripts": {
  "dev":       "vite",
  "build":     "vite build",
  "preview":   "vite preview",
  "lint":      "eslint . --ext .js,.jsx",
  "format":    "prettier --write \"**/*.{js,jsx,css,md}\"",
  "test":      "vitest",
  "test:watch":"vitest --watch"
}
```

---

## Commit Format (Conventional Commits)

```
type(scope): short description   # max 72 chars

type:  feat | fix | chore | refactor | style | test | docs
scope: game | ui | audio | agents | config
```

Examples:
- `feat(game): add witch card with skeleton spawning`
- `fix(ui): correct card hand overflow on mobile`
- `style(ui): refine arena Tailwind spacing`

---

## Key Resources

- **Agent Definitions**: `.claude/agents/*.md`
- **Main Source**: `ClashRoyaleGame.jsx`
- **This File**: Root `AGENTS.md` — keep synchronized when adding/removing agents
