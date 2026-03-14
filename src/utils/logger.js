/**
 * Logger Utility
 * Debug logging with levels
 */

export const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
}

let currentLevel = LOG_LEVELS.INFO

/**
 * Set log level
 */
export const setLogLevel = level => {
  currentLevel = level
}

/**
 * Log debug message
 */
export const debug = (message, data) => {
  if (currentLevel <= LOG_LEVELS.DEBUG) {
    console.log(`[DEBUG] ${message}`, data || '')
  }
}

/**
 * Log info message
 */
export const info = (message, data) => {
  if (currentLevel <= LOG_LEVELS.INFO) {
    console.log(`[INFO] ${message}`, data || '')
  }
}

/**
 * Log warning
 */
export const warn = (message, data) => {
  if (currentLevel <= LOG_LEVELS.WARN) {
    console.warn(`[WARN] ${message}`, data || '')
  }
}

/**
 * Log error
 */
export const error = (message, data) => {
  if (currentLevel <= LOG_LEVELS.ERROR) {
    console.error(`[ERROR] ${message}`, data || '')
  }
}

/**
 * Log game event
 */
export const logEvent = (eventName, data) => {
  debug(`Event: ${eventName}`, data)
}
