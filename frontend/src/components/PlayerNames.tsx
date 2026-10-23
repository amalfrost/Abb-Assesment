import { useState } from 'react'
import type { Game, Player, Players } from '../types'

interface PlayerNamesProps {
    game: Game
    onRename: (players: Partial<Players>) => void
}

const MAX_NAME_LENGTH = 20 // same limit as the backend

const TickIcon = () => (
    <svg viewBox="0 0 20 20" className="size-4" aria-hidden="true">
        <path d="M4 10.5 L8 14.5 L16 6" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
)

// Local state holds what's being typed. A name is only saved when the player
// confirms it with the tick (or Enter); Escape puts the saved name back.
// App gives this component a key built from the saved names, so it starts
// fresh whenever the server's names change.
const PlayerNames = ({ game, onRename }: PlayerNamesProps) => {
    const [names, setNames] = useState<Players>(game.players)
    const locked = game.status !== 'InProgress'

    function isEdited(player: Player) {
        return names[player].trim() !== game.players[player]
    }

    function save(player: Player) {
        if (isEdited(player)) onRename({ [player]: names[player] })
    }

    function cancel(player: Player) {
        setNames({ ...names, [player]: game.players[player] })
    }

    function renderField(player: Player) {
        const color = player === 'X' ? 'text-x' : 'text-o'

        // The computer's name is fixed
        if (player === 'O' && game.mode === 'Computer') {
            return (
                <div className="flex items-baseline gap-2">
                    <span className={`font-bold ${color}`}>O</span>
                    <span className="py-1 font-medium">Computer</span>
                </div>
            )
        }

        // Once the game is over, show the saved name and drop any unsaved edit
        const showTick = !locked && isEdited(player)

        return (
            <div className="flex items-center gap-2">
                <span className={`font-bold ${color}`} aria-hidden="true">{player}</span>
                <input
                    className={`w-32 border-b-2 bg-transparent py-1 font-medium outline-none focus:border-ink disabled:text-muted
                        ${showTick ? 'border-ink' : 'border-line'}`}
                    value={locked ? game.players[player] : names[player]}
                    maxLength={MAX_NAME_LENGTH}
                    disabled={locked}
                    aria-label={`Name for player ${player}`}
                    onChange={e => setNames({ ...names, [player]: e.target.value })}
                    onKeyDown={e => {
                        if (e.key === 'Enter') save(player)
                        if (e.key === 'Escape') cancel(player)
                    }}
                />
                {/* Keeps its space when hidden so the layout doesn't jump */}
                <button
                    className={`flex size-6 items-center justify-center rounded-full bg-ok text-paper hover:bg-ok/85
                        ${showTick ? '' : 'invisible'}`}
                    aria-label={`Save name for player ${player}`}
                    title="Save name"
                    onClick={() => save(player)}>
                    <TickIcon />
                </button>
            </div>
        )
    }

    return (
        <div className="flex flex-wrap gap-x-6 gap-y-2">
            {renderField('X')}
            {renderField('O')}
        </div>
    )
}

export default PlayerNames
