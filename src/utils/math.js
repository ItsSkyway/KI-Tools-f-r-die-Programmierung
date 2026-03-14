/**
 * Math Utilities
 * Common math functions for game logic
 */

/**
 * Calculate distance between two points
 */
export const distance = (x1, y1, x2, y2) => {
  return Math.hypot(x2 - x1, y2 - y1)
}

/**
 * Calculate angle between two points (in radians)
 */
export const angle = (x1, y1, x2, y2) => {
  return Math.atan2(y2 - y1, x2 - x1)
}

/**
 * Clamp value between min and max
 */
export const clamp = (value, min, max) => {
  return Math.max(min, Math.min(max, value))
}

/**
 * Linear interpolation
 */
export const lerp = (a, b, t) => {
  return a + (b - a) * t
}

/**
 * Check if point is in circle
 */
export const pointInCircle = (px, py, cx, cy, radius) => {
  return distance(px, py, cx, cy) <= radius
}

/**
 * Check if circles overlap
 */
export const circlesOverlap = (x1, y1, r1, x2, y2, r2) => {
  return distance(x1, y1, x2, y2) < r1 + r2
}

/**
 * Normalize vector
 */
export const normalize = (x, y) => {
  const len = Math.hypot(x, y)
  if (len === 0) return { x: 0, y: 0 }
  return { x: x / len, y: y / len }
}

/**
 * Get random between min and max
 */
export const random = (min, max) => {
  return min + Math.random() * (max - min)
}

/**
 * Get random integer
 */
export const randomInt = (min, max) => {
  return Math.floor(random(min, max + 1))
}

/**
 * Weighted random choice
 */
export const weightedRandom = (items, weights) => {
  const totalWeight = weights.reduce((a, b) => a + b, 0)
  let rand = Math.random() * totalWeight

  for (let i = 0; i < items.length; i++) {
    rand -= weights[i]
    if (rand <= 0) {
      return items[i]
    }
  }

  return items[items.length - 1]
}

/**
 * Shuffle array
 */
export const shuffle = array => {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

/**
 * Modulo that always returns positive
 */
export const mod = (a, b) => {
  return ((a % b) + b) % b
}
