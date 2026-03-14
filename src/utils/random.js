/**
 * Random Utilities
 * RNG helper functions
 */

/**
 * Seed-based random (for deterministic testing)
 */
let seed = 12345

export const setSeed = newSeed => {
  seed = newSeed
}

export const seededRandom = () => {
  seed = (seed * 9301 + 49297) % 233280
  return seed / 233280
}

/**
 * Weighted random selection
 */
export const selectWeighted = (options, weights) => {
  let totalWeight = 0
  weights.forEach(w => (totalWeight += w))

  let random = Math.random() * totalWeight
  for (let i = 0; i < options.length; i++) {
    random -= weights[i]
    if (random <= 0) {
      return options[i]
    }
  }

  return options[options.length - 1]
}

/**
 * Random from array
 */
export const randomChoice = array => {
  return array[Math.floor(Math.random() * array.length)]
}

/**
 * Shuffle array (Fisher-Yates)
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
 * Random integer in range
 */
export const randInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Random float in range
 */
export const randFloat = (min, max) => {
  return Math.random() * (max - min) + min
}

/**
 * 50/50 chance
 */
export const coinFlip = () => {
  return Math.random() < 0.5
}

/**
 * Roll dice (1-6)
 */
export const rollDice = () => {
  return randInt(1, 6)
}

/**
 * Probability check
 */
export const checkProbability = probability => {
  return Math.random() < probability
}
