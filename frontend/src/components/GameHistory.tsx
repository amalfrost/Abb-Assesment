import { Fragment, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import * as api from '../api'
import type { HistoryEntry } from '../types'
import MoveHistory from './MoveHistory'

function resultText(entry: HistoryEntry) {
    if (entry.status === 'Draw' || !entry.winner) return 'Draw'
    return `${entry.players?.[entry.winner] ?? entry.winner} won`
}

// Older entries have no names, so fall back to the mode
function playersText(entry: HistoryEntry) {
    if (entry.players) return `${entry.players.X} vs ${entry.players.O}`
    return entry.mode === 'Computer' ? 'vs Computer' : 'Two player'
}

const GameHistory = () => {
    const [open, setOpen] = useState(false)
    const [expandedId, setExpandedId] = useState<number | null>(null)

    // Only fetched once the panel is opened; useGame invalidates ['history']
    // after every move, so it refreshes when a game finishes while open.
    const { data: history, isLoading } = useQuery({
        queryKey: ['history'],
        queryFn: api.getHistory,
        enabled: open,
    })

    function toggleRow(id: number) {
        setExpandedId(expandedId === id ? null : id)
    }

    return (
        <div>
            <button
                className="text-sm font-medium text-ink underline underline-offset-2 hover:text-x"
                aria-expanded={open}
                onClick={() => setOpen(!open)}>
                {open ? 'Hide game history' : 'Show game history'}
            </button>

            {open && (
                <div className="mt-3 overflow-x-auto">
                    {isLoading && <p className="text-sm text-muted">Loading...</p>}

                    {history && history.length === 0 && (
                        <p className="text-sm text-muted">Finished games are listed here.</p>
                    )}

                    {history && history.length > 0 && (
                        <table className="w-full text-sm text-left">
                            <thead className="text-muted border-b border-line">
                                <tr>
                                    <th className="py-1.5 pr-4 font-medium">Game</th>
                                    <th className="py-1.5 pr-4 font-medium">Finished</th>
                                    <th className="py-1.5 pr-4 font-medium">Players</th>
                                    <th className="py-1.5 pr-4 font-medium">Result</th>
                                    <th className="py-1.5 font-medium">Moves</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.map(entry => (
                                    <Fragment key={entry.id}>
                                        <tr className="border-b border-line">
                                            <td className="py-1.5 pr-4 tabular-nums">{entry.id}</td>
                                            <td className="py-1.5 pr-4">{new Date(entry.finishedAt).toLocaleString()}</td>
                                            <td className="py-1.5 pr-4">{playersText(entry)}</td>
                                            <td className={`py-1.5 pr-4 font-semibold ${entry.winner === 'X' ? 'text-x' : entry.winner === 'O' ? 'text-o' : ''}`}>
                                                {resultText(entry)}
                                            </td>
                                            <td className="py-1.5">
                                                <button
                                                    className="underline underline-offset-2 hover:text-x tabular-nums"
                                                    aria-expanded={expandedId === entry.id}
                                                    onClick={() => toggleRow(entry.id)}>
                                                    {expandedId === entry.id ? 'Hide' : `${entry.moves.length} moves`}
                                                </button>
                                            </td>
                                        </tr>
                                        {expandedId === entry.id && (
                                            <tr>
                                                <td colSpan={5} className="py-2 pl-4 bg-hover">
                                                    <MoveHistory moves={entry.moves} players={entry.players} />
                                                </td>
                                            </tr>
                                        )}
                                    </Fragment>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    )
}

export default GameHistory
