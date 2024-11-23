const gridSize = 10;
let grid = [];
let score = 0;
let timeLeft = 60;
let extraTimeLeft = 10;
let isExtraGame = false;
let foundPairs = 0; // 찾은 조합의 개수를 추적
let selectedCells = []; // 선택된 셀 저장

function createGameStatusDiv() {
  let statusDiv = document.getElementById("game-status");
  if (!statusDiv) {
    statusDiv = document.createElement("div");
    statusDiv.id = "game-status";
    document.body.appendChild(statusDiv);
  }
  return statusDiv;
}

function showGameStatus(message) {
  const statusDiv = createGameStatusDiv();
  statusDiv.textContent = message;
  statusDiv.style.display = "block";

  setTimeout(() => {
    statusDiv.style.display = "none";
  }, 3000);
}

showGameStatus("Game Started! Good luck!");

let timerPaused = false;
let timerInterval = null; // 타이머 상태 저장

function initTimer() {
  // 기존 타이머 중단
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  // 기존 진행 바 가져오기 또는 생성
  let progressBarContainer = document.getElementById("progress-bar");
  if (!progressBarContainer) {
    progressBarContainer = document.createElement("div");
    progressBarContainer.id = "progress-bar";

    const progressBar = document.createElement("div");
    progressBar.id = "progress";
    progressBar.style.width = "100%"; // 초기화
    progressBarContainer.appendChild(progressBar);

    const infoContainer = document.getElementById("info");
    infoContainer.appendChild(progressBarContainer);
  } else {
    const progressBar = document.getElementById("progress");
    if (progressBar) progressBar.style.width = "100%";
  }

  // 새로운 타이머 시작
  timerInterval = setInterval(() => {
    if (!timerPaused) {
      if (!isExtraGame) {
        timeLeft--;
        document.getElementById("timer").textContent = `${timeLeft}s`;

        const progressPercentage = Math.max((timeLeft / 60) * 100, 0);
        const progressBar = document.getElementById("progress");
        if (progressBar) progressBar.style.width = `${progressPercentage}%`;

        if (timeLeft <= 0) {
          clearInterval(timerInterval);
          timerInterval = null;
          startExtraGame();
        }
      }
    }
  }, 1000);
}

document.getElementById("pause-resume").addEventListener("click", () => {
  const button = document.getElementById("pause-resume");

  // Pause 상태에서 Restart로 전환
  if (!timerPaused) {
    clearInterval(timerInterval); // 기존 타이머 정리
    timerInterval = null; // 타이머 상태 초기화

    // 버튼 텍스트 업데이트
    button.textContent = "Restart";

    // 기존 이벤트 리스너 제거 및 Restart 동작 추가
    button.replaceWith(button.cloneNode(true));
    const newButton = document.getElementById("pause-resume");

    newButton.addEventListener("click", () => {
      initGame(); // Restart 버튼처럼 새로운 게임 시작
    });
  }

  // Pause 상태 토글
  timerPaused = !timerPaused;
});

document.getElementById("restart").addEventListener("click", () => {
  clearInterval(timerInterval); // 기존 타이머 정리
  timerInterval = null;
  initGame(); // 새로운 게임 시작
});

document.body.addEventListener("keydown", (e) => {
  if (e.key === "p") toggleTimer();
});

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
// 경로가 비어있는지 확인하는 함수입니다.
function isPathClear(x1, y1, x2, y2) {
  const dx = Math.sign(x2 - x1); // x 방향 이동량
  const dy = Math.sign(y2 - y1); // y 방향 이동량

  // 직선 또는 대각선 경로만 허용
  if (Math.abs(x2 - x1) !== Math.abs(y2 - y1) && x1 !== x2 && y1 !== y2) {
    return false; // 꺾인 경로는 허용하지 않음
  }

  let cx = x1 + dx;
  let cy = y1 + dy;

  // 경로 중간에 다른 셀이 있는지 확인
  while (cx !== x2 || cy !== y2) {
    if (grid[cx][cy] !== 0) {
      return false; // 경로에 셀이 있으면 실패
    }
    cx += dx;
    cy += dy;
  }
  return true; // 경로가 비어있음
}

// 인접 여부 확인하는 함수
function isAdjacent(x1, y1, x2, y2) {
  const dx = Math.abs(x2 - x1);
  const dy = Math.abs(y2 - y1);
  return dx <= 1 && dy <= 1; // 인접: 가로, 세로, 대각선 포함
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
  if (
    selectedCells.length === 0 || // 첫 번째 셀 선택
    isAdjacent(selectedCells[0].x, selectedCells[0].y, x, y) || // 인접한 경우
    isPathClear(selectedCells[0].x, selectedCells[0].y, x, y) // 경로가 비어있는 경우
  ) {
    const cellDiv = document.querySelectorAll(".cell")[x * gridSize + y];
    cellDiv.classList.add("selected");
    selectedCells.push({ x, y });
  } else {
    // 선택 불가한 셀 클릭 시 무시
    showGameStatus(
      "Invalid move! You can only select adjacent or clear path cells."
    );
    return;
  }

  // 두 개 선택된 경우 처리
  if (selectedCells.length === 2) {
    const [first, second] = selectedCells;

    if (
      grid[first.x][first.y] + grid[second.x][second.y] === 10 &&
      (first.x !== second.x || first.y !== second.y)
    ) {
      // 올바른 쌍
      score += 10;
      showGameStatus("Correct Pair! +10 Points!");
      document.getElementById("score").textContent = score;

      const firstCellDiv =
        document.querySelectorAll(".cell")[first.x * gridSize + first.y];
      const secondCellDiv =
        document.querySelectorAll(".cell")[second.x * gridSize + second.y];

      // 두 셀 모두에 correctClass 적용
      firstCellDiv.classList.add("correct");
      secondCellDiv.classList.add("correct");

      setTimeout(() => {
        firstCellDiv.classList.remove("correct");
        secondCellDiv.classList.remove("correct");

        // 짝이 맞은 셀 제거
        removeCell(first.x, first.y);
        removeCell(second.x, second.y);
      }, 500);

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
  showGameStatus("Game Over! Thanks for playing!");
  const nickname = prompt("Game Over! Enter your nickname:");
  if (nickname) {
    saveScore(nickname, score);
  }
  showLeaderboard();
  document.getElementById("restart").style.display = "block";
}

// 게임 초기화
function initGame() {
  // 타이머 중지
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  // 상태 초기화
  score = 0;
  timeLeft = 60;
  extraTimeLeft = 10;
  isExtraGame = false;
  foundPairs = 0;
  selectedCells = [];
  timerPaused = false;

  // UI 초기화
  document.getElementById("score").textContent = score;
  document.getElementById("timer").textContent = `${timeLeft}s`;
  document.getElementById("extra-game").style.display = "none";
  document.getElementById("restart").style.display = "none";

  // 기존 진행 바 제거
  const progressBarContainer = document.getElementById("progress-bar");
  if (progressBarContainer) progressBarContainer.remove();

  // 기존 게임판 초기화
  const gridContainer = document.getElementById("grid");
  gridContainer.innerHTML = ""; // 기존 그리드 UI 제거

  // 새로운 게임 시작
  generateRandomGrid();
  initTimer();
}

// 엑스트라 게임 시작
function startExtraGame() {
  showGameStatus("Time's Up! Starting Extra Game!");
  isExtraGame = true;
  extraTimeLeft = 10;

  // 기존 타이머와 진행 바 재사용
  document.getElementById("extra-game").style.display = "none"; // 기존 아래 표시 제거
  document.getElementById("timer").textContent = `${extraTimeLeft}s`; // 상단 타이머 업데이트
  const progressBar = document.getElementById("progress");
  if (progressBar) progressBar.style.width = "100%";

  // 타이머 초기화
  if (timerInterval) clearInterval(timerInterval);

  timerInterval = setInterval(() => {
    extraTimeLeft--;
    document.getElementById("timer").textContent = `${extraTimeLeft}s`;

    const progressPercentage = Math.max((extraTimeLeft / 10) * 100, 0);
    if (progressBar) progressBar.style.width = `${progressPercentage}%`;

    if (extraTimeLeft <= 0) {
      clearInterval(timerInterval);
      timerInterval = null;
      endGame();
    }
  }, 1000);
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

document.getElementById("restart").addEventListener("click", () => {
  clearInterval(timerInterval); // 기존 타이머 정리
  timerInterval = null;
  initGame(); // 게임 재시작
  showGameStatus("Game Started! Good luck!");
});

// 게임 시작
initGame();
