import "./pacman.css";

// board
let board;
const rowCount = 21;
const columnCount = 19;
const tileSize = 32;
const boardHeight = rowCount * tileSize;
const boardWidth = columnCount * tileSize;
let context;

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

const walls = new Set();
const foods = new Set();
const ghosts = new Set();
let pacman;

window.onload = function () {
  board = document.getElementById("board");
  if (board && board instanceof HTMLCanvasElement) {
    board.style.height = `${boardHeight}px`;
    board.style.width = `${boardWidth}px`;
    context = board.getContext("2d");

    loadImages();
    loadMap();
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

function loadMap() {
  walls.clear();
  foods.clear();
  ghosts.clear();

  for (let r = 0; r < rowCount; r++) {
    for (let c = 0; c < columnCount; c++) {
      const row = tileMap[r];
      const tileMapChar = row[c];

      const x = c * tileSize;
      const y = r * tileSize;

      //   if (tileMapChar == "X") {
      //     // block wall
      //     const wall = new Block(wallImage, x, y, tileSize, tileSize);
      //     walls.add(wall);
      //   } else if (tileMapChar == "b") {
      //     const ghost = new Block(blueGhostImage, x, y, tileSize, tileSize);
      //     ghosts.add(ghost);
      //   }

      switch (tileMapChar) {
        case "X": {
          const wall = new Block(wallImage, x, y, tileSize, tileSize);
          walls.add(wall);
          break;
        }
        case "b": {
          const ghost = new Block(blueGhostImage, x, y, tileSize, tileSize);
          ghosts.add(ghost);
          break;
        }
        case "P": {
          const pacmanImage = new Block(
            pacmanUpImage,
            x,
            y,
            tileSize,
            tileSize
          );
          pacman = pacmanImage;
          break;
        }
        case "p": {
          const ghost = new Block(pinkGhostImage, x, y, tileSize, tileSize);
          ghosts.add(ghost);
          break;
        }
        case "o": {
          const ghost = new Block(orangeGhostImage, x, y, tileSize, tileSize);
          ghosts.add(ghost);
          break;
        }
        case "r": {
          const ghost = new Block(redGhostImage, x, y, tileSize, tileSize);
          ghosts.add(ghost);
          break;
        }
        case " ": {
          const food = new Block(null, x + 14, y + 14, 4, 4);
          foods.add(food);
          break;
        }
      }
    }
  }
}

// GAME LOOP
function update() {
  draw();
  setTimeout(update, 50); //20 FPS 1 -> 1000ms/20 = 50
}

function draw() {}

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
