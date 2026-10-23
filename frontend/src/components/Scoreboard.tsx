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
        { label: 'X Wins', value: scoreboard?.xWins, color: 'text-blue-600' },
        { label: 'O Wins', value: scoreboard?.oWins, color: 'text-red-600' },
        { label: 'Draws', value: scoreboard?.draws, color: 'text-amber-600' },
    ]

    return (
        <div>
            <div className="grid grid-cols-3 gap-2 mb-3">
                {items.map(item => (
                    <div key={item.label} className="rounded-lg border border-gray-200 p-3 text-center">
                        <p className={`text-2xl font-bold ${item.color}`}>{item.value ?? '-'}</p>
                        <p className="text-xs uppercase tracking-wide text-gray-500">{item.label}</p>
                    </div>
                ))}
            </div>
            <button
                className="text-sm text-gray-600 underline hover:text-gray-900 disabled:opacity-40"
                disabled={resetMutation.isPending}
                onClick={() => resetMutation.mutate()}>
                Reset Scoreboard
            </button>
        </div>
    )
}

export default Scoreboard
