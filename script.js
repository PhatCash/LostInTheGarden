const world = document.getElementById("world");
const player = document.getElementById("player");
const flowerCount = document.getElementById("flowerCount");
const progressFill = document.getElementById("progressFill");
const progressText = document.getElementById("progressText");
const messageText = document.getElementById("messageText");
const messagePanel = document.getElementById("messagePanel");
const startScreen = document.getElementById("startScreen");
const gameShell = document.getElementById("gameShell");
const endingScreen = document.getElementById("endingScreen");
const endingText = document.getElementById("endingText");
const gameView = document.getElementById("gameView");
const startButton = document.getElementById("startButton");
const restartButton = document.getElementById("restartButton");
const playAgainButton = document.getElementById("playAgainButton");
const touchButtons = Array.from(document.querySelectorAll(".touch-button"));

const flowers = Array.from(document.querySelectorAll(".flower"));

const flowerNotes = [
  "You are beautiful, and this rose has been waiting to say so.",
  "These flowers are for you, bright and gentle as morning.",
  "You make the garden brighter just by being here.",
  "This little garden feels softer with you in it."
];

const finalNote = "Every flower has been gathered, and the garden finally says its secret out loud: you make even the softest place feel warmer. Petals drift through the air, the paths grow still, and the whole garden feels like a small love letter left open just for you.";

const state = {
  isPlaying: false,
  playerX: 120,
  playerY: 240,
  speed: 3,
  foundFlowers: new Set(),
  pressedKeys: new Set()
};

const worldSize = {
  width: 1400,
  height: 980
};

function updatePlayerPosition() {
  player.style.left = `${state.playerX}px`;
  player.style.top = `${state.playerY}px`;
  player.style.zIndex = String(40 + Math.floor(state.playerY / 14));
}

function updateFlowerCounter() {
  const collected = state.foundFlowers.size;
  const total = flowers.length;
  const percent = Math.round((collected / total) * 100);

  flowerCount.textContent = `${collected} / ${total}`;
  progressFill.style.width = `${percent}%`;
  progressText.textContent = `${percent}%`;
}

function setMessage(text) {
  messageText.textContent = text;
  messagePanel.animate(
    [
      { opacity: 0.65, transform: "translateY(6px)" },
      { opacity: 1, transform: "translateY(0px)" }
    ],
    {
      duration: 220,
      easing: "ease-out"
    }
  );
}

function centerCameraOnPlayer() {
  const viewWidth = gameView.clientWidth;
  const viewHeight = gameView.clientHeight;
  const maxOffsetX = Math.max(0, worldSize.width - viewWidth);
  const maxOffsetY = Math.max(0, worldSize.height - viewHeight);

  const targetX = state.playerX - viewWidth / 2;
  const targetY = state.playerY - viewHeight / 2;

  const offsetX = Math.max(0, Math.min(targetX, maxOffsetX));
  const offsetY = Math.max(0, Math.min(targetY, maxOffsetY));

  world.style.transform = `translate(${-offsetX}px, ${-offsetY}px)`;
}

function collectFlower(flower, flowerId) {
  if (state.foundFlowers.has(flowerId)) {
    return;
  }

  state.foundFlowers.add(flowerId);
  flower.classList.add("hidden");
  updateFlowerCounter();
  setMessage(flowerNotes[flowerId]);

  if (state.foundFlowers.size === flowers.length) {
    window.setTimeout(showEnding, 900);
  }
}

function checkFlowerCollection() {
  flowers.forEach((flower) => {
    const flowerId = Number(flower.dataset.flowerId);

    if (state.foundFlowers.has(flowerId)) {
      return;
    }

    const flowerX = parseFloat(flower.style.left);
    const flowerY = parseFloat(flower.style.top);
    const distance = Math.hypot(state.playerX - flowerX, state.playerY - flowerY);

    if (distance < 42) {
      collectFlower(flower, flowerId);
    }
  });
}

function movePlayer() {
  if (!state.isPlaying) {
    return;
  }

  let moveX = 0;
  let moveY = 0;

  if (state.pressedKeys.has("arrowup") || state.pressedKeys.has("w")) {
    moveY -= state.speed;
  }

  if (state.pressedKeys.has("arrowdown") || state.pressedKeys.has("s")) {
    moveY += state.speed;
  }

  if (state.pressedKeys.has("arrowleft") || state.pressedKeys.has("a")) {
    moveX -= state.speed;
  }

  if (state.pressedKeys.has("arrowright") || state.pressedKeys.has("d")) {
    moveX += state.speed;
  }

  const diagonalMove = moveX !== 0 && moveY !== 0;
  const speedMultiplier = diagonalMove ? Math.SQRT1_2 : 1;
  const nextX = Math.max(68, Math.min(state.playerX + moveX * speedMultiplier, worldSize.width - 68));
  const nextY = Math.max(68, Math.min(state.playerY + moveY * speedMultiplier, worldSize.height - 68));

  state.playerX = nextX;
  state.playerY = nextY;

  updatePlayerPosition();
  centerCameraOnPlayer();
  checkFlowerCollection();

  window.requestAnimationFrame(movePlayer);
}

function restartGame() {
  state.playerX = 120;
  state.playerY = 240;
  state.foundFlowers.clear();
  state.pressedKeys.clear();
  state.isPlaying = true;

  flowers.forEach((flower) => {
    flower.classList.remove("hidden");
  });

  startScreen.classList.add("hidden");
  endingScreen.classList.add("hidden");
  gameShell.classList.remove("hidden");

  updatePlayerPosition();
  centerCameraOnPlayer();
  updateFlowerCounter();
  setMessage("The garden opens ahead. Four flowers are hidden along the paths for you.");

  window.requestAnimationFrame(movePlayer);
}

function startGame() {
  restartGame();
}

function showEnding() {
  state.isPlaying = false;
  endingText.textContent = finalNote;
  endingScreen.classList.remove("hidden");
}

function handleKeyDown(event) {
  const key = event.key.toLowerCase();

  if (["arrowup", "arrowdown", "arrowleft", "arrowright", "w", "a", "s", "d"].includes(key)) {
    event.preventDefault();
    state.pressedKeys.add(key);
  }
}

function handleKeyUp(event) {
  state.pressedKeys.delete(event.key.toLowerCase());
}

function setTouchKey(key, isPressed) {
  if (isPressed) {
    state.pressedKeys.add(key);
    return;
  }

  state.pressedKeys.delete(key);
}

touchButtons.forEach((button) => {
  const key = button.dataset.key;

  button.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    setTouchKey(key, true);
  });

  button.addEventListener("pointerup", () => setTouchKey(key, false));
  button.addEventListener("pointercancel", () => setTouchKey(key, false));
  button.addEventListener("pointerleave", () => setTouchKey(key, false));
});

startButton.addEventListener("click", startGame);
restartButton.addEventListener("click", restartGame);
playAgainButton.addEventListener("click", restartGame);
window.addEventListener("keydown", handleKeyDown);
window.addEventListener("keyup", handleKeyUp);
window.addEventListener("resize", centerCameraOnPlayer);

updatePlayerPosition();
updateFlowerCounter();
