/* ============================================================================
   ⚔️ CLASH ROYALE WHIMSY - IMPLEMENTATION GUIDE
   ============================================================================
   
   Copy-paste code snippets to add personality to your game.
   These are ready-to-use implementations for ClashRoyaleGame.jsx
   
   ============================================================================ */

// ============================================================================
// 1. PERSONALITY COPY & MESSAGES
// ============================================================================

// Add this object to your game component for witty messages

const PERSONALITY_MESSAGES = {
  // Victory messages - randomly selected
  victory: [
    "Victory Royale! 🏆 You just made their kingdom weep!",
    "DESTROYED! 💥 They're gonna need a bigger castle!",
    "King's Throne defended with STYLE! ⚔️",
    "You bent the rules of battle! Glorious! 🔥",
    "Just witnessed something beautiful... your strategy! 💎",
    "Opponent's still looking for where it all went wrong! 😂",
    "Absolutely LEGENDARY! 👑 Well played!",
    "Perfection in battle! You're on FIRE! 🔥",
  ],

  // Defeat messages - encouraging tone
  defeat: [
    "Ouch! 💔 They got the best of you today... but that was a great match!",
    "Plan better, attack smarter—you've got this next time! 💪",
    "Not your day? Let's prove it was a fluke!",
    "That was tough, but legends never stop after one loss!",
    "Better luck next time, warrior. We believe in you! 🔮",
    "Defeated this time, but your comeback starts NOW! 📈",
    "Tough loss! But every loss is a lesson! 📚",
  ],

  // Difficulty names with personality
  difficulty: {
    easy: {
      name: "Squire Mode 🛡️",
      desc: "Your opponent is learning. Enjoy the victory lap!",
    },
    medium: {
      name: "Knight's Challenge ⚔️",
      desc: "Worthy opponent. Strategy matters. Show your skill!",
    },
    hard: {
      name: "King's Gauntlet 👑",
      desc: "Only legends survive here. Master or be mastered!",
    },
  },

  // Tips that rotate during gameplay
  tips: [
    "🧠 Elixir management is key. Don't waste it all at once!",
    "🎯 Spread troops across lanes to confuse the enemy!",
    "💡 Sometimes defending is more important than attacking!",
    "⚡ Deploy units faster than your opponent—reaction wins!",
    "🛡️ Mirror opponent's strength, then counter-attack!",
    "🔥 Fireball hits multiple units. Use it wisely!",
    "👥 Some cards work great together. Experiment!",
    "⏱️ Double Elixir changes everything. Adapt or lose!",
    "🎪 Never fight fair: Use spells to even the odds!",
    "🏆 Every loss teaches you something!",
  ],

  // Battle encouragement (triggered during gameplay)
  battleEncouragement: {
    playerTowerDestroyed:
      "💪 Shake it off! You've got this!",
    opponentTowerDestroyed:
      "🔥 YESSS! Keep the pressure on!",
    lowElixir:
      "⏳ Elixir coming... Build your strategy!",
    doubleElixirActive:
      "⚡ DOUBLE ELIXIR! ATTACK ATTACK ATTACK!",
    comebackChance:
      "🎯 Come back is ON! Let's GO!",
    matchAlmostOver:
      "📍 Final push! Everything on this!",
    playerWinning:
      "👑 You're dominating! Don't let up!",
    playerLosing:
      "💎 You can turn this around!",
  },

  // Skill recognition during gameplay
  skillRecognition: [
    "Perfect synergy! Knight + Archers = destruction! ⚔️",
    "Smart defense! You turned the tide! 🛡️",
    "PERFECT TIMING! Best moment to attack! ⏱️",
    "Outstanding elixir management! 💧",
    "BOLD PLAY! High risk, high reward! 🎲",
    "Excellent adaptation to opponent's strategy! 🧠",
  ],

  // Result screen messages
  resultMessages: {
    perfectVictory: {
      title: "😎 FLAWLESS VICTORY! 😎",
      subtitle: "You didn't lose a single tower. Pure domination!",
      stat: "Zero towers lost!",
    },
    narrowVictory: {
      title: "Victory! (That was close!) 😅",
      subtitle: "By the skin of your teeth! What a thriller!",
      stat: "Just barely made it!",
    },
    devastatingLoss: {
      title: "Ouch... 💔",
      subtitle: "They brought the pain. Time to rebuild!",
      stat: "Needs work...",
    },
    honorableLoss: {
      title: "Valiant Effort 🗡️",
      subtitle: "You fought like a warrior! Learn and come back stronger!",
      stat: "Honorable defeat",
    },
  },

  // Performance messages (after match)
  performanceMessages: {
    highDamage: "💥 You brought the firepower!",
    efficientBuilder: "🎯 Elixir efficiency: LEGENDARY!",
    spellMaster: "🔥 Your spells were DEVASTATING!",
    troopCommander: "⚔️ Your army was UNSTOPPABLE!",
    defenseKing: "🛡️ They couldn't break through!",
    speedDemon: "⚡ LIGHTNING FAST reactions!",
    strategicMind: "🧠 Outstanding strategy!",
    underdog: "🐉 Against all odds, you WON!",
    comeback: "📈 Incredible comeback victory!",
    perfect: "👑 NO towers lost. PERFECTION!",
  },
};

// Helper function to get random message
function getRandomMessage(messageArray) {
  return messageArray[Math.floor(Math.random() * messageArray.length)];
}

// ============================================================================
// 2. ANIMATION TRIGGER FUNCTIONS
// ============================================================================

// Call these functions at appropriate moments in your game

/**
 * Trigger victory celebration effects
 * @param {HTMLElement} targetElement - Where to show celebration
 */
function triggerVictoryCelebration(targetElement) {
  // Add victory flash
  const flash = document.createElement("div");
  flash.className = "victory-flash";
  document.body.appendChild(flash);
  setTimeout(() => flash.remove(), 800);

  // Create confetti
  createConfetti(30);

  // Play victory message
  console.log(
    getRandomMessage(PERSONALITY_MESSAGES.victory)
  );
}

/**
 * Create confetti particles
 * @param {number} count - How many pieces of confetti
 */
function createConfetti(count) {
  const colors = ["🎉", "✨", "🎊", "🌟", "💫", "🎈"];

  for (let i = 0; i < count; i++) {
    const confetti = document.createElement("div");
    confetti.className = "confetti";
    confetti.textContent = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.left = Math.random() * window.innerWidth + "px";
    confetti.style.top = "-20px";
    confetti.style.fontSize = Math.random() * 20 + 20 + "px";
    confetti.style.opacity = Math.random() * 0.7 + 0.3;
    document.body.appendChild(confetti);

    setTimeout(() => confetti.remove(), 3000);
  }
}

/**
 * Trigger defeat wobble effect
 */
function triggerDefeatWobble() {
  const gameContainer = document.querySelector(".game-container") ||
    document.querySelector(".arena") || document.body;
  gameContainer.classList.add("defeat-wobble");

  setTimeout(() => {
    gameContainer.classList.remove("defeat-wobble");
  }, 500);
}

/**
 * Show crown destruction animation when tower falls
 * @param {number} x - X position
 * @param {number} y - Y position
 */
function triggerCrownDestruction(x, y) {
  const crown = document.createElement("div");
  crown.className = "crown-destruction";
  crown.textContent = "👑";
  crown.style.left = x + "px";
  crown.style.top = y + "px";
  document.body.appendChild(crown);

  setTimeout(() => crown.remove(), 800);
}

/**
 * Show unit spawn animation
 * @param {HTMLElement} unitElement - The unit element
 * @param {number} index - Which unit in group (for stagger)
 */
function triggerUnitSpawn(unitElement, index = 0) {
  unitElement.classList.add("unit-spawn");
  unitElement.style.setProperty("--index", index);

  setTimeout(() => {
    unitElement.classList.remove("unit-spawn");
  }, 500);
}

/**
 * Show card play feedback
 * @param {HTMLElement} cardElement - The card that was played
 */
function triggerCardPlayFeedback(cardElement) {
  cardElement.classList.add("card-play-feedback", "card-sparkle");

  setTimeout(() => {
    cardElement.classList.remove("card-play-feedback", "card-sparkle");
  }, 400);
}

/**
 * Show damage number pop-up
 * @param {number} damage - Amount of damage
 * @param {number} x - X position
 * @param {number} y - Y position
 */
function showDamageNumber(damage, x, y) {
  const damageEl = document.createElement("div");
  damageEl.className = "damage-number";
  damageEl.textContent = damage;
  damageEl.style.left = x + "px";
  damageEl.style.top = y + "px";
  document.body.appendChild(damageEl);

  setTimeout(() => damageEl.remove(), 800);
}

/**
 * Show unit hit reaction
 * @param {HTMLElement} unitElement - The unit that was hit
 */
function triggerUnitHit(unitElement) {
  unitElement.classList.add("unit-hit");

  setTimeout(() => {
    unitElement.classList.remove("unit-hit");
  }, 300);
}

/**
 * Show unit death animation
 * @param {HTMLElement} unitElement - The unit that died
 * @param {number} x - X position
 * @param {number} y - Y position
 */
function triggerUnitDeath(unitElement, x, y) {
  unitElement.classList.add("unit-death");

  // Create burst particles
  const burstContainer = document.createElement("div");
  burstContainer.className = "death-burst";
  burstContainer.style.left = x + "px";
  burstContainer.style.top = y + "px";

  const particles = ["💫", "✨", "⭐"];
  for (let i = 0; i < 5; i++) {
    const particle = document.createElement("div");
    particle.className = "death-particle";
    particle.textContent = particles[Math.floor(Math.random() * particles.length)];

    const angle = (i / 5) * Math.PI * 2;
    const distance = 50;
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance;
    particle.style.setProperty("--tx", tx + "px");
    particle.style.setProperty("--ty", ty + "px");

    burstContainer.appendChild(particle);
  }

  document.body.appendChild(burstContainer);

  setTimeout(() => {
    unitElement.remove();
    burstContainer.remove();
  }, 500);
}

/**
 * Show spell cast explosion
 * @param {string} spellType - Type of spell (fireball, arrows, etc)
 * @param {number} x - X position
 * @param {number} y - Y position
 */
function triggerSpellExplosion(spellType, x, y) {
  const explosion = document.createElement("div");
  explosion.className = "spell-explosion";
  explosion.style.left = x + "px";
  explosion.style.top = y + "px";

  if (spellType === "fireball") {
    explosion.textContent = "🔥";
  } else if (spellType === "arrows") {
    explosion.textContent = "⬆️";
  } else {
    explosion.textContent = "✨";
  }

  document.body.appendChild(explosion);

  setTimeout(() => explosion.remove(), 600);
}

/**
 * Show score celebration
 * @param {number} points - Points to display
 * @param {number} x - X position
 * @param {number} y - Y position
 */
function showScoreCelebration(points, x, y) {
  const scoreEl = document.createElement("div");
  scoreEl.className = "score-celebration";
  scoreEl.textContent = "+" + points;
  scoreEl.style.left = x + "px";
  scoreEl.style.top = y + "px";
  document.body.appendChild(scoreEl);

  setTimeout(() => scoreEl.remove(), 1000);
}

/**
 * Trigger arena tension (final minute)
 */
function triggerArenaTension(enabled) {
  const gameContainer = document.querySelector(".game-container") ||
    document.querySelector(".arena");
  if (gameContainer) {
    if (enabled) {
      gameContainer.classList.add("arena-tension");
    } else {
      gameContainer.classList.remove("arena-tension");
    }
  }
}

/**
 * Show elixir warning (low elixir)
 */
function showElixirWarning(enabled) {
  const elixirBar = document.querySelector(".elixir-bar");
  if (elixirBar) {
    if (enabled) {
      elixirBar.classList.add("elixir-low");
    } else {
      elixirBar.classList.remove("elixir-low");
    }
  }
}

/**
 * Show elixir fully charged celebration
 */
function showElixirFull() {
  const elixirBar = document.querySelector(".elixir-bar");
  if (elixirBar) {
    elixirBar.classList.add("elixir-full");
    setTimeout(() => {
      elixirBar.classList.remove("elixir-full");
    }, 800);
  }
}

/**
 * Show card ready indication (pulsing glow)
 */
function showCardReady(cardElement, ready) {
  if (ready) {
    cardElement.classList.add("card-ready");
  } else {
    cardElement.classList.remove("card-ready");
  }
}

/**
 * Activate rainbow mode (easter egg)
 */
function activateRainbowMode() {
  document.body.classList.add("rainbow-mode");

  // Auto-disable after 10 seconds
  setTimeout(() => {
    document.body.classList.remove("rainbow-mode");
  }, 10000);
}

/**
 * Create floating emoji (easter egg)
 */
function createFloatingEmoji(emoji) {
  const floatingEl = document.createElement("div");
  floatingEl.className = "floating-emoji";
  floatingEl.textContent = emoji;
  floatingEl.style.left = Math.random() * window.innerWidth + "px";
  floatingEl.style.top = window.innerHeight / 2 + "px";
  document.body.appendChild(floatingEl);

  setTimeout(() => floatingEl.remove(), 4000);
}

// ============================================================================
// 3. REACT COMPONENT INTEGRATION
// ============================================================================

// Add this to your ClashRoyaleGame component

// Inside your game component, add these state updates at key moments:

// When opponent plays a card:
const handleOpponentCardPlay = (card, index) => {
  triggerCardPlayFeedback(cardElement);
};

// When unit spawns:
const handleUnitSpawn = (unit, index) => {
  triggerUnitSpawn(unitElement, index);
};

// When tower is destroyed:
const handleTowerDestroyed = (x, y) => {
  triggerCrownDestruction(x, y);
  showScoreCelebration(500, x, y);
};

// When unit dies:
const handleUnitDeath = (unit, x, y) => {
  triggerUnitDeath(unitElement, x, y);
  showDamageNumber(unit.hp, x, y);
};

// When battle ends (victory):
const handleVictory = () => {
  triggerVictoryCelebration();
  // Show personality message
  const victoryMsg = getRandomMessage(PERSONALITY_MESSAGES.victory);
  console.log(victoryMsg);
};

// When battle ends (defeat):
const handleDefeat = () => {
  triggerDefeatWobble();
  // Show personality message
  const defeatMsg = getRandomMessage(PERSONALITY_MESSAGES.defeat);
  console.log(defeatMsg);
};

// When time is running out (last 30 seconds):
const handleTimeCritical = (critical) => {
  triggerArenaTension(critical);
};

// ============================================================================
// 4. QUICK INTEGRATION CHECKLIST
// ============================================================================

/*
✅ STEP 1: Copy WHIMSY_ANIMATIONS.css into your index.html <style> tag

✅ STEP 2: Add PERSONALITY_MESSAGES object to your game component

✅ STEP 3: Copy animation trigger functions into your component

✅ STEP 4: Find key moments in your game loop:
   - When units spawn: triggerUnitSpawn()
   - When damage dealt: showDamageNumber()
   - When unit dies: triggerUnitDeath()
   - When tower falls: triggerCrownDestruction()
   - When player wins: triggerVictoryCelebration()
   - When player loses: triggerDefeatWobble()

✅ STEP 5: Test each animation
   - Play a match and watch for effects
   - Verify victory/defeat screens have personality
   - Check that animations don't distract from gameplay

✅ STEP 6: Add personality copy to your UI
   - Victory message: getRandomMessage(PERSONALITY_MESSAGES.victory)
   - Defeat message: getRandomMessage(PERSONALITY_MESSAGES.defeat)
   - Difficulty names: Use PERSONALITY_MESSAGES.difficulty
   - Battle tips: Rotate PERSONALITY_MESSAGES.tips every 10 seconds

✅ STEP 7: Enable Easter eggs
   - Konami code (Up, Up, Down, Down, Left, Right, Left, Right, B, A)
     → activateRainbowMode()
   - Triple click opponent name → createFloatingEmoji('😂')
   - Quick card slot taps → createFloatingEmoji('✨')

✅ STEP 8: Monitor performance
   - Check for smooth animations on lower-end devices
   - Verify accessibility with reduced motion settings
   - Ensure animations don't impact game responsiveness
*/

// ============================================================================
// 5. RESULT SCREEN ENHANCEMENT TEMPLATE
// ============================================================================

/*
VICTORY SCREEN (add this to your result screen component):

<div className="result-screen victory">
  <div className="victory-header">
    <h1>🏆 {getRandomMessage(PERSONALITY_MESSAGES.victory)}</h1>
  </div>
  
  <div className="stats-container">
    <div className="stat-row">
      <span className="stat-icon">🏰</span>
      <span className="stat-label">Towers Destroyed</span>
      <span className="stat-value">{matchStats.towersDestroyed}</span>
    </div>
    <div className="stat-row">
      <span className="stat-icon">⚔️</span>
      <span className="stat-label">Units Deployed</span>
      <span className="stat-value">{matchStats.unitsDeployed}</span>
    </div>
    <div className="stat-row">
      <span className="stat-icon">💧</span>
      <span className="stat-label">Elixir Efficiency</span>
      <span className="stat-value">{matchStats.elixirEfficiency}%</span>
    </div>
  </div>

  <div className="performance-message">
    ✨ {getRandomMessage(PERSONALITY_MESSAGES.performanceMessages)}
  </div>

  <button className="quick-play" onClick={handleQuickRestart}>
    ⚡ Play Again NOW
  </button>
</div>

DEFEAT SCREEN:

<div className="result-screen defeat">
  <div className="defeat-header">
    <h1>🛡️ {getRandomMessage(PERSONALITY_MESSAGES.defeat)}</h1>
  </div>
  
  <div className="stats-container">
    {/* Show stats with lower emphasis */}
  </div>

  <div className="encouragement-message">
    You fought well! Learn and adapt for next battle!
  </div>

  <button className="quick-play" onClick={handleQuickRestart}>
    🎯 Revenge?
  </button>
</div>
*/

// ============================================================================
// 6. EASTER EGGS IMPLEMENTATION
// ============================================================================

// Add to your main component's useEffect:

useEffect(() => {
  const keySequence = [];
  const konamiCode = [
    "ArrowUp",
    "ArrowUp",
    "ArrowDown",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "ArrowLeft",
    "ArrowRight",
    "KeyB",
    "KeyA",
  ];

  const handleKeyDown = (e) => {
    keySequence.push(e.code);
    keySequence.splice(0, keySequence.length - 10);

    if (keySequence.join(",") === konamiCode.join(",")) {
      activateRainbowMode();
      console.log("🌈 Rainbow mode activated!");
    }
  };

  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
}, []);

// ============================================================================
// End of Implementation Guide
// ============================================================================
