// End-to-end tests for every REST endpoint.
// Starts the real Express app on a random port and calls it with fetch.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

// Point the store at a temp file before it is loaded, so real data is untouched
const dataFile = path.join(os.tmpdir(), `ttt-test-${Date.now()}.json`);
process.env.DATA_FILE = dataFile;
const { default: app } = await import('../src/app.js');

let server;
let baseUrl;

before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://localhost:${server.address().port}/api`;
  await post('/scoreboard/reset');
});

after(() => {
  server.close();
  fs.rmSync(dataFile, { force: true });
});

async function request(method, url, body) {
  const res = await fetch(baseUrl + url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return { status: res.status, body: await res.json() };
}

const get = (url) => request('GET', url);
const post = (url, body) => request('POST', url, body);

async function newGame(mode) {
  const res = await post('/games', mode ? { mode } : {});
  return res.body.id;
}

// Plays a list of [player, row, col] moves and returns the last response
async function play(id, moves) {
  let res;
  for (const [player, row, col] of moves) {
    res = await post(`/games/${id}/moves`, { player, row, col });
  }
  return res;
}

// ---------- POST /api/games ----------

test('creates a two-player game by default', async () => {
  const res = await post('/games', {});
  assert.equal(res.status, 201);
  assert.equal(res.body.mode, 'TwoPlayer');
  assert.deepEqual(res.body.board, Array(9).fill(null));
  assert.equal(res.body.currentPlayer, 'X');
  assert.equal(res.body.status, 'InProgress');
  assert.deepEqual(res.body.moves, []);
  assert.ok(res.body.scoreboard);
});

test('creates a computer game', async () => {
  const res = await post('/games', { mode: 'Computer' });
  assert.equal(res.status, 201);
  assert.equal(res.body.mode, 'Computer');
});

test('rejects an unknown mode', async () => {
  const res = await post('/games', { mode: 'Online' });
  assert.equal(res.status, 400);
});

// ---------- GET /api/games/:id ----------

test('returns the current game state', async () => {
  const id = await newGame();
  await play(id, [['X', 1, 1]]);
  const res = await get(`/games/${id}`);
  assert.equal(res.status, 200);
  assert.equal(res.body.board[4], 'X');
  assert.equal(res.body.currentPlayer, 'O');
});

test('returns 404 for an unknown game', async () => {
  const res = await get('/games/does-not-exist');
  assert.equal(res.status, 404);
});

// ---------- POST /api/games/:id/moves ----------

test('valid move places the mark, records history and switches turn', async () => {
  const id = await newGame();
  const res = await play(id, [['X', 0, 2]]);
  assert.equal(res.status, 200);
  assert.equal(res.body.board[2], 'X');
  assert.equal(res.body.currentPlayer, 'O');
  assert.deepEqual(res.body.moves, [{ number: 1, player: 'X', row: 0, col: 2 }]);
});

test('invalid moves are rejected and do not change the turn', async () => {
  const id = await newGame();
  await play(id, [['X', 0, 0]]);

  const wrongPlayer = await post(`/games/${id}/moves`, { player: 'X', row: 1, col: 1 });
  assert.equal(wrongPlayer.status, 400);

  const occupied = await post(`/games/${id}/moves`, { player: 'O', row: 0, col: 0 });
  assert.equal(occupied.status, 400);

  const outside = await post(`/games/${id}/moves`, { player: 'O', row: 3, col: 0 });
  assert.equal(outside.status, 400);

  const state = await get(`/games/${id}`);
  assert.equal(state.body.currentPlayer, 'O');
  assert.equal(state.body.moves.length, 1);
});

test('malformed JSON body returns 400', async () => {
  const id = await newGame();
  const res = await fetch(`${baseUrl}/games/${id}/moves`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{bad json',
  });
  assert.equal(res.status, 400);
});

test('row win: winner, winning cells and scoreboard', async () => {
  const before = (await get('/scoreboard')).body;
  const id = await newGame();
  const res = await play(id, [['X', 0, 0], ['O', 1, 0], ['X', 0, 1], ['O', 1, 1], ['X', 0, 2]]);
  assert.equal(res.body.status, 'Won');
  assert.equal(res.body.winner, 'X');
  assert.deepEqual(res.body.winningCells, [0, 1, 2]);
  assert.equal(res.body.scoreboard.xWins, before.xWins + 1);
});

test('column win', async () => {
  const id = await newGame();
  const res = await play(id, [['X', 0, 1], ['O', 0, 0], ['X', 2, 2], ['O', 1, 0], ['X', 1, 2], ['O', 2, 0]]);
  assert.equal(res.body.winner, 'O');
  assert.deepEqual(res.body.winningCells, [0, 3, 6]);
});

test('diagonal win', async () => {
  const id = await newGame();
  const res = await play(id, [['X', 0, 0], ['O', 0, 1], ['X', 1, 1], ['O', 0, 2], ['X', 2, 2]]);
  assert.equal(res.body.winner, 'X');
  assert.deepEqual(res.body.winningCells, [0, 4, 8]);
});

test('draw when the board fills with no winner', async () => {
  const before = (await get('/scoreboard')).body;
  const id = await newGame();
  const res = await play(id, [
    ['X', 0, 0], ['O', 0, 1], ['X', 0, 2],
    ['O', 1, 1], ['X', 1, 0], ['O', 1, 2],
    ['X', 2, 1], ['O', 2, 0], ['X', 2, 2],
  ]);
  assert.equal(res.body.status, 'Draw');
  assert.equal(res.body.winner, null);
  assert.equal(res.body.scoreboard.draws, before.draws + 1);
});

test('move after the game is finished is rejected and scoreboard counts once', async () => {
  const id = await newGame();
  const won = await play(id, [['X', 0, 0], ['O', 1, 0], ['X', 0, 1], ['O', 1, 1], ['X', 0, 2]]);
  const res = await post(`/games/${id}/moves`, { player: 'O', row: 2, col: 2 });
  assert.equal(res.status, 400);

  const score = (await get('/scoreboard')).body;
  assert.equal(score.xWins, won.body.scoreboard.xWins);
});

// ---------- Computer mode ----------

test('computer replies as O straight after the human move', async () => {
  const id = await newGame('Computer');
  const res = await play(id, [['X', 0, 0]]);
  assert.equal(res.body.moves.length, 2);
  assert.equal(res.body.board[4], 'O'); // takes the center
  assert.equal(res.body.currentPlayer, 'X');
});

test('computer blocks X', async () => {
  const id = await newGame('Computer');
  await play(id, [['X', 0, 0]]); // O takes center
  const res = await play(id, [['X', 0, 1]]); // X threatens the top row
  assert.equal(res.body.board[2], 'O');
});

test('computer does not move after X wins', async () => {
  const id = await newGame('Computer');
  // X sets up a fork the computer can only block one side of
  const res = await play(id, [['X', 0, 0], ['X', 2, 2], ['X', 2, 0], ['X', 1, 0]]);
  assert.equal(res.body.status, 'Won');
  assert.equal(res.body.winner, 'X');
  assert.equal(res.body.moves.at(-1).player, 'X');
});

test('human cannot play as O in computer mode', async () => {
  const id = await newGame('Computer');
  const res = await post(`/games/${id}/moves`, { player: 'O', row: 0, col: 0 });
  assert.equal(res.status, 400);
});

// ---------- POST /api/games/:id/undo ----------

test('two-player undo removes only the last move', async () => {
  const id = await newGame();
  await play(id, [['X', 0, 0], ['O', 1, 1]]);
  const res = await post(`/games/${id}/undo`);
  assert.equal(res.status, 200);
  assert.equal(res.body.moves.length, 1);
  assert.equal(res.body.board[4], null);
  assert.equal(res.body.currentPlayer, 'O');
});

test('computer undo removes the computer move and the human move before it', async () => {
  const id = await newGame('Computer');
  await play(id, [['X', 0, 0]]);
  const res = await post(`/games/${id}/undo`);
  assert.equal(res.body.moves.length, 0);
  assert.deepEqual(res.body.board, Array(9).fill(null));
  assert.equal(res.body.currentPlayer, 'X');
});

test('undo with no moves is rejected', async () => {
  const id = await newGame();
  const res = await post(`/games/${id}/undo`);
  assert.equal(res.status, 400);
});

test('undo after the game is finished is rejected', async () => {
  const id = await newGame();
  await play(id, [['X', 0, 0], ['O', 1, 0], ['X', 0, 1], ['O', 1, 1], ['X', 0, 2]]);
  const res = await post(`/games/${id}/undo`);
  assert.equal(res.status, 400);
});

// ---------- POST /api/games/:id/reset ----------

test('reset clears the game but keeps id, mode and scoreboard', async () => {
  const id = await newGame('Computer');
  await play(id, [['X', 0, 0]]);
  const before = (await get('/scoreboard')).body;

  const res = await post(`/games/${id}/reset`);
  assert.equal(res.body.id, id);
  assert.equal(res.body.mode, 'Computer');
  assert.deepEqual(res.body.board, Array(9).fill(null));
  assert.deepEqual(res.body.moves, []);
  assert.equal(res.body.currentPlayer, 'X');
  assert.equal(res.body.status, 'InProgress');
  assert.deepEqual(res.body.scoreboard, before);
});

test('reset after a win lets the same game be played again', async () => {
  const id = await newGame();
  await play(id, [['X', 0, 0], ['O', 1, 0], ['X', 0, 1], ['O', 1, 1], ['X', 0, 2]]);
  await post(`/games/${id}/reset`);
  const res = await play(id, [['X', 2, 2]]);
  assert.equal(res.status, 200);
});

// ---------- Scoreboard & history ----------

test('scoreboard reset zeroes counts but keeps history', async () => {
  const historyBefore = (await get('/history')).body.length;
  assert.ok(historyBefore > 0);

  const res = await post('/scoreboard/reset');
  assert.deepEqual(res.body, { xWins: 0, oWins: 0, draws: 0 });
  assert.deepEqual((await get('/scoreboard')).body, { xWins: 0, oWins: 0, draws: 0 });
  assert.equal((await get('/history')).body.length, historyBefore);
});

test('history lists finished games newest first', async () => {
  const id = await newGame();
  await play(id, [['X', 0, 0], ['O', 0, 1], ['X', 1, 1], ['O', 0, 2], ['X', 2, 2]]);

  const res = await get('/history');
  const latest = res.body[0];
  assert.equal(latest.gameId, id);
  assert.equal(latest.status, 'Won');
  assert.equal(latest.winner, 'X');
  assert.equal(latest.moves.length, 5);
  assert.ok(latest.finishedAt);
  assert.ok(res.body[0].id > res.body[1].id);
});

test('scoreboard and history are saved to the data file', () => {
  const saved = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
  assert.ok(saved.scoreboard);
  assert.ok(saved.history.length > 0);
});
