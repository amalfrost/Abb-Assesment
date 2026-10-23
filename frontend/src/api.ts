import type { Game, GameMode, HistoryEntry, Player, Scoreboard } from './types'

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(`/api${url}`, {
        headers: { 'Content-Type': 'application/json' },
        ...options,
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Request failed')
    return data
}

export const createGame = (mode: GameMode) =>
    request<Game>('/games', { method: 'POST', body: JSON.stringify({ mode }) })

export const getGame = (id: string) => request<Game>(`/games/${id}`)

export const makeMove = (id: string, player: Player, row: number, col: number) =>
    request<Game>(`/games/${id}/moves`, { method: 'POST', body: JSON.stringify({ player, row, col }) })

export const undoMove = (id: string) => request<Game>(`/games/${id}/undo`, { method: 'POST' })

export const resetGame = (id: string) => request<Game>(`/games/${id}/reset`, { method: 'POST' })

export const getScoreboard = () => request<Scoreboard>('/scoreboard')

export const resetScoreboard = () => request<Scoreboard>('/scoreboard/reset', { method: 'POST' })

export const getHistory = () => request<HistoryEntry[]>('/history')
