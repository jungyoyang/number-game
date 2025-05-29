## 📖 Project Overview

Number game is an interactive puzzle game where players select number pairs that sum to 10.

The game challenges logical thinking with constraints on adjacent or path-clear selections, featuring bonus rounds and a leaderboard for high scores.

---

## 🌐 Live Demo

You can play the game directly on your browser without any setup:

👉 [Number Grid Game Live](https://numbergamepuzzle.netlify.app)

---

## 🧠 Background & Idea

* Post-COVID, we aimed to build an addictive puzzle game that works directly in-browser
* Combined simple number click logic with a pathfinding rule (inspired by Mahjong "Shisen")
* Built with pure HTML/CSS/JavaScript and deployed with Netlify

---

## 🎯 Objective

* Provide a reflex-training puzzle experience via fast number matching
* Implement pathfinding rules using backtracking or BFS to match numbers only when path constraints are satisfied
* Add visual effects, difficulty scaling, and bonus modes to enhance replayability

---

## 🔎 Gameplay Mechanics

1. A 10x10 grid is generated, filled with number tiles (1-9) — only 8 valid matching pairs exist per grid
2. Players have 60 seconds to find and match all 8 pairs
3. Upon completion, a new grid is generated automatically and gameplay continues
4. After the initial 60 seconds, a **Bonus Round** begins:

   * Starts with 10 seconds
   * Every successful match resets the timer to 10 seconds
   * If no match is found before time runs out, the game ends
5. Players enter a nickname after the game
6. Scores and nicknames are saved and sorted by high score using file I/O (for local leaderboard)

---

## 🧰 Algorithm - Shisen Rule Logic

> "Only allow matches if there exists a clear path with **2 or fewer turns**."

Implemented with **Backtracking** or **BFS** that tracks direction change count:

```js
function isConnectable(board, start, end) {
  // Use BFS or backtracking
  // Track the number of direction changes (max 2)
  // Return true if such a path exists
}
```

---

## 🗃️ Core Features

* 1\~9 number tiles, randomly placed in matching pairs
* Fast-paced matching system with increasing difficulty
* Pathfinding constraint for valid pair matching
* Bonus extension mode
* Nickname input and local score sorting with file I/O

---

## 📸 Screenshot

<img src="./assets/numbergame_preview.png" alt="Game Screenshot" width="320" />

---

## 📽️ Demo Video

▶ [Watch Gameplay Demo on YouTube](https://www.youtube.com/watch?v=xLaaH59Pnn4)

[![Video Thumbnail](https://img.youtube.com/vi/xLaaH59Pnn4/hqdefault.jpg)](https://www.youtube.com/watch?v=xLaaH59Pnn4)

---

## 🛠️ Tech Stack

* HTML / CSS / JavaScript
* Netlify (deployment)

---

## 📄 File Structure

```
number-grid-game/
├── index.html         # Main HTML file
├── style.css          # Styling
├── script.js          # Game logic
├── README.md          # Documentation
└── assets/
    ├── numbergame_preview.png
    └── 발표자료.pptx
```

---

## 👥 Contributors

강동호 김이삭 백승현 양정요
