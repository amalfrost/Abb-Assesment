import type { Cell as CellValue } from '../types'

interface CellProps {
    value: CellValue
    label: string // e.g. "Row 1, Column 2" - read out by screen readers
    highlighted: boolean
    disabled: boolean
    onClick: () => void
}

// pathLength={1} lets the CSS draw animation work the same for any shape
const XMark = () => (
    <svg viewBox="0 0 100 100" className="size-3/5 text-x" aria-hidden="true">
        <g fill="none" stroke="currentColor" strokeWidth={11} strokeLinecap="round">
            <path className="draw-stroke" pathLength={1} d="M22 22 L78 78" />
            <path className="draw-stroke draw-delay" pathLength={1} d="M78 22 L22 78" />
        </g>
    </svg>
)

const OMark = () => (
    <svg viewBox="0 0 100 100" className="size-3/5 text-o" aria-hidden="true">
        <circle
            className="draw-stroke"
            pathLength={1}
            cx="50" cy="50" r="30"
            fill="none" stroke="currentColor" strokeWidth={11} strokeLinecap="round"
            transform="rotate(-90 50 50)"
        />
    </svg>
)

const Cell = ({ value, label, highlighted, disabled, onClick }: CellProps) => {
    let background = 'bg-paper enabled:hover:bg-hover'
    if (highlighted) background = value === 'X' ? 'bg-x-tint' : 'bg-o-tint'

    return (
        <button
            className={`size-24 sm:size-28 flex items-center justify-center ${background}`}
            aria-label={`${label}, ${value ?? 'empty'}`}
            disabled={disabled}
            onClick={onClick}>
            {value === 'X' && <XMark />}
            {value === 'O' && <OMark />}
        </button>
    )
}

export default Cell
