import { Link } from "@tanstack/react-router"
import { Logo } from "./logo"
import ThemeSwitch from "./theme-switch"
import User from "./user"
import { Settings } from "lucide-react"

export const Aside = ({ children }: { children?: React.ReactNode }) => {
	return (
		<aside className="w-full sm:w-[20dvw] h-full sm:h-svh sm:sticky top-0 left-0 pt-10 px-6 flex flex-col justify-between border shadow bg-accent">
			<div className="absolute top-4 right-4 flex justify-between items-center opacity-50">
				<ThemeSwitch />
			</div>
			<Link
				to="/admin"
				className="absolute top-4 left-4 flex justify-between items-center opacity-50"
				aria-label="Administración"
			>
				<Settings size={20} />
			</Link>
			<Logo />

			{children}
			<User />
		</aside>
	)
}
