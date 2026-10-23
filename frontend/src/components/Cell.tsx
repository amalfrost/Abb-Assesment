import type { Cell as CellValue } from '../types'

interface CellProps {
    value: CellValue
    highlighted: boolean
    disabled: boolean
    onClick: () => void
}

const Cell = ({ value, highlighted, disabled, onClick }: CellProps) => {
    const cellStyle = `h-24 w-24 rounded-lg border-2 text-4xl font-bold disabled:cursor-not-allowed
${value === 'X' ? 'text-blue-600' : value === 'O' ? 'text-red-600' : 'text-gray-900'}
  ${highlighted ? 'bg-green-200 border-green-500' : 'bg-white border-gray-300 hover:bg-gray-50'}`
    return (
        <button
            className={cellStyle}
            disabled={disabled}
            onClick={onClick}>
            {value}
        </button>
    )
}

export default Cell