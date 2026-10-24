import { useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import * as api from './api'
import type { GameMode, Players } from './types'
import { useGame } from './hooks/useGame'
import ModeSelector from './components/ModeSelector'
import PlayerNames from './components/PlayerNames'
import Board from './components/Board'
import GameStatus from './components/GameStatus'
import Controls from './components/Controls'
import MoveHistory from './components/MoveHistory'
import Scoreboard from './components/Scoreboard'
import GameHistory from './components/GameHistory'
import Landing from './components/Landing'
import FloatingShapes from './components/FloatingShapes'

const Logo = () => (
    <div className="flex items-center gap-3">
        <div className="flex size-11 -rotate-6 items-center justify-center rounded-xl border-3 border-ink bg-card shadow-[3px_3px_0_var(--color-ink)]" aria-hidden="true">
            <svg viewBox="0 0 32 32" className="size-7">
                <g fill="none" strokeLinecap="round">
                    <path d="M11 3v26M21 3v26M3 11h26M3 21h26" stroke="var(--color-ink)" strokeWidth={2} />
                    <path d="M4 4l4.5 4.5M8.5 4L4 8.5" stroke="var(--color-x-mark)" strokeWidth={2.6} />
                    <circle cx="26" cy="26" r="2.8" stroke="var(--color-o-mark)" strokeWidth={2.6} />
                </g>
            </svg>
        </div>
        <span className="font-display text-2xl font-bold">Tic Tac Toe</span>
    </div>
)

const card = 'rounded-3xl border-3 border-ink bg-card p-5 shadow-pop'

function App() {
  const queryClient = useQueryClient()
  const [mode, setMode] = useState<GameMode>('TwoPlayer')
  // The landing page shows until the player presses Start game
  const [started, setStarted] = useState(false)
  const [gameId, setGameId] = useState<string | null>(null)
  // Names to carry into the next game when the mode changes
  const carriedNames = useRef<Partial<Players> | undefined>(undefined)

  // A new game is created when play starts and whenever the mode changes
  useEffect(() => {
    if (!started) return
    api.createGame(mode, carriedNames.current).then(game => {
      // put the new game straight into the cache so useGame doesn't need to fetch it
      queryClient.setQueryData(['game', game.id], game)
      setGameId(game.id)
    })
  }, [mode, started, queryClient])

  const { game, move, undo, reset, rename, isPending, error } = useGame(gameId)

  function rememberNames() {
    if (game) {
      // Keep X's name. O's name only carries between two-player games,
      // otherwise "Computer" would become a human player's name.
      carriedNames.current = {
        X: game.players.X,
        O: game.mode === 'TwoPlayer' ? game.players.O : undefined,
      }
    }
  }

  function changeMode(newMode: GameMode) {
    rememberNames()
    setMode(newMode)
  }

  function goHome() {
    rememberNames()
    setGameId(null)
    setStarted(false)
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-8 sm:py-8">
      <FloatingShapes />

      <header className="flex flex-wrap items-center justify-between gap-4">
        <Logo />
        {started && (
          <div className="flex flex-wrap items-center gap-3">
            <ModeSelector mode={mode} disabled={isPending} onChange={changeMode} />
            <button
              className="btn-pop inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-2xl border-3 border-ink bg-card px-4 font-extrabold"
              onClick={goHome}>
              <svg viewBox="0 0 16 16" className="size-4" aria-hidden="true">
                <path d="M10 3L5 8l5 5" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Home
            </button>
          </div>
        )}
      </header>

      {!started ? (
        <Landing mode={mode} onModeChange={setMode} onStart={() => setStarted(true)} />
      ) : !game ? (
        <p className="mt-10 font-bold text-muted">Starting a new game...</p>
      ) : (
        <div className="mt-10 grid gap-12 md:grid-cols-[auto_1fr]">
          {/* Left: the game itself */}
          <main className="space-y-6">
            <PlayerNames
              key={`${game.id}-${game.players.X}-${game.players.O}`}
              game={game}
              onRename={rename}
            />
            <GameStatus game={game} />
            <Board game={game} disabled={isPending} onCellClick={move} />
            <div className="pt-2">
              <Controls game={game} disabled={isPending} onUndo={undo} onReset={reset} />
            </div>
            {error && (
              <p role="alert" className="max-w-xs rounded-2xl border-3 border-ink bg-x-tint px-4 py-2 text-sm font-bold">
                {error.message}
              </p>
            )}
          </main>

          {/* Right: results and history */}
          <aside className="space-y-8 min-w-0">
            <section>
              <h2 className="mb-4 font-display text-2xl font-bold">Scoreboard</h2>
              <Scoreboard />
            </section>

            <section className={card}>
              <h2 className="mb-3 font-display text-2xl font-bold">Move history</h2>
              <MoveHistory moves={game.moves} players={game.players} />
            </section>

            <section className={card}>
              <h2 className="mb-3 font-display text-2xl font-bold">Game history</h2>
              <GameHistory />
            </section>
          </aside>
        </div>
      )}
    </div>
  )
}

export default App
