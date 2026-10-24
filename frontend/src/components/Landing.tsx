import { useEffect, useState } from 'react'
import type { GameMode } from '../types'
import ModeSelector from './ModeSelector'
import { OMark, XMark } from './Cell'
import { WinLine } from './Board'

interface LandingProps {
    mode: GameMode
    onModeChange: (mode: GameMode) => void
    onStart: () => void
}

// Scripted demo game: X opens in the centre and wins on the 2-4-6 diagonal
const DEMO_MOVES = [4, 1, 0, 8, 6, 3, 2]
const DEMO_LINE = [2, 4, 6]
const DEMO_TICKS = 13 // 7 moves, then the win line is held for a few ticks before restarting

const DemoBoard = () => {
    const [tick, setTick] = useState(0)

    useEffect(() => {
        const timer = setInterval(() => setTick(t => (t + 1) % DEMO_TICKS), 650)
        return () => clearInterval(timer)
    }, [])

    const shown = Math.min(tick, DEMO_MOVES.length)
    const board = Array(9).fill(null)
    DEMO_MOVES.slice(0, shown).forEach((cell, k) => { board[cell] = k % 2 ? 'O' : 'X' })
    const done = tick > DEMO_MOVES.length

    return (
        <figure className="m-0 flex flex-col items-center gap-6">
            <div
                role="img"
                aria-label="Animated demo: X wins a game of tic tac toe on the diagonal"
                className="demo-tilt w-full max-w-[420px] rounded-[30px] border-3 border-ink bg-sun p-4 shadow-pop-lg">
                <div className="relative grid aspect-square grid-cols-3 gap-2.5" aria-hidden="true">
                    {board.map((value, i) => (
                        <div key={i} className="flex items-center justify-center rounded-2xl border-3 border-ink bg-card">
                            {value === 'X' && <XMark />}
                            {value === 'O' && <OMark />}
                        </div>
                    ))}
                    {done && <WinLine cells={DEMO_LINE} />}
                </div>
            </div>
            <figcaption className="flex items-center gap-2.5 rounded-full border-3 border-ink bg-card px-4 py-2 text-sm font-extrabold">
                <span className="size-2.5 rounded-full bg-x-mark" aria-hidden="true" />
                {done ? 'X takes the diagonal!' : `Demo game · move ${Math.max(1, shown)} of ${DEMO_MOVES.length}`}
            </figcaption>
        </figure>
    )
}

const STEPS = [
    { title: 'Take turns', text: 'X always opens. Tap any empty square to place your mark.', badge: 'bg-x-mark text-white', shadow: 'shadow-[6px_6px_0_var(--color-x-mark)]', tilt: '-rotate-1' },
    { title: 'Line up three', text: 'Three in a row, column or diagonal wins. A full board with no line is a draw.', badge: 'bg-o-mark text-white', shadow: 'shadow-[6px_6px_0_var(--color-o-mark)]', tilt: 'rotate-1' },
    { title: 'Go again', text: 'Start a new round any time. The score keeps count until you reset it.', badge: 'bg-mint text-ink', shadow: 'shadow-[6px_6px_0_var(--color-mint)]', tilt: '-rotate-1' },
]

const Landing = ({ mode, onModeChange, onStart }: LandingProps) => {
    return (
        <main className="flex flex-col gap-24 pt-10 sm:pt-14">
            <section className="flex flex-wrap items-center gap-16">
                <div className="flex min-w-0 flex-[1_1_420px] flex-col gap-7">
                    <span className="-rotate-2 self-start rounded-full border-3 border-ink bg-card px-3.5 py-2 text-[15px] font-extrabold">
                        X goes first · O answers
                    </span>
                    <h1 className="m-0 font-display text-[clamp(48px,7.5vw,92px)] font-bold leading-[0.98]">
                        Three in a row{' '}
                        <span className="inline-block -rotate-3 rounded-[18px] border-3 border-ink bg-x-mark px-3.5 pb-1.5 text-white shadow-[5px_5px_0_var(--color-ink)]">
                            wins!
                        </span>
                    </h1>
                    <p className="m-0 max-w-[480px] text-xl font-medium leading-relaxed text-muted">
                        Play a friend on the same screen or take on the computer. Quick rounds, a running score, and a rematch one tap away.
                    </p>

                    <div className="flex flex-col gap-3">
                        <span className="text-sm font-extrabold uppercase tracking-wider text-muted">Pick your mode</span>
                        <ModeSelector mode={mode} disabled={false} onChange={onModeChange} />
                    </div>

                    <div className="flex flex-wrap items-center gap-5 pt-1">
                        <button
                            className="btn-pop inline-flex min-h-16 cursor-pointer items-center gap-3 rounded-[18px] border-3 border-ink bg-mint px-8 font-display text-2xl font-bold text-ink"
                            onClick={onStart}>
                            Start game
                            <svg viewBox="0 0 18 18" className="size-5.5" aria-hidden="true">
                                <path d="M4 9h10M10 4.5L14.5 9 10 13.5" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                        <span className="font-bold text-muted">No sign-up needed</span>
                    </div>
                </div>

                <div className="min-w-0 flex-[1_1_340px]">
                    <DemoBoard />
                </div>
            </section>

            <section aria-labelledby="how-title" className="flex flex-col gap-7">
                <h2 id="how-title" className="m-0 font-display text-4xl font-bold">How to play</h2>
                <ol className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-6 p-0">
                    {STEPS.map((step, i) => (
                        <li key={step.title} className={`flex flex-col gap-2.5 rounded-[22px] border-3 border-ink bg-card p-6 ${step.shadow} ${step.tilt}`}>
                            <span className={`flex size-12 items-center justify-center self-start rounded-full border-3 border-ink font-display text-2xl font-bold ${step.badge}`}>
                                {i + 1}
                            </span>
                            <strong className="font-display text-[22px] font-semibold">{step.title}</strong>
                            <span className="leading-normal text-muted">{step.text}</span>
                        </li>
                    ))}
                </ol>
            </section>
        </main>
    )
}

export default Landing
