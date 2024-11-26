const gridSize = 10;
let grid = [];
let score = 0;
let timeLeft = 60;
let extraTimeLeft = 10;
let isExtraGame = false;
let foundPairs = 0; // 찾은 조합의 개수를 추적
let selectedCells = []; // 선택된 셀 저장

function showGameStatus(message) {
  let statusDiv = document.getElementById("game-status");

  // 기존 상태 메시지가 있으면 재사용
  if (!statusDiv) {
    statusDiv = document.createElement("div");
    statusDiv.id = "game-status";
    document.body.appendChild(statusDiv);
  }

  statusDiv.textContent = message;

  // 하단에 고정된 상태로 표시
  statusDiv.style.display = "block";

  // 3초 후 메시지 숨기기
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
  // 같은 행에서 연결 확인 (직선)
  if (x1 === x2) {
    const [start, end] = [Math.min(y1, y2), Math.max(y1, y2)];
    for (let y = start + 1; y < end; y++) {
      if (grid[x1][y] !== 0) return false; // 중간에 숫자가 있으면 차단
    }
    return true;
  }

  // 같은 열에서 연결 확인 (직선)
  if (y1 === y2) {
    const [start, end] = [Math.min(x1, x2), Math.max(x1, x2)];
    for (let x = start + 1; x < end; x++) {
      if (grid[x][y1] !== 0) return false; // 중간에 숫자가 있으면 차단
    }
    return true;
  }

  // 대각선에서 연결 확인 (중간에 숫자 하나만 허용)
  if (Math.abs(x2 - x1) === Math.abs(y2 - y1)) {
    let middleBlocked = 0;
    const dx = x2 > x1 ? 1 : -1;
    const dy = y2 > y1 ? 1 : -1;

    let cx = x1 + dx;
    let cy = y1 + dy;

    while (cx !== x2 && cy !== y2) {
      if (grid[cx][cy] !== 0) {
        middleBlocked++;
        if (middleBlocked > 1) return false;
      }
      cx += dx;
      cy += dy;
    }
    return true;
  }

  // 꺾이는 경로 확인
  if (
    grid[x1][y2] === 0 &&
    isPathClear(x1, y1, x1, y2) &&
    isPathClear(x1, y2, x2, y2)
  ) {
    return true;
  }
  if (
    grid[x2][y1] === 0 &&
    isPathClear(x1, y1, x2, y1) &&
    isPathClear(x2, y1, x2, y2)
  ) {
    return true;
  }

  return false;
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

  if (cellIndex !== -1) {
    const cellDiv = document.querySelectorAll(".cell")[x * gridSize + y];
    cellDiv.classList.remove("selected");
    selectedCells.splice(cellIndex, 1);
    return;
  }

  const cellDiv = document.querySelectorAll(".cell")[x * gridSize + y];
  cellDiv.classList.add("selected");
  selectedCells.push({ x, y });

  if (selectedCells.length === 2) {
    const [first, second] = selectedCells;

    if (
      grid[first.x][first.y] + grid[second.x][second.y] === 10 &&
      isPathClear(first.x, first.y, second.x, second.y)
    ) {
      score += 10;
      showGameStatus("Correct Pair! +10 Points!");
      document.getElementById("score").textContent = score;

      setTimeout(() => {
        removeCell(first.x, first.y);
        removeCell(second.x, second.y);
      }, 500);
    } else {
      showGameStatus("Invalid Pair!");
    }

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
});

// 게임 시작
initGame();

let hintCount = 3; // 힌트 사용 제한

// 힌트 버튼 클릭 이벤트
document.getElementById("hint").addEventListener("click", () => {
  if (hintCount <= 0) {
    showGameStatus("No hints left!");
    return;
  }

  // 가능한 짝 찾기
  let pairFound = false; // 유효한 짝이 발견되었는지 추적

  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      if (grid[i][j] === 0) continue; // 빈 셀은 건너뜀

      for (let k = 0; k < gridSize; k++) {
        for (let l = 0; l < gridSize; l++) {
          if (grid[k][l] === 0 || (i === k && j === l)) continue; // 자기 자신 또는 빈 셀은 제외

          // 숫자 합과 경로 확인
          if (
            grid[i][j] + grid[k][l] === 10 &&
            isPathClear(i, j, k, l) // 경로 확인
          ) {
            // 유효한 짝 발견
            const firstCellDiv =
              document.querySelectorAll(".cell")[i * gridSize + j];
            const secondCellDiv =
              document.querySelectorAll(".cell")[k * gridSize + l];

            // 힌트 강조
            firstCellDiv.classList.add("hint");
            secondCellDiv.classList.add("hint");

            // 1초 후 강조 효과 제거
            setTimeout(() => {
              firstCellDiv.classList.remove("hint");
              secondCellDiv.classList.remove("hint");
            }, 1000);

            // 점수 차감 및 힌트 사용 감소
            score -= 5;
            document.getElementById("score").textContent = score;

            hintCount--;
            document.getElementById("hint").textContent = `Hint (${hintCount} left)`;

            pairFound = true; // 짝이 발견되었음을 표시
            return; // 한 쌍만 표시하고 종료
          }
        }
      }
    }
  }

  // 짝이 발견되지 않은 경우
  if (!pairFound) {
    showGameStatus("No valid pairs found!");
  }
});


// 점수 효과 표시
function showScoreEffect(x, y, delta) {
  const effect = document.createElement("div");
  effect.className = "score-effect";
  effect.textContent = `+${delta}`;
  effect.style.left = `${y * 45 + 10}px`; // 셀 중앙
  effect.style.top = `${x * 45 + 10}px`;
  effect.style.position = "absolute";

  const gridContainer = document.getElementById("grid");
  gridContainer.appendChild(effect);


}

// 별 효과 표시
function showStarEffect(x, y) {
  const star = document.createElement("div");
  star.className = "star-effect";
  star.style.left = `${y * 45 + 10}px`; // 셀 중앙
  star.style.top = `${x * 45 + 10}px`;
  star.style.position = "absolute";

  const gridContainer = document.getElementById("grid");
  gridContainer.appendChild(star);

  setTimeout(() => {
    star.remove(); // 효과가 끝나면 삭제
  }, 1000);
}

// 셀 클릭 처리
function handleCellClick(x, y) {
  const cellIndex = selectedCells.findIndex(
    (cell) => cell.x === x && cell.y === y
  );

  if (cellIndex !== -1) {
    const cellDiv = document.querySelectorAll(".cell")[x * gridSize + y];
    cellDiv.classList.remove("selected");
    selectedCells.splice(cellIndex, 1);
    return;
  }

  const cellDiv = document.querySelectorAll(".cell")[x * gridSize + y];
  cellDiv.classList.add("selected");
  selectedCells.push({ x, y });

  if (selectedCells.length === 2) {
    const [first, second] = selectedCells;

    if (
      grid[first.x][first.y] + grid[second.x][second.y] === 10 &&
      isPathClear(first.x, first.y, second.x, second.y)
    ) {
      score += 10;
      document.getElementById("score").textContent = score;

      // 효과 표시
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

    selectedCells.forEach(({ x, y }) => {
      const cellDiv = document.querySelectorAll(".cell")[x * gridSize + y];
      cellDiv.classList.remove("selected");
    });
    selectedCells = [];
  }
}


// 알맞은 짝을 맞춘 경우
if (grid[first.x][first.y] + grid[second.x][second.y] === 10) {
  score += 10;
  showScoreEffect(first.x, first.y, 10);
  showStarEffect(first.x, first.y);
  showStarEffect(second.x, second.y);

  document.getElementById("score").textContent = score;
}

function isPathClear(x1, y1, x2, y2) {
  // 같은 행에서 연결 확인 (직선)
  if (x1 === x2) {
    const [start, end] = [Math.min(y1, y2), Math.max(y1, y2)];
    for (let y = start + 1; y < end; y++) {
      if (grid[x1][y] !== 0) return false; // 중간에 숫자가 있으면 차단
    }
    return true; // 경로가 뚫려 있음
  }

  // 같은 열에서 연결 확인 (직선)
  if (y1 === y2) {
    const [start, end] = [Math.min(x1, x2), Math.max(x1, x2)];
    for (let x = start + 1; x < end; x++) {
      if (grid[x][y1] !== 0) return false; // 중간에 숫자가 있으면 차단
    }
    return true; // 경로가 뚫려 있음
  }

  // 대각선에서 연결 확인 (중간에 숫자 하나만 허용)
  if (Math.abs(x2 - x1) === Math.abs(y2 - y1)) {
    let middleBlocked = 0;
    const dx = x2 > x1 ? 1 : -1; // x 방향 이동량
    const dy = y2 > y1 ? 1 : -1; // y 방향 이동량

    let cx = x1 + dx;
    let cy = y1 + dy;

    while (cx !== x2 && cy !== y2) {
      if (grid[cx][cy] !== 0) {
        middleBlocked++;
        if (middleBlocked > 1) return false; // 중간에 숫자가 2개 이상이면 차단
      }
      cx += dx;
      cy += dy;
    }
    return true; // 중간에 숫자가 하나만 있는 경우
  }

  // 꺾이는 경로 확인 (사천성 스타일)
  if (
    grid[x1][y2] === 0 &&
    isPathClear(x1, y1, x1, y2) &&
    isPathClear(x1, y2, x2, y2)
  ) {
    return true;
  }
  if (
    grid[x2][y1] === 0 &&
    isPathClear(x1, y1, x2, y1) &&
    isPathClear(x2, y1, x2, y2)
  ) {
    return true;
  }

  return false; // 연결 불가능
}


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

    // 짝 확인: 숫자 합이 10이고, 경로가 뚫려 있어야 함
    if (
      grid[first.x][first.y] + grid[second.x][second.y] === 10 &&
      isPathClear(first.x, first.y, second.x, second.y)
    ) {
      // 올바른 쌍
      score += 10;
      showGameStatus("Correct Pair! +10 Points!");
      document.getElementById("score").textContent = score;

      const firstCellDiv =
        document.querySelectorAll(".cell")[first.x * gridSize + first.y];
      const secondCellDiv =
        document.querySelectorAll(".cell")[second.x * gridSize + second.y];

      // 올바른 쌍 효과 표시
      showScoreEffect(first.x, first.y, 10);
      showStarEffect(first.x, first.y);
      showStarEffect(second.x, second.y);

      setTimeout(() => {
        removeCell(first.x, first.y);
        removeCell(second.x, second.y);
      }, 500);
    } else {
      // 잘못된 쌍
      showGameStatus("Invalid Pair!");
    }

    // 선택 초기화
    selectedCells.forEach(({ x, y }) => {
      const cellDiv = document.querySelectorAll(".cell")[x * gridSize + y];
      cellDiv.classList.remove("selected");
    });
    selectedCells = [];
  }
}

function removeCell(x, y) {
  const cellDiv = document.querySelectorAll(".cell")[x * gridSize + y];
  cellDiv.classList.add("fade-out"); // 소멸 애니메이션 추가
  setTimeout(() => {
    cellDiv.textContent = ""; // 텍스트 제거
    cellDiv.classList.remove("fade-out"); // 소멸 애니메이션 제거
    cellDiv.classList.add("empty"); // 빈 셀 스타일 적용
    grid[x][y] = 0; // 그리드 값 0으로 설정
  }, 500); // 애니메이션 완료 후 처리
}

function isPathClear(x1, y1, x2, y2) {
  // 같은 행에서 연결 확인
  if (x1 === x2) {
    const [start, end] = [Math.min(y1, y2), Math.max(y1, y2)];
    for (let y = start + 1; y < end; y++) {
      if (grid[x1][y] !== 0) return false; // 중간에 숫자가 있으면 차단
    }
    return true; // 경로가 뚫려 있음
  }

  // 같은 열에서 연결 확인
  if (y1 === y2) {
    const [start, end] = [Math.min(x1, x2), Math.max(x1, x2)];
    for (let x = start + 1; x < end; x++) {
      if (grid[x][y1] !== 0) return false; // 중간에 숫자가 있으면 차단
    }
    return true; // 경로가 뚫려 있음
  }

  // 대각선에서 연결 확인 (중간에 숫자 하나만 허용)
  if (Math.abs(x2 - x1) === Math.abs(y2 - y1)) {
    let middleBlocked = 0;
    const dx = x2 > x1 ? 1 : -1; // x 방향 이동량
    const dy = y2 > y1 ? 1 : -1; // y 방향 이동량

    let cx = x1 + dx;
    let cy = y1 + dy;

    while (cx !== x2 && cy !== y2) {
      if (grid[cx][cy] !== 0) {
        middleBlocked++;
        if (middleBlocked > 1) return false; // 중간에 숫자가 2개 이상이면 차단
      }
      cx += dx;
      cy += dy;
    }
    return true; // 중간에 숫자가 하나만 있는 경우
  }

  // 꺾이는 경로 확인 (사천성 스타일)
  if (
    grid[x1][y2] === 0 &&
    isPathClear(x1, y1, x1, y2) &&
    isPathClear(x1, y2, x2, y2)
  ) {
    return true;
  }
  if (
    grid[x2][y1] === 0 &&
    isPathClear(x1, y1, x2, y1) &&
    isPathClear(x2, y1, x2, y2)
  ) {
    return true;
  }

  return false; // 연결 불가능
}

function isPathClear(x1, y1, x2, y2) {
  console.log(`Checking path between (${x1}, ${y1}) and (${x2}, ${y2})`);

  // 같은 행에서 연결 확인 (직선)
  if (x1 === x2) {
    const [start, end] = [Math.min(y1, y2), Math.max(y1, y2)];
    for (let y = start + 1; y < end; y++) {
      if (grid[x1][y] !== 0) {
        console.log(`Blocked at (${x1}, ${y})`);
        return false; // 중간에 숫자가 있으면 차단
      }
    }
    return true; // 경로가 뚫려 있음
  }

  // 같은 열에서 연결 확인 (직선)
  if (y1 === y2) {
    const [start, end] = [Math.min(x1, x2), Math.max(x1, x2)];
    for (let x = start + 1; x < end; x++) {
      if (grid[x][y1] !== 0) {
        console.log(`Blocked at (${x}, ${y1})`);
        return false; // 중간에 숫자가 있으면 차단
      }
    }
    return true; // 경로가 뚫려 있음
  }

  // 대각선에서 연결 확인 (중간에 숫자 하나만 허용)
  if (Math.abs(x2 - x1) === Math.abs(y2 - y1)) {
    let middleBlocked = 0;
    const dx = x2 > x1 ? 1 : -1; // x 방향 이동량
    const dy = y2 > y1 ? 1 : -1; // y 방향 이동량

    let cx = x1 + dx;
    let cy = y1 + dy;

    while (cx !== x2 && cy !== y2) {
      if (grid[cx][cy] !== 0) {
        middleBlocked++;
        console.log(`Middle blocked at (${cx}, ${cy})`);
        if (middleBlocked > 1) {
          return false; // 중간에 숫자가 2개 이상이면 차단
        }
      }
      cx += dx;
      cy += dy;
    }
    return true; // 중간에 숫자가 하나만 있는 경우
  }

  // 꺾이는 경로 확인 (사천성 스타일)
  if (
    grid[x1][y2] === 0 &&
    isPathClear(x1, y1, x1, y2) &&
    isPathClear(x1, y2, x2, y2)
  ) {
    return true;
  }
  if (
    grid[x2][y1] === 0 &&
    isPathClear(x1, y1, x2, y1) &&
    isPathClear(x2, y1, x2, y2)
  ) {
    return true;
  }

  console.log(`No valid path between (${x1}, ${y1}) and (${x2}, ${y2})`);
  return false; // 연결 불가능
}

document.getElementById("hint").addEventListener("click", () => {
  if (hintCount <= 0) {
    showGameStatus("No hints left!");
    return;
  }

  // 가능한 짝 찾기
  let pairFound = false;

  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      if (grid[i][j] === 0) continue; // 빈 셀 건너뛰기

      for (let k = 0; k < gridSize; k++) {
        for (let l = 0; l < gridSize; l++) {
          if (
            grid[k][l] === 0 || // 빈 셀은 건너뛰기
            (i === k && j === l) // 동일한 셀은 무시
          )
            continue;

          // 숫자 합과 경로 확인
          if (
            grid[i][j] + grid[k][l] === 10 &&
            isPathClear(i, j, k, l)
          ) {
            // 유효한 쌍 발견
            const firstCellDiv =
              document.querySelectorAll(".cell")[i * gridSize + j];
            const secondCellDiv =
              document.querySelectorAll(".cell")[k * gridSize + l];

            // 힌트 강조
            firstCellDiv.classList.add("hint");
            secondCellDiv.classList.add("hint");

            setTimeout(() => {
              firstCellDiv.classList.remove("hint");
              secondCellDiv.classList.remove("hint");
            }, 1000);

            // 점수 차감 및 힌트 사용 감소
            score -= 5;
            document.getElementById("score").textContent = score;

            hintCount--;
            document.getElementById("hint").textContent = `Hint (${hintCount} left)`;

            pairFound = true;
            return; // 한 쌍만 표시하고 종료
          }
        }
      }
    }
  }

  // 유효한 짝이 없을 경우
  if (!pairFound) {
    showGameStatus("No valid pairs found!");
  }
});

