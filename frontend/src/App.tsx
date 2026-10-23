import { useEffect, useState } from 'react'
import * as api from './api'
import { useGame } from './hooks/useGame'
import Board from './components/Board'
import GameStatus from './components/GameStatus'
import Controls from './components/Controls'
import MoveHistory from './components/MoveHistory'

function App() {
  const [gameId, setGameId] = useState<string | null>(null)

  useEffect(() => {
    api.createGame('TwoPlayer').then(game => setGameId(game.id))
  }, [])

  const { game, move, undo, reset, isPending, error } = useGame(gameId)

  if (!game) return <p className="p-8">Loading...</p>

  return (
    <div className="p-8 space-y-4">
      <GameStatus game={game} />
      <Board game={game} disabled={isPending} onCellClick={move} />

      <Controls game={game} disabled={isPending} onUndo={undo} onReset={reset} />

      {error && <p className="text-red-600">{error.message}</p>}

      <section className="max-w-sm">
        <h2 className="text-lg font-semibold mb-2">Move History</h2>
        <MoveHistory moves={game.moves} />
      </section>
    </div>
  )
}

export default App
