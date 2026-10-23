import type { Move } from '../types'

interface MoveHistoryProps {
    moves: Move[]
}

// Takes just the moves (not the whole game) so the game history panel can reuse it
const MoveHistory = ({ moves }: MoveHistoryProps) => {
    if (moves.length === 0) {
        return <p className="text-sm text-muted">Moves appear here as you play.</p>
    }

    return (
        <table className="w-full text-sm text-left">
            <thead className="text-muted border-b border-line">
                <tr>
                    <th className="py-1.5 pr-4 font-medium">Move</th>
                    <th className="py-1.5 pr-4 font-medium">Player</th>
                    <th className="py-1.5 font-medium">Position</th>
                </tr>
            </thead>
            <tbody>
                {moves.map(move => (
                    <tr key={move.number} className="border-b border-line">
                        <td className="py-1.5 pr-4 tabular-nums">{move.number}</td>
                        <td className={`py-1.5 pr-4 font-semibold ${move.player === 'X' ? 'text-x' : 'text-o'}`}>
                            {move.player}
                        </td>
                        {/* backend rows/cols are 0-based; show them 1-based */}
                        <td className="py-1.5">Row {move.row + 1}, Column {move.col + 1}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    )
}

export default MoveHistory
