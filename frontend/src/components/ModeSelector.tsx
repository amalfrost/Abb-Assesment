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
        <div role="group" aria-label="Game mode" className="flex flex-wrap gap-3">
            {MODES.map(option => (
                <button
                    key={option.value}
                    aria-pressed={mode === option.value}
                    className={`min-h-11 rounded-2xl border-3 border-ink px-4 font-bold text-ink transition
                        enabled:cursor-pointer disabled:cursor-not-allowed disabled:opacity-60
                        ${mode === option.value
                            ? 'bg-sun shadow-pop'
                            : 'bg-card shadow-pop-sm enabled:hover:-translate-x-px enabled:hover:-translate-y-px'}`}
                    disabled={disabled}
                    onClick={() => onChange(option.value)}>
                    {option.label}
                </button>
            ))}
        </div>
    )
}

export default ModeSelector
