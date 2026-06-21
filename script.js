let paused = false;
let showPauseMenu = false;
let flashingLines = [];
let clearingLines = false;

const bgThemes = {
  lavendar:
    "radial-gradient(circle at top, #f3e5f5, #d1c4e9 40%, #9575cd 100%)",
  sunset: "linear-gradient(135deg, #ff9a9e, #fad0c4)",
  mint: "linear-gradient(135deg, #a8edea, #fed6e3)",
  dark: "linear-gradient(135deg, #232526, #414345)",
};

const deviceThemes = {
  purple: {
    device: "linear-gradient(180deg, #0f0f12 0%, #1a1a1f 30%, #7b1fa2 100%)",
    light: "#e1bee7",
    dark: "#ce93d8",
  },
  pink: {
    device: "linear-gradient(180deg, #2a0f1f 0%, #4a1a3a 30%, #ec407a 100%)",
    light: "#f8bbd0",
    dark: "#f48fb1",
  },
  blue: {
    device: "linear-gradient(180deg, #0f1a2a 0%, #1a2f4a 30%, #42a5f5 100%)",
    light: "#bbdefb",
    dark: "#90caf9",
  },
  green: {
    device: "linear-gradient(180deg, #0f2a1a 0%, #1a4a2f 30%, #66bb6a 100%)",
    light: "#c8e6c9",
    dark: "#a5d6a7",
  },
};

document.getElementById("deviceColor").addEventListener("change", (e) => {
  const theme = deviceThemes[e.target.value];
  document.documentElement.style.setProperty("--device-color", theme.device);
  document.documentElement.style.setProperty("--screen-light", theme.light);
  document.documentElement.style.setProperty("--screen-dark", theme.dark);
});

document.getElementById("bgTheme").addEventListener("change", (e) => {
  document.body.style.background = bgThemes[e.target.value];
});

const actions = ["feed", "game", "health", "clean", "light"];
let menuIndex = 0;
let inGame = false;

let grid, piece, gameLoop;
let score = 0;

const ROWS = 22;
const COLS = 16;

const shapes = [
  [
    [1, 1, 1],
    [0, 1, 0],
  ],
  [
    [1, 1],
    [1, 1],
  ],
  [
    [1, 1, 0],
    [0, 1, 1],
  ],
  [
    [0, 1, 1],
    [1, 1, 0],
  ],
  [[1, 1, 1, 1]],
];

function updateMenu() {
  document.querySelectorAll(".menu-item").forEach((item, i) => {
    item.classList.toggle("active", i === menuIndex);
  });
}

function showInfo(text) {
  const el = document.getElementById("infoText");
  el.innerText = text;
  if (!inGame) {
    setTimeout(() => (el.innerText = "Select action"), 1200);
  }
}

function moveLeft() {
  if (inGame && !paused) {
    piece.x--;
    if (collide()) piece.x++;
    return;
  }
  menuIndex = (menuIndex - 1 + actions.length) % actions.length;
  updateMenu();
}

function moveRight() {
  if (inGame && !paused) {
    piece.x++;
    if (collide()) piece.x--;
    return;
  }
  menuIndex = (menuIndex + 1) % actions.length;
  updateMenu();
}

function selectOption() {
  if (inGame) {
    if (!paused) rotatePiece();
    return;
  }

  if (actions[menuIndex] === "game") startTetris();
}

function startTetris() {
  inGame = true;
  paused = false;
  showPauseMenu = false;

  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  const container = document.getElementById("gameContainer");

  document.getElementById("infoText").style.display = "none";
  document.querySelector(".menu").style.display = "none";

  container.style.display = "flex";

  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;

  score = 0;

  grid = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
  spawnPiece();

  gameLoop = setInterval(() => {
    if (!paused) update(ctx, canvas);
    else draw(ctx, canvas);
  }, 400);
}

function spawnPiece() {
  const shape = shapes[Math.floor(Math.random() * shapes.length)];
  piece = { shape, x: Math.floor(COLS / 2) - 1, y: 0 };
  if (collide()) gameOver();
}

function rotatePiece() {
  const rotated = piece.shape[0].map((_, i) =>
    piece.shape.map((row) => row[i]).reverse(),
  );
  const old = piece.shape;
  piece.shape = rotated;
  if (collide()) piece.shape = old;
}

function collide() {
  return piece.shape.some((row, dy) =>
    row.some((val, dx) => {
      if (!val) return false;
      let x = piece.x + dx;
      let y = piece.y + dy;
      return x < 0 || x >= COLS || y >= ROWS || (y >= 0 && grid[y][x]);
    }),
  );
}

function merge() {
  piece.shape.forEach((row, dy) => {
    row.forEach((val, dx) => {
      if (val) grid[piece.y + dy][piece.x + dx] = 1;
    });
  });
}

function clearLines() {
  let lines = [];

  grid.forEach((row, i) => {
    if (row.every((cell) => cell === 1)) {
      lines.push(i);
    }
  });

  flashingLines = [...lines];

  if (!lines.length) return false;

  clearingLines = true;
  score += lines.length * 10;

  setTimeout(() => {
    lines.sort((a, b) => b - a);

    lines.forEach((lineIndex) => {
      grid.splice(lineIndex, 1);
      grid.unshift(Array(COLS).fill(0));
    });

    clearingLines = false;
    flashingLines = [];
    spawnPiece();
  }, 300);

  return true;
}

function update(ctx, canvas) {
  if (clearingLines) {
    draw(ctx, canvas);
    return;
  }

  piece.y++;
  if (collide()) {
    piece.y--;
    merge();
    if (!clearLines()) {
      spawnPiece();
    }
  }
  draw(ctx, canvas);
}

function draw(ctx, canvas) {
  const panelWidth = Math.floor(canvas.width * 0.22);
  const gameWidth = canvas.width - panelWidth;

  const size = Math.floor(Math.min(gameWidth / COLS, canvas.height / ROWS));

  const offsetX = panelWidth + Math.floor((gameWidth - COLS * size) / 2);
  const offsetY = Math.floor((canvas.height - ROWS * size) / 2);

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "rgba(0,0,0,0.1)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, panelWidth, canvas.height);

  ctx.fillStyle = "white";
  ctx.font = "10px monospace";
  ctx.textAlign = "center";

  ctx.fillText("SCORE", panelWidth / 2, 20);
  ctx.fillText(score, panelWidth / 2, 40);
  ctx.fillStyle = "#333";
  ctx.fillRect(10, canvas.height - 35, panelWidth - 17, 25);

  ctx.fillStyle = "white";
  ctx.fillText("PAUSE", panelWidth / 2, canvas.height - 18);

  ctx.strokeStyle = "rgba(0,0,0,0.3)";

  for (let y = 0; y <= ROWS; y++) {
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY + y * size);
    ctx.lineTo(offsetX + COLS * size, offsetY + y * size);
    ctx.stroke();
  }

  for (let x = 0; x <= COLS; x++) {
    ctx.beginPath();
    ctx.moveTo(offsetX + x * size, offsetY);
    ctx.lineTo(offsetX + x * size, offsetY + ROWS * size);
    ctx.stroke();
  }

  ctx.fillStyle = "black";

  grid.forEach((row, y) => {
    if (clearingLines && flashingLines.includes(y)) {
      return;
    }

    row.forEach((val, x) => {
      if (val) {
        ctx.fillRect(
          offsetX + x * size + 1,
          offsetY + y * size + 1,
          size - 2,
          size - 2,
        );
      }
    });
  });

  piece.shape.forEach((row, dy) => {
    row.forEach((val, dx) => {
      if (val) {
        ctx.fillRect(
          offsetX + (piece.x + dx) * size + 1,
          offsetY + (piece.y + dy) * size + 1,
          size - 2,
          size - 2,
        );
      }
    });
  });

  if (showPauseMenu) {
    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillRect(panelWidth, 0, gameWidth, canvas.height);

    ctx.fillStyle = "white";
    ctx.fillText("RESUME", canvas.width / 2, 80);
    ctx.fillText("RESTART", canvas.width / 2, 110);
    ctx.fillText("CLOSE", canvas.width / 2, 140);
  }
}

function gameOver() {
  clearInterval(gameLoop);
  document.getElementById("gameOverUI").style.display = "flex";
}

function restartGame() {
  score = 0;
  paused = false;
  showPauseMenu = false;
  grid = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
  spawnPiece();
}

function exitGame() {
  clearInterval(gameLoop);
  document.getElementById("gameContainer").style.display = "none";
  document.getElementById("infoText").style.display = "block";
  document.querySelector(".menu").style.display = "flex";
  inGame = false;
}

document.getElementById("gameCanvas").addEventListener("click", (e) => {
  if (!inGame) return;

  const canvas = e.target;
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const panelWidth = canvas.width * 0.22;

  if (!showPauseMenu) {
    if (x < panelWidth && y > canvas.height - 30) {
      paused = true;
      showPauseMenu = true;
    }
  } else {
    if (y > 60 && y < 90) {
      paused = false;
      showPauseMenu = false;
    } else if (y > 90 && y < 120) restartGame();
    else if (y > 120 && y < 150) exitGame();
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") moveLeft();
  if (e.key === "ArrowRight") moveRight();
  if (e.key === "ArrowUp") selectOption();
});

updateMenu();
