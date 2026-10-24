import type { Game } from '../types'
import Cell from './Cell'

interface BoardProps {
    game: Game
    disabled: boolean                                // true while a request is in flight
    onCellClick: (row: number, col: number) => void
}

// Strike line through the winning cells. The SVG uses a 3x3 coordinate space,
// so cell i has its center at (col + 0.5, row + 0.5).
export const WinLine = ({ cells }: { cells: number[] }) => {
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
                stroke="var(--color-ink)"
                strokeWidth={0.1}
                strokeLinecap="round"
            />
        </svg>
    )
}

// Pieces are positioned and coloured by the .confetti rules in index.css
const Confetti = () => (
    <div className="confetti pointer-events-none absolute inset-0" aria-hidden="true">
        {Array.from({ length: 12 }, (_, i) => <span key={i} />)}
    </div>
)

const Board = ({ game, disabled, onCellClick }: BoardProps) => {
    return (
        <div className="relative w-fit rounded-[30px] border-3 border-ink bg-sun p-3 sm:p-3.5 shadow-pop-lg">
            <div className="relative grid grid-cols-3 gap-2 sm:gap-2.5">
                {game.board.map((value, i) => (
                    <Cell
                        key={i}
                        value={value}
                        label={`Row ${Math.floor(i / 3) + 1}, Column ${(i % 3) + 1}`}
                        highlighted={game.winningCells.includes(i)}
                        disabled={disabled || game.status !== 'InProgress' || value !== null}
                        ghost={game.currentPlayer}
                        onClick={() => onCellClick(Math.floor(i / 3), i % 3)}
                    />
                ))}
                {game.winner && <WinLine cells={game.winningCells} />}
            </div>
            {game.winner && <Confetti />}
        </div>
    )
}

export default Board
