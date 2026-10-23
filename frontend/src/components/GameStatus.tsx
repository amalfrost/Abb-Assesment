import type { Game } from '../types'

interface GameStatusProps {
    game: Game
}

const GameStatus = ({ game }: GameStatusProps) => {
    const vsComputer = game.mode === 'Computer'
    let message = `Player ${game.currentPlayer}'s turn`
    let color = game.currentPlayer === 'X' ? 'text-x' : 'text-o'

    if (game.status === 'Won') {
        if (vsComputer) message = game.winner === 'X' ? 'You win' : 'The computer wins'
        else message = `Player ${game.winner} wins`
        color = game.winner === 'X' ? 'text-x' : 'text-o'
    } else if (game.status === 'Draw') {
        message = "It's a draw"
        color = 'text-ink'
    } else if (vsComputer) {
        message = 'Your turn (X)'
    }

    // aria-live so screen readers announce turn changes and results
    return (
        <p aria-live="polite" className={`text-2xl font-semibold ${color}`}>
            {message}
        </p>
    )
}

export default GameStatus
