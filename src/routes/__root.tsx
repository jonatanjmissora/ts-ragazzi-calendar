import type { QueryClient } from "@tanstack/react-query"
import {
	createRootRouteWithContext,
	HeadContent,
	Scripts,
} from "@tanstack/react-router"

import appCss from "../styles.css?url"
import { Toaster } from "sonner"
import { Session } from "better-auth"
import { lazy, Suspense } from "react"
import { DefaultCatchBoundary } from "@/components/DefaultCatchBoundary"
import { NotFound } from "@/components/NotFound"

const DevtoolsPanel = lazy(() => import("@/components/devtools-panel"))
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
				title: "TanStack Start Starter",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
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

	return (
		<html
			lang="en"
			className={`${theme} w-screen overflow-x-hidden min-h-screen`}
		>
			<head>
				<HeadContent />
			</head>
			<body className="w-full h-full flex flex-col">
				{children}
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
