"use client"

import { useEffect, useState } from "react"
import { useRegisterSW } from "virtual:pwa-register/react"

export function PWARegister() {
	const [needRefresh, setNeedRefresh] = useState(false)

	const {
		offlineReady: [offlineReady, setOfflineReady],
		updateServiceWorker,
	} = useRegisterSW({
		onNeedRefresh() {
			setNeedRefresh(true)
		},
		onOfflineReady() {
			setOfflineReady(true)
			setTimeout(() => setOfflineReady(false), 5000)
		},
	})

	useEffect(() => {
		if (import.meta.env.DEV) {
			setNeedRefresh(false)
			setOfflineReady(false)
		}
	}, [offlineReady, setOfflineReady])

	if (import.meta.env.DEV) return null

	return (
		<>
			{offlineReady && (
				<div className="fixed bottom-4 right-4 z-50 rounded-lg bg-zinc-800 px-4 py-3 text-sm text-white shadow-lg">
					App lista para uso offline
				</div>
			)}
			{needRefresh && (
				<div className="fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-lg bg-zinc-800 px-4 py-3 text-sm text-white shadow-lg">
					<span>Nueva versión disponible</span>
					<button
						onClick={() => updateServiceWorker(true)}
						className="rounded bg-blue-600 px-3 py-1 text-xs font-medium hover:bg-blue-500"
					>
						Actualizar
					</button>
					<button
						onClick={() => setNeedRefresh(false)}
						className="text-xs text-zinc-400 hover:text-white"
					>
						Cerrar
					</button>
				</div>
			)}
		</>
	)
}
