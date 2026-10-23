// Pure game rules. No Express, no storage - each function takes a game and returns a new one.

export const WIN_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
  [0, 4, 8], [2, 4, 6],            // diagonals
];

export class GameError extends Error {}

export function createGame(id, mode = 'TwoPlayer') {
  return buildState({ id, mode }, []);
}

export function checkWinner(board) {
  for (const [a, b, c] of WIN_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], cells: [a, b, c] };
    }
  }
  return null;
}

// Board, turn and status are always derived from the move list.
// That way makeMove and undo can't drift out of sync.
function buildState(game, moves) {
  const board = Array(9).fill(null);
  for (const move of moves) {
    board[move.row * 3 + move.col] = move.player;
  }

  const result = checkWinner(board);
  let status = 'InProgress';
  if (result) status = 'Won';
  else if (moves.length === 9) status = 'Draw';

  const lastMove = moves[moves.length - 1];
  const currentPlayer = lastMove && lastMove.player === 'X' ? 'O' : 'X';

  return {
    ...game,
    board,
    moves,
    status,
    currentPlayer,
    winner: result ? result.winner : null,
    winningCells: result ? result.cells : [],
  };
}

export function makeMove(game, player, row, col) {
  if (game.status !== 'InProgress') {
    throw new GameError('Game is already finished');
  }
  if (player !== game.currentPlayer) {
    throw new GameError(`It is ${game.currentPlayer}'s turn`);
  }
  if (!Number.isInteger(row) || !Number.isInteger(col) || row < 0 || row > 2 || col < 0 || col > 2) {
    throw new GameError('Move is outside the board');
  }
  if (game.board[row * 3 + col]) {
    throw new GameError('Cell is already taken');
  }

  const move = { number: game.moves.length + 1, player, row, col };
  return buildState(game, [...game.moves, move]);
}

export function undoMove(game) {
  if (game.status !== 'InProgress') {
    throw new GameError('Cannot undo a finished game');
  }
  if (game.moves.length === 0) {
    throw new GameError('No moves to undo');
  }

  // vs computer, undo removes the computer's reply and the human move before it
  const count = game.mode === 'Computer' ? 2 : 1;
  return buildState(game, game.moves.slice(0, -count));
}

export function resetGame(game) {
  return buildState(game, []);
}
