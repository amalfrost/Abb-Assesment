import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import * as api from './api'
import type { GameMode } from './types'
import { useGame } from './hooks/useGame'
import ModeSelector from './components/ModeSelector'
import Board from './components/Board'
import GameStatus from './components/GameStatus'
import Controls from './components/Controls'
import MoveHistory from './components/MoveHistory'
import Scoreboard from './components/Scoreboard'
import GameHistory from './components/GameHistory'

function App() {
  const queryClient = useQueryClient()
  const [mode, setMode] = useState<GameMode>('TwoPlayer')
  const [gameId, setGameId] = useState<string | null>(null)

  // A new game is created on first load and whenever the mode changes
  useEffect(() => {
    api.createGame(mode).then(game => {
      // put the new game straight into the cache so useGame doesn't need to fetch it
      queryClient.setQueryData(['game', game.id], game)
      setGameId(game.id)
    })
  }, [mode, queryClient])

  const { game, move, undo, reset, isPending, error } = useGame(gameId)

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-8 sm:py-12">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-ink pb-6">
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight [font-stretch:125%]">Tic Tac Toe</h1>
        <ModeSelector mode={mode} disabled={isPending} onChange={setMode} />
      </header>

      {!game ? (
        <p className="mt-10 text-muted">Starting a new game...</p>
      ) : (
        <div className="mt-10 grid gap-12 md:grid-cols-[auto_1fr]">
          {/* Left: the game itself */}
          <main className="space-y-6">
            <GameStatus game={game} />
            <Board game={game} disabled={isPending} onCellClick={move} />
            <Controls game={game} disabled={isPending} onUndo={undo} onReset={reset} />
            {error && (
              <p role="alert" className="max-w-xs border-l-4 border-ink pl-3 text-sm">
                {error.message}
              </p>
            )}
          </main>

          {/* Right: results and history */}
          <aside className="space-y-10 min-w-0">
            <section>
              <h2 className="mb-3 text-lg font-bold">Scoreboard</h2>
              <Scoreboard />
            </section>

            <section>
              <h2 className="mb-3 text-lg font-bold">Move history</h2>
              <MoveHistory moves={game.moves} />
            </section>

            <section>
              <h2 className="mb-3 text-lg font-bold">Game history</h2>
              <GameHistory />
            </section>
          </aside>
        </div>
      )}
    </div>
  )
}

export default App
