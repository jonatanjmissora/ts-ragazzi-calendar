import { Link } from "@tanstack/react-router"
import { Logo } from "./logo"
import ThemeSwitch from "./theme-switch"
import User from "./user"
import { Settings, Link as LinkIcon } from "lucide-react"
import { Suspense, useState } from "react"
import { useSuspenseQuery } from "@tanstack/react-query"
import { linksQueryOptions } from "queries/links/links-query"

export const Aside = ({ children }: { children?: React.ReactNode }) => {
	const [showLinks, setShowLinks] = useState(false)
	return (
		<aside className="w-full sm:w-[20dvw] h-full sm:h-svh sm:sticky top-0 left-0 pt-10 px-6 flex flex-col justify-between border shadow bg-accent relative">
			<Link
				to="/admin"
				className="absolute top-4 left-4 flex justify-between items-center opacity-50"
				aria-label="Administración"
			>
				<Settings size={20} />
			</Link>
			<div className="absolute top-4 right-1/2 translate-x-1/2 flex flex-col justify-between items-center">
				<LinkIcon
					size={20}
					onClick={() => setShowLinks(!showLinks)}
					className="cursor-pointer opacity-50"
				/>
				{showLinks && (
					<Suspense fallback={<div>...</div>}>
						<Links />
					</Suspense>
				)}
			</div>
			<div className="z-200 absolute top-4 right-4 flex justify-between items-center opacity-50">
				<ThemeSwitch />
			</div>
			<Logo />

			{children}
			<User />
		</aside>
	)
}

function Links() {
	const { data: links } = useSuspenseQuery(linksQueryOptions)
	return (
		<nav className="flex flex-col mt-4">
			{links.map(link => (
				<Link
					to={link.url}
					key={link.id}
					className="bg-gray-600 p-2 m-1 border rounded-lg"
					target="_blank"
				>
					<img
						src={link.imagen ?? "/images/link.png"}
						alt={link.nombre}
						className="w-12 h-12"
					/>
				</Link>
			))}
		</nav>
	)
}
