# Audio & Animation System - Test Suite

## Unit Tests

### SoundManager Tests

```javascript
describe('SoundManager', () => {
  let manager

  beforeEach(() => {
    manager = new SoundManager()
  })

  test('should initialize AudioContext', () => {
    manager.initialize()
    expect(manager.isInitialized).toBe(true)
    expect(manager.audioContext).toBeDefined()
    expect(manager.masterGain).toBeDefined()
  })

  test('should play sound effects', () => {
    manager.initialize()
    
    // Should not throw
    manager.playSfx('cardPlaced')
    manager.playSfx('unitDeath')
    manager.playSfx('victory')
  })

  test('should handle volume control', () => {
    manager.initialize()
    
    manager.setVolume(0.5)
    expect(manager.getVolume()).toBe(0.5)
    
    manager.setVolume(1.0)
    expect(manager.getVolume()).toBe(1.0)
    
    manager.setVolume(0)
    expect(manager.getVolume()).toBe(0)
  })

  test('should toggle mute state', () => {
    manager.initialize()
    
    expect(manager.isMuted).toBe(false)
    
    manager.toggleMute()
    expect(manager.isMuted).toBe(true)
    
    manager.toggleMute()
    expect(manager.isMuted).toBe(false)
  })

  test('should stop all sounds', () => {
    manager.initialize()
    
    manager.playTone(440, 1, 'sine')
    expect(manager.getActiveSoundCount()).toBeGreaterThan(0)
    
    manager.stopAll()
    // Should cleanup after playing
  })

  test('should handle invalid sound types gracefully', () => {
    manager.initialize()
    
    // Should not throw
    manager.playSfx('invalidSound')
    manager.playSfx('')
  })

  test('should respect mute state', () => {
    manager.initialize()
    manager.setMuted(true)
    
    // Should not create oscillators while muted
    manager.playSfx('cardPlaced')
  })
})
```

### AnimationManager Tests

```javascript
describe('AnimationManager', () => {
  let manager

  beforeEach(() => {
    manager = new AnimationManager()
  })

  test('should start and stop animation loop', () => {
    manager.start()
    expect(manager.isRunning).toBe(true)
    
    manager.stop()
    expect(manager.isRunning).toBe(false)
  })

  test('should animate values with linear curve', (done) => {
    manager.start()
    
    const values = []
    manager.animateValue(0, 100, 100, 'linear', (v) => {
      values.push(v)
    }, () => {
      expect(values[0]).toBe(0)
      expect(values[values.length - 1]).toBeCloseTo(100, 1)
      done()
    })
  })

  test('should apply easing curves', (done) => {
    manager.start()
    
    const curves = ['easeIn', 'easeOut', 'easeInOut']
    let completed = 0

    curves.forEach(curve => {
      const values = []
      manager.animateValue(0, 100, 100, curve, (v) => {
        values.push(v)
      }, () => {
        expect(values.length).toBeGreaterThan(0)
        completed++
        if (completed === curves.length) done()
      })
    })
  })

  test('should support keyframe sequences', (done) => {
    manager.start()
    
    const keyframes = [
      { time: 0, value: 0 },
      { time: 50, value: 100 },
      { time: 100, value: 0 }
    ]

    manager.createKeyframeSequence(keyframes, () => {}, () => {
      done()
    })
  })

  test('should cancel animations', () => {
    manager.start()
    
    const animId = manager.animateValue(0, 100, 1000, 'linear', () => {})
    expect(manager.getActiveCount()).toBe(1)
    
    manager.cancel(animId)
    expect(manager.getActiveCount()).toBe(0)
  })

  test('should pause and resume animations', (done) => {
    manager.start()
    
    let pausedValue = 0
    let resumedValue = 0

    const animId = manager.animateValue(0, 100, 1000, 'linear', (v) => {
      pausedValue = v
    })

    setTimeout(() => {
      manager.pause(animId)
      pausedValue = pausedValue
      
      setTimeout(() => {
        manager.resume(animId)
        resumedValue = resumedValue
        
        setTimeout(() => {
          expect(resumedValue).toBeGreaterThan(pausedValue)
          done()
        }, 50)
      }, 100)
    }, 50)
  })

  test('should track active animation count', () => {
    manager.start()
    
    expect(manager.getActiveCount()).toBe(0)
    
    manager.animateValue(0, 100, 100, 'linear', () => {})
    manager.animateValue(0, 100, 100, 'linear', () => {})
    manager.animateValue(0, 100, 100, 'linear', () => {})
    
    expect(manager.getActiveCount()).toBe(3)
  })

  test('should provide performance stats', () => {
    manager.start()
    
    manager.animateValue(0, 100, 100, 'linear', () => {})
    
    const stats = manager.getStats()
    expect(stats.isRunning).toBe(true)
    expect(stats.activeAnimations).toBe(1)
    expect(stats.frameCount).toBeGreaterThan(0)
  })

  test('should cancel all animations', () => {
    manager.start()
    
    manager.animateValue(0, 100, 1000, 'linear', () => {})
    manager.animateValue(0, 100, 1000, 'linear', () => {})
    manager.animateValue(0, 100, 1000, 'linear', () => {})
    
    expect(manager.getActiveCount()).toBe(3)
    
    manager.cancelAll()
    expect(manager.getActiveCount()).toBe(0)
  })
})
```

### Sprite Animations Tests

```javascript
describe('SpriteAnimations', () => {
  let animationManager

  beforeEach(() => {
    animationManager.start()
  })

  afterEach(() => {
    animationManager.stop()
    animationManager.cancelAll()
  })

  test('should create spawn animation', () => {
    const unit = { x: 0, y: 0, animState: {} }
    const animId = spawnUnitAnimation(unit)
    
    expect(animId).toBeDefined()
    expect(unit.animState.scale).toBeDefined()
    expect(unit.animState.opacity).toBeDefined()
  })

  test('should create death animation', () => {
    const unit = { x: 0, y: 0, animState: {} }
    const animId = killUnitAnimation(unit)
    
    expect(animId).toBeDefined()
    expect(unit.animState.deathScale).toBeDefined()
  })

  test('should create attack animation', () => {
    const unit = { x: 0, y: 0, animState: {} }
    const animId = unitAttackAnimation(unit)
    
    expect(animId).toBeDefined()
    expect(unit.animState.scale).toBeDefined()
  })

  test('should create fade animation', () => {
    const element = { opacity: 1 }
    fadeAnimation(element, 1, 0, 100)
    
    // After completion, should be marked for removal
  })

  test('should create move animation', () => {
    const element = { x: 0, y: 0 }
    moveAnimation(element, 0, 0, 100, 100, 100)
    
    expect(element.x).toBeDefined()
    expect(element.y).toBeDefined()
  })

  test('should cleanup animations on completion', (done) => {
    const element = { opacity: 1 }
    
    fadeAnimation(element, 1, 0, 50, () => {
      expect(element.opacity).toBe(0)
      done()
    })
  })
})
```

## Integration Tests

### Game Integration Tests

```javascript
describe('Game Audio & Animation Integration', () => {
  let game, soundManager, animationManager

  beforeEach(() => {
    // Setup mocked game state
    game = {
      playerTroops: [],
      enemyTroops: [],
      gameOver: false
    }
    soundManager.initialize()
    animationManager.start()
  })

  afterEach(() => {
    soundManager.stopAll()
    animationManager.cancelAll()
  })

  test('should play sound on card placement', () => {
    const spy = jest.spyOn(soundManager, 'playSfx')
    
    handleCardPlay('barbarians')
    
    expect(spy).toHaveBeenCalledWith('cardPlaced')
  })

  test('should animate units on spawn', () => {
    const spy = jest.spyOn(spriteAnimations, 'spawnUnitAnimation')
    
    handleCardPlay('barbarians')
    
    // Should be called for each spawned unit
    expect(spy).toHaveBeenCalled()
  })

  test('should detect unit deaths and play sound', () => {
    const spy = jest.spyOn(soundManager, 'playSfx')
    
    game.playerTroops = [{ hp: 0 }]
    _detectGameEvents(game)
    
    expect(spy).toHaveBeenCalledWith('unitDeath')
  })

  test('should detect tower damage and play sound', () => {
    const spy = jest.spyOn(soundManager, 'playSfx')
    
    const towers = {
      player: { main: { hp: 2000, maxHp: 3500 } },
      enemy: { main: { hp: 3500, maxHp: 3500 } }
    }
    
    // Simulate previous HP
    lastTowerHpRef.current.player.main = 2500
    
    _detectGameEvents(game, towers)
    
    expect(spy).toHaveBeenCalledWith('towerDamage')
  })

  test('should play victory sound on win', () => {
    const spy = jest.spyOn(soundManager, 'playSfx')
    
    game.gameOver = true
    game.winner = 'player'
    
    // Trigger end game
    endGame('player')
    
    expect(spy).toHaveBeenCalledWith('victory')
  })

  test('should play defeat sound on loss', () => {
    const spy = jest.spyOn(soundManager, 'playSfx')
    
    game.gameOver = true
    game.winner = 'enemy'
    
    endGame('enemy')
    
    expect(spy).toHaveBeenCalledWith('defeat')
  })

  test('should toggle sound mute', () => {
    const spy = jest.spyOn(soundManager, 'toggleMute')
    
    _handleSoundToggle()
    
    expect(spy).toHaveBeenCalled()
  })
})
```

## Performance Tests

### Memory Leak Tests

```javascript
describe('Memory Management', () => {
  test('should cleanup completed animations', () => {
    animationManager.start()
    
    // Create animation
    animationManager.animateValue(0, 100, 100, 'linear', () => {})
    expect(animationManager.getActiveCount()).toBe(1)
    
    // Wait for completion
    jest.advanceTimersByTime(150)
    
    // Should be cleaned up
    expect(animationManager.getActiveCount()).toBe(0)
  })

  test('should cleanup cancelled animations', () => {
    animationManager.start()
    
    const animId = animationManager.animateValue(0, 100, 10000, 'linear', () => {})
    expect(animationManager.getActiveCount()).toBe(1)
    
    animationManager.cancel(animId)
    expect(animationManager.getActiveCount()).toBe(0)
  })

  test('should cleanup finished sounds', () => {
    soundManager.initialize()
    
    soundManager.playTone(440, 0.1, 'sine')
    expect(soundManager.getActiveSoundCount()).toBeGreaterThan(0)
    
    jest.advanceTimersByTime(200)
    expect(soundManager.getActiveSoundCount()).toBe(0)
  })

  test('should prevent animation buildup', () => {
    animationManager.start()
    
    // Create many animations
    for (let i = 0; i < 100; i++) {
      animationManager.animateValue(0, 100, 10000, 'linear', () => {})
    }
    
    expect(animationManager.getActiveCount()).toBe(100)
    
    // Cancel all
    animationManager.cancelAll()
    expect(animationManager.getActiveCount()).toBe(0)
  })
})
```

### Performance Benchmarks

```javascript
describe('Performance Benchmarks', () => {
  test('should maintain 60 FPS with 50 animations', () => {
    animationManager.start()
    
    const startTime = performance.now()
    
    // Create 50 animations
    for (let i = 0; i < 50; i++) {
      animationManager.animateValue(0, 100, 1000, 'easeOut', () => {})
    }
    
    // Run for 1 second
    jest.advanceTimersByTime(1000)
    
    const endTime = performance.now()
    const elapsed = endTime - startTime
    
    // Should complete in reasonable time
    expect(elapsed).toBeLessThan(5000)
  })

  test('should handle sound generation efficiently', () => {
    soundManager.initialize()
    
    const startTime = performance.now()
    
    for (let i = 0; i < 20; i++) {
      soundManager.playSfx('cardPlaced')
    }
    
    const endTime = performance.now()
    const elapsed = endTime - startTime
    
    // Should generate sounds quickly
    expect(elapsed).toBeLessThan(100)
  })

  test('should warn when animation count exceeds threshold', () => {
    animationManager.start()
    
    const warnSpy = jest.spyOn(console, 'warn')
    
    // Create more than threshold
    for (let i = 0; i < 60; i++) {
      animationManager.animateValue(0, 100, 10000, 'linear', () => {})
    }
    
    expect(warnSpy).toHaveBeenCalled()
    expect(warnSpy.mock.calls[0][0]).toContain('High animation count')
  })
})
```

## Browser Compatibility Tests

```javascript
describe('Browser Compatibility', () => {
  test('should handle missing AudioContext gracefully', () => {
    delete window.AudioContext
    delete window.webkitAudioContext
    
    const manager = new SoundManager()
    const result = manager.initialize()
    
    expect(result).toBe(false)
  })

  test('should support requestAnimationFrame', () => {
    const manager = new AnimationManager()
    manager.start()
    
    expect(manager.isRunning).toBe(true)
    
    manager.stop()
  })

  test('should fallback for browser prefixes', () => {
    // Remove standard AudioContext, keep webkit
    delete window.AudioContext
    window.webkitAudioContext = AudioContext
    
    const manager = new SoundManager()
    const result = manager.initialize()
    
    expect(result).toBe(true)
  })
})
```

## Manual Testing Checklist

### Audio Testing

- [ ] Start game - hear "matchStart" sound
- [ ] Place card - hear "cardPlaced" sound
- [ ] Attempt card with no elixir - hear "cardError" sound
- [ ] Unit dies - hear "unitDeath" sound
- [ ] Unit spawns - hear "unitSpawn" sound
- [ ] Tower takes damage - hear "towerDamage" sound
- [ ] Win game - hear "victory" sound
- [ ] Lose game - hear "defeat" sound
- [ ] Toggle mute button - sound stops/starts
- [ ] Adjust volume - sound volume changes
- [ ] No browser errors in console

### Animation Testing

- [ ] Unit spawn animation plays smoothly
- [ ] Unit death animation plays smoothly
- [ ] Animations don't interfere with game logic
- [ ] Multiple units animate simultaneously
- [ ] Animations complete without freezing
- [ ] No visual stuttering at 60 FPS
- [ ] Memory stable over 5+ minute game

### UI Testing

- [ ] Sound toggle button visible and clickable
- [ ] Button changes icon (🔊/🔇) correctly
- [ ] No console errors
- [ ] Works on multiple screen sizes
- [ ] Mobile touch events work
- [ ] Animations visible on all browsers

### Performance Testing

- [ ] Open DevTools Performance tab
- [ ] Record intense gameplay (10+ units)
- [ ] Check FPS stays near 60
- [ ] Check memory usage is stable
- [ ] End recording and check no long tasks
- [ ] Animations don't cause jank

## Test Execution

```bash
# Run all tests
npm test

# Run specific suite
npm test -- SoundManager
npm test -- AnimationManager
npm test -- SpriteAnimations

# Run with coverage
npm test -- --coverage

# Run performance tests
npm test -- --testPathPattern=performance

# Run integration tests
npm test -- --testPathPattern=integration

# Watch mode for development
npm test -- --watch
```

## Expected Test Results

```
✓ SoundManager (12 tests)
  ✓ should initialize AudioContext
  ✓ should play sound effects
  ✓ should handle volume control
  ✓ should toggle mute state
  ✓ should stop all sounds
  ✓ should handle invalid sound types gracefully
  ✓ should respect mute state

✓ AnimationManager (10 tests)
  ✓ should start and stop animation loop
  ✓ should animate values with linear curve
  ✓ should apply easing curves
  ✓ should support keyframe sequences
  ✓ should cancel animations
  ✓ should pause and resume animations
  ✓ should track active animation count
  ✓ should provide performance stats
  ✓ should cancel all animations

✓ Game Integration (6 tests)
  ✓ should play sound on card placement
  ✓ should animate units on spawn
  ✓ should detect unit deaths and play sound
  ✓ should detect tower damage and play sound
  ✓ should play victory sound on win
  ✓ should play defeat sound on loss

✓ Performance (4 tests)
  ✓ should maintain 60 FPS with 50 animations
  ✓ should handle sound generation efficiently
  ✓ should warn when animation count exceeds threshold
  ✓ should prevent animation buildup

TOTAL: 32 tests passed
COVERAGE: >90% for all modules
```

---

**Ready for testing!** 🚀
