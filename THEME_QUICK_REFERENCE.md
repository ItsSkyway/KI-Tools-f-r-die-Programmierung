# Dark Fantasy Clash Royale UI Theme - Quick Reference

## 🎨 Color Palette Quick Reference

### Primary Brand Colors
```css
--color-primary: #9333ea          /* Deep Purple - Main brand */
--color-primary-bright: #a855f7   /* Bright Purple - Highlights */
--color-primary-light: #c084fc    /* Light Purple - Hover states */
```

### Semantic Accent Colors
```css
--color-accent-gold: #fbbf24      /* Gold - Legendary/Premium */
--color-accent-green: #10b981     /* Green - Player/Success */
--color-accent-red: #ef4444       /* Red - Enemy/Danger */
--color-accent-yellow: #f59e0b    /* Yellow - Warning */
--color-accent-blue: #3b82f6      /* Blue - Info/River */
```

### Dark Fantasy Backgrounds
```css
--color-bg-darkest: #0a0e27       /* Darkest background */
--color-bg-darker: #1a0a2e        /* Dark panels */
--color-bg-dark: #0f0420          /* Darkest accents */
--color-bg-panel: rgba(31, 41, 55, 0.95)  /* Semi-transparent */
```

### Text Colors
```css
--color-text-primary: #f9fafb     /* Main text - nearly white */
--color-text-secondary: #d1d5db   /* Secondary text - light gray */
--color-text-tertiary: #9ca3af    /* Tertiary text - medium gray */
--color-text-disabled: #6b7280    /* Disabled text */
```

---

## 🎭 Rarity Gradients

### Card Rarity Styling
```css
/* Common - Brown/Gold */
background: linear-gradient(135deg, #6B4423 0%, #C9A961 100%);
border-color: #E8D5B7;

/* Rare - Blue */
background: linear-gradient(135deg, #1E5F9E 0%, #4A9FD8 100%);
border-color: #6EB5E8;

/* Epic - Purple */
background: linear-gradient(135deg, #6B2D7F 0%, #A855F7 100%);
border-color: #D4AAFF;

/* Legendary - Gold/Orange (with glow) */
background: linear-gradient(135deg, #B8860B 0%, #FF8C00 100%);
border-color: #FFB84D;
box-shadow: 0 0 40px rgba(255, 165, 0, 0.9);
```

---

## 🎯 Usage Examples

### Using Color Tokens
```html
<!-- Wrong - Hardcoded color -->
<div style="color: #9333ea; background: #0a0e27;">Content</div>

<!-- Right - Using CSS variables -->
<div style="color: var(--color-primary); background: var(--color-bg-darkest);">Content</div>
```

### Using Utility Classes
```html
<!-- Button -->
<button class="btn btn-primary">Play Card</button>
<button class="btn btn-secondary">Cancel</button>

<!-- Text colors -->
<p class="text-primary">Main text</p>
<p class="text-accent-gold">Gold text</p>
<p class="text-accent-green">Success message</p>

<!-- Cards -->
<div class="card">Card with default styling</div>
<div class="card rarity-epic">Epic card</div>
```

### Shadows & Depth
```css
/* Subtle shadow */
box-shadow: var(--shadow-sm);

/* Medium shadow */
box-shadow: var(--shadow-md);

/* With glow effect */
box-shadow: var(--shadow-lg), var(--shadow-glow-purple);

/* Legendary glow */
box-shadow: var(--shadow-lg), var(--shadow-glow-gold);
```

### Animations
```css
/* Hover animation */
transition: all var(--transition-smooth);

/* Pulsing glow */
animation: glow-pulse 2s ease-in-out infinite;

/* Floating animation */
animation: float 3s ease-in-out infinite;

/* Scale bounce in */
animation: scale-bounce-in 0.6s ease-out;
```

---

## 📐 Spacing System

### Standard Spacing Scale (4px base unit)
```css
--space-1: 0.25rem   /* 4px */
--space-2: 0.5rem    /* 8px */
--space-3: 0.75rem   /* 12px */
--space-4: 1rem      /* 16px */
--space-6: 1.5rem    /* 24px */
--space-8: 2rem      /* 32px */
--space-10: 2.5rem   /* 40px */
--space-12: 3rem     /* 48px */
--space-16: 4rem     /* 64px */
```

---

## 📝 Typography Scale

### Font Sizes
```css
--font-size-xs: 0.75rem      /* 12px - Small labels */
--font-size-sm: 0.875rem     /* 14px - Secondary text */
--font-size-base: 1rem       /* 16px - Body text */
--font-size-lg: 1.125rem     /* 18px - Large body */
--font-size-xl: 1.25rem      /* 20px - Subheadings */
--font-size-2xl: 1.5rem      /* 24px - Headings */
--font-size-3xl: 1.875rem    /* 30px - Large headings */
--font-size-4xl: 2.25rem     /* 36px - Hero text */
```

### Font Families
```css
--font-family-display: 'Clash Royale', 'Arial Black', sans-serif    /* Headlines */
--font-family-body: 'Arial', sans-serif                              /* Content */
--font-family-mono: 'Courier New', monospace                         /* Code */
```

### Font Weights
```css
--font-weight-normal: 400
--font-weight-medium: 500
--font-weight-bold: 700
```

---

## 🎬 Animation Timings

### Transition Speeds
```css
--transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1)
--transition-normal: 300ms cubic-bezier(0.4, 0, 0.2, 1)
--transition-slow: 500ms cubic-bezier(0.4, 0, 0.2, 1)
--transition-smooth: 300ms cubic-bezier(0.34, 1.56, 0.64, 1)  /* Bounce/spring */
```

### Available Keyframe Animations
- `glow-pulse` - Pulsing glow effect
- `fade-in` - Smooth fade entrance
- `scale-bounce-in` - Scale-in with bounce
- `slide-down` - Slide down from top
- `slide-up` - Slide up from bottom
- `shimmer` - Shine/shimmer effect
- `float` - Floating/bobbing motion
- `pulse-scale` - Scaling pulse

---

## 🛠️ Customization Guide

### Changing Colors
All colors are centralized in `src/ui/theme.css` at the `:root` level. To change a color globally:

```css
:root {
  --color-primary: #YOUR_NEW_COLOR;  /* Change primary purple */
  --color-accent-gold: #YOUR_NEW_COLOR;  /* Change gold */
}
```

### Adding New Animations
Add keyframes to `theme.css`:

```css
@keyframes my-custom-animation {
  0% { transform: scale(1); opacity: 1; }
  100% { transform: scale(1.1); opacity: 0.5; }
}

/* Use it */
animation: my-custom-animation 0.6s ease-out;
```

### Creating New Component Styles
```css
/* Add to theme.css utility classes or specific CSS file */
.my-component {
  background: var(--color-bg-panel);
  border: 2px solid var(--color-border);
  box-shadow: var(--shadow-md);
  transition: all var(--transition-smooth);
  border-radius: var(--radius-lg);
}
```

---

## ♿ Accessibility Features

### Supported
- ✅ **Reduced Motion**: Respects `prefers-reduced-motion` media query
- ✅ **High Contrast**: Supports `prefers-contrast: more`
- ✅ **Color Contrast**: WCAG AA compliant (4.5:1 minimum)
- ✅ **Focus States**: Clear focus indicators on interactive elements
- ✅ **Keyboard Navigation**: All elements are keyboard accessible

### Testing Accessibility
```css
/* Test reduced motion */
@media (prefers-reduced-motion: reduce) {
  /* Animations are disabled */
}

/* Test high contrast */
@media (prefers-contrast: more) {
  /* Borders and colors are enhanced */
}
```

---

## 📱 Responsive Breakpoints

### Mobile-First Approach
```css
/* Base: Mobile (320px+) */
/* Design for mobile first */

/* Small devices (640px+) */
@media (min-width: 640px) { }

/* Medium devices (768px+) */
@media (min-width: 768px) { }

/* Large devices (1024px+) */
@media (min-width: 1024px) { }

/* Extra large (1280px+) */
@media (min-width: 1280px) { }
```

---

## 🔍 How to Apply Theme to New Components

### Step 1: Use CSS Variables
```css
.new-component {
  color: var(--color-text-primary);
  background: var(--color-bg-darker);
}
```

### Step 2: Add Theme Classes
```html
<div class="panel card shadow-lg">
  <p class="text-primary">Themed content</p>
</div>
```

### Step 3: Apply Animations
```css
.new-component {
  transition: all var(--transition-smooth);
}

.new-component:hover {
  box-shadow: var(--shadow-glow-purple);
  transform: translateY(-2px);
}
```

---

## 📊 File Structure

```
src/ui/
├── theme.css                 ← Unified design system (use this!)
├── ClashRoyaleHUD.css        ← HUD components (imports theme.css)
├── ClashArena.css            ← Arena components (imports theme.css)
├── Game.jsx                  ← Main component (uses CSS variables)
└── ... (other components)

index.html
└── Links to all CSS files
```

---

## ✨ Design System Key Principles

1. **Consistency**: All UI uses centralized tokens
2. **Accessibility**: WCAG AA compliance built-in
3. **Performance**: GPU-accelerated animations
4. **Maintainability**: Single source of truth for styles
5. **Scalability**: Easy to extend or create new themes
6. **Responsiveness**: Mobile-first, adaptive layouts

---

## 🚀 Next Steps

### For Developers
- Use CSS variables for all styling
- Leverage utility classes for common patterns
- Reference theme.css for available tokens
- Test with accessibility tools

### For Designers
- Extend color palette by adding new tokens
- Create new animation variations
- Add new component base styles
- Maintain consistency across UI

### For Updates
- Update colors in theme.css (propagates everywhere)
- Add animations to theme.css keyframes
- Create new utility classes as needed
- Keep component-specific CSS focused

---

**Last Updated**: 2024
**Theme Version**: 1.0 - Dark Fantasy Clash Royale
**Status**: ✅ Production Ready
