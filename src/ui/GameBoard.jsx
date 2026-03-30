/**
 * GameBoard.jsx
 * Arena rendering component
 */

import React from 'react'
import ArenaRenderer from './ArenaRenderer'

export default function GameBoard({ gameState, towers }) {
  return <ArenaRenderer gameState={gameState} towers={towers} />
}
