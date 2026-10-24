// In-memory storage. Active games live only in memory; the scoreboard and
// finished-game history are also written to data.json so they survive a restart.
import fs from 'node:fs';

// DATA_FILE can be overridden so tests don't touch the real data
const DATA_FILE = process.env.DATA_FILE || new URL('../data.json', import.meta.url);

const games = new Map();
let { scoreboard, history } = loadData();

function emptyScoreboard() {
  return { xWins: 0, oWins: 0, draws: 0 };
}

function loadData() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch {
    return { scoreboard: emptyScoreboard(), history: [] };
  }
}

function saveData() {
  fs.writeFileSync(DATA_FILE, JSON.stringify({ scoreboard, history }, null, 2));
}

export function getGame(id) {
  return games.get(id);
}

export function addGame(game) {
  games.set(game.id, game);
}

// Every change to a game goes through here. A game is recorded only when it
// moves from InProgress to Won/Draw, so the scoreboard can't be counted twice.
export function updateGame(game) {
  const previous = games.get(game.id);
  games.set(game.id, game);

  if (previous.status === 'InProgress' && game.status !== 'InProgress') {
    recordFinishedGame(game);
  }
}

function recordFinishedGame(game) {
  if (game.status === 'Draw') scoreboard.draws++;
  else if (game.winner === 'X') scoreboard.xWins++;
  else scoreboard.oWins++;

  history.push({
    id: history.length + 1,
    gameId: game.id,
    mode: game.mode,
    players: game.players,
    status: game.status,
    winner: game.winner,
    moves: game.moves,
    finishedAt: new Date().toISOString(),
  });
  saveData();
}

export function getScoreboard() {
  return scoreboard;
}

export function resetScoreboard() {
  scoreboard = emptyScoreboard();
  saveData();
  return scoreboard;
}

export function getHistory() {
  return [...history].reverse();
}
