"use client"

import { useEffect, useState } from "react"

export function PWARegister() {
	const [needRefresh, setNeedRefresh] = useState(false)
	const [offlineReady, setOfflineReady] = useState(false)

	useEffect(() => {
		if (import.meta.env.DEV || !("serviceWorker" in navigator)) return

		navigator.serviceWorker.register("/sw.js").then((reg) => {
			reg.addEventListener("updatefound", () => {
				const newWorker = reg.installing
				if (!newWorker) return

				newWorker.addEventListener("statechange", () => {
					if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
						setNeedRefresh(true)
					}
				})
			})
		})

		navigator.serviceWorker.ready.then(() => {
			setOfflineReady(true)
			setTimeout(() => setOfflineReady(false), 5000)
		})
	}, [])

	const updateSW = () => {
		navigator.serviceWorker.controller?.postMessage({ type: "SKIP_WAITING" })
		setNeedRefresh(false)
		window.location.reload()
	}

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
						onClick={updateSW}
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
