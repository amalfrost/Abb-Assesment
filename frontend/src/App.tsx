import { useEffect, useState } from 'react'
import * as api from './api'
import { useGame } from './hooks/useGame'

function App() {
  const [gameId, setGameId] = useState<string | null>(null)

  useEffect(() => {
    api.createGame('TwoPlayer').then(game => setGameId(game.id))
  }, [])

  const { game, move, undo, reset, isPending, error } = useGame(gameId)

  if (!game) return <p className="p-8">Loading...</p>

  // Temporary debug view - replaced by Board/Controls in the next steps
  return (
    <div className="p-8 space-y-4">
      <pre>{game.board.map(c => c ?? '.').join('')} | turn: {game.currentPlayer} | {game.status}</pre>
      <div className="space-x-2">
        <button className="border px-3 py-1" disabled={isPending} onClick={() => move(1, 1)}>Play center</button>
        <button className="border px-3 py-1" disabled={isPending} onClick={() => move(0, 0)}>Play top-left</button>
        <button className="border px-3 py-1" disabled={isPending} onClick={undo}>Undo</button>
        <button className="border px-3 py-1" disabled={isPending} onClick={reset}>Reset</button>
      </div>
      {error && <p className="text-red-600">{error.message}</p>}
    </div>
  )
}

export default App
