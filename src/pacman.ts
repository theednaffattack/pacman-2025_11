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
let blueGhostImage;
let orangeGhostImage;
let pinkGhostImage;
let redGhostImage;

window.onload = function () {
  board = document.getElementById("board");
  if (board && board instanceof HTMLCanvasElement) {
    board.style.height = `${boardHeight}px`;
    board.style.width = `${boardWidth}px`;
    context = board.getContext("2d");
  }
};
