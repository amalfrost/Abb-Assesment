import type { Game } from '../types'

interface GameStatusProps {
    game: Game
}

const GameStatus = ({ game }: GameStatusProps) => {
    let message = `${game.players[game.currentPlayer]}'s turn`
    let color = game.currentPlayer === 'X' ? 'text-x' : 'text-o'

    if (game.status === 'Won' && game.winner) {
        message = `${game.players[game.winner]} wins!`
        color = game.winner === 'X' ? 'text-x' : 'text-o'
    } else if (game.status === 'Draw') {
        message = "It's a draw!"
        color = 'text-ink'
    }

    const finished = game.status !== 'InProgress'

    // aria-live so screen readers announce turn changes and results
    return (
        <p aria-live="polite" className="flex min-h-14 items-center">
            {finished ? (
                // keyed so the banner bounces in again for every result
                <span
                    key={`${game.id}-${game.moves.length}`}
                    className={`bounce-in inline-block rounded-2xl border-3 border-ink bg-sun px-5 py-1.5 font-display text-3xl font-bold shadow-pop ${color}`}>
                    {message}
                </span>
            ) : (
                <span className={`font-display text-3xl font-semibold ${color}`}>{message}</span>
            )}
        </p>
    )
}

export default GameStatus
