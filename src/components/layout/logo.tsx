export const Logo = () => {
	return (
		<article className="flex items-center">
			<div className="w-3/5">
				<img
					className="object-contain h-auto dark:hidden opacity-20"
					src="/logo-dark.svg"
					alt="Logo"
				/>
				<img
					className="object-contain h-auto hidden dark:block opacity-20"
					src="/logo-light.svg"
					alt="Logo"
				/>
			</div>
			<div className="w-full text-center flex flex-col gap-2 relative text-foreground/20">
				<h1 className="text-6xl font-bold tracking-wider">ragazzi</h1>
				<h3 className="absolute right-5 -bottom-1/3 font-semibold text-xl">
					vaqueria
				</h3>
			</div>
		</article>
	)
}
