import express from 'express';
import cors from 'cors';
import { randomUUID } from 'node:crypto';
import { createGame, makeMove, undoMove, resetGame, renamePlayers, GameError } from './gameLogic.js';
import { pickComputerMove } from './computer.js';
import * as store from './store.js';

const MODES = ['TwoPlayer', 'Computer'];

const app = express();
app.use(cors());
app.use(express.json());

function toResponse(game) {
  return { ...game, scoreboard: store.getScoreboard() };
}

function findGame(req, res, next) {
  const game = store.getGame(req.params.id);
  if (!game) {
    return res.status(404).json({ error: 'Game not found' });
  }
  req.game = game;
  next();
}

app.post('/api/games', (req, res) => {
  const mode = req.body?.mode ?? 'TwoPlayer';
  if (!MODES.includes(mode)) {
    return res.status(400).json({ error: `Unsupported mode: ${mode}` });
  }

  const game = createGame(randomUUID(), mode, req.body?.players);
  store.addGame(game);
  res.status(201).json(toResponse(game));
});

app.put('/api/games/:id/players', findGame, (req, res) => {
  const game = renamePlayers(req.game, req.body ?? {});
  store.updateGame(game);
  res.json(toResponse(game));
});

app.get('/api/games/:id', findGame, (req, res) => {
  res.json(toResponse(req.game));
});

app.post('/api/games/:id/moves', findGame, (req, res) => {
  const { player, row, col } = req.body ?? {};
  let game = makeMove(req.game, player, row, col);

  // The computer (always O) replies in the same request, unless X just ended the game
  if (game.mode === 'Computer' && game.status === 'InProgress') {
    const cell = pickComputerMove(game.board);
    game = makeMove(game, 'O', Math.floor(cell / 3), cell % 3);
  }

  store.updateGame(game);
  res.json(toResponse(game));
});

app.post('/api/games/:id/undo', findGame, (req, res) => {
  const game = undoMove(req.game);
  store.updateGame(game);
  res.json(toResponse(game));
});

app.post('/api/games/:id/reset', findGame, (req, res) => {
  const game = resetGame(req.game);
  store.updateGame(game);
  res.json(toResponse(game));
});

app.get('/api/scoreboard', (req, res) => {
  res.json(store.getScoreboard());
});

app.post('/api/scoreboard/reset', (req, res) => {
  res.json(store.resetScoreboard());
});

app.get('/api/history', (req, res) => {
  res.json(store.getHistory());
});

// Rule violations from gameLogic become 400s; anything else is a real bug.
app.use((err, req, res, next) => {
  if (err instanceof GameError) {
    return res.status(400).json({ error: err.message });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Request body is not valid JSON' });
  }
  console.error(err);
  res.status(500).json({ error: 'Something went wrong' });
});

export default app;
