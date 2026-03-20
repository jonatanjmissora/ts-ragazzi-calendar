import { Logo } from "./logo"
import UserMenu from "./user-menu"

export const Aside = ({ children }: { children?: React.ReactNode }) => {
	return (
		<aside className="w-[20dvw] h-screen sticky top-0 left-0 py-10 px-6 flex flex-col justify-between gap-20 border shadow bg-accent">
			<div className="flex flex-col sm:gap-20 2xl:gap-40">
				<UserMenu />
				{children}
			</div>
			<Logo />
		</aside>
	)
}
