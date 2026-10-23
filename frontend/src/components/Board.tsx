import type { Game, Player } from '../types'
import Cell from './Cell'

interface BoardProps {
    game: Game
    disabled: boolean                                // true while a request is in flight
    onCellClick: (row: number, col: number) => void
}

// Strike line through the winning cells. The SVG uses a 3x3 coordinate space,
// so cell i has its center at (col + 0.5, row + 0.5).
const WinLine = ({ cells, winner }: { cells: number[], winner: Player }) => {
    const [first, , last] = cells
    const x1 = (first % 3) + 0.5, y1 = Math.floor(first / 3) + 0.5
    const x2 = (last % 3) + 0.5, y2 = Math.floor(last / 3) + 0.5
    const overshoot = 0.15 // run slightly past the outer cell centers

    return (
        <svg viewBox="0 0 3 3" className="absolute inset-0 size-full pointer-events-none" aria-hidden="true">
            <line
                className="draw-stroke draw-slow"
                pathLength={1}
                x1={x1 - (x2 - x1) * overshoot} y1={y1 - (y2 - y1) * overshoot}
                x2={x2 + (x2 - x1) * overshoot} y2={y2 + (y2 - y1) * overshoot}
                stroke={winner === 'X' ? 'var(--color-x)' : 'var(--color-o)'}
                strokeWidth={0.09}
                strokeLinecap="round"
            />
        </svg>
    )
}

const Board = ({ game, disabled, onCellClick }: BoardProps) => {
    return (
        // The ink background only shows through the gaps, which draws the # grid
        <div className="relative grid grid-cols-3 gap-1.5 bg-ink w-fit">
            {game.board.map((value, i) => (
                <Cell
                    key={i}
                    value={value}
                    label={`Row ${Math.floor(i / 3) + 1}, Column ${(i % 3) + 1}`}
                    highlighted={game.winningCells.includes(i)}
                    disabled={disabled || game.status !== 'InProgress' || value !== null}
                    onClick={() => onCellClick(Math.floor(i / 3), i % 3)}
                />
            ))}
            {game.winner && <WinLine cells={game.winningCells} winner={game.winner} />}
        </div>
    )
}

export default Board
