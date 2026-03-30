# Audio & Animation Implementation Guide

## Quick Start

### 1. Audio System Usage

```javascript
import { soundManager } from '../audio/soundManager.js'

// Initialize (happens automatically in Game.jsx on first game start)
soundManager.initialize()

// Play a sound effect
soundManager.playSfx('cardPlaced')

// Play custom chord
soundManager.playChord([262, 330, 392], 0.1) // C, E, G

// Play tone
soundManager.playTone(600, 0.15, 'sine')

// Volume control
soundManager.setVolume(0.5)          // 50% volume
const vol = soundManager.getVolume() // Get current volume

// Mute control
soundManager.toggleMute()
soundManager.setMuted(true)

// Cleanup
soundManager.stopAll()
soundManager.getActiveSoundCount() // Returns number of active sounds
```

### 2. Animation System Usage

```javascript
import { animationManager } from '../animation/animationManager.js'
import * as spriteAnimations from '../animation/spriteAnimations.js'

// Start animation loop
animationManager.start()

// Animate a value
const animId = animationManager.animateValue(
  0,           // from
  100,         // to
  1000,        // duration (ms)
  'easeOut',   // timing curve
  (value) => {
    // Called each frame with interpolated value
    console.log('Current value:', value)
  },
  () => {
    // Called when animation completes
    console.log('Animation done!')
  }
)

// Cancel animation
animationManager.cancel(animId)

// Keyframe animation
animationManager.createKeyframeSequence(
  [
    { time: 0, value: 0, ease: 'easeIn' },
    { time: 500, value: 100, ease: 'easeOut' },
    { time: 1000, value: 0 }
  ],
  (value) => console.log(value),
  () => console.log('Done!')
)

// Stop all animations
animationManager.cancelAll()
```

### 3. Sprite Animations

```javascript
import * as spriteAnimations from '../animation/spriteAnimations.js'

// Unit spawn animation
spriteAnimations.spawnUnitAnimation(unit, canvasContext)

// Unit death animation
spriteAnimations.killUnitAnimation(unit)

// Attack animation
spriteAnimations.unitAttackAnimation(unit)

// Damage flash
spriteAnimations.damageFlash(unit)

// Hover glow
spriteAnimations.unitHoverGlow(unit)

// Floating text (damage numbers)
spriteAnimations.floatingTextAnimation(
  { x: 100, y: 100 },  // position
  textState,             // state object to update
  2000                   // duration ms
)

// Generic animations
spriteAnimations.fadeAnimation(element, 1, 0, 500)     // Fade out
spriteAnimations.scaleAnimation(element, 1, 0.5, 300)  // Shrink
spriteAnimations.bounceAnimation(element, 30)           // Bounce
spriteAnimations.shakeAnimation(element)                // Shake
```

## Game Integration Example

### In Game.jsx

```jsx
import { soundManager } from '../audio/soundManager.js'
import { animationManager } from '../animation/animationManager.js'
import * as spriteAnimations from '../animation/spriteAnimations.js'

export default function Game() {
  // Initialize audio and animations when game starts
  useEffect(() => {
    if (screen === 'playing') {
      // Initialize audio on first user interaction
      if (!soundManager.isInitialized) {
        soundManager.initialize()
        soundManager.playSfx('matchStart')
      }

      // Start animation loop
      animationManager.start()

      return () => {
        animationManager.stop()
      }
    }
  }, [screen])

  // Handle card play with audio and animations
  const handleCardPlay = (cardId) => {
    if (card && spendPlayerElixir(card.elixirCost)) {
      // Play card placement sound
      soundManager.playSfx('cardPlaced')

      // Spawn units
      const units = spawnCard(cardId, 'player', 300, 700)
      gs.playerTroops.push(...units)

      // Animate unit spawns (staggered)
      units.forEach((unit, index) => {
        setTimeout(() => {
          spriteAnimations.spawnUnitAnimation(unit)
          soundManager.playSfx('unitSpawn')
        }, index * 100)
      })
    } else {
      // Not enough elixir
      soundManager.playSfx('cardError')
    }
  }

  // Detect game events
  useEffect(() => {
    const eventDetectionInterval = setInterval(() => {
      // Detect unit deaths
      if (unitCount < lastUnitCount) {
        soundManager.playSfx('unitDeath')
      }

      // Detect tower damage
      if (towerHp < lastTowerHp) {
        soundManager.playSfx('towerDamage')
      }
    }, 33)

    return () => clearInterval(eventDetectionInterval)
  }, [])

  // Handle game end
  const handleGameEnd = (winner) => {
    if (winner === 'player') {
      soundManager.playSfx('victory')
    } else {
      soundManager.playSfx('defeat')
    }
  }
}
```

## Sound Effects Reference

### All Available Sounds

```javascript
// Musical/Positive Sounds
soundManager.playSfx('cardPlaced')    // Bright C-Major chord
soundManager.playSfx('victory')       // Triumphant arpeggio
soundManager.playSfx('matchStart')    // Bright jingle
soundManager.playSfx('unitSpawn')     // Pop tone
soundManager.playSfx('criticalHit')   // Double beep

// Negative/Error Sounds
soundManager.playSfx('cardError')     // Sad descending tone
soundManager.playSfx('unitDeath')     // Explosion noise
soundManager.playSfx('towerDamage')   // Sharp impact tone
soundManager.playSfx('defeat')        // Sad trombone
soundManager.playSfx('damageHit')     // Triangle tone

// Special Sounds
soundManager.playSfx('freezeApplied')  // Crystalline sweep
soundManager.playSfx('spellCast')      // Generic chord
```

## Timing Curves for Animations

### Predefined Curves

```javascript
// Linear
animationManager.animateValue(0, 100, 1000, 'linear', onUpdate)

// Quadratic
animationManager.animateValue(0, 100, 1000, 'easeIn', onUpdate)
animationManager.animateValue(0, 100, 1000, 'easeOut', onUpdate)
animationManager.animateValue(0, 100, 1000, 'easeInOut', onUpdate)

// Cubic
animationManager.animateValue(0, 100, 1000, 'easeInCubic', onUpdate)
animationManager.animateValue(0, 100, 1000, 'easeOutCubic', onUpdate)
animationManager.animateValue(0, 100, 1000, 'easeInOutCubic', onUpdate)

// Quartic
animationManager.animateValue(0, 100, 1000, 'easeInQuart', onUpdate)
animationManager.animateValue(0, 100, 1000, 'easeOutQuart', onUpdate)
animationManager.animateValue(0, 100, 1000, 'easeInOutQuart', onUpdate)

// Quintic
animationManager.animateValue(0, 100, 1000, 'easeInQuint', onUpdate)
animationManager.animateValue(0, 100, 1000, 'easeOutQuint', onUpdate)
animationManager.animateValue(0, 100, 1000, 'easeInOutQuint', onUpdate)

// Exponential
animationManager.animateValue(0, 100, 1000, 'easeInExpo', onUpdate)
animationManager.animateValue(0, 100, 1000, 'easeOutExpo', onUpdate)
animationManager.animateValue(0, 100, 1000, 'easeInOutExpo', onUpdate)

// Circular
animationManager.animateValue(0, 100, 1000, 'easeInCirc', onUpdate)
animationManager.animateValue(0, 100, 1000, 'easeOutCirc', onUpdate)
animationManager.animateValue(0, 100, 1000, 'easeInOutCirc', onUpdate)

// Custom
animationManager.animateValue(0, 100, 1000, (p) => p * p, onUpdate)
```

## CSS Animations

### Available Keyframes

```css
/* Use these utility classes on React elements */
className="animate-pulse-red"      /* Pulsing red warning */
className="animate-scale-pop"      /* Pop effect */
className="animate-float-up"       /* Float upward */
className="animate-glow"           /* Glowing effect */
className="animate-shake"          /* Shake animation */
className="animate-bounce"         /* Bounce effect */
className="animate-spin"           /* Spinning */
className="animate-flash"          /* Flash effect */
className="animate-card-lift"      /* Card hover lift */
className="animate-expand"         /* Expand outward */
className="animate-celebrate"      /* Victory celebrate */
className="animate-defeat-fade"    /* Defeat fade */
```

### Custom CSS Usage

```css
/* Define custom timing */
.my-element {
  animation: scale-pop 0.3s ease-out;
}

.my-element:hover {
  animation: glow 2s ease-in-out infinite;
}
```

## Advanced Usage

### Staggered Animations

```javascript
// Stagger multiple animations
items.forEach((item, index) => {
  setTimeout(() => {
    spriteAnimations.spawnUnitAnimation(item)
  }, index * 100) // 100ms stagger
})
```

### Sequential Animations

```javascript
// Chain animations
const animId1 = animationManager.animateValue(0, 100, 500, 'easeOut', update1, () => {
  // First animation complete, start second
  const animId2 = animationManager.animateValue(100, 0, 500, 'easeIn', update2)
})
```

### Parallel Animations

```javascript
// Run animations simultaneously
const anim1 = spriteAnimations.spawnUnitAnimation(unit1)
const anim2 = spriteAnimations.spawnUnitAnimation(unit2)
const anim3 = spriteAnimations.spawnUnitAnimation(unit3)
```

### Conditional Animations

```javascript
// Only animate if needed
if (unit.hp > 0) {
  spriteAnimations.unitHoverGlow(unit)
} else {
  spriteAnimations.killUnitAnimation(unit)
}
```

## Performance Tips

### Avoid These Mistakes

```javascript
// ❌ Don't initialize audio repeatedly
useEffect(() => {
  soundManager.initialize() // WRONG - called every render!
}, [])

// ✅ Do initialize once
const initRef = useRef(false)
useEffect(() => {
  if (!initRef.current) {
    soundManager.initialize()
    initRef.current = true
  }
}, [])

// ❌ Don't create too many animations at once
for (let i = 0; i < 100; i++) {
  animationManager.animateValue(0, 100, 1000, 'linear', update)
}

// ✅ Do monitor and limit animations
if (animationManager.getActiveCount() < 50) {
  animationManager.animateValue(0, 100, 1000, 'linear', update)
}

// ❌ Don't forget to cancel animations on cleanup
useEffect(() => {
  const animId = animationManager.animateValue(...)
  // MISSING CLEANUP!
}, [])

// ✅ Do cancel animations on unmount
useEffect(() => {
  const animId = animationManager.animateValue(...)
  return () => {
    animationManager.cancel(animId)
  }
}, [])
```

## Debugging

### Console Logs

```javascript
// Check audio status
console.log(soundManager.isInitialized)
console.log(soundManager.isMuted)
console.log(soundManager.getVolume())
console.log(soundManager.getActiveSoundCount())

// Check animation status
console.log(animationManager.isRunning)
console.log(animationManager.getActiveCount())
console.log(animationManager.getStats())

// Check specific animation
const info = animationManager.getAnimationInfo(animId)
console.log(info)
```

### Browser DevTools

1. **Performance Tab**
   - Record during gameplay
   - Look for consistent frame rate
   - Check for animation frame drops

2. **Memory Tab**
   - Take heap snapshot
   - Check for growing animation/sound objects
   - Verify cleanup is working

3. **Console**
   - Watch for warnings about >50 animations
   - Check for audio errors
   - Monitor animation/sound counts

## Common Recipes

### Play Sound on Event

```javascript
// When unit dies
unit.onDeath = () => {
  soundManager.playSfx('unitDeath')
  spriteAnimations.killUnitAnimation(unit)
}

// When tower damaged
tower.onDamage = () => {
  soundManager.playSfx('towerDamage')
  spriteAnimations.damageFlash(tower)
}
```

### Animate UI Element

```javascript
// React component
const MyComponent = () => {
  const [value, setValue] = useState(0)

  const handleClick = () => {
    animationManager.animateValue(0, 100, 1000, 'easeOut', setValue)
  }

  return (
    <div onClick={handleClick} style={{ transform: `scale(${value / 100})` }}>
      Click to animate
    </div>
  )
}
```

### Create Sound Toggle

```javascript
const [muted, setMuted] = useState(false)

const handleToggleMute = () => {
  const newMuted = !muted
  soundManager.setMuted(newMuted)
  setMuted(newMuted)
  
  // Play confirmation sound
  if (!newMuted) {
    soundManager.playSfx('cardPlaced')
  }
}

return (
  <button onClick={handleToggleMute}>
    {muted ? '🔇' : '🔊'}
  </button>
)
```

## Troubleshooting

### Issue: No Sound

```javascript
// Check if initialized
if (!soundManager.isInitialized) {
  soundManager.initialize()
}

// Check if muted
if (soundManager.isMuted) {
  soundManager.setMuted(false)
}

// Check volume
if (soundManager.getVolume() === 0) {
  soundManager.setVolume(0.5)
}

// Try playing a sound
soundManager.playSfx('matchStart')
```

### Issue: Animations Stuttering

```javascript
// Check active animation count
const count = animationManager.getActiveCount()
console.log(`Active animations: ${count}`)

// Cancel excess animations if needed
if (count > 50) {
  console.warn('Too many animations - canceling oldest')
  animationManager.cancelAll()
}

// Check stats
console.log(animationManager.getStats())
```

### Issue: Memory Growing

```javascript
// Ensure cleanup is happening
console.log(soundManager.getActiveSoundCount())
console.log(animationManager.getActiveCount())

// Force cleanup
soundManager.stopAll()
animationManager.cancelAll()

// Profile with DevTools Memory tab
```

---

**For complete API reference, see: AUDIO_ANIMATION_SYSTEM.md**
