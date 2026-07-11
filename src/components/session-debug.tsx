import { useRouteContext } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { getSession } from "server/get-session"

export function SessionDebug() {
	const [info, setInfo] = useState("cargando...")
	const [online, setOnline] = useState(false)
	const ctx = useRouteContext({ from: "__root__" })
	const ctxSess = ctx?.session
	const ctxStatus = ctxSess ? "SI" : ctxSess === null ? "NO(null)" : "NO(undef)"
	useEffect(() => {
		setOnline(navigator.onLine)
		getSession()
			.then(s => setInfo(s ? "fn:SI" : "fn:NO"))
			.catch(() => setInfo("fn:ERROR"))
	}, [])
	return (
		<div className="fixed bottom-2 right-2 z-50 text-[10px] bg-black/80 text-white px-2 py-1 rounded font-mono">
			ctx:{ctxStatus} {info} on:{online ? "SI" : "NO"}
		</div>
	)
}
