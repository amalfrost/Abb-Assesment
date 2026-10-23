import type { CSSProperties } from 'react'

// Decorative X / O shapes that drift behind the page (animated by .float in index.css)
const SHAPES: { kind: 'x' | 'o', color: string, style: CSSProperties }[] = [
    { kind: 'x', color: 'var(--color-x-mark)', style: { '--r': '-12deg', width: 84, left: '4%', top: 120, opacity: 0.35 } as CSSProperties },
    { kind: 'o', color: 'var(--color-o-mark)', style: { '--r': '0deg', width: 110, right: '6%', top: 70, opacity: 0.3 } as CSSProperties },
    { kind: 'o', color: 'var(--color-sun)', style: { '--r': '20deg', width: 64, left: '46%', top: 30, opacity: 0.8 } as CSSProperties },
    { kind: 'x', color: 'var(--color-mint)', style: { '--r': '8deg', width: 72, right: '12%', bottom: 140, opacity: 0.5 } as CSSProperties },
    { kind: 'o', color: 'var(--color-grape)', style: { '--r': '-20deg', width: 90, left: '8%', bottom: 80, opacity: 0.4 } as CSSProperties },
]

const FloatingShapes = () => (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
        {SHAPES.map((shape, i) => (
            <svg key={i} viewBox="0 0 100 100" className="float" style={shape.style}>
                {shape.kind === 'x'
                    ? <path d="M22 22 L78 78 M78 22 L22 78" fill="none" stroke={shape.color} strokeWidth={16} strokeLinecap="round" />
                    : <circle cx="50" cy="50" r="32" fill="none" stroke={shape.color} strokeWidth={14} />}
            </svg>
        ))}
    </div>
)

export default FloatingShapes
