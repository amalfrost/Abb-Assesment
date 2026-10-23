import { useEffect, useState } from 'react'
import * as api from './api'
import { useGame } from './hooks/useGame'
import Board from './components/Board'
import GameStatus from './components/GameStatus'

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

      {/* Replaced by the Controls component in the next step */}
      <div className="space-x-2">
        <button className="border px-3 py-1" disabled={isPending} onClick={undo}>Undo</button>
        <button className="border px-3 py-1" disabled={isPending} onClick={reset}>Reset</button>
      </div>

      {error && <p className="text-red-600">{error.message}</p>}
    </div>
  )
}

export default App
