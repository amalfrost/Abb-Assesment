import type { Game } from '../types'

interface GameStatusProps {
    game: Game
}

const GameStatus = ({ game }: GameStatusProps) => {
    let message = `${game.players[game.currentPlayer]}'s turn`
    let color = game.currentPlayer === 'X' ? 'text-x' : 'text-o'

    if (game.status === 'Won' && game.winner) {
        message = `${game.players[game.winner]} wins`
        color = game.winner === 'X' ? 'text-x' : 'text-o'
    } else if (game.status === 'Draw') {
        message = "It's a draw"
        color = 'text-ink'
    }

    // aria-live so screen readers announce turn changes and results
    return (
        <p aria-live="polite" className={`text-2xl font-semibold ${color}`}>
            {message}
        </p>
    )
}

export default GameStatus
