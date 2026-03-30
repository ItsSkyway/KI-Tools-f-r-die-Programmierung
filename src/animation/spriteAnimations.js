/**
 * Sprite Animations
 * Canvas-based unit and effect animations
 * All animations work with canvas rendering without DOM manipulation
 */

import { animationManager } from './animationManager.js';

/**
 * Animate unit spawn
 * @param {object} unit - Unit to animate
 * @param {CanvasRenderingContext2D} ctx - Canvas context (for potential immediate rendering)
 * @returns {number} Animation ID
 */
export function spawnUnitAnimation(unit, ctx) {
  // Store initial state
  unit.animState = unit.animState || {};
  unit.animState.scale = 0;
  unit.animState.opacity = 0;
  unit.animState.glowIntensity = 0;

  return animationManager.animateValue(
    0,
    1,
    300, // 0.3 seconds
    'easeOut',
    (progress) => {
      // Scale: 0 -> 1.2 -> 1
      if (progress < 0.5) {
        unit.animState.scale = progress * 2.4;
      } else {
        unit.animState.scale = 1 + (1 - progress) * 0.4;
      }
      
      // Fade in
      unit.animState.opacity = progress;
      
      // Glow pulse
      unit.animState.glowIntensity = Math.sin(progress * Math.PI) * 0.5;
    },
    () => {
      // Cleanup
      unit.animState.scale = 1;
      unit.animState.opacity = 1;
      unit.animState.glowIntensity = 0;
    }
  );
}

/**
 * Animate unit death
 * @param {object} unit - Unit to animate
 * @returns {number} Animation ID
 */
export function killUnitAnimation(unit) {
  unit.animState = unit.animState || {};
  unit.animState.deathScale = 1;
  unit.animState.deathOpacity = 1;
  unit.animState.deathRotation = 0;

  return animationManager.animateValue(
    0,
    1,
    500, // 0.5 seconds
    'easeIn',
    (progress) => {
      // Scale down: 1 -> 0.2
      unit.animState.deathScale = 1 - (progress * 0.8);
      
      // Fade out
      unit.animState.deathOpacity = 1 - progress;
      
      // Spin and bounce
      unit.animState.deathRotation = progress * Math.PI * 4;
    },
    () => {
      // Mark as dead and ready for removal
      unit.isDying = true;
    }
  );
}

/**
 * Animate unit attack
 * @param {object} unit - Attacking unit
 * @returns {number} Animation ID
 */
export function unitAttackAnimation(unit) {
  unit.animState = unit.animState || {};
  const originalScale = unit.animState.scale || 1;

  return animationManager.animateValue(
    0,
    1,
    200, // 0.2 seconds
    'easeInOut',
    (progress) => {
      // Scale pop: 1 -> 1.1 -> 1
      const popAmount = Math.sin(progress * Math.PI) * 0.1;
      unit.animState.scale = originalScale + popAmount;
      
      // Recoil: backward then forward
      unit.animState.recoil = Math.sin(progress * Math.PI) * 15; // pixels
    },
    () => {
      unit.animState.scale = originalScale;
      unit.animState.recoil = 0;
    }
  );
}

/**
 * Damage flash animation
 * @param {object} unit - Unit to flash
 * @returns {number} Animation ID
 */
export function damageFlash(unit) {
  unit.animState = unit.animState || {};
  unit.animState.damageFlashIntensity = 0;

  return animationManager.animateValue(
    1,
    0,
    500, // 0.5 seconds
    'easeOut',
    (progress) => {
      // Red tint overlay intensity
      unit.animState.damageFlashIntensity = progress;
    },
    () => {
      unit.animState.damageFlashIntensity = 0;
    }
  );
}

/**
 * Card deploy animation
 * @param {object} position - {x, y} card position
 * @param {object} animState - Animation state object to update
 * @returns {number} Animation ID
 */
export function cardDeployAnimation(position, animState) {
  animState.deployScale = 0;
  animState.deployOpacity = 0;
  animState.glowBrightness = 0;

  return animationManager.animateValue(
    0,
    1,
    300, // 0.3 seconds
    'easeOut',
    (progress) => {
      // Scale: 0 -> 1.2 -> 1
      if (progress < 0.5) {
        animState.deployScale = progress * 2.4;
      } else {
        animState.deployScale = 1 + (1 - progress) * 0.4;
      }
      
      // Fade in
      animState.deployOpacity = progress;
      
      // Border glow pulse
      animState.glowBrightness = Math.sin(progress * Math.PI * 1.5) * 0.8;
    },
    () => {
      animState.deployScale = 1;
      animState.deployOpacity = 1;
      animState.glowBrightness = 0;
    }
  );
}

/**
 * Continuous hover glow animation
 * @param {object} unit - Unit to glow
 * @returns {number} Animation ID
 */
export function unitHoverGlow(unit) {
  unit.animState = unit.animState || {};
  
  // Create infinite loop animation
  const keyframes = [
    { time: 0, value: 0.3, ease: 'easeInOut' },
    { time: 500, value: 0.8, ease: 'easeInOut' },
    { time: 1000, value: 0.3, ease: 'easeInOut' }
  ];

  return animationManager.createKeyframeSequence(
    keyframes,
    (intensity) => {
      unit.animState.hoverGlowIntensity = intensity;
    },
    () => {
      // Restart the animation for continuous loop
      unitHoverGlow(unit);
    }
  );
}

/**
 * Floating text animation (damage/heal numbers)
 * @param {object} position - {x, y} starting position
 * @param {object} textState - State object to update
 * @param {number} duration - Duration in ms
 * @returns {number} Animation ID
 */
export function floatingTextAnimation(position, textState, duration = 2000) {
  textState.floatY = 0;
  textState.opacity = 1;

  return animationManager.animateValue(
    0,
    1,
    duration,
    'easeOut',
    (progress) => {
      // Float upward
      textState.floatY = -50 * progress;
      
      // Fade out
      textState.opacity = 1 - progress;
      
      // Optional horizontal drift
      textState.driftX = Math.sin(progress * Math.PI * 2) * 10;
    },
    () => {
      // Mark for removal
      textState.removed = true;
    }
  );
}

/**
 * Shake animation (for unavailable cards)
 * @param {object} element - Element state to animate
 * @returns {number} Animation ID
 */
export function shakeAnimation(element) {
  element.shake = 0;

  return animationManager.animateValue(
    0,
    1,
    200, // 0.2 seconds
    'linear',
    (progress) => {
      // Shake left and right
      const shakeAmount = Math.sin(progress * Math.PI * 8) * 8;
      element.shake = shakeAmount;
    },
    () => {
      element.shake = 0;
    }
  );
}

/**
 * Bounce animation (for victory/defeat emotes)
 * @param {object} element - Element to animate
 * @param {number} bounceAmount - How high to bounce (pixels)
 * @returns {number} Animation ID
 */
export function bounceAnimation(element, bounceAmount = 30) {
  element.bounceY = 0;
  element.scale = 1;

  return animationManager.animateValue(
    0,
    1,
    400, // 0.4 seconds
    'easeOut',
    (progress) => {
      // Bounce up then down
      const bounce = Math.sin(progress * Math.PI);
      element.bounceY = -bounce * bounceAmount;
      
      // Scale: 1 -> 1.5 -> 1
      element.scale = 1 + bounce * 0.5;
    },
    () => {
      element.bounceY = 0;
      element.scale = 1;
    }
  );
}

/**
 * Fade animation
 * @param {object} element - Element to fade
 * @param {number} startOpacity - Starting opacity
 * @param {number} endOpacity - Ending opacity
 * @param {number} duration - Duration in ms
 * @returns {number} Animation ID
 */
export function fadeAnimation(element, startOpacity, endOpacity, duration = 500) {
  return animationManager.animateValue(
    startOpacity,
    endOpacity,
    duration,
    'easeOut',
    (opacity) => {
      element.opacity = opacity;
    },
    () => {
      element.removed = endOpacity === 0;
    }
  );
}

/**
 * Scale animation
 * @param {object} element - Element to scale
 * @param {number} startScale - Starting scale
 * @param {number} endScale - Ending scale
 * @param {number} duration - Duration in ms
 * @returns {number} Animation ID
 */
export function scaleAnimation(element, startScale, endScale, duration = 300) {
  return animationManager.animateValue(
    startScale,
    endScale,
    duration,
    'easeOut',
    (scale) => {
      element.scale = scale;
    }
  );
}

/**
 * Rotate animation
 * @param {object} element - Element to rotate
 * @param {number} startAngle - Starting angle in radians
 * @param {number} endAngle - Ending angle in radians
 * @param {number} duration - Duration in ms
 * @returns {number} Animation ID
 */
export function rotateAnimation(element, startAngle, endAngle, duration = 500) {
  return animationManager.animateValue(
    startAngle,
    endAngle,
    duration,
    'linear',
    (angle) => {
      element.rotation = angle;
    }
  );
}

/**
 * Screen flash animation (white flash overlay)
 * @param {object} screenState - Screen state to animate
 * @param {number} intensity - Flash intensity 0-1
 * @returns {number} Animation ID
 */
export function screenFlashAnimation(screenState, intensity = 0.5) {
  screenState.flashOpacity = intensity;

  return animationManager.animateValue(
    intensity,
    0,
    100, // 0.1 seconds
    'easeOut',
    (opacity) => {
      screenState.flashOpacity = opacity;
    },
    () => {
      screenState.flashOpacity = 0;
    }
  );
}

/**
 * Position animation (move from A to B)
 * @param {object} element - Element with x, y properties
 * @param {number} startX - Starting X
 * @param {number} startY - Starting Y
 * @param {number} endX - Ending X
 * @param {number} endY - Ending Y
 * @param {number} duration - Duration in ms
 * @param {string} curve - Timing curve
 * @returns {number} Animation ID
 */
export function moveAnimation(element, startX, startY, endX, endY, duration = 500, curve = 'easeOut') {
  element.x = startX;
  element.y = startY;

  const keyframes = [
    { time: 0, value: { x: startX, y: startY } },
    { time: duration, value: { x: endX, y: endY }, ease: curve }
  ];

  return animationManager.createKeyframeSequence(
    keyframes,
    (pos) => {
      element.x = pos.x;
      element.y = pos.y;
    }
  );
}

/**
 * Cancel all sprite animations
 */
export function cancelAllSpriteAnimations() {
  animationManager.cancelAll();
}

/**
 * Get animation manager
 */
export function getAnimationManager() {
  return animationManager;
}
