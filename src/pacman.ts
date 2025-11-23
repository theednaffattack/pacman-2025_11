import "./pacman.css";
import GUI from "lil-gui";

// board
let board: HTMLCanvasElement;
const rowCount = 21;
const columnCount = 19;
const TILE_SIZE = 32;
const BOARD_HEIGHT = rowCount * TILE_SIZE;
const BOARD_WIDTH = columnCount * TILE_SIZE;
let context: CanvasRenderingContext2D | null;

// The variables we might want to tune while playing
const CONFIG = {
  move_speed: 100,
  lives: 3,
};

let score = 0;
// let lives = 1;
let gameOver = false;

const gui = new GUI();
gui.add(CONFIG, "move_speed", 10, 500);

//images
let blueGhostImage: HTMLImageElement;
let orangeGhostImage: HTMLImageElement;
let pinkGhostImage: HTMLImageElement;
let redGhostImage: HTMLImageElement;
let pacmanUpImage: HTMLImageElement;
let pacmanRightImage: HTMLImageElement;
let pacmanDownImage: HTMLImageElement;
let pacmanLeftImage: HTMLImageElement;
let wallImage: HTMLImageElement;

//X = wall, O = skip, P = pac man, ' ' = food
//Ghosts: b = blue, o = orange, p = pink, r = red
const tileMap = [
  "XXXXXXXXXXXXXXXXXXX",
  "X        X        X",
  "X XX XXX X XXX XX X",
  "X                 X",
  "X XX X XXXXX X XX X",
  "X    X       X    X",
  "XXXX XXXX XXXX XXXX",
  "OOOX X       X XOOO",
  "XXXX X XXrXX X XXXX",
  "O       bpo       O",
  "XXXX X XXXXX X XXXX",
  "OOOX X       X XOOO",
  "XXXX X XXXXX X XXXX",
  "X        X        X",
  "X XX XXX X XXX XX X",
  "X  X     P     X  X",
  "XX X X XXXXX X X XX",
  "X    X   X   X    X",
  "X XXXXXX X XXXXXX X",
  "X                 X",
  "XXXXXXXXXXXXXXXXXXX",
];

let gridState: "visible" | "invisible" = "invisible";

const walls = new Set<Block>();
const foods = new Set<Block>();
const ghosts = new Set<Block>();

const DIRECTIONS = ["U", "R", "D", "L"] as const;

type Directions = (typeof DIRECTIONS)[number];

let pacman: Block;
let pacmanUpUrl = new URL("./assets/pacmanUp.png", import.meta.url).href;
let pacmanRightUrl = new URL("./assets/pacmanRight.png", import.meta.url).href;
let pacmanDownUrl = new URL("./assets/pacmanDown.png", import.meta.url).href;
let pacmanLeftUrl = new URL("./assets/pacmanLeft.png", import.meta.url).href;
let blueGhostUrl = new URL("./assets/blueGhost.png", import.meta.url).href;
let pinkGhostUrl = new URL("./assets/pinkGhost.png", import.meta.url).href;
let redGhostUrl = new URL("./assets/redGhost.png", import.meta.url).href;
let orangeGhostUrl = new URL("./assets/orangeGhost.png", import.meta.url).href;
let wallUrl = new URL("./assets/wall.png", import.meta.url).href;

const wallPromise = await imageFromUrl(wallUrl);
const pacmanUpPromise = await imageFromUrl(pacmanUpUrl);
const pacmanRightPromise = await imageFromUrl(pacmanRightUrl);
const pacmanDownPromise = await imageFromUrl(pacmanDownUrl);
const pacmanLeftPromise = await imageFromUrl(pacmanLeftUrl);
const orangeGhostPromise = await imageFromUrl(orangeGhostUrl);
const redGhostPromise = await imageFromUrl(redGhostUrl);
const blueGhostPromise = await imageFromUrl(blueGhostUrl);
const pinkGhostPromise = await imageFromUrl(pinkGhostUrl);

window.onload = async function () {
  board = document.getElementById("board") as HTMLCanvasElement;
  if (board && board instanceof HTMLCanvasElement) {
    board.height = BOARD_HEIGHT;
    board.width = BOARD_WIDTH;
    context = board.getContext("2d");

    loadImages();
    await loadMap();

    // assign direction to ghosts
    for (const ghost of ghosts.values()) {
      const newDirection = DIRECTIONS[Math.floor(Math.random() * 4)];
      ghost.updateDirection(newDirection);
    }
    update();

    // Listen for certain keys to control the game
    document.addEventListener("keyup", movePacman);

    const visibilityBtn = document.getElementById(
      "visibility"
    ) as HTMLButtonElement;

    visibilityBtn.addEventListener("click", (evt: MouseEvent) => {
      evt.preventDefault();
      const clickedBtn = evt.target as HTMLButtonElement;
      if (gridState == "invisible") {
        clickedBtn.textContent = "Hide Grid";
        gridState = "visible";
      } else {
        clickedBtn.textContent = "Show Grid";
        gridState = "invisible";
      }
    });
  }
};

function loadImages() {
  wallImage = new Image();
  blueGhostImage = new Image();
  orangeGhostImage = new Image();
  pinkGhostImage = new Image();
  redGhostImage = new Image();
  pacmanUpImage = new Image();
  pacmanDownImage = new Image();
  pacmanLeftImage = new Image();
  pacmanRightImage = new Image();

  // const wallPromise = await imageFromUrl(wallUrl);

  wallImage.src = "./assets/wall.png";
  blueGhostImage.src = "./assets/blueGhost.png";
  orangeGhostImage.src = "./assets/orangeGhost.png";
  pinkGhostImage.src = "./assets/pinkGhost.png";
  redGhostImage.src = "./assets/redGhost.png";
  pacmanUpImage.src = "./assets/pacmanUp.png";
  pacmanRightImage.src = "./assets/pacmanRight.png";
  pacmanDownImage.src = "./assets/pacmanDown.png";
  pacmanLeftImage.src = "./assets/pacmanLeft.png";
}

async function loadMap() {
  walls.clear();
  foods.clear();
  ghosts.clear();

  for (let r = 0; r < rowCount; r++) {
    for (let c = 0; c < columnCount; c++) {
      const row = tileMap[r];
      const tileMapChar = row[c];

      const x = c * TILE_SIZE;
      const y = r * TILE_SIZE;

      if (tileMapChar == "X") {
        // block wall
        const wall = new Block(wallPromise, x, y, TILE_SIZE, TILE_SIZE);
        walls.add(wall);
      } else if (tileMapChar == "b") {
        const ghost = new Block(blueGhostPromise, x, y, TILE_SIZE, TILE_SIZE);
        ghosts.add(ghost);
      } else if (tileMapChar == "p") {
        const ghost = new Block(pinkGhostPromise, x, y, TILE_SIZE, TILE_SIZE);
        ghosts.add(ghost);
      } else if (tileMapChar == "r") {
        const ghost = new Block(redGhostPromise, x, y, TILE_SIZE, TILE_SIZE);
        ghosts.add(ghost);
      } else if (tileMapChar == "o") {
        const ghost = new Block(orangeGhostPromise, x, y, TILE_SIZE, TILE_SIZE);
        ghosts.add(ghost);
      } else if (tileMapChar == "P") {
        pacman = new Block(pacmanRightPromise, x, y, TILE_SIZE, TILE_SIZE);
      } else if (tileMapChar == " ") {
        const food = new Block(null, x + 14, y + 14, 4, 4);
        foods.add(food);
      }
    } // for of
  } // forof
}

// GAME LOOP
function update() {
  if (gameOver) {
    return;
  }
  move();
  draw();
  setScore();
  updateLives();

  setTimeout(update, 50); //20 FPS 1 -> 1000ms/20 = 50
} // fn update

function draw() {
  // Paint the board black
  if (context) {
    context.clearRect(0, 0, board.width, board.height);
    context.fillStyle = "#000000"; // background color
    context.fillRect(0, 0, BOARD_WIDTH, BOARD_HEIGHT);
  }
  // Show gridlines
  if (gridState == "visible") {
    drawGrid(context, BOARD_WIDTH, BOARD_HEIGHT, 0);
  }
  // Draw sprite assets
  // Draw pacman
  if (context) {
    if (pacman && pacman.image) {
      context.drawImage(
        pacman.image,
        pacman.x,
        pacman.y,
        pacman.width,
        pacman.height
      );
    }
    // Draw Ghosts
    for (const ghost of ghosts.values()) {
      if (ghost.image) {
        context.drawImage(
          ghost.image,
          ghost.x,
          ghost.y,
          ghost.width,
          ghost.height
        );
      }
    }
    // Draw walls
    for (const wall of walls.values()) {
      if (wall.image) {
        context.drawImage(wall.image, wall.x, wall.y, wall.width, wall.height);
      } else {
        console.error("Wall image missing!");
      }
    }
    // Draw food
    context.fillStyle = "white";
    for (let food of foods.values()) {
      context.fillRect(food.x, food.y, food.width, food.height);
    }

    // score
    context.fillStyle = "white";
    context.font = "14px sans-serif";
    if (gameOver) {
      context.fillText(
        "Game Over: " + String(score),
        TILE_SIZE / 2,
        TILE_SIZE / 2
      );
    } else {
      context.fillText(
        "x" + String(CONFIG.lives) + " " + String(score),
        TILE_SIZE / 2,
        TILE_SIZE / 2
      );
    } // if
  } else {
    console.error("Context is missing");
  }
} // fn draw

function move() {
  pacman.x += pacman.velocityX;
  pacman.y += pacman.velocityY;

  // Pacman wall collisions
  for (let wall of walls.values()) {
    if (collision(pacman, wall)) {
      pacman.x -= pacman.velocityX;
      pacman.y -= pacman.velocityY;
      break;
    }
  }

  // --- Pacman Teleport Logic ---

  // Check if Pac-Man goes off the right edge of the maze
  if (pacman.x >= BOARD_WIDTH) {
    // Teleport to the left edge
    pacman.x = 0;
  }
  // Check if Pac-Man goes off the left edge
  else if (pacman.x < 0) {
    // Teleport to the right edge
    pacman.x = BOARD_WIDTH - TILE_SIZE; // Adjust by TILE_SIZE if needed for correct placement
  }

  // Move the ghosts
  for (const ghost of ghosts.values()) {
    if (collision(pacman, ghost)) {
      CONFIG.lives -= 1;
      if (CONFIG.lives == 0) {
        gameOver = true;
        return;
      }
      resetPositions();
    } // if
    ghost.x += ghost.velocityX;
    ghost.y += ghost.velocityY;

    // Ghost collision detection
    for (const wall of walls.values()) {
      if (collision(ghost, wall)) {
        ghost.x -= ghost.velocityX;
        ghost.y -= ghost.velocityY;
        const newDirection = DIRECTIONS[Math.floor(Math.random() * 4)];
        ghost.updateDirection(newDirection);
      } // if
    } // for

    // --- Teleport Logic ---

    // Check if character goes off the right edge of the maze
    if (ghost.x + ghost.width >= BOARD_WIDTH) {
      // Teleport to the left edge
      ghost.x = 0;
    }
    // Check if character  goes off the left edge
    else if (ghost.x < 0) {
      // Teleport to the right edge
      ghost.x = BOARD_WIDTH - TILE_SIZE; // Adjust by TILE_SIZE if needed for correct placement
    } // if
  } // for

  // Check food collision
  let foodEaten: Block | null = null;
  for (const food of foods.values()) {
    if (collision(pacman, food)) {
      foodEaten = food;
      score += 10;
      break;
    } // if
  } // for
  if (foodEaten) {
    foods.delete(foodEaten);
  } // if

  // Next level
  if (foods.size == 0) {
    loadMap();
    resetPositions();
  } // if
} // fn move

function movePacman(evt: KeyboardEvent) {
  if (gameOver) {
    loadMap();
    resetPositions();
    CONFIG.lives = 3;
    score = 0;
    gameOver = false;
    update(); // restart game loop
    return;
  } // if

  if (evt.code == "ArrowUp" || evt.code == "KeyW" || evt.code == "KeyI") {
    pacman.updateDirection("U");
  } else if (
    evt.code == "ArrowDown" ||
    evt.code == "KeyS" ||
    evt.code == "KeyK"
  ) {
    pacman.updateDirection("D");
  } else if (
    evt.code == "ArrowLeft" ||
    evt.code == "KeyA" ||
    evt.code == "KeyJ"
  ) {
    pacman.updateDirection("L");
  } else if (
    evt.code == "ArrowRight" ||
    evt.code == "KeyF" ||
    evt.code == "KeyL"
  ) {
    pacman.updateDirection("R");
  } // if

  // update pacman images
  if (pacman.direction == "U") {
    pacman.image = pacmanUpPromise;
  } else if (pacman.direction == "R") {
    pacman.image = pacmanRightPromise;
  } else if (pacman.direction == "D") {
    pacman.image = pacmanDownPromise;
  } else if (pacman.direction == "L") {
    pacman.image = pacmanLeftPromise;
  } // if
} // fn movePacman

// from https://www.fabiofranchino.com/log/load-an-image-with-javascript-using-await/
export function imageFromUrl(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous"; // to avoid CORS if used with Canvas
    img.src = url;
    img.onload = () => {
      resolve(img);
    };
    img.onerror = (e) => {
      console.error("Image load failure");

      console.error(url);

      reject(e);
    };
  });
}

function drawGrid(
  context: CanvasRenderingContext2D | null,
  bw: number,
  bh: number,
  p: number
) {
  if (context) {
    for (var x = 0; x <= BOARD_WIDTH; x += TILE_SIZE) {
      context.moveTo(0.5 + x + p, p);
      context.lineTo(0.5 + x + p, BOARD_HEIGHT + p);
    }

    for (var x = 0; x <= BOARD_HEIGHT; x += TILE_SIZE) {
      context.moveTo(p, 0.5 + x + p);
      context.lineTo(BOARD_WIDTH + p, 0.5 + x + p);
    }
    context.strokeStyle = "white";
    context.stroke();
  }
}

function collision(a: Block, b: Block) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function setScore() {
  const scoreElement = document.getElementById("score");
  if (scoreElement && scoreElement.textContent) {
    scoreElement.textContent = String(score);
  }
}
function updateLives() {
  const livesElement = document.getElementById("lives");
  if (livesElement && livesElement.textContent) {
    livesElement.textContent = String(CONFIG.lives);
  }
}

function resetPositions() {
  pacman.reset();
  pacman.velocityX = 0;
  pacman.velocityY = 0;

  for (const ghost of ghosts.values()) {
    ghost.reset();
    const newDirection = DIRECTIONS[Math.floor(Math.random() * 4)];
    ghost.updateDirection(newDirection);
  }
}

class Block {
  image: HTMLImageElement | null;
  x: number;
  y: number;
  width: number;
  height: number;
  startX: number;
  startY: number;
  direction: Directions;
  velocityX: number;
  velocityY: number;
  constructor(
    image: HTMLImageElement | null,
    x: number,
    y: number,
    width: number,
    height: number
  ) {
    this.image = image;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    this.startX = x;
    this.startY = y;

    this.direction = "R";
    this.velocityX = 0;
    this.velocityY = 0;
  }

  updateDirection(direction: Directions) {
    const prevDirection = this.direction;
    this.direction = direction;
    this.updateVelocity();
    this.x += this.velocityX;
    this.y += this.velocityY;

    for (const wall of walls) {
      if (collision(this, wall)) {
        this.x -= this.velocityX;
        this.y -= this.velocityY;
        // preserve previous direction
        this.direction = prevDirection;
        this.updateVelocity();
        return;
      }
    }
  }

  updateVelocity() {
    if (this.direction == "U") {
      this.velocityX = 0;
      this.velocityY = -TILE_SIZE / 4;
    } else if (this.direction == "D") {
      this.velocityX = 0;
      this.velocityY = TILE_SIZE / 4;
    } else if (this.direction == "L") {
      this.velocityX = -TILE_SIZE / 4;
      this.velocityY = 0;
    } else if (this.direction == "R") {
      this.velocityX = TILE_SIZE / 4;
      this.velocityY = 0;
    }
  }

  reset() {
    this.x = this.startX;
    this.y = this.startY;
  }
}
