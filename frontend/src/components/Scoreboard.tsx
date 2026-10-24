import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as api from '../api'

// Fetches its own data. useGame invalidates ['scoreboard'] after every move,
// so this refreshes by itself when a game finishes.
const Scoreboard = () => {
    const queryClient = useQueryClient()

    const { data: scoreboard } = useQuery({
        queryKey: ['scoreboard'],
        queryFn: api.getScoreboard,
    })

    const resetMutation = useMutation({
        mutationFn: api.resetScoreboard,
        onSuccess: (data) => queryClient.setQueryData(['scoreboard'], data),
    })

    const items = [
        { label: 'X wins', value: scoreboard?.xWins, color: 'text-x' },
        { label: 'O wins', value: scoreboard?.oWins, color: 'text-o' },
        { label: 'Draws', value: scoreboard?.draws, color: 'text-ink' },
    ]

    return (
        <div>
            <dl className="grid grid-cols-3 gap-3">
                {items.map(item => (
                    <div key={item.label} className="rounded-2xl border-3 border-ink bg-card px-2 py-2.5 text-center shadow-pop">
                        <dt className="text-sm font-bold">{item.label}</dt>
                        <dd className={`font-display text-4xl font-bold tabular-nums ${item.color}`}>{item.value ?? '-'}</dd>
                    </div>
                ))}
            </dl>
            <button
                className="mt-4 cursor-pointer text-sm font-bold text-muted underline underline-offset-2 hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
                disabled={resetMutation.isPending}
                onClick={() => resetMutation.mutate()}>
                Reset scoreboard
            </button>
        </div>
    )
}

export default Scoreboard
