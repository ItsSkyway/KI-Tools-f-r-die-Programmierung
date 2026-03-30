/**
 * UI Module Exports
 * 
 * NEW CLASH ROYALE UI SYSTEM (v2.0)
 * ==================================
 * 
 * HUD Components:
 * - TopHUD: Enemy/Player HP + Timer
 * - BottomHUD: Elixir bar + Phase indicator
 * - MatchResultScreen: Victory/Defeat screen
 * 
 * Arena Components:
 * - CardHand: 4-card hand with drag/drop
 * - Arena: Main gameplay area with units
 * - DeckBuilder: 8-card selection screen
 * - DifficultySelector: Game difficulty selection
 */

// ============================================================================
// CLASH ROYALE HUD SYSTEM (NEW)
// ============================================================================
export { 
  TopHUD,           // Enemy HP + Player HP + Timer display
  BottomHUD,        // Elixir bar + Phase indicator + Status
  MatchResultScreen, // Victory/Defeat screen with stats
  ClashRoyaleHUD    // Complete HUD wrapper
} from './ClashRoyaleHUD.jsx'

// ============================================================================
// CLASH ROYALE ARENA & GAME COMPONENTS (NEW)
// ============================================================================
export {
  CardHand,         // 4-Card hand with drag/drop support
  Arena,            // Main gameplay arena with units
  DeckBuilder,      // 8-Card selection screen
  DifficultySelector // Game difficulty selection
} from './ClashArena.jsx'

// ============================================================================
// LEGACY COMPONENTS (KEPT FOR COMPATIBILITY)
// ============================================================================
export { default as Game } from './Game.jsx'
export { default as GameBoard } from './GameBoard.jsx'
// export { default as CardHand } from './CardHand.jsx'  // Use new ClashArena.CardHand
export { default as PlayerStats } from './PlayerStats.jsx'
// export { default as DeckBuilder } from './DeckBuilder.jsx'  // Use new ClashArena.DeckBuilder
export { default as GameOver } from './GameOver.jsx'
