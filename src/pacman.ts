import "./pacman.css";

// board
let board;
const rowCount = 21;
const columnCount = 19;
const tileSize = 32;
const boardHeight = rowCount * tileSize;
const boardWidth = columnCount * tileSize;
let context: CanvasRenderingContext2D | null;

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

const walls = new Set<Block>();
const foods = new Set<Block>();
const ghosts = new Set<Block>();
let pacman: Block;
let pacmanRightUrl = new URL("./assets/pacmanRight.png", import.meta.url).href;
let blueGhostUrl = new URL("./assets/blueGhost.png", import.meta.url).href;
let pinkGhostUrl = new URL("./assets/pinkGhost.png", import.meta.url).href;
let redGhostUrl = new URL("./assets/redGhost.png", import.meta.url).href;
let orangeGhostUrl = new URL("./assets/orangeGhost.png", import.meta.url).href;
let wallUrl = new URL("./assets/wall.png", import.meta.url).href;

const wallPromise = await imageFromUrl(wallUrl);
const pacmanRightPromise = await imageFromUrl(pacmanRightUrl);
const orangeGhostPromise = await imageFromUrl(orangeGhostUrl);
const redGhostPromise = await imageFromUrl(redGhostUrl);
const blueGhostPromise = await imageFromUrl(blueGhostUrl);
const pinkGhostPromise = await imageFromUrl(pinkGhostUrl);

window.onload = async function () {
  board = document.getElementById("board");
  if (board && board instanceof HTMLCanvasElement) {
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");

    loadImages();
    await loadMap();
    update();
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

      const x = c * tileSize;
      const y = r * tileSize;

      if (tileMapChar == "X") {
        // block wall
        const wall = new Block(wallPromise, x, y, tileSize, tileSize);
        walls.add(wall);
      } else if (tileMapChar == "b") {
        const ghost = new Block(blueGhostPromise, x, y, tileSize, tileSize);
        ghosts.add(ghost);
      } else if (tileMapChar == "p") {
        const ghost = new Block(pinkGhostPromise, x, y, tileSize, tileSize);
        ghosts.add(ghost);
      } else if (tileMapChar == "r") {
        const ghost = new Block(redGhostPromise, x, y, tileSize, tileSize);
        ghosts.add(ghost);
      } else if (tileMapChar == "o") {
        const ghost = new Block(orangeGhostPromise, x, y, tileSize, tileSize);
        ghosts.add(ghost);
      } else if (tileMapChar == "P") {
        pacman = new Block(pacmanRightPromise, x, y, tileSize, tileSize);
      } else if (tileMapChar == " ") {
        const food = new Block(null, x + 14, y + 14, 4, 4);
        foods.add(food);
      }
    }
  }

  console.log("MAP LOAD COMPLETE");
}

// GAME LOOP
function update() {
  draw();

  setTimeout(update, 50); //20 FPS 1 -> 1000ms/20 = 50
}

function draw() {
  // console.log("ATTEMPTING TO DRAW", {
  //   x: pacman.x,
  //   y: pacman.y,
  //   boardW: boardWidth,
  //   boardH: boardHeight,
  // });

  // Paint the board black
  if (context) {
    context.fillStyle = "#000000"; // background color
    context.fillRect(0, 0, boardWidth, boardHeight);
  }
  // // Show gridlines
  // drawGrid(context, boardWidth, boardHeight, 0);

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
  } else {
    console.error("Context is missing");
  }
}

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
    for (var x = 0; x <= boardWidth; x += tileSize) {
      context.moveTo(0.5 + x + p, p);
      context.lineTo(0.5 + x + p, boardHeight + p);
    }

    for (var x = 0; x <= boardHeight; x += tileSize) {
      context.moveTo(p, 0.5 + x + p);
      context.lineTo(boardWidth + p, 0.5 + x + p);
    }
    context.strokeStyle = "green";
    context.stroke();
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
  }
}
