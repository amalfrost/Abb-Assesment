import type { GameMode } from '../types'

interface ModeSelectorProps {
    mode: GameMode
    disabled: boolean
    onChange: (mode: GameMode) => void
}

const MODES: { value: GameMode, label: string }[] = [
    { value: 'TwoPlayer', label: 'Two Player' },
    { value: 'Computer', label: 'vs Computer' },
]

const ModeSelector = ({ mode, disabled, onChange }: ModeSelectorProps) => {
    return (
        <div className="inline-flex rounded-lg border border-gray-300 overflow-hidden">
            {MODES.map(option => (
                <button
                    key={option.value}
                    className={`px-4 py-2 text-sm font-medium disabled:cursor-not-allowed
                        ${mode === option.value ? 'bg-gray-800 text-white' : 'bg-white hover:bg-gray-50'}`}
                    disabled={disabled}
                    onClick={() => onChange(option.value)}>
                    {option.label}
                </button>
            ))}
        </div>
    )
}

export default ModeSelector
