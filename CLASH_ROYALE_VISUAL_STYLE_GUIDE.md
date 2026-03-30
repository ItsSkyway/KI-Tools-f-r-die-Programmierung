# 🎨 Clash Royale UI - Visual Style Guide

## Dark Fantasy Theme Overview

The entire UI system is built on a **Dark Fantasy theme** inspired by authentic Clash Royale design language. This creates an immersive medieval fantasy aesthetic with modern gaming UI elements.

## Color Psychology & Usage

### Primary Purples (UI Accents)
```
#9333ea (Primary Purple) - Used for borders, dividers
#a855f7 (Bright Purple) - Used for highlights, glows, calls-to-action
RGB: Purple reflects magic, power, premium feel
```
**Usage:**
- Borders on all panels and cards
- Text for labels and titles
- Glow effects on hover/focus
- Drop zone indicators
- Timer text shadows

### Semantic Colors (Dark Fantasy)

#### Green (#10b981) - Victory & Player
```css
.cr-hp-bar-green {
  background: linear-gradient(90deg, #059669 0%, #10b981 100%);
  box-shadow: 0 0 12px rgba(16, 185, 129, 0.6);
}
```
**Represents:** Success, player control, positive actions
**Use:** Player HP bars, victory screen, success feedback, "Play Again" button

#### Red (#ef4444) - Danger & Enemy
```css
.cr-hp-bar-red {
  background: linear-gradient(90deg, #dc2626 0%, #ef4444 100%);
  box-shadow: 0 0 12px rgba(239, 68, 68, 0.6);
}
```
**Represents:** Danger, enemy threat, damage
**Use:** Enemy HP bars, damage numbers, invalid zones, defeat screen

#### Gold (#fbbf24) - Premium & Legendary
```css
/* Timer - Grand Central Display */
.cr-timer-value {
  color: #fbbf24;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.8),
               0 0 20px rgba(251, 191, 36, 0.4);
  animation: timer-pulse 1s ease-in-out infinite;
}
```
**Represents:** Legendary quality, high value, attention
**Use:** Timer display, legendary card borders, premium glow effects

#### Yellow (#f59e0b) - Warning & Mid Game
```css
/* Elixir bar during mid game phase */
.cr-elixir-fill {
  background: linear-gradient(90deg, #10b981 0%, #34d399 100%);  /* Early */
  background: linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%);  /* Mid */
  background: linear-gradient(90deg, #ef4444 0%, #f87171 100%);  /* Late */
}
```
**Represents:** Game intensity increasing
**Use:** Phase indicator, time pressure warnings

### Rarity Gradient System

#### Common (Brown) - Foundation Cards
```css
.rarity-common {
  background: linear-gradient(135deg, #6B4423 0%, #C9A961 100%);
  border-color: #E8D5B7;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6),
              inset 0 1px 0 rgba(255, 255, 255, 0.1);
}
```
**Aesthetic:** Earthy, natural, approachable
**Examples:** Goblins, Archers, basic troops
**Feeling:** Novice-friendly, common sight

#### Rare (Blue) - Solid Choices
```css
.rarity-rare {
  background: linear-gradient(135deg, #1E5F9E 0%, #4A9FD8 100%);
  border-color: #6EB5E8;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6),
              inset 0 1px 0 rgba(255, 255, 255, 0.1);
}
```
**Aesthetic:** Professional, reliable, water-like
**Examples:** Barbarians, Wizards, solid units
**Feeling:** Trustworthy, competent choice

#### Epic (Purple) - Powerful Spells
```css
.rarity-epic {
  background: linear-gradient(135deg, #6B2D7F 0%, #A855F7 100%);
  border-color: #D4AAFF;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6),
              inset 0 1px 0 rgba(255, 255, 255, 0.1);
}
```
**Aesthetic:** Mystical, powerful, arcane
**Examples:** Dragons, P.E.K.K.A, powerful magic
**Feeling:** Prestigious, special, high-impact

#### Legendary (Gold) - Gamechangers
```css
.rarity-legendary {
  background: linear-gradient(135deg, #B8860B 0%, #FF8C00 100%);
  border-color: #FFB84D;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6),
              0 0 30px rgba(255, 165, 0, 0.9),
              inset 0 0 20px rgba(255, 215, 0, 0.3);
}
```
**Aesthetic:** Divine, golden, mystical aura
**Examples:** Princess, Ice Wizard, ElectroGiant
**Feeling:** Exclusive, rare, game-changing
**Extra Effects:** Outer + inner glow for premium feel

## Background System

### Dark Fantasy Gradient
```css
/* Main background */
background: linear-gradient(135deg, #0a0e27 0%, #1a0a2e 50%, #0f0420 100%);

/* Breakdown: */
#0a0e27 - Deep midnight blue (upper left)
#1a0a2e - Royal purple-blue (center)
#0f0420 - Almost black purple (lower right)

/* Creates:** Depth, dimensional feeling, premium look
```

### Panel/Card Backgrounds
```css
/* Standard UI panels */
background: linear-gradient(180deg, rgba(31, 41, 55, 0.95) 0%, rgba(17, 24, 39, 0.98) 100%);

/* Creates:** Slight vertical fade, unified with main bg
/* Opacity 0.95-0.98:** Slightly transparent for layering feel
```

### Arena Background (Battle Area)
```css
background: linear-gradient(135deg, #1a3a3a 0%, #0f2828 50%, #0a1f1f 100%);

/* Breakdown: */
#1a3a3a - Teal-ish dark (battlefield edge)
#0f2828 - Darker teal (center)
#0a1f1f - Almost black teal (depth)

/* Creates:** Water/aquatic battlefield feeling
/* Different from main UI:** Visually separates gameplay area
```

## Typography Hierarchy

### Display Font: Arial Black

```css
/* HUGE TITLES - Match States, Results */
font-size: 3.5rem (56px)
font-weight: 900
letter-spacing: 2px
text-shadow: 0 4px 12px rgba(0, 0, 0, 0.8)

Examples:
- "🏆 VICTORY!"
- "💀 DEFEAT"
- "⚔️ SELECT DIFFICULTY"
- "🎴 BUILD YOUR DECK"
```

### Display Font: Large Titles
```css
/* Large section headers */
font-size: 2.5rem (40px)
font-weight: 900
letter-spacing: 1px
text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8)

Examples:
- Deck builder title
- Difficulty selector title
- HUD section names
```

### Body Font: Arial Regular

```css
/* Normal text content */
font-size: 1rem (16px)
font-weight: 600-700
text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8)

Examples:
- Descriptions
- Subtitles
- UI labels
```

### Small Text
```css
/* Labels, counts, elixir values */
font-size: 0.875rem (14px)
font-weight: bold
text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8)

Examples:
- Rarity badges
- Elixir costs
- Card names
- Tower labels
```

## Visual Effects & Techniques

### Glow Effects (Neon Style)
```css
/* Outer glow - creates halo effect */
box-shadow: 0 0 20px rgba(147, 51, 234, 0.6);

/* Enhanced glow on hover */
box-shadow: 0 0 30px rgba(147, 51, 234, 0.8),
            inset 0 0 20px rgba(147, 51, 234, 0.2);

/* Color variations: */
Purple glow: rgba(147, 51, 234, 0.6)
Green glow: rgba(16, 185, 129, 0.6)
Red glow: rgba(239, 68, 68, 0.6)
Gold glow: rgba(251, 191, 36, 0.6)
```

### Shine Effects (Animation)
```css
@keyframes shine {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

/* Creates:** Animated reflection effect
/* Used on:** Cards, elixir bars, spell effects
/* Duration:** 2-3 seconds for subtle effect
```

### Depth Layering (Shadows)
```css
/* Single element shadow */
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6);

/* Layered shadows for depth */
box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8),    /* Far shadow */
            0 8px 20px rgba(0, 0, 0, 0.4),     /* Mid shadow */
            0 0 1px rgba(255, 255, 255, 0.1);   /* Highlight edge */

/* Inset shadows for recessed effect */
box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.8);
```

### Gradient Overlays (3D Feel)
```css
/* Linear gradient for direction */
background: linear-gradient(135deg, #6B2D7F 0%, #A855F7 100%);
/* Creates:** Light-to-dark flow, directional feel

/* Radial for spotlight */
background: radial-gradient(circle at 30% 30%, #A855F7, #6B2D7F);
/* Creates:** Center highlight, 3D spherical feel
```

## Animation Philosophy

### Easing Function
```css
/* Standard easing for all UI animations */
cubic-bezier(0.4, 0, 0.2, 1)

/* This creates:** Smooth, natural acceleration/deceleration
/* Feels:** Premium, polished, not mechanical
```

### Animation Duration Guidelines

```
Fast (150ms): UI feedback, hover states, ripple effects
Normal (300ms): Card movements, state transitions, item reveals
Slow (500ms): Important scene changes, result screens

/* Principle: Faster = more responsive, Slower = more dramatic
```

### Key Animation Types

#### 1. Hover Elevations
```css
.cr-card:hover {
  transform: translateY(-12px) scale(1.05);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.6),
              0 0 20px rgba(147, 51, 234, 0.5);
  transition: all 200ms ease;
}

/* Communicates:** "This is interactive"
/* Feeling:** Satisfying, tactile, elevated
```

#### 2. Glowing Pulses
```css
@keyframes timer-pulse {
  0%, 100% {
    transform: scale(1);
    text-shadow: 0 4px 8px rgba(0, 0, 0, 0.8),
                 0 0 20px rgba(251, 191, 36, 0.4);
  }
  50% {
    transform: scale(1.05);
    text-shadow: 0 4px 8px rgba(0, 0, 0, 0.8),
                 0 0 30px rgba(251, 191, 36, 0.6);
  }
}

/* Communicates:** "Something important is here"
/* Feeling:** Attention, urgency, magical
```

#### 3. Floating Bobbing
```css
@keyframes unit-float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-4px); }
}

/* Communicates:** "This is alive/moving"
/* Feeling:** Organic, lightweight, ethereal
```

#### 4. Pop Animations
```css
@keyframes damage-pop {
  0% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
  100% {
    transform: translateY(-30px) scale(0.5);
    opacity: 0;
  }
}

/* Communicates:** "Something just happened"
/* Feeling:** Impact, consequence, cause-and-effect
```

## Rarity Visual Language

### Visual Progression

```
COMMON → RARE → EPIC → LEGENDARY
  ↓        ↓      ↓        ↓
Brown    Blue   Purple   Gold
  ↓        ↓      ↓        ↓
Earthy  Stable Mystical  Divine
  ↓        ↓      ↓        ↓
Basic   Solid  Powerful Exclusive
```

### Rarity Indicators Beyond Color

1. **Border Style**
   - Common: Subtle tan border
   - Rare: Medium blue border
   - Epic: Bright purple border
   - Legendary: Gold + glow effects

2. **Glow Intensity**
   - Common: Minimal glow
   - Rare: Moderate glow
   - Epic: Noticeable glow
   - Legendary: Intense double-glow

3. **Badge Styling**
   - Common: "COMMON" text
   - Rare: "RARE" text
   - Epic: "EPIC" text + brighter
   - Legendary: "LEGENDARY" text + shimmer

4. **Selection Feedback**
   - When selected: Green checkmark + scale
   - Border turns bright green
   - Glow effect intensifies
   - Visual confirmation of choice

## State Indicators

### Card States

#### Playable
```css
.hand-card.can-play {
  cursor: grab;
  opacity: 1;
  border-color: [rarity-color];
  box-shadow: normal;
}
```

#### Hovering
```css
.hand-card:hover:not(.cannot-play) {
  transform: translateY(-12px) scale(1.05);
  box-shadow: enhanced-with-glow;
  cursor: grab; /* Grab cursor indicates draggable */
}
```

#### Dragging
```css
.hand-card.dragging {
  opacity: 0.4;
  filter: grayscale(100%);
  cursor: grabbing;
  transform: scale(0.95);
  /* Faded, desaturated appearance */
}
```

#### Cannot Play (Insufficient Elixir)
```css
.hand-card.cannot-play {
  opacity: 0.5;
  cursor: not-allowed;
  border-color: rgba(107, 114, 128, 0.5);
  background: dimmed;
  /* Clear disabled state */
}
```

### Drop Zone States

#### Valid Drop Zone
```css
.cr-drop-zone.valid {
  animation: drop-zone-valid 1s ease-in-out infinite;
  border-color: rgba(16, 185, 129, 0.6);
  box-shadow: 0 0 50px rgba(16, 185, 129, 0.6);
  /* Green = success, good to go */
}
```

#### Invalid Drop Zone
```css
.cr-drop-zone.invalid {
  animation: drop-zone-invalid 0.6s ease-in-out;
  border-color: rgba(239, 68, 68, 0.8);
  box-shadow: 0 0 30px rgba(239, 68, 68, 0.6);
  /* Red = blocked, can't place here */
}
```

## Responsive Design Considerations

### Desktop (1024px+)
- Full 4-column card hand
- Large timer display
- Spacious HUD layout
- Full-size arena
- Premium spacing throughout

### Tablet (768px-1023px)
- Adjusted padding (-20%)
- Slightly smaller fonts
- Same layout structure
- Touch-friendly sizes maintained

### Mobile (640px-767px)
- 2-column card hand
- Stacked HUD elements
- Reduced spacing (-40%)
- Container-fit arena
- Optimized for touch

### Small Mobile (<640px)
- Extremely compact
- Minimal spacing
- Large touch targets (44px+)
- Essential information only
- Portrait orientation optimized

## Accessibility in Visual Design

### Color + Pattern
- Never rely on color alone
- Add text labels (e.g., "PLAYABLE" vs "LOCKED")
- Use patterns/icons for status

### Contrast Ratios
- Text on UI: 4.5:1 (WCAG AA)
- Text on background: 7:1 (WCAG AAA)
- Focus outlines: 3px solid #fbbf24

### Interactive Elements
- Minimum 44px × 44px for touch
- Clear hover/focus states
- Visual feedback on all interactions
- No information conveyed by animation alone

### Motion
- Reduced motion support: `@media (prefers-reduced-motion: reduce)`
- No auto-playing animations
- Pause on hover when appropriate
- Minimal flashing

## Consistency Rules

### Always Use Design Tokens
✓ Use --cr-primary-purple for all purple accents
✓ Use --transition-normal for most transitions
✓ Use font-display for titles
✓ Use semantic color variables

### Avoid
✗ Hardcoded colors (breaks theming)
✗ Custom animation timing (inconsistent feel)
✗ Generic fonts like Arial without context
✗ Inconsistent spacing (use 4px scale)
✗ Mixed border styles (stay with consistent design)

### Maintain Visual Hierarchy
1. Most important: Largest, brightest, centered
2. Important: Medium size, good contrast
3. Secondary: Smaller, muted colors
4. Tertiary: Smallest, most subtle

## Examples of Professional Application

### Example 1: Victory Screen
```
BIG GOLD "VICTORY!" TEXT (3.5rem, #fbbf24)
  ↓
Green subtitle explaining what happened
  ↓
Tower comparison with clear visuals
  ↓
TWO BUTTONS: "PLAY AGAIN" (green/prominent) | "MENU" (gray/secondary)

Color psychology: Victory = gold celebration + green success
Hierarchy: Title > Explanation > Stats > Actions
Animation: Scale-in 0.6s, staggered element timing
```

### Example 2: Elixir Bar Progression
```
Early Game:  GREEN (#10b981) + slight opacity = "Go time!"
Mid Game:    YELLOW (#f59e0b) + medium opacity = "Strategic moment"
Late Game:   RED (#ef4444) + high opacity = "Critical!"

Visual progression tells story without text
Smooth color transitions reflect game intensity
```

### Example 3: Card Rarity Selection
```
Common (Brown):    Approachable, "Start here"
Rare (Blue):       Trustworthy, "Safe choice"
Epic (Purple):     Powerful, "Special effect"
Legendary (Gold):  Exclusive, "Game changer"

Each rarity has unique gradient + glow
Checkmark confirms selection
Disabled state shows when deck full
```

## Brand Voice in Design

The UI communicates these values:
- **Premium**: Gold accents, glows, elevated cards
- **Powerful**: Deep colors, strong shadows, bold typography
- **Dark Fantasy**: Medieval aesthetics, magical theme
- **Responsive**: Smooth animations, clear feedback
- **Accessible**: High contrast, clear states, helpful UI

Every design decision reinforces that this is a **professional, premium gaming experience** built on authentic Clash Royale inspiration.

---

**Design System Version**: 2.0
**Last Updated**: 2024
**Theme**: Dark Fantasy (Clash Royale Authentic)
**Status**: ✅ Complete & Professional
