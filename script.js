const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const bestScoreEl = document.getElementById("best-score");
const startBtn = document.getElementById("start-btn");
const pauseBtn = document.getElementById("pause-btn");

const gridSize = 20;
const cellSize = canvas.width / gridSize;

const DIRECTIONS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 }
};

let snake = [];
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };
let food = { x: 10, y: 10 };
let score = 0;
let bestScore = Number(localStorage.getItem("snake-best-score") || 0);
let gameLoop = null;
let gameStatus = "ready"; // ready, running, paused, gameover

bestScoreEl.textContent = bestScore;

function resetGame() {
  snake = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 }
  ];
  direction = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };
  score = 0;
  scoreEl.textContent = score;
  spawnFood();
}

function spawnFood() {
  do {
    food = {
      x: Math.floor(Math.random() * gridSize),
      y: Math.floor(Math.random() * gridSize)
    };
  } while (snake.some(segment => segment.x === food.x && segment.y === food.y));
}

function setDirection(newDir) {
  const isOpposite =
    newDir.x === -direction.x && newDir.y === -direction.y;

  if (!isOpposite) {
    nextDirection = newDir;
  }
}

function update() {
  direction = nextDirection;

  const head = {
    x: snake[0].x + direction.x,
    y: snake[0].y + direction.y
  };

  const hitWall =
    head.x < 0 ||
    head.x >= gridSize ||
    head.y < 0 ||
    head.y >= gridSize;

  const hitSelf = snake.some(segment => segment.x === head.x && segment.y === head.y);

  if (hitWall || hitSelf) {
    endGame();
    return;
  }

  snake.unshift(head);

  const ateFood = head.x === food.x && head.y === food.y;
  if (ateFood) {
    score += 1;
    scoreEl.textContent = score;

    if (score > bestScore) {
      bestScore = score;
      bestScoreEl.textContent = bestScore;
      localStorage.setItem("snake-best-score", String(bestScore));
    }

    spawnFood();
  } else {
    snake.pop();
  }

  draw();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Background grid
  ctx.fillStyle = "#0b1220";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      ctx.strokeStyle = "#1e293b";
      ctx.strokeRect(i * cellSize, j * cellSize, cellSize, cellSize);
    }
  }

  // Draw food
  ctx.fillStyle = "#f43f5e";
  ctx.fillRect(food.x * cellSize + 4, food.y * cellSize + 4, cellSize - 8, cellSize - 8);

  // Draw snake
  snake.forEach((segment, index) => {
    ctx.fillStyle = index === 0 ? "#22c55e" : "#4ade80";
    ctx.fillRect(
      segment.x * cellSize + 1,
      segment.y * cellSize + 1,
      cellSize - 2,
      cellSize - 2
    );
  });
}

function startGame() {
  if (gameStatus === "ready" || gameStatus === "gameover") {
    resetGame();
  }

  if (gameStatus === "paused") {
    gameStatus = "running";
    gameLoop = setInterval(update, 120);
    return;
  }

  gameStatus = "running";
  clearInterval(gameLoop);
  gameLoop = setInterval(update, 120);
  draw();
}

function pauseGame() {
  if (gameStatus === "running") {
    gameStatus = "paused";
    clearInterval(gameLoop);
  } else if (gameStatus === "paused") {
    startGame();
  }
}

function endGame() {
  gameStatus = "gameover";
  clearInterval(gameLoop);
  draw();
  // Show a quick message on the canvas
  ctx.fillStyle = "rgba(15, 23, 42, 0.75)";
  ctx.fillRect(0, canvas.height / 2 - 40, canvas.width, 80);
  ctx.fillStyle = "#f8fafc";
  ctx.font = "bold 30px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2 + 10);
}

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowUp" || event.key.toLowerCase() === "w") {
    setDirection(DIRECTIONS.up);
  } else if (event.key === "ArrowDown" || event.key.toLowerCase() === "s") {
    setDirection(DIRECTIONS.down);
  } else if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") {
    setDirection(DIRECTIONS.left);
  } else if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") {
    setDirection(DIRECTIONS.right);
  } else if (event.code === "Space") {
    if (gameStatus === "ready" || gameStatus === "gameover") {
      startGame();
    } else {
      pauseGame();
    }
  }
});

document.querySelectorAll(".control").forEach((button) => {
  button.addEventListener("click", () => {
    const dir = button.dataset.dir;
    setDirection(DIRECTIONS[dir]);
    if (gameStatus === "ready" || gameStatus === "gameover") {
      startGame();
    }
  });
});

startBtn.addEventListener("click", startGame);
pauseBtn.addEventListener("click", pauseGame);

resetGame();
draw();