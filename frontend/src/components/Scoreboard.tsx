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
            <dl className="flex divide-x divide-line">
                {items.map(item => (
                    <div key={item.label} className="flex-1 px-4 first:pl-0">
                        <dd className={`text-4xl font-bold tabular-nums ${item.color}`}>{item.value ?? '-'}</dd>
                        <dt className="text-sm text-muted">{item.label}</dt>
                    </div>
                ))}
            </dl>
            <button
                className="mt-3 text-sm text-muted underline underline-offset-2 hover:text-ink disabled:opacity-40"
                disabled={resetMutation.isPending}
                onClick={() => resetMutation.mutate()}>
                Reset scoreboard
            </button>
        </div>
    )
}

export default Scoreboard
