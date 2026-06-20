import { useRouteContext, useRouter } from "@tanstack/react-router"
import { Monitor, Moon, Sun } from "lucide-react"
import { setThemeServerFn } from "server/theme"

export default function ThemeSwitch() {
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
		<button className="cursor-pointer" onClick={toggleTheme}>
			{theme === "dark" ? (
				<Moon size={20} />
			) : theme === "light" ? (
				<Sun size={20} />
			) : (
				<Monitor size={20} />
			)}
		</button>
	)
}
