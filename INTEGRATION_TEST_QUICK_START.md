# 🚀 INTEGRATION TEST QUICK START

## In 2 Minutes

### 1️⃣ Start the Game
```
1. Open index.html in browser (Chrome/Firefox recommended)
2. Select difficulty: "Medium"
3. Build deck: Knight, Archer, Giant, Goblins, Fireball, Freeze, Skeleton Army, Minions
4. Click "Start Game"
```

### 2️⃣ Run Automated Tests
```javascript
// Open browser console (F12 → Console tab)
// Paste this one line:
fetch('INTEGRATION_TEST_COMPREHENSIVE.js').then(r=>r.text()).then(t=>eval(t)).then(()=>runIntegrationTests())
```

### 3️⃣ Review Results
- ✅ All tests pass → Game ready!
- ❌ Some fail → Check details in console

---

## What Gets Tested

| Scenario | What | Pass Criteria |
|----------|------|---------------|
| **A** | Units move and cross river | No drowning on bridge ✓ |
| **B** | Drowning mechanics | Health decreases in river ✓ |
| **C** | Tower combat | Arrows hit and damage ✓ |
| **D** | King tower activation | Becomes active when triggered ✓ |
| **E** | Multiple cards | All spawn and move independently ✓ |
| **Performance** | FPS and memory | 30+ FPS maintained ✓ |
| **Edge Cases** | Stress testing | Handles max load ✓ |

---

## Manual Testing (5 Minutes Each)

### Scenario A: Basic Movement
1. Play a Knight card
2. Watch it move up the screen
3. ✅ Should cross river without damage

### Scenario B: Drowning
1. Let enemy knock your unit into river
2. ✅ Unit health should turn red and decrease

### Scenario C: Tower Combat
1. Let towers shoot at your units
2. ✅ See arrows flying and hitting

### Scenario D: King Tower Activation
1. Destroy one enemy princess tower
2. ✅ Watch enemy king tower activate and shoot

### Scenario E: Multiple Cards
1. Play Knight, Archer, Giant in quick succession
2. ✅ All move in different lanes independently

---

## Success Criteria ✅

All of these should work:

- ✅ Arena renders correctly (bridges, river, towers)
- ✅ Units spawn and move
- ✅ Bridge crossing works (no drowning)
- ✅ Drowning mechanics work
- ✅ Towers shoot arrows
- ✅ Arrows hit targets
- ✅ King tower dormant → active
- ✅ Multiple cards work
- ✅ 30+ FPS maintained
- ✅ No crashes

---

## If Something Fails

1. Check browser console (F12) for errors
2. Look at the test output details
3. Refer to INTEGRATION_TEST_REPORT.md for debugging

---

## Files You'll Use

- `index.html` - The game
- `INTEGRATION_TEST_COMPREHENSIVE.js` - Automated tests
- `INTEGRATION_TEST_VERIFICATION_GUIDE.js` - Manual testing guide
- `INTEGRATION_TEST_REPORT.md` - Full documentation

---

**Ready? → Open index.html and start testing!** 🎮
