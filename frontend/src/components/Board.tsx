import type { Game } from '../types'
import Cell from './Cell'

interface BoardProps {
    game: Game
    disabled: boolean                                // true while a request is in flight
    onCellClick: (row: number, col: number) => void
}

const Board = ({ game, disabled, onCellClick }: BoardProps) => {
    return (
        <div className="grid grid-cols-3 gap-2 w-fit">
            {game.board.map((value, i) => (
                <Cell
                    key={i}
                    value={value}
                    highlighted={game.winningCells.includes(i)}
                    disabled={disabled}
                    onClick={() => onCellClick(Math.floor(i / 3), i % 3)}
                />
            ))}
        </div>
    )
}

export default Board
