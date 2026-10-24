import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from '../api'
import type { Game, Players } from "../types";

export function useGame(gameId: string | null) {

    const queryClient = useQueryClient();

    const gameQuery = useQuery({
        queryKey: ['game', gameId],
        queryFn: () => api.getGame(gameId!),
        enabled: !!gameId, //dont fetch untill we have game id
    })

    function onSuccess(game: Game) {
        queryClient.setQueryData(['game', gameId], game)
        queryClient.invalidateQueries({ queryKey: ['scoreboard'] })
        queryClient.invalidateQueries({ queryKey: ['history'] })
    }

    const moveMutation = useMutation({
        mutationFn: ({ row, col }: { row: number, col: number }) =>
            api.makeMove(gameId!, gameQuery.data!.currentPlayer, row, col),
        onSuccess
    })

    const undoMutation = useMutation({
        mutationFn: () => api.undoMove(gameId!),
        onSuccess
    })

    const resetMutation = useMutation({
        mutationFn: () => api.resetGame(gameId!),
        onSuccess
    })

    const renameMutation = useMutation({
        mutationFn: (players: Partial<Players>) => api.renamePlayers(gameId!, players),
        onSuccess
    })

    return {
        game: gameQuery.data,
        move: (row: number, col: number) => moveMutation.mutate({ row, col }),
        undo: () => undoMutation.mutate(),
        reset: () => resetMutation.mutate(),
        rename: (players: Partial<Players>) => renameMutation.mutate(players),
        isPending: moveMutation.isPending || undoMutation.isPending || resetMutation.isPending || renameMutation.isPending,
        error: moveMutation.error ?? undoMutation.error ?? resetMutation.error ?? renameMutation.error,
    }
}