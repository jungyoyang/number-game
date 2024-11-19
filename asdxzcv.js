const gridSize = 10;
let grid = [];
let score = 0;
let timeLeft = 60;
let timer;

// 그리드 초기화
function generateGrid() {
  grid = Array.from({ length: gridSize }, () =>
    Array.from({ length: gridSize }, () => Math.floor(Math.random() * 9) + 1)
  );
  renderGrid();
}

// 그리드 렌더링
function renderGrid() {
  const gridContainer = document.getElementById("grid");
  gridContainer.innerHTML = ""; // 기존 그리드 초기화
  grid.forEach((row, i) => {
    row.forEach((cell, j) => {
      const cellDiv = document.createElement("div");
      cellDiv.className = "cell";
      cellDiv.textContent = cell;
      cellDiv.addEventListener("click", () => handleCellClick(i, j));
      gridContainer.appendChild(cellDiv);
    });
  });
}

// 셀 클릭 처리
let selectedCells = [];
function handleCellClick(x, y) {
  selectedCells.push({ x, y });
  const [first, second] = selectedCells;

  if (selectedCells.length === 2) {
    const sum = grid[first.x][first.y] + grid[second.x][second.y];
    const cells = document.querySelectorAll(".cell");
    if (sum === 10 && (first.x !== second.x || first.y !== second.y)) {
      // 맞춘 경우
      score += 1;
      document.getElementById("score").textContent = score;

      cells[first.x * gridSize + first.y].classList.add("correct");
      cells[second.x * gridSize + second.y].classList.add("correct");

      grid[first.x][first.y] = 0;
      grid[second.x][second.y] = 0;

      setTimeout(renderGrid, 500);
    } else {
      // 틀린 경우
      cells[first.x * gridSize + first.y].classList.add("wrong");
      cells[second.x * gridSize + second.y].classList.add("wrong");
    }

    selectedCells = [];
  }
}

// 힌트 기능
document.getElementById("hint").addEventListener("click", () => {
  score = Math.max(0, score - 5);
  document.getElementById("score").textContent = score;

  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize; y++) {
          if (
            (i !== x || j !== y) &&
            grid[i][j] + grid[x][y] === 10 &&
            grid[i][j] !== 0 &&
            grid[x][y] !== 0
          ) {
            const cells = document.querySelectorAll(".cell");
            cells[i * gridSize + j].classList.add("correct");
            cells[x * gridSize + y].classList.add("correct");
            setTimeout(() => {
              cells[i * gridSize + j].classList.remove("correct");
              cells[x * gridSize + y].classList.remove("correct");
            }, 1000);
            return;
          }
        }
      }
    }
  }
});

// 타이머 시작
function startTimer() {
  timer = setInterval(() => {
    timeLeft -= 1;
    document.getElementById("timer").textContent = timeLeft;
    if (timeLeft <= 0) {
      clearInterval(timer);
      endGame();
    }
  }, 1000);
}

// 게임 종료
function endGame() {
  document.getElementById("grid").style.display = "none";
  document.getElementById("info").style.display = "none";
  const gameOver = document.getElementById("game-over");
  gameOver.style.display = "block";
  document.getElementById("final-score").textContent = score;

  document.getElementById("submit-score").addEventListener("click", () => {
    const nickname = document.getElementById("nickname").value;
    alert(`Score submitted! Nickname: ${nickname}, Score: ${score}`);
  });
}

// 게임 초기화
function init() {
  generateGrid();
  startTimer();
}

init();
