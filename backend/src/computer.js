import { WIN_LINES } from './gameLogic.js';

const CENTER = 4;
const CORNERS = [0, 2, 6, 8];

// Returns the empty cell that would complete a line for `player`, or null.
function findWinningCell(board, player) {
  for (const line of WIN_LINES) {
    const owned = line.filter((i) => board[i] === player).length;
    const empty = line.find((i) => board[i] === null);
    if (owned === 2 && empty !== undefined) {
      return empty;
    }
  }
  return null;
}

// Priority: win -> block X -> center -> corner -> any free cell.
export function pickComputerMove(board) {
  const win = findWinningCell(board, 'O');
  if (win !== null) return win;

  const block = findWinningCell(board, 'X');
  if (block !== null) return block;

  if (board[CENTER] === null) return CENTER;

  const corner = CORNERS.find((i) => board[i] === null);
  if (corner !== undefined) return corner;

  return board.findIndex((cell) => cell === null);
}
