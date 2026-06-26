export const Logo = () => {
	return (
		<article className="flex items-center">
			<div className="w-3/5">
				<img
					className="object-contain h-auto dark:hidden opacity-20"
					src="/logo-dark.svg"
					alt=""
					width="136"
					height="165"
				/>
				<img
					className="object-contain h-auto hidden dark:block opacity-20"
					src="/logo-light.svg"
					alt=""
					width="136"
					height="165"
				/>
			</div>
			<div className="w-full text-center flex flex-col gap-2 relative text-foreground/60 -z-1">
				<span className="sm:text-5xl 2xl:text-6xl text-4xl font-bold tracking-wider">
					ragazzi
				</span>
				<span className="absolute right-5 -bottom-1/3 font-semibold sm:text-base 2xl:text-xl text-base">
					vaqueria
				</span>
			</div>
		</article>
	)
}
