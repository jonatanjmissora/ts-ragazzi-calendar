"use client"

import { useEffect, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import {
	getPendingCount,
	getMutationQueue,
	type MutationEntry,
} from "@/lib/offline/db"
import { processMutationQueue } from "@/lib/offline/sync"
import { Wifi, WifiOff } from "lucide-react"

function formatMutation(entry: MutationEntry): string {
	const { type, payload } = entry
	const desc =
		payload?.rubro && payload?.sector
			? `${payload.rubro}/${payload.sector}`
			: payload?.id
				? payload.id.slice(0, 8)
				: ""
	if (type === "create") return `Crear${desc ? `: ${desc}` : ""}`
	if (type === "update") return `Actualizar${desc ? `: ${desc}` : ""}`
	if (type === "delete") return `Eliminar${desc ? `: ${desc}` : ""}`
	return type
}

async function checkActualOnline(): Promise<boolean> {
	if (!navigator.onLine) return false
	try {
		const ctrl = new AbortController()
		const id = setTimeout(() => ctrl.abort(), 3000)
		await fetch("/manifest.webmanifest", {
			method: "HEAD",
			cache: "no-store",
			signal: ctrl.signal,
		})
		clearTimeout(id)
		return true
	} catch {
		return false
	}
}

export function OfflineIndicator() {
	const queryClient = useQueryClient()
	const [pending, setPending] = useState(0)
	const [entries, setEntries] = useState<MutationEntry[]>([])
	const [isOnline, setIsOnline] = useState(true)
	const [syncing, setSyncing] = useState(false)

	useEffect(() => {
		if (typeof window === "undefined") return

		let cancelled = false

		const refresh = async () => {
			const online = await checkActualOnline()
			if (cancelled) return
			setIsOnline(online)

			const count = await getPendingCount()
			if (cancelled) return
			setPending(count)

			if (count > 0) {
				const queue = await getMutationQueue()
				if (!cancelled) setEntries(queue)
			} else {
				if (!cancelled) setEntries([])
			}
		}

		refresh()
		const interval = setInterval(refresh, 3000)

		const handleOnline = () => refresh()
		const handleOffline = () => {
			setIsOnline(false)
			refresh()
		}
		window.addEventListener("online", handleOnline)
		window.addEventListener("offline", handleOffline)

		return () => {
			cancelled = true
			clearInterval(interval)
			window.removeEventListener("online", handleOnline)
			window.removeEventListener("offline", handleOffline)
		}
	}, [])

	useEffect(() => {
		if (!isOnline || pending === 0 || syncing) return

		let cancelled = false
		setSyncing(true)
		processMutationQueue(queryClient)
			.catch(() => {})
			.finally(() => {
				if (cancelled) return
				setSyncing(false)
			})
		return () => {
			cancelled = true
		}
	}, [isOnline, pending, syncing])

	if (pending === 0 && isOnline) return null

	return (
		<div className="fixed bottom-0 left-0 right-0 z-50 bg-amber-500/90 backdrop-blur-sm text-white px-4 py-2 text-sm flex flex-col items-center gap-1">
			<div className="flex items-center gap-2">
				{isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
				<span className="font-medium">
					{isOnline
						? syncing
							? `Sincronizando ${pending} cambio${pending !== 1 ? "s" : ""}...`
							: `${pending} cambio${pending !== 1 ? "s" : ""} pendiente${pending !== 1 ? "s" : ""}`
						: `Sin conexion — ${pending} cambio${pending !== 1 ? "s" : ""} pendiente${pending !== 1 ? "s" : ""}`}
				</span>
			</div>
			{entries.length > 0 && (
				<ul className="text-xs text-white/80 list-disc list-inside">
					{entries.map(e => (
						<li key={e.id}>{formatMutation(e)}</li>
					))}
				</ul>
			)}
		</div>
	)
}
