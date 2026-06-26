"use client"

import { useEffect, useState } from "react"

export function PWARegister() {
	const [needRefresh, setNeedRefresh] = useState(false)
	const [offlineReady, setOfflineReady] = useState(false)

	useEffect(() => {
		if (import.meta.env.DEV || !("serviceWorker" in navigator)) return

		let registration: ServiceWorkerRegistration | undefined

		navigator.serviceWorker.register("/sw.js").then((reg) => {
			registration = reg

			if (reg.waiting) {
				setNeedRefresh(true)
			}

			reg.addEventListener("updatefound", () => {
				const newWorker = reg.installing
				if (!newWorker) return

				newWorker.addEventListener("statechange", () => {
					if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
						setNeedRefresh(true)
					} else if (newWorker.state === "activated") {
						setOfflineReady(true)
						setTimeout(() => setOfflineReady(false), 5000)
					}
				})
			})
		})

		navigator.serviceWorker.addEventListener("controllerchange", () => {
			window.location.reload()
		})

		return () => {
			registration?.unregister()
		}
	}, [])

	useEffect(() => {
		if (import.meta.env.DEV) {
			setNeedRefresh(false)
			setOfflineReady(false)
		}
	}, [])

	if (import.meta.env.DEV) return null

	const updateSW = () => {
		navigator.serviceWorker.controller?.postMessage({ type: "SKIP_WAITING" })
	}

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
