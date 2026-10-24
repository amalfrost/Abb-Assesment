// Mirrors the backend API contract (see backend/src/gameLogic.js and store.js)

export type Player = 'X' | 'O'
export type Cell = Player | null
export type GameMode = 'TwoPlayer' | 'Computer'
export type GameStatus = 'InProgress' | 'Won' | 'Draw'
export type Players = Record<Player, string> // e.g. { X: 'Amal', O: 'Computer' }

export interface Move {
  number: number
  player: Player
  row: number
  col: number
}

export interface Scoreboard {
  xWins: number
  oWins: number
  draws: number
}

export interface Game {
  id: string
  mode: GameMode
  players: Players
  board: Cell[]
  currentPlayer: Player
  status: GameStatus
  winner: Player | null
  winningCells: number[]
  moves: Move[]
  scoreboard: Scoreboard
}

export interface HistoryEntry {
  id: number
  gameId: string
  mode: GameMode
  players?: Players // missing on games saved before names were added
  status: GameStatus
  winner: Player | null
  moves: Move[]
  finishedAt: string
}
