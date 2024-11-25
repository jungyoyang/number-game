const gridSize = 10;
let grid = [];
let score = 0;
let timeLeft = 60;
let extraTimeLeft = 10;
let isExtraGame = false;
let foundPairs = 0;
let selectedCells = [];
let timerPaused = false;
let timerInterval = null;
let hintCount = 3;

// 게임 상태 메시지 표시
function showGameStatus(message) {
  let statusDiv = document.getElementById("game-status");
  if (!statusDiv) {
    statusDiv = document.createElement("div");
    statusDiv.id = "game-status";
    document.body.appendChild(statusDiv);
  }
  statusDiv.textContent = message;
  statusDiv.style.display = "block";
  setTimeout(() => (statusDiv.style.display = "none"), 3000);
}

// 타이머 초기화
function initTimer() {
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (!timerPaused && !isExtraGame) {
      timeLeft--;
      updateTimerDisplay(timeLeft);
      updateProgressBar(timeLeft / 60);
      if (timeLeft <= 0) startExtraGame();
    }
  }, 1000);
}

// 진행 바 업데이트
function updateProgressBar(progress) {
  const progressBar = document.getElementById("progress");
  if (progressBar) progressBar.style.width = `${Math.max(progress * 100, 0)}%`;
}

// UI 업데이트
function updateTimerDisplay(time) {
  document.getElementById("timer").textContent = `${time}s`;
}

function updateScoreDisplay(score) {
  document.getElementById("score").textContent = score;
}

// 그리드 랜더링
function renderGrid() {
  const gridContainer = document.getElementById("grid");
  gridContainer.innerHTML = "";
  grid.forEach((row, i) => {
    row.forEach((cell, j) => {
      const cellDiv = document.createElement("div");
      cellDiv.className = "cell";
      cellDiv.textContent = cell || "";
      if (cell !== 0) {
        cellDiv.addEventListener("click", () => handleCellClick(i, j));
      } else {
        cellDiv.classList.add("empty");
      }
      gridContainer.appendChild(cellDiv);
    });
  });
}

// 셀 선택/취소 처리
function toggleCellSelection(x, y, select) {
  const cellDiv = document.querySelectorAll(".cell")[x * gridSize + y];
  if (select) cellDiv.classList.add("selected");
  else cellDiv.classList.remove("selected");
}

// 셀 클릭 처리
function handleCellClick(x, y) {
  const cellIndex = selectedCells.findIndex(
    (cell) => cell.x === x && cell.y === y
  );

  if (cellIndex !== -1) {
    toggleCellSelection(x, y, false);
    selectedCells.splice(cellIndex, 1);
    return;
  }

  toggleCellSelection(x, y, true);
  selectedCells.push({ x, y });

  if (selectedCells.length === 2) {
    const [first, second] = selectedCells;

    if (
      grid[first.x][first.y] + grid[second.x][second.y] === 10 &&
      isPathClear(first.x, first.y, second.x, second.y)
    ) {
      score += 10;
      showGameStatus("Correct Pair! +10 Points!");
      updateScoreDisplay(score);

      showScoreEffect(first.x, first.y, 10);
      showStarEffect(first.x, first.y);
      showStarEffect(second.x, second.y);

      setTimeout(() => {
        removeCell(first.x, first.y);
        removeCell(second.x, second.y);
      }, 500);
    } else {
      showGameStatus("Invalid Pair!");
    }

    selectedCells.forEach(({ x, y }) => toggleCellSelection(x, y, false));
    selectedCells = [];
  }
}

// 셀 제거
function removeCell(x, y) {
  const cellDiv = document.querySelectorAll(".cell")[x * gridSize + y];
  cellDiv.classList.add("fade-out");
  setTimeout(() => {
    cellDiv.textContent = "";
    cellDiv.classList.remove("fade-out");
    cellDiv.classList.add("empty");
    grid[x][y] = 0;
  }, 500);
}

// 경로 확인
function isPathClear(x1, y1, x2, y2) {
  // 같은 행 또는 열에서 직선 확인
  if (x1 === x2 || y1 === y2) {
    const [start, end] =
      x1 === x2
        ? [Math.min(y1, y2), Math.max(y1, y2)]
        : [Math.min(x1, x2), Math.max(x1, x2)];
    for (let i = start + 1; i < end; i++) {
      if (x1 === x2 && grid[x1][i] !== 0) return false;
      if (y1 === y2 && grid[i][y1] !== 0) return false;
    }
    return true;
  }
  // 대각선 및 꺾이는 경로 확인
  if (
    Math.abs(x2 - x1) === Math.abs(y2 - y1) ||
    (grid[x1][y2] === 0 && isPathClear(x1, y1, x1, y2) && isPathClear(x1, y2, x2, y2)) ||
    (grid[x2][y1] === 0 && isPathClear(x1, y1, x2, y1) && isPathClear(x2, y1, x2, y2))
  ) {
    return true;
  }
  return false;
}

// 힌트 사용
document.getElementById("hint").addEventListener("click", () => {
  if (hintCount <= 0) {
    showGameStatus("No hints left!");
    return;
  }
  let pairFound = false;

  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      if (grid[i][j] === 0) continue;

      for (let k = 0; k < gridSize; k++) {
        for (let l = 0; l < gridSize; l++) {
          if (
            grid[k][l] === 0 ||
            (i === k && j === l) ||
            grid[i][j] + grid[k][l] !== 10 ||
            !isPathClear(i, j, k, l)
          )
            continue;

          highlightHint(i, j, k, l);
          pairFound = true;
          hintCount--;
          updateScoreDisplay((score -= 5));
          return;
        }
      }
    }
  }

  if (!pairFound) showGameStatus("No valid pairs found!");
});

// 힌트 강조
function highlightHint(x1, y1, x2, y2) {
  const firstCell = document.querySelectorAll(".cell")[x1 * gridSize + y1];
  const secondCell = document.querySelectorAll(".cell")[x2 * gridSize + y2];
  firstCell.classList.add("hint");
  secondCell.classList.add("hint");
  setTimeout(() => {
    firstCell.classList.remove("hint");
    secondCell.classList.remove("hint");
  }, 1000);
}

// 게임 초기화
function initGame() {
  clearInterval(timerInterval);
  score = 0;
  timeLeft = 60;
  hintCount = 3;
  isExtraGame = false;
  selectedCells = [];
  updateScoreDisplay(score);
  updateTimerDisplay(timeLeft);
  generateRandomGrid();
  renderGrid();
  initTimer();
}

// 게임 시작
function generateRandomGrid() {
  grid = Array.from({ length: gridSize }, () =>
    Array.from({ length: gridSize }, () => Math.floor(Math.random() * 9) + 1)
  );
}

initGame();
