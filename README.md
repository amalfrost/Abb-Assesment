# Tic Tac Toe

A browser-based Tic Tac Toe game with a React + TypeScript frontend and a Node.js REST API. The backend owns all game state: board, turns, move history, undo, game status, scoreboard and the computer opponent. The frontend renders whatever the API returns.

---

## 1. Project overview

- Two players share one screen, or a human (X) plays the computer (O).
- Every move goes to the backend, which validates it, applies it, detects a win or draw, and (in computer mode) replies with the computer's move in the same response.
- A session scoreboard and a history of finished games are kept on the backend and saved to a JSON file, so they survive a restart.

**Stack note:** the brief mentions Angular and .NET in places. As agreed for this submission, the frontend is **React** and the backend is **Node.js (Express)**, so the whole project is in JavaScript/TypeScript.

## 2. Tech stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | React 19 + TypeScript, Vite | Fast dev setup. TypeScript types mirror the API contract (`frontend/src/types.ts`) |
| Styling | Tailwind CSS v4 | Design tokens live in one `@theme` block in `index.css` |
| Server state | TanStack React Query v5 | The backend is the source of truth. Queries and mutations map 1:1 to REST calls and give loading/error state for free |
| Local UI state | `useState` / `useRef` | No Context or Redux needed: one page, shallow tree, server state already shared via React Query |
| Backend | Node.js + Express (plain JavaScript, ES modules) | Minimal REST server |
| Storage | In-memory, with scoreboard + finished-game history saved to `backend/data.json` | Allowed by the brief. No database dependency |
| Tests | `node:test` (built into Node) against the real Express app | No extra test framework needed |

## 3. Features implemented

**Required**
- 3×3 board. Empty cells are clickable, and filled cells are locked.
- Two players (X and O) take alternating turns, and the UI shows whose turn it is. An invalid move doesn't change the turn.
- Win detection on rows, columns and diagonals. The winner is shown, the winning cells are highlighted, and the board is locked.
- Draw detection. A draw message is shown and the board is locked.
- **Reset game** clears the board, move history and result, sets the turn back to X, and keeps the scoreboard.
- **Move history** shows the move number, player and position (`Row 1, Column 1`).
- **Undo last move** removes 1 move in two-player mode and 2 moves (the computer's reply and the human move before it) in computer mode. It's disabled when there's nothing to undo.
- **Scoreboard** counts X wins, O wins and draws, served by the backend. It updates exactly once per finished game and has its own **Reset scoreboard** button.
- **Computer mode**: the human is X and the computer is O. The computer moves automatically using the required priority: win, block X, center, corner, any free cell.
- The backend rejects invalid moves: outside the board, occupied cell, after the game is over, or by the wrong player.

**Extras**
- **Game history**: a list of finished games (players, result, time). Click "N moves" to see that game's moves. It's saved across server restarts.
- **Player names**: edit a name, then confirm it with the green tick or Enter (Escape cancels). In computer mode O is always "Computer". Names appear in the status line, move history and game history.
- A landing page with a mode picker, a hover preview of the next mark, drawn X/O marks and a win animation. All animation is turned off when the OS "reduce motion" setting is on.
- Accessibility basics: cells have labels such as "Row 1, Column 2, empty", the status line is announced to screen readers (`aria-live`), and keyboard focus is visible.

## 4. Run the backend locally

Requires **Node.js 20 or later** (developed on Node 22).

```bash
cd backend
npm install
npm run dev        # http://localhost:4000, restarts on file changes
```

`npm start` runs it without the file watcher. The scoreboard and game history are written to `backend/data.json` (git-ignored). Delete that file to start from zero.

## 5. Run the frontend locally

With the backend running, in a second terminal:

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
```

Vite proxies every `/api/*` request to `http://localhost:4000` (see `vite.config.ts`), so the frontend has no hard-coded API URL and there are no CORS issues in development.

Other scripts: `npm run build` (type-checks with `tsc`, then builds) and `npm run lint`.

Fonts load from Google Fonts. Offline, the app falls back to the system font.

## 6. API endpoint summary

Base URL: `http://localhost:4000/api`. All bodies are JSON.

| Method | Endpoint | Body | Returns |
|---|---|---|---|
| POST | `/games` | `{ "mode": "TwoPlayer" \| "Computer", "players"?: { "X"?: string, "O"?: string } }` | `201` GameState |
| GET | `/games/:id` | – | GameState |
| POST | `/games/:id/moves` | `{ "player": "X" \| "O", "row": 0-2, "col": 0-2 }` | GameState (includes the computer's reply in computer mode) |
| POST | `/games/:id/undo` | – | GameState |
| POST | `/games/:id/reset` | – | GameState |
| PUT | `/games/:id/players` | `{ "X"?: string, "O"?: string }` | GameState |
| GET | `/scoreboard` | – | `{ "xWins", "oWins", "draws" }` |
| POST | `/scoreboard/reset` | – | Scoreboard (all zeros) |
| GET | `/history` | – | Finished games, newest first |

**GameState**
```json
{
  "id": "b54def84-06ab-4162-91da-cb903153b069",
  "mode": "TwoPlayer",
  "players": { "X": "Player X", "O": "Player O" },
  "board": ["X", null, null, null, "O", null, null, null, null],
  "currentPlayer": "X",
  "status": "InProgress",
  "winner": null,
  "winningCells": [],
  "moves": [
    { "number": 1, "player": "X", "row": 0, "col": 0 },
    { "number": 2, "player": "O", "row": 1, "col": 1 }
  ],
  "scoreboard": { "xWins": 0, "oWins": 0, "draws": 0 }
}
```
- `board` has 9 entries, where index = `row * 3 + col`. Rows and columns are 0-based in the API, and the UI shows them 1-based.
- `status` is `InProgress`, `Won` or `Draw`. `winningCells` holds board indexes, for example `[0, 1, 2]`.

**History entry**
```json
{
  "id": 3,
  "gameId": "b54def84-…",
  "mode": "TwoPlayer",
  "players": { "X": "Amal", "O": "Priya" },
  "status": "Won",
  "winner": "X",
  "moves": [ … ],
  "finishedAt": "2026-10-24T02:14:58.000Z"
}
```
`id` is a running number for each finished game. `gameId` can repeat, because Reset keeps the same game id, so one game id can finish several times.

**Errors** use the shape `{ "error": "message" }`:
- `400` for a rule violation: `Cell is already taken`, `It is O's turn`, `Move is outside the board`, `Game is already finished`, `No moves to undo`, `Cannot undo a finished game`, an invalid player name, an unsupported mode, or malformed JSON.
- `404` for an unknown game id.

## 7. How to run tests

```bash
cd backend
npm test
```

There are 33 tests in `backend/tests/api.test.js`. They start the real Express app on a random port and call it over HTTP. They use a temporary data file (set through the `DATA_FILE` environment variable), so `backend/data.json` is never touched. Coverage, mapped to the brief:

| Brief requirement | Covered by |
|---|---|
| Valid move, turn switching | valid move places the mark, records history and switches turn |
| Invalid move | wrong player, occupied cell, outside the board (turn unchanged), malformed JSON |
| Row / column / diagonal win | one test each, including the winning cells |
| Draw | full board with no winner |
| Reset game | clears the board and keeps id, mode, names and scoreboard; playable again after a win |
| Undo in two-player mode | removes only the last move, and the turn goes back |
| Undo in computer mode | removes the computer's move and the human move before it |
| Scoreboard update | counted once per game; reset zeroes it and keeps history |
| Computer move selection | replies immediately, takes the center, blocks X, never moves after X wins, human can't play as O |
| Move after completion | rejected, and the scoreboard is unchanged |

## 8. AI tools and prompt summary

**Tool:** Claude Code (Anthropic) in VS Code.

**How the requirement became a specification**
1. I pasted the full brief and asked for a plan with my chosen stack: *"React + Tailwind + React Query for the frontend, Node.js for the backend (not .NET) … make the project as simple as possible."*
2. I reviewed the plan and changed its scope:
   - Build two-player mode first and add computer mode later.
   - Add a **game history** feature, stored on the backend in a JSON file rather than in localStorage.
3. Before coding, I settled the main decisions: the backend is the source of truth, Undo uses Option A, the computer moves on the server, and one repo has two folders with no monorepo tooling.

**Prompts used (in order, paraphrased)**
- "Give me a clear plan based on the problem statement."
- "Just implement the backend, step by step. After each step, review the code and commit."
- "Test all the endpoints in the backend, review, and make sure I can understand everything."
- "For the frontend I'd like to do it myself, but give me instructions", then "let's move one step at a time."
- "Convert the frontend to TypeScript."
- "Is it possible to add player names?", then "you do it."
- "Once you enter the name, add a small green tick to confirm it."

**What the AI generated**
- The backend: game rules, computer move logic, store, routes and the API test suite. It was built in reviewed, committed steps.
- The TypeScript conversion and the API types.
- Several frontend components (status, controls, move history, scoreboard, game history, mode selector).
- A first design pass, the player-names feature and the name-confirm tick.

**What I wrote or changed myself**
- Scaffolded the Vite app and set up Tailwind and React Query.
- Wrote the `request` helper in `api.ts`, the `Cell` and `Board` components and the first version of the `useGame` hook, following step-by-step guidance.
- Made later visual refactors of the frontend.
- Made the scope decisions listed above.

**What I reviewed carefully**
- **Undo**: board, turn and status are always rebuilt from the move list (`buildState` in `gameLogic.js`), so undo is just removing the last move or the last two.
- **Scoreboard counted once**: games are counted only on the `InProgress` → `Won`/`Draw` change, in `store.updateGame`.
- **Computer priority order**: `computer.js`.
- **Error handling**: rule errors become `400`.

**Bugs found during review and fixed**
- A malformed JSON body returned a `500`. It now returns a `400`.
- Filled cells weren't locked on the board, because only the "request running" flag was checked.
- An early version of the status component checked statuses that don't exist (`XWins`). The API uses `Won` plus a `winner` field.
- Winning-cell tints were see-through, so the dark grid showed through and the cells looked dark.
- Saving a name when its field lost focus raced with a click on a cell. Names are now saved by an explicit tick or Enter, and only while a game is in progress.

## 9. Design decisions

- **The backend is the single source of truth.** The frontend never decides a winner or validates a move. After every action it puts the server's response straight into the React Query cache with `setQueryData`, then marks the scoreboard and history as out of date with `invalidateQueries`.
- **Game rules are pure functions** (`gameLogic.js`, `computer.js`). They know nothing about Express or storage. Routes in `app.js` stay thin: find the game, apply a rule, save, respond.
- **State is derived from the move list.** `buildState` replays the moves onto an empty board and works out the status, winner and turn. Move, undo and reset all go through it, so the board and history can't disagree.
- **The computer moves on the server, in the same request** as the human move. The client makes one call and gets one consistent state back.
- **Counting finished games happens in one place.** `store.updateGame` records a game only when its status moves from `InProgress` to finished. Moving or undoing after a finish is rejected, and reset returns to `InProgress`, so nothing can count a game twice.
- **Persistence:** the scoreboard and history are saved to a JSON file because they are worth keeping. Active games stay in memory only.
- **Frontend structure:**
  - `useGame` wraps the game query and its mutations.
  - The scoreboard and history components fetch their own data. Game history is only fetched once its panel is opened (`enabled: open`).
  - Board cells are disabled while any request is running, which stops double-clicks from sending two moves.
- **One repo, two folders** (`backend/`, `frontend/`), each with its own `package.json`. No workspace tooling, because it isn't needed at this size.

## 10. Clarifications and assumptions

- **Clarification 2: Option A (undo is disabled after completion).** Once a game is won or drawn, Undo is disabled both in the UI and by the API, so the scoreboard is final for that game.
- **Scoreboard scope:** one scoreboard for the whole server session, shared across games and modes. It counts by mark (X wins / O wins), not by player name, because names can change between games.
- **Computer mode:** the human is always X and moves first, and the computer is always O. Any name sent for O is replaced with "Computer".
- **Reset** keeps the same game id, mode and player names. Changing mode starts a new game. X's name is carried over, and O's name is carried over only between two-player games.
- **Player names:** trimmed, at most 20 characters. A blank name falls back to "Player X" / "Player O". Names can be changed while a game is in progress and are locked once it finishes, because history records who played.
- **Positions:** the API uses 0-based `row`/`col`, and the UI shows them 1-based.
- Games saved before player names were added have no `players` field. The UI falls back to showing the mode and the mark.

## 11. Known limitations

- **Single user, no accounts:** everyone using the same backend shares one scoreboard and history.
- **Active games are lost on restart.** Only the scoreboard and history are saved. The JSON file is written synchronously, which is fine for one local server but not for several server processes.
- **The computer is deterministic and beatable**, exactly as the priority rules in the brief define. For example, a corner–opposite-corner fork wins against it.
- **History grows without limit.** There's no paging or way to clear it from the UI. Delete `data.json` to clear it.
- In development, React StrictMode runs effects twice, so starting a game creates one extra unused game in backend memory. This doesn't happen in a production build.

## 12. Future improvements

- SQLite storage for games, history and scoreboards, with a scoreboard per browser session.
- A difficulty setting with an unbeatable minimax computer as "hard".
- History paging and a "clear history" action.
- A production setup: serve the built frontend from Express or Docker Compose, and make the API URL configurable.
- Online two-player games across devices (WebSockets).

---

### Project structure

```
backend/
  src/
    server.js      starts the API on port 4000
    app.js         Express routes + error handling
    gameLogic.js   pure game rules (moves, win/draw, undo, reset, names)
    computer.js    computer move selection
    store.js       in-memory games, scoreboard + history (saved to data.json)
  tests/api.test.js
frontend/
  src/
    api.ts           one typed function per endpoint
    types.ts         TypeScript mirror of the API contract
    hooks/useGame.ts React Query hook: game query + move/undo/reset/rename
    App.tsx          page layout and game creation
    components/      Board, Cell, GameStatus, Controls, PlayerNames, ModeSelector,
                     Scoreboard, MoveHistory, GameHistory, Landing, FloatingShapes
```
