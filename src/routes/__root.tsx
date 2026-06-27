import type { QueryClient } from "@tanstack/react-query"
import {
	createRootRouteWithContext,
	HeadContent,
	Scripts,
} from "@tanstack/react-router"

import appCss from "../styles.css?url"
import { Toaster } from "sonner"
import { Session } from "better-auth"
import { lazy, Suspense, useEffect } from "react"
import { DefaultCatchBoundary } from "@/components/DefaultCatchBoundary"
import { NotFound } from "@/components/NotFound"

const DevtoolsPanel = lazy(() => import("@/components/devtools-panel"))
import { PWARegister } from "@/components/pwa-register"
import { OfflineIndicator } from "@/components/offline-indicator"
import { startSyncListener } from "@/lib/offline/sync"
import { getSession } from "server/get-session"
import { getThemeServerFn } from "server/theme"

export type RouterContext = {
	session: Session | null
	queryClient: QueryClient
	theme: "light" | "dark" | "auto"
}

export const Route = createRootRouteWithContext<RouterContext>()({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "Ragazzi",
			},
			{
				name: "description",
				content: "Ragazzi — app de gestión de pagos para vaquería",
			},
			{
				name: "theme-color",
				content: "#09090b",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
			{
				rel: "manifest",
				href: "/manifest.webmanifest",
			},
		],
	}),
	beforeLoad: async () => {
		const [theme, session] = await Promise.all([
			getThemeServerFn().then(t => (t ?? "auto") as "light" | "dark" | "auto"),
			getSession(),
		])
		return { theme, session }
	},
	shellComponent: RootDocument,
	errorComponent: DefaultCatchBoundary,
	notFoundComponent: () => <NotFound />,
})

function RootDocument({ children }: { children: React.ReactNode }) {
	const { theme } = Route.useRouteContext()

	useEffect(() => {
		startSyncListener()
	}, [])

	return (
		<html
			lang="es"
			className={`${theme} w-screen overflow-x-hidden min-h-screen`}
		>
			<head>
				<HeadContent />
			</head>
			<body className="w-full h-full flex flex-col">
				<OfflineIndicator />
				{children}
				<PWARegister />
				<Toaster />
				{import.meta.env.DEV && (
					<Suspense fallback={null}>
						<DevtoolsPanel />
					</Suspense>
				)}
				<Scripts />
			</body>
		</html>
	)
}
