# Audio & Animation System Documentation

## Overview

The Card Game now includes a comprehensive audio and animation system powered by:

- **Web Audio API** for procedural sound generation (no external audio files)
- **requestAnimationFrame** for smooth 60 FPS animations
- **Canvas-compatible animations** that don't require DOM manipulation

## Audio System (soundManager.js)

### Initialization

```javascript
import { soundManager } from '../audio/soundManager.js'

// Initialize on first user interaction (happens automatically in Game.jsx)
soundManager.initialize()
```

### Sound Effects

Available sound effects:

| Effect | Type | Duration | Usage |
|--------|------|----------|-------|
| `cardPlaced` | C-Major Chord | 100ms | Card played successfully |
| `cardError` | Descending Tone | 300ms | Not enough elixir |
| `unitDeath` | Explosion Noise | 200ms | Unit dies |
| `towerDamage` | Sharp Tone | 150ms | Tower takes damage |
| `victory` | Arpeggio | 500ms | Player wins |
| `defeat` | Sad Trombone | 800ms | Player loses |
| `matchStart` | Bright Jingle | 300ms | Game starts |
| `criticalHit` | Double Beep | 200ms | Critical hit |
| `unitSpawn` | Pop Tone | 80ms | Unit spawned |
| `freezeApplied` | Crystalline Sweep | 400ms | Freeze spell cast |
| `spellCast` | Chord | 150ms | Any spell cast |
| `damageHit` | Triangle Tone | 100ms | Damage hit |

### Playing Sounds

```javascript
// Play sound effect
soundManager.playSfx('cardPlaced')

// Play custom chord
soundManager.playChord([262, 330, 392], 0.1) // C, E, G chord for 100ms

// Play simple tone
soundManager.playTone(600, 0.15, 'sine') // 600Hz for 150ms
```

### Volume Control

```javascript
// Set volume (0.0 to 1.0)
soundManager.setVolume(0.5)

// Get current volume
const vol = soundManager.getVolume()

// Mute/unmute
soundManager.setMuted(true)
soundManager.toggleMute()

// Stop all sounds
soundManager.stopAll()

// Get active sound count
console.log(soundManager.getActiveSoundCount())
```

## Animation System (animationManager.js)

### Initialization

```javascript
import { animationManager } from '../animation/animationManager.js'

// Start animation loop (automatic in Game.jsx)
animationManager.start()

// Stop when done
animationManager.stop()
```

### Animate Values

```javascript
// Animate any numeric value
const animId = animationManager.animateValue(
  0,           // start value
  100,         // end value
  1000,        // duration in ms
  'easeOut',   // timing curve
  (value) => {
    console.log('Current value:', value)
  },
  () => {
    console.log('Animation complete!')
  }
)

// Cancel animation
animationManager.cancel(animId)

// Pause/resume
animationManager.pause(animId)
animationManager.resume(animId)
```

### Timing Curves

Available timing curves:

- `linear` - Constant speed
- `easeIn` - Slow start, fast end
- `easeOut` - Fast start, slow end
- `easeInOut` - Slow start and end, fast middle
- `easeInCubic`, `easeOutCubic`, `easeInOutCubic`
- `easeInQuart`, `easeOutQuart`, `easeInOutQuart`
- `easeInQuint`, `easeOutQuint`, `easeInOutQuint`
- `easeInExpo`, `easeOutExpo`, `easeInOutExpo`
- `easeInCirc`, `easeOutCirc`, `easeInOutCirc`
- Custom function: `(progress) => {...}`

### Keyframe Sequences

```javascript
const keyframes = [
  { time: 0, value: 0, ease: 'easeIn' },
  { time: 500, value: 100, ease: 'easeOut' },
  { time: 1000, value: 0, ease: 'easeIn' }
]

animationManager.createKeyframeSequence(
  keyframes,
  (value) => console.log(value),
  () => console.log('Done!')
)
```

### Performance Monitoring

```javascript
// Get stats
const stats = animationManager.getStats()
console.log(stats)
// Output: { activeAnimations: 5, frameCount: 1234, isRunning: true }

// Get active animation count
console.log(animationManager.getActiveCount()) // 5
```

## Sprite Animations (spriteAnimations.js)

Pre-built animations for common game actions:

```javascript
import * as spriteAnimations from '../animation/spriteAnimations.js'

// Unit spawn - scale 0→1.2→1, fade in, glow
spriteAnimations.spawnUnitAnimation(unit, ctx)

// Unit death - scale down, fade out, spin
spriteAnimations.killUnitAnimation(unit)

// Attack - scale pop 1→1.1→1, recoil
spriteAnimations.unitAttackAnimation(unit)

// Damage flash - red tint overlay
spriteAnimations.damageFlash(unit)

// Hover glow - continuous pulse
spriteAnimations.unitHoverGlow(unit)

// Floating text - fade up animation
spriteAnimations.floatingTextAnimation(position, textState, 2000)

// Shake - for error states
spriteAnimations.shakeAnimation(element)

// Bounce - for emotes
spriteAnimations.bounceAnimation(element, 30)

// Fade - generic fade in/out
spriteAnimations.fadeAnimation(element, 1, 0, 500)

// Scale - generic scale animation
spriteAnimations.scaleAnimation(element, 1, 0.5, 300)

// Rotate - spin animation
spriteAnimations.rotateAnimation(element, 0, Math.PI * 2, 500)

// Move - position animation
spriteAnimations.moveAnimation(element, 0, 0, 100, 100, 500, 'easeOut')

// Screen flash - white overlay
spriteAnimations.screenFlashAnimation(screenState, 0.5)
```

## Integration in Game.jsx

The Game component automatically:

1. **Initializes audio** on first game start
2. **Starts animation loop** when playing
3. **Plays sounds** for all game events:
   - Card placed
   - Unit spawned
   - Unit killed
   - Tower damaged
   - Game won/lost
4. **Triggers animations** for:
   - Unit spawns
   - Unit deaths
   - Card errors
5. **Provides sound toggle** button (🔊/🔇)

## CSS Animation Support

Added comprehensive @keyframes to App.css for CSS-based animations:

```css
@keyframes pulse-red { }    /* For timer warnings */
@keyframes scale-pop { }    /* For card placement */
@keyframes float-up { }     /* For floating text */
@keyframes glow { }         /* For glowing effects */
@keyframes shake { }        /* For errors */
@keyframes bounce { }       /* For emotes */
@keyframes spin { }         /* For loading */
@keyframes flash { }        /* For damage */
/* ... and many more */
```

Usage in React:

```jsx
<div className="animate-pulse-red">Warning!</div>
<div className="animate-scale-pop">Placed!</div>
<div className="animate-float-up">+50 Gold</div>
```

## Performance Guidelines

### Monitor Active Animations

The system warns when > 50 animations are active:

```javascript
if (animationManager.getActiveCount() > 50) {
  console.warn('⚠️ High animation count:', animationManager.getActiveCount())
}
```

### Target 60 FPS

- Animations use requestAnimationFrame for smooth 60 FPS
- Canvas rendering avoids DOM layout recalculations
- Audio synthesis is lightweight - Web Audio API handles scheduling

### Memory Management

- Completed animations are automatically removed
- Sound oscillators are cleaned up after playback
- Use `cancelAll()` when transitioning between screens

## Best Practices

### Playing Sounds

```javascript
// ✅ Good - Sound effects for user actions
soundManager.playSfx('cardPlaced')

// ❌ Avoid - Playing too many sounds simultaneously
for (let i = 0; i < 100; i++) {
  soundManager.playSfx('damage') // Don't do this!
}

// ✅ Better - Stagger sounds
units.forEach((unit, i) => {
  setTimeout(() => soundManager.playSfx('unitSpawn'), i * 50)
})
```

### Animations

```javascript
// ✅ Good - Use sprite animations for common effects
spriteAnimations.spawnUnitAnimation(unit)

// ✅ Good - Custom animations with proper cleanup
const animId = animationManager.animateValue(0, 100, 500, 'easeOut', (v) => {
  element.value = v
})

// ❌ Avoid - Forgetting to cancel long-running animations
// Always cancel before unmounting components
animationManager.cancel(animId)
```

### Volume Control

```javascript
// ✅ Good - Persistent user preference
const [volume, setVolume] = useState(0.5)
useEffect(() => {
  soundManager.setVolume(volume)
}, [volume])

// ❌ Avoid - Constantly reinitializing audio
soundManager.initialize() // Only call once!
```

## Troubleshooting

### No Sound

1. Audio not initialized - needs user interaction first
2. Check browser console for errors
3. Verify AudioContext is supported
4. Check if sound is muted

### Animations Stuttering

1. Check active animation count: `animationManager.getActiveCount()`
2. If > 50, cancel unused animations
3. Profile with browser DevTools Performance tab
4. May be caused by CPU/GPU limitations

### Memory Leaks

1. Always call `animationManager.cancel()` when animations should stop
2. Use `animationManager.cancelAll()` between game sessions
3. Sound oscillators auto-cleanup after playback
4. Check console for warnings about high animation counts

## API Reference

### SoundManager

```javascript
soundManager.initialize()               // Init AudioContext
soundManager.playSfx(type, options)     // Play sound effect
soundManager.playChord(frequencies, duration)
soundManager.playTone(frequency, duration, type)
soundManager.setVolume(volume)          // 0.0-1.0
soundManager.getVolume()                // Returns 0.0-1.0
soundManager.setMuted(muted)
soundManager.toggleMute()               // Returns new mute state
soundManager.stopAll()
soundManager.getActiveSoundCount()
```

### AnimationManager

```javascript
animationManager.start()                // Start RAF loop
animationManager.stop()                 // Stop RAF loop
animationManager.animateValue(start, end, duration, curve, onUpdate, onComplete)
animationManager.createKeyframeSequence(keyframes, onUpdate, onComplete)
animationManager.cancel(animId)
animationManager.pause(animId)
animationManager.resume(animId)
animationManager.getAnimationInfo(animId)
animationManager.getActiveCount()
animationManager.cancelAll()
animationManager.getStats()
```

### Sprite Animations

All functions return animation ID for later cancellation.

```javascript
spawnUnitAnimation(unit, ctx)
killUnitAnimation(unit)
unitAttackAnimation(unit)
damageFlash(unit)
cardDeployAnimation(position, animState)
unitHoverGlow(unit)
floatingTextAnimation(position, textState, duration)
shakeAnimation(element)
bounceAnimation(element, bounceAmount)
fadeAnimation(element, startOpacity, endOpacity, duration)
scaleAnimation(element, startScale, endScale, duration)
rotateAnimation(element, startAngle, endAngle, duration)
moveAnimation(element, startX, startY, endX, endY, duration, curve)
screenFlashAnimation(screenState, intensity)
```

---

**Total System Stats:**
- Sound Effects: 13 types
- Timing Curves: 15+ types
- Pre-built Animations: 15+
- CSS Keyframes: 25+
- Lines of Code: ~2,500+

For questions or issues, check the implementation files:
- `src/audio/soundManager.js`
- `src/animation/animationManager.js`
- `src/animation/spriteAnimations.js`
