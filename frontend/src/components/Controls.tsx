import type { Game } from '../types'

interface ControlsProps {
    game: Game
    disabled: boolean // true while a request is in flight
    onUndo: () => void
    onReset: () => void
}

const buttonStyle = 'px-4 py-2 rounded-md font-medium border-2 border-ink disabled:opacity-35 disabled:cursor-not-allowed'

const Controls = ({ game, disabled, onUndo, onReset }: ControlsProps) => {
    // Undo is off once the game is finished (Option A), so the scoreboard stays final
    const canUndo = game.moves.length > 0 && game.status === 'InProgress' && !disabled

    return (
        <div className="flex gap-3">
            <button
                className={`${buttonStyle} bg-paper text-ink enabled:hover:bg-hover`}
                disabled={!canUndo}
                onClick={onUndo}>
                Undo last move
            </button>
            <button
                className={`${buttonStyle} bg-ink text-paper enabled:hover:bg-ink/85`}
                disabled={disabled}
                onClick={onReset}>
                Reset game
            </button>
        </div>
    )
}

export default Controls
