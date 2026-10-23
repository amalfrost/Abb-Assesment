import type { Game } from '../types'

interface GameStatusProps {
    game: Game
}

const GameStatus = ({ game }: GameStatusProps) => {
    let message = `Player ${game.currentPlayer}'s turn`
    let color = 'text-gray-800'

    if (game.status === 'Won') {
        message = `Player ${game.winner} wins!`
        color = game.winner === 'X' ? 'text-blue-600' : 'text-red-600'
    } else if (game.status === 'Draw') {
        message = "It's a draw!"
        color = 'text-amber-600'
    }

    return (
        <div>
            <p className="text-sm uppercase tracking-wide text-gray-500">
                {game.mode === 'Computer' ? 'vs Computer' : 'Two Player'}
            </p>
            <p className={`text-2xl font-semibold ${color}`}>{message}</p>
        </div>
    )
}

export default GameStatus
