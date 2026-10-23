import { Fragment, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import * as api from '../api'
import type { HistoryEntry } from '../types'
import MoveHistory from './MoveHistory'

function resultText(entry: HistoryEntry) {
    return entry.status === 'Draw' ? 'Draw' : `${entry.winner} won`
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
                className="px-4 py-2 rounded-lg font-medium border bg-white border-gray-300 hover:bg-gray-50"
                onClick={() => setOpen(!open)}>
                {open ? 'Hide game history' : 'Show game history'}
            </button>

            {open && (
                <div className="mt-3">
                    {isLoading && <p className="text-sm text-gray-500">Loading...</p>}

                    {history && history.length === 0 && (
                        <p className="text-sm text-gray-500">No finished games yet.</p>
                    )}

                    {history && history.length > 0 && (
                        <table className="w-full text-sm text-left">
                            <thead className="text-gray-500 border-b border-gray-200">
                                <tr>
                                    <th className="py-1 pr-4 font-medium">#</th>
                                    <th className="py-1 pr-4 font-medium">Finished</th>
                                    <th className="py-1 pr-4 font-medium">Mode</th>
                                    <th className="py-1 pr-4 font-medium">Result</th>
                                    <th className="py-1 font-medium">Moves</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.map(entry => (
                                    <Fragment key={entry.id}>
                                        <tr
                                            className="border-b border-gray-100 cursor-pointer hover:bg-gray-50"
                                            onClick={() => toggleRow(entry.id)}>
                                            <td className="py-1 pr-4">{entry.id}</td>
                                            <td className="py-1 pr-4">{new Date(entry.finishedAt).toLocaleString()}</td>
                                            <td className="py-1 pr-4">{entry.mode === 'Computer' ? 'vs Computer' : 'Two Player'}</td>
                                            <td className="py-1 pr-4 font-semibold">{resultText(entry)}</td>
                                            <td className="py-1">{entry.moves.length}</td>
                                        </tr>
                                        {expandedId === entry.id && (
                                            <tr>
                                                <td colSpan={5} className="py-2 pl-4 bg-gray-50">
                                                    <MoveHistory moves={entry.moves} />
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
