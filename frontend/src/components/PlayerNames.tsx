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
// Focusing a field clears it (the saved name stays as the placeholder) so
// typing starts fresh; leaving it empty restores the saved name.
// App gives this component a key built from the saved names, so it starts
// fresh whenever the server's names change.
const PlayerNames = ({ game, onRename }: PlayerNamesProps) => {
    const [names, setNames] = useState<Players>(game.players)
    const locked = game.status !== 'InProgress'

    // An empty field is not an edit - it falls back to the saved name
    function isEdited(player: Player) {
        const typed = names[player].trim()
        return typed !== '' && typed !== game.players[player]
    }

    function clearIfUnchanged(player: Player) {
        if (names[player] === game.players[player]) setNames({ ...names, [player]: '' })
    }

    function restoreIfEmpty(player: Player) {
        if (names[player].trim() === '') cancel(player)
    }

    function save(player: Player) {
        if (isEdited(player)) onRename({ [player]: names[player] })
    }

    function cancel(player: Player) {
        setNames({ ...names, [player]: game.players[player] })
    }

    function renderField(player: Player) {
        const color = player === 'X' ? 'text-x' : 'text-o'
        // The player whose turn it is gets a highlighted chip
        const chip = `flex min-h-12 items-center gap-2 rounded-2xl border-3 border-ink px-3 shadow-pop-sm transition-colors
            ${!locked && game.currentPlayer === player ? 'bg-sun' : 'bg-card'}`

        // The computer's name is fixed
        if (player === 'O' && game.mode === 'Computer') {
            return (
                <div className={chip}>
                    <span className={`font-display text-xl font-bold ${color}`}>O</span>
                    <span className="py-1 pr-2 font-bold">Computer</span>
                </div>
            )
        }

        // Once the game is over, show the saved name and drop any unsaved edit
        const showTick = !locked && isEdited(player)

        return (
            <div className={chip}>
                <span className={`font-display text-xl font-bold ${color}`} aria-hidden="true">{player}</span>
                <input
                    className={`w-32 border-b-2 bg-transparent py-1 font-bold outline-none placeholder:text-muted/60 focus:border-ink disabled:text-muted
                        ${showTick ? 'border-ink' : 'border-ink/20'}`}
                    value={locked ? game.players[player] : names[player]}
                    placeholder={game.players[player]}
                    maxLength={MAX_NAME_LENGTH}
                    disabled={locked}
                    aria-label={`Name for player ${player}`}
                    onFocus={() => clearIfUnchanged(player)}
                    onBlur={() => restoreIfEmpty(player)}
                    onChange={e => setNames({ ...names, [player]: e.target.value })}
                    onKeyDown={e => {
                        if (e.key === 'Enter') save(player)
                        if (e.key === 'Escape') cancel(player)
                    }}
                />
                {/* Keeps its space when hidden so the layout doesn't jump */}
                <button
                    className={`flex size-7 cursor-pointer items-center justify-center rounded-full border-2 border-ink bg-mint text-ink hover:brightness-110
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
        <div className="flex flex-wrap gap-3">
            {renderField('X')}
            {renderField('O')}
        </div>
    )
}

export default PlayerNames
