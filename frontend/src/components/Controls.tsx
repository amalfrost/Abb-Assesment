import type { Game } from '../types'

interface ControlsProps {
    game: Game
    disabled: boolean // true while a request is in flight
    onUndo: () => void
    onReset: () => void
}

const buttonStyle = `btn-pop min-h-12 px-5 rounded-2xl border-3 border-ink font-display text-lg font-semibold text-ink
    enabled:cursor-pointer disabled:opacity-40 disabled:shadow-none disabled:cursor-not-allowed`

const Controls = ({ game, disabled, onUndo, onReset }: ControlsProps) => {
    // Undo is off once the game is finished (Option A), so the scoreboard stays final
    const canUndo = game.moves.length > 0 && game.status === 'InProgress' && !disabled

    return (
        <div className="flex flex-wrap gap-4">
            <button
                className={`${buttonStyle} bg-card`}
                disabled={!canUndo}
                onClick={onUndo}>
                Undo last move
            </button>
            <button
                className={`${buttonStyle} bg-mint`}
                disabled={disabled}
                onClick={onReset}>
                Reset game
            </button>
        </div>
    )
}

export default Controls
