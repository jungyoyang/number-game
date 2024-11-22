const gridSize = 10;
let grid = [];
let score = 0;
let timeLeft = 60;
let extraTimeLeft = 10;
let isExtraGame = false;
let foundPairs = 0; // 찾은 조합의 개수를 추적
let selectedCells = []; // 선택된 셀 저장

// 타이머 및 진행 바 초기화
function initTimer() {
  const progressBarContainer = document.createElement("div");
  progressBarContainer.id = "progress-bar";

  const progressBar = document.createElement("div");
  progressBar.id = "progress";
  progressBarContainer.appendChild(progressBar);

  const infoContainer = document.getElementById("info");
  infoContainer.appendChild(progressBarContainer);

  // 타이머 시작
  const timerInterval = setInterval(() => {
    if (!isExtraGame) {
      timeLeft--;
      document.getElementById("timer").textContent = `${timeLeft}s`;

      const progressPercentage = Math.max((timeLeft / 60) * 100, 0);
      // 음수가 되면 안되니 최소값을 0으로 고정!
      progressBar.style.width = `${progressPercentage}%`;

      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        startExtraGame();
      }
    } else {
      extraTimeLeft--;
      document.getElementById("extra-timer").textContent = `${extraTimeLeft}s`;

      if (extraTimeLeft <= 0) {
        clearInterval(timerInterval);
        endGame();
      }
    }
  }, 1000);
}

// 랜덤 그리드 생성
function generateRandomGrid() {
  grid = Array.from({ length: gridSize }, () =>
    Array.from({ length: gridSize }, () => Math.floor(Math.random() * 9) + 1)
  );

  let pairsAdded = 0;
  while (pairsAdded < 8) {
    const x1 = Math.floor(Math.random() * gridSize);
    const y1 = Math.floor(Math.random() * gridSize);
    const x2 = Math.floor(Math.random() * gridSize);
    const y2 = Math.floor(Math.random() * gridSize);

    if (x1 !== x2 || y1 !== y2) {
      const value = Math.floor(Math.random() * 9) + 1;
      if (grid[x1][y1] !== 0 && grid[x2][y2] !== 0) {
        grid[x1][y1] = value;
        grid[x2][y2] = 10 - value;
        pairsAdded++;
      }
    }
  }
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
      if (cell !== 0) {
        cellDiv.textContent = cell;
        cellDiv.addEventListener("click", () => handleCellClick(i, j));
      } else {
        cellDiv.classList.add("empty"); // 빈 셀은 흰색 표시
      }
      gridContainer.appendChild(cellDiv);
    });
  });
}

// 셀 클릭 처리
function handleCellClick(x, y) {
  const cellIndex = selectedCells.findIndex(
    (cell) => cell.x === x && cell.y === y
  );

  // 이미 선택된 셀 클릭 시 취소
  if (cellIndex !== -1) {
    const cellDiv = document.querySelectorAll(".cell")[x * gridSize + y];
    cellDiv.classList.remove("selected");
    selectedCells.splice(cellIndex, 1);
    return;
  }

  // 새로운 셀 선택
  const cellDiv = document.querySelectorAll(".cell")[x * gridSize + y];
  cellDiv.classList.add("selected");
  selectedCells.push({ x, y });

  // 두 개 선택된 경우 처리
  if (selectedCells.length === 2) {
    const [first, second] = selectedCells;

    if (
      grid[first.x][first.y] + grid[second.x][second.y] === 10 &&
      (first.x !== second.x || first.y !== second.y)
    ) {
      // 올바른 쌍
      score += 10;
      document.getElementById("score").textContent = score;

      // 짝이 맞은 셀 제거
      removeCell(first.x, first.y);
      removeCell(second.x, second.y);

      // 조합 찾은 개수 증가
      foundPairs++;

      // 8개의 조합을 찾으면 새로운 그리드 생성
      if (foundPairs >= 8) {
        foundPairs = 0;
        setTimeout(() => {
          generateRandomGrid(); // 새로운 그리드 생성
        }, 500); // 소멸 애니메이션 후 실행
      }

      if (isExtraGame) {
        extraTimeLeft = 10; // 10초로 초기화
      }
    } else {
      // 잘못된 쌍
      const firstCellDiv =
        document.querySelectorAll(".cell")[first.x * gridSize + first.y];
      const secondCellDiv =
        document.querySelectorAll(".cell")[second.x * gridSize + second.y];
      firstCellDiv.classList.add("wrong");
      secondCellDiv.classList.add("wrong");

      setTimeout(() => {
        firstCellDiv.classList.remove("wrong");
        secondCellDiv.classList.remove("wrong");
      }, 500);
    }

    // 선택 초기화
    selectedCells.forEach(({ x, y }) => {
      const cellDiv = document.querySelectorAll(".cell")[x * gridSize + y];
      cellDiv.classList.remove("selected");
    });
    selectedCells = [];
  }
}

// 셀을 소멸시키는 함수 (애니메이션 후 흰색 유지)
function removeCell(x, y) {
  const cellDiv = document.querySelectorAll(".cell")[x * gridSize + y];
  cellDiv.classList.add("fade-out"); // 소멸 애니메이션 추가
  setTimeout(() => {
    cellDiv.textContent = ""; // 텍스트 제거
    cellDiv.classList.remove("fade-out"); // 소멸 애니메이션 제거
    cellDiv.classList.add("empty"); // 빈 셀 스타일 적용 (흰색 유지)
    grid[x][y] = 0; // 그리드 값 0으로 설정
  }, 500); // 애니메이션 완료 후 처리
}

// 게임 종료 처리
function endGame() {
  const nickname = prompt("Game Over! Enter your nickname:");
  if (nickname) {
    saveScore(nickname, score);
  }
  showLeaderboard();
  document.getElementById("restart").style.display = "block";
}

// 게임 초기화
function initGame() {
  score = 0;
  timeLeft = 60;
  isExtraGame = false;
  foundPairs = 0;
  selectedCells = [];
  document.getElementById("score").textContent = score;
  document.getElementById("timer").textContent = `${timeLeft}s`;
  document.getElementById("restart").style.display = "none";
  document.getElementById("extra-game").style.display = "none";
  generateRandomGrid();
  initTimer();
}

// 엑스트라 게임 시작
function startExtraGame() {
  isExtraGame = true;
  extraTimeLeft = 10;
  document.getElementById("extra-game").style.display = "block";
  initTimer();
}

// 점수 저장 및 리더보드 관리
function saveScore(nickname, score) {
  let scores = JSON.parse(localStorage.getItem("leaderboard")) || [];
  scores.push({ nickname, score });
  scores.sort((a, b) => b.score - a.score);
  localStorage.setItem("leaderboard", JSON.stringify(scores));
}

// 리더보드 출력
function showLeaderboard() {
  const scores = JSON.parse(localStorage.getItem("leaderboard")) || [];
  let leaderboard = "Leaderboard:\n";
  scores.forEach((entry, index) => {
    leaderboard += `${index + 1}. ${entry.nickname} - ${entry.score}\n`;
  });
  alert(leaderboard);
}

// 게임 재시작 버튼
document.getElementById("restart").addEventListener("click", initGame);

// 게임 시작
initGame();
