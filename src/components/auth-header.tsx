import { useRouteContext, useRouter } from "@tanstack/react-router"
import { Monitor, Moon, Sun } from "lucide-react"

import { setThemeServerFn } from "server/theme"

export default function AuthHeader() {
	const { theme } = useRouteContext({ from: "__root__" })
	const router = useRouter()

	const toggleTheme = () => {
		const themes = ["light", "dark", "auto"] as const
		const nextTheme = themes[(themes.indexOf(theme) + 1) % themes.length]
		setThemeServerFn({ data: nextTheme }).then(() => {
			router.invalidate()
		})
	}

	return (
		<header className="py-8 w-[90%] 2xl:w-[80%] mx-auto">
			<nav className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<div className="w-15">
						<img
							className="object-contain h-auto dark:hidden opacity-75"
							src="/logo-dark.svg"
							alt="Logo"
						/>
						<img
							className="object-contain h-auto hidden dark:block"
							src="/logo-light.svg"
							alt="Logo"
						/>
					</div>
					<h1 className="font-bold tracking-wider text-3xl text-foreground/75">
						ragazzi
					</h1>
				</div>

				<div className="flex items-center gap-4">
					<button className="cursor-pointer" onClick={toggleTheme}>
						{theme === "dark" ? (
							<Moon size={20} />
						) : theme === "light" ? (
							<Sun size={20} />
						) : (
							<Monitor size={20} />
						)}
					</button>
				</div>
			</nav>
		</header>
	)
}
