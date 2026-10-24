import type { Cell as CellValue, Player } from '../types'

interface CellProps {
    value: CellValue
    label: string // e.g. "Row 1, Column 2" - read out by screen readers
    highlighted: boolean
    disabled: boolean
    ghost: Player // mark previewed on hover while the cell is playable
    onClick: () => void
}

// pathLength={1} lets the CSS draw animation work the same for any shape
export const XMark = () => (
    <svg viewBox="0 0 100 100" className="mark-pop size-3/5 text-x-mark" aria-hidden="true">
        <g fill="none" stroke="currentColor" strokeWidth={14} strokeLinecap="round">
            <path className="draw-stroke" pathLength={1} d="M22 22 L78 78" />
            <path className="draw-stroke draw-delay" pathLength={1} d="M78 22 L22 78" />
        </g>
    </svg>
)

export const OMark = () => (
    <svg viewBox="0 0 100 100" className="mark-pop size-3/5 text-o-mark" aria-hidden="true">
        <circle
            className="draw-stroke"
            pathLength={1}
            cx="50" cy="50" r="30"
            fill="none" stroke="currentColor" strokeWidth={13} strokeLinecap="round"
            transform="rotate(-90 50 50)"
        />
    </svg>
)

// Faint preview of the mark the current player would place
const GhostMark = ({ player }: { player: Player }) => (
    <svg
        viewBox="0 0 100 100"
        className={`absolute size-3/5 opacity-0 transition-opacity group-hover:opacity-20 ${player === 'X' ? 'text-x-mark' : 'text-o-mark'}`}
        aria-hidden="true">
        {player === 'X'
            ? <path d="M22 22 L78 78 M78 22 L22 78" fill="none" stroke="currentColor" strokeWidth={14} strokeLinecap="round" />
            : <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth={13} />}
    </svg>
)

const Cell = ({ value, label, highlighted, disabled, ghost, onClick }: CellProps) => {
    let background = 'bg-card enabled:hover:bg-hover'
    if (highlighted) background = value === 'X' ? 'bg-x-tint' : 'bg-o-tint'

    return (
        <button
            className={`group cell-wiggle relative flex size-22 sm:size-28 items-center justify-center rounded-2xl border-3 border-ink
                transition-colors enabled:cursor-pointer enabled:active:scale-95 ${background}`}
            aria-label={`${label}, ${value ?? 'empty'}`}
            disabled={disabled}
            onClick={onClick}>
            {value === 'X' && <XMark />}
            {value === 'O' && <OMark />}
            {!disabled && <GhostMark player={ghost} />}
        </button>
    )
}

export default Cell
