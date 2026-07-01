"use client"

import { useEffect, useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useOnlineStatus } from "@/hooks/use-online-status"
import { getPendingCount } from "@/lib/offline/db"
import { processMutationQueue } from "@/lib/offline/sync"
import { Wifi, WifiOff } from "lucide-react"

const PENDING_COUNT_KEY = ["offline", "pending-count"] as const

export function OfflineIndicator() {
	const isOnline = useOnlineStatus()
	const queryClient = useQueryClient()
	const [syncing, setSyncing] = useState(false)
	const [shouldPoll, setShouldPoll] = useState(false)

	// Count de pendientes. Se activa solo cuando shouldPoll es true (offline
	// o hay pendientes). Esto evita la temporal dead zone de usar `pending`
	// dentro de su propia declaracion de useQuery.
	const { data: pending = 0 } = useQuery({
		queryKey: PENDING_COUNT_KEY,
		queryFn: () => getPendingCount(),
		enabled: typeof window !== "undefined" && shouldPoll,
		refetchInterval: shouldPoll ? 5000 : false,
		staleTime: 1000,
	})

	// Activar polling cuando estamos offline o hay pendientes.
	// Desactivar cuando online y sin pendientes.
	useEffect(() => {
		if (typeof window === "undefined") return
		if (!isOnline || pending > 0) {
			setShouldPoll(true)
		} else {
			setShouldPoll(false)
		}
	}, [isOnline, pending])

	// Auto-sync cuando vuelve la conexion y hay pendientes. Es el unico dueño
	// del trigger de sync (startSyncListener fue removido).
	useEffect(() => {
		if (!isOnline || pending === 0 || syncing) return

		let cancelled = false
		setSyncing(true)
		processMutationQueue()
			.catch(() => {})
			.finally(() => {
				if (cancelled) return
				setSyncing(false)
				queryClient.invalidateQueries({ queryKey: PENDING_COUNT_KEY })
				// Repoblar lecturas con los datos reales del server.
				queryClient.invalidateQueries({ queryKey: ["pagos"] })
			})
		return () => {
			cancelled = true
		}
	}, [isOnline, pending, syncing, queryClient])

	if (pending === 0 && isOnline) return null

	return (
		<div className="fixed bottom-0 left-0 right-0 z-50 bg-amber-500/90 backdrop-blur-sm text-white px-4 py-2 text-sm flex items-center justify-center gap-2">
			{isOnline ? (
				<>
					<Wifi size={14} />
					<span>
						{syncing
							? `Sincronizando ${pending} cambio${pending !== 1 ? "s" : ""}...`
							: `${pending} cambio${pending !== 1 ? "s" : ""} pendiente${pending !== 1 ? "s" : ""}`}
					</span>
				</>
			) : (
				<>
					<WifiOff size={14} />
					<span>
						Sin conexion
						{pending > 0
							? ` — ${pending} cambio${pending !== 1 ? "s" : ""} pendiente${pending !== 1 ? "s" : ""}`
							: ""}
					</span>
				</>
			)}
		</div>
	)
}
