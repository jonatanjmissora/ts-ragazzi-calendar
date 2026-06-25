import ThemeSwitch from "@/components/layout/theme-switch"

export default function AuthHeader() {
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
					<ThemeSwitch />
				</div>
			</nav>
		</header>
	)
}
