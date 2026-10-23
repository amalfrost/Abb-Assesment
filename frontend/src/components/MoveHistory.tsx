import type { Move } from '../types'

interface MoveHistoryProps {
    moves: Move[]
}

// Takes just the moves (not the whole game) so the game history panel can reuse it
const MoveHistory = ({ moves }: MoveHistoryProps) => {
    if (moves.length === 0) {
        return <p className="text-sm text-gray-500">No moves yet.</p>
    }

    return (
        <table className="w-full text-sm text-left">
            <thead className="text-gray-500 border-b border-gray-200">
                <tr>
                    <th className="py-1 pr-4 font-medium">Move</th>
                    <th className="py-1 pr-4 font-medium">Player</th>
                    <th className="py-1 font-medium">Position</th>
                </tr>
            </thead>
            <tbody>
                {moves.map(move => (
                    <tr key={move.number} className="border-b border-gray-100">
                        <td className="py-1 pr-4">{move.number}</td>
                        <td className={`py-1 pr-4 font-semibold ${move.player === 'X' ? 'text-blue-600' : 'text-red-600'}`}>
                            {move.player}
                        </td>
                        {/* backend rows/cols are 0-based; show them 1-based */}
                        <td className="py-1">Row {move.row + 1}, Column {move.col + 1}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    )
}

export default MoveHistory
