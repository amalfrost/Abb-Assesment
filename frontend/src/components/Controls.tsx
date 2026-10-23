import type { Game } from '../types'

interface ControlsProps {
    game: Game
    disabled: boolean // true while a request is in flight
    onUndo: () => void
    onReset: () => void
}

const buttonStyle = 'px-4 py-2 rounded-lg font-medium border disabled:opacity-40 disabled:cursor-not-allowed'

const Controls = ({ game, disabled, onUndo, onReset }: ControlsProps) => {
    // Undo is off once the game is finished (Option A), so the scoreboard stays final
    const canUndo = game.moves.length > 0 && game.status === 'InProgress' && !disabled

    return (
        <div className="flex gap-3">
            <button
                className={`${buttonStyle} bg-white border-gray-300 hover:bg-gray-50`}
                disabled={!canUndo}
                onClick={onUndo}>
                Undo Last Move
            </button>
            <button
                className={`${buttonStyle} bg-gray-800 border-gray-800 text-white hover:bg-gray-700`}
                disabled={disabled}
                onClick={onReset}>
                Reset Game
            </button>
        </div>
    )
}

export default Controls
