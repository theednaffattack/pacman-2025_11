import "./pacman.css";

// board
let board: HTMLElement | null;
const rowCount = 21;
const columnCount = 19;
const tileSize = 32;
const boardHeight = rowCount * tileSize;
const boardWidth = columnCount * tileSize;
let context;

window.onload = function () {
  board = document.getElementById("board");
  if (board) {
    board.style.height = `${boardHeight}px`;
    board.style.width = `${boardWidth}px`;
  }
};
