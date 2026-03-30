/**
 * Animation Manager
 * Orchestrates all game animations using requestAnimationFrame
 * Handles timing, curves, and animation queuing
 */

class AnimationManager {
  constructor() {
    this.animations = new Map(); // id -> animation object
    this.animationId = 0;
    this.rafId = null;
    this.lastFrameTime = 0;
    this.frameCount = 0;
    this.performanceThreshold = 50; // Warn if > 50 animations
    this.isRunning = false;
  }

  /**
   * Start the animation loop
   */
  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.lastFrameTime = performance.now();
    this._animate(this.lastFrameTime);
  }

  /**
   * Stop the animation loop
   */
  stop() {
    this.isRunning = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  /**
   * Main animation loop using requestAnimationFrame
   */
  _animate(currentTime) {
    if (!this.isRunning) return;

    const deltaTime = currentTime - this.lastFrameTime;
    this.lastFrameTime = currentTime;
    this.frameCount++;

    // Update all active animations
    const completedIds = [];
    
    for (const [id, animation] of this.animations.entries()) {
      const progress = Math.min(1, (currentTime - animation.startTime) / animation.duration);
      
      // Apply timing curve
      const easedProgress = this._applyCurve(progress, animation.curve);
      
      // Call update callback
      animation.onUpdate(easedProgress);
      
      // Mark as completed if done
      if (progress >= 1) {
        completedIds.push(id);
        if (animation.onComplete) {
          animation.onComplete();
        }
      }
    }

    // Remove completed animations
    completedIds.forEach(id => {
      this.animations.delete(id);
    });

    // Performance monitoring
    if (this.animations.size > this.performanceThreshold) {
      console.warn(`⚠️ High animation count: ${this.animations.size} (threshold: ${this.performanceThreshold})`);
    }

    // Continue loop
    this.rafId = requestAnimationFrame(this._animate.bind(this));
  }

  /**
   * Apply timing curve to progress value
   */
  _applyCurve(progress, curve = 'linear') {
    const curves = {
      linear: (p) => p,
      easeIn: (p) => p * p,
      easeOut: (p) => 1 - (1 - p) ** 2,
      easeInOut: (p) => p < 0.5 ? 2 * p * p : 1 - (-2 * p + 2) ** 2 / 2,
      easeInCubic: (p) => p ** 3,
      easeOutCubic: (p) => 1 - (1 - p) ** 3,
      easeInOutCubic: (p) => p < 0.5 ? 4 * p ** 3 : 1 - (-2 * p + 2) ** 3 / 2,
      easeInQuart: (p) => p ** 4,
      easeOutQuart: (p) => 1 - (1 - p) ** 4,
      easeInOutQuart: (p) => p < 0.5 ? 8 * p ** 4 : 1 - (-2 * p + 2) ** 4 / 2,
      easeInQuint: (p) => p ** 5,
      easeOutQuint: (p) => 1 - (1 - p) ** 5,
      easeInOutQuint: (p) => p < 0.5 ? 16 * p ** 5 : 1 - (-2 * p + 2) ** 5 / 2,
      easeInExpo: (p) => p === 0 ? 0 : 2 ** (10 * p - 10),
      easeOutExpo: (p) => p === 1 ? 1 : 1 - 2 ** (-10 * p),
      easeInOutExpo: (p) => {
        if (p === 0 || p === 1) return p;
        return p < 0.5 ? 2 ** (20 * p - 10) / 2 : (2 - 2 ** (-20 * p + 10)) / 2;
      },
      easeInCirc: (p) => 1 - Math.sqrt(1 - p ** 2),
      easeOutCirc: (p) => Math.sqrt(1 - (p - 1) ** 2),
      easeInOutCirc: (p) => p < 0.5
        ? (1 - Math.sqrt(1 - (2 * p) ** 2)) / 2
        : (Math.sqrt(1 - (-2 * p + 2) ** 2) + 1) / 2,
    };

    const curveFn = typeof curve === 'function' ? curve : curves[curve] || curves.linear;
    return curveFn(Math.max(0, Math.min(1, progress)));
  }

  /**
   * Animate a value over time
   * @param {number} startVal - Starting value
   * @param {number} endVal - Ending value
   * @param {number} duration - Duration in milliseconds
   * @param {string|function} curve - Timing curve
   * @param {function} onUpdate - Called each frame with interpolated value
   * @param {function} onComplete - Called when animation completes
   * @returns {number} Animation ID
   */
  animateValue(startVal, endVal, duration, curve = 'linear', onUpdate, onComplete) {
    const animId = ++this.animationId;
    const startTime = performance.now();

    this.animations.set(animId, {
      startTime,
      duration,
      curve,
      onUpdate: (progress) => {
        const value = startVal + (endVal - startVal) * progress;
        onUpdate(value);
      },
      onComplete
    });

    // Start animation loop if not already running
    if (!this.isRunning) {
      this.start();
    }

    return animId;
  }

  /**
   * Create a keyframe sequence animation
   * @param {array} keyframes - Array of {time: ms, value: any, ease: string}
   * @param {function} onUpdate - Called each frame
   * @param {function} onComplete - Called when done
   * @returns {number} Animation ID
   */
  createKeyframeSequence(keyframes, onUpdate, onComplete) {
    if (!keyframes || keyframes.length === 0) return null;

    const animId = ++this.animationId;
    const totalDuration = Math.max(...keyframes.map(kf => kf.time));
    const startTime = performance.now();

    this.animations.set(animId, {
      startTime,
      duration: totalDuration,
      curve: 'linear',
      onUpdate: (progress) => {
        const currentTime = progress * totalDuration;
        
        // Find current and next keyframe
        let currentKf = keyframes[0];
        let nextKf = keyframes[0];
        
        for (let i = 0; i < keyframes.length - 1; i++) {
          if (keyframes[i].time <= currentTime) {
            currentKf = keyframes[i];
            nextKf = keyframes[i + 1];
          }
        }
        
        // Interpolate between keyframes
        const timeBetween = nextKf.time - currentKf.time;
        const timeInSegment = currentTime - currentKf.time;
        const segmentProgress = timeBetween > 0 ? timeInSegment / timeBetween : 1;
        
        const curve = nextKf.ease || 'linear';
        const easedProgress = this._applyCurve(segmentProgress, curve);
        
        // Linear interpolation for numeric values
        let value;
        if (typeof currentKf.value === 'number' && typeof nextKf.value === 'number') {
          value = currentKf.value + (nextKf.value - currentKf.value) * easedProgress;
        } else {
          value = progress >= (nextKf.time / totalDuration) ? nextKf.value : currentKf.value;
        }
        
        onUpdate(value);
      },
      onComplete
    });

    if (!this.isRunning) {
      this.start();
    }

    return animId;
  }

  /**
   * Cancel an animation
   * @param {number} animId - Animation ID to cancel
   */
  cancel(animId) {
    const animation = this.animations.get(animId);
    if (animation) {
      this.animations.delete(animId);
      return true;
    }
    return false;
  }

  /**
   * Pause an animation
   * @param {number} animId - Animation ID to pause
   */
  pause(animId) {
    const animation = this.animations.get(animId);
    if (animation) {
      animation.paused = true;
      animation.pauseTime = performance.now();
    }
  }

  /**
   * Resume a paused animation
   * @param {number} animId - Animation ID to resume
   */
  resume(animId) {
    const animation = this.animations.get(animId);
    if (animation && animation.paused) {
      const offset = performance.now() - animation.pauseTime;
      animation.startTime += offset;
      animation.paused = false;
    }
  }

  /**
   * Get animation info
   * @param {number} animId - Animation ID
   * @returns {object} Animation info
   */
  getAnimationInfo(animId) {
    return this.animations.get(animId);
  }

  /**
   * Get count of active animations
   */
  getActiveCount() {
    return this.animations.size;
  }

  /**
   * Cancel all animations
   */
  cancelAll() {
    this.animations.clear();
  }

  /**
   * Get performance stats
   */
  getStats() {
    return {
      activeAnimations: this.animations.size,
      frameCount: this.frameCount,
      isRunning: this.isRunning
    };
  }
}

// Export singleton
export const animationManager = new AnimationManager();

export default AnimationManager;
