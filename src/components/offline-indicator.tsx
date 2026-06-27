"use client"

import { useEffect, useState } from "react"
import { useOnlineStatus } from "@/hooks/use-online-status"
import { getPendingCount } from "@/lib/offline/db"
import { processMutationQueue } from "@/lib/offline/sync"
import { Wifi, WifiOff } from "lucide-react"

export function OfflineIndicator() {
	const isOnline = useOnlineStatus()
	const [pending, setPending] = useState(0)
	const [syncing, setSyncing] = useState(false)

	useEffect(() => {
		const check = async () => {
			const count = await getPendingCount()
			setPending(count)

			if (count > 0 && navigator.onLine) {
				setSyncing(true)
				await processMutationQueue()
				const remaining = await getPendingCount()
				setPending(remaining)
				setSyncing(false)
			}
		}

		check()
		const interval = setInterval(check, 3000)

		return () => clearInterval(interval)
	}, [])

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
