import type { GameMode } from '../types'

interface ModeSelectorProps {
    mode: GameMode
    disabled: boolean
    onChange: (mode: GameMode) => void
}

const MODES: { value: GameMode, label: string }[] = [
    { value: 'TwoPlayer', label: 'Two player' },
    { value: 'Computer', label: 'vs Computer' },
]

const ModeSelector = ({ mode, disabled, onChange }: ModeSelectorProps) => {
    return (
        <div role="group" aria-label="Game mode" className="inline-flex rounded-md border-2 border-ink overflow-hidden">
            {MODES.map(option => (
                <button
                    key={option.value}
                    aria-pressed={mode === option.value}
                    className={`px-4 py-1.5 text-sm font-medium disabled:cursor-not-allowed
                        ${mode === option.value ? 'bg-ink text-paper' : 'bg-paper text-ink enabled:hover:bg-hover'}`}
                    disabled={disabled}
                    onClick={() => onChange(option.value)}>
                    {option.label}
                </button>
            ))}
        </div>
    )
}

export default ModeSelector
