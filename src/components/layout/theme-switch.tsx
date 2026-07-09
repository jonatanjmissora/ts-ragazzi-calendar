import { useEffect, useState } from "react"
import { Monitor, Moon, Sun } from "lucide-react"
import { setThemeServerFn } from "server/theme"

const THEMES = ["light", "dark", "auto"] as const

export default function ThemeSwitch() {
	const [theme, setTheme] = useState<"light" | "dark" | "auto">("auto")
	const [mounted, setMounted] = useState(false)

	useEffect(() => {
		const c = document.documentElement.className
		const t = c.includes("dark") ? "dark" : c.includes("light") ? "light" : "auto"
		setTheme(t)
		setMounted(true)
	}, [])

	const toggleTheme = () => {
		const next = THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length]
		setTheme(next)
		document.documentElement.className = `${next} w-screen overflow-x-hidden min-h-screen`
		setThemeServerFn({ data: next })
	}

	return (
		<button
			aria-label="Toggle theme"
			className="cursor-pointer"
			onClick={toggleTheme}
		>
			<span className={mounted ? "" : "invisible"}>
				{theme === "dark" ? (
					<Moon size={20} />
				) : theme === "light" ? (
					<Sun size={20} />
				) : (
					<Monitor size={20} />
				)}
			</span>
		</button>
	)
}
