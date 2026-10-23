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

  if (!game) return <p className="p-8">Loading...</p>

  return (
    <div className="p-8 space-y-4">
      <ModeSelector mode={mode} disabled={isPending} onChange={setMode} />
      <GameStatus game={game} />
      <Board game={game} disabled={isPending} onCellClick={move} />

      <Controls game={game} disabled={isPending} onUndo={undo} onReset={reset} />

      {error && <p className="text-red-600">{error.message}</p>}

      <section className="max-w-sm">
        <h2 className="text-lg font-semibold mb-2">Scoreboard</h2>
        <Scoreboard />
      </section>

      <section className="max-w-sm">
        <h2 className="text-lg font-semibold mb-2">Move History</h2>
        <MoveHistory moves={game.moves} />
      </section>

      <section className="max-w-xl">
        <h2 className="text-lg font-semibold mb-2">Game History</h2>
        <GameHistory />
      </section>
    </div>
  )
}

export default App
