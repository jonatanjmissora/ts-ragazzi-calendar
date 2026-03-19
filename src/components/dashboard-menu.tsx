import {
	Link,
	useNavigate,
	useRouteContext,
	useRouter,
} from "@tanstack/react-router"
import { LogOut, Menu, Monitor, Moon, Sun, User } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { authClient } from "@/lib/auth-client"
import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "./ui/alert-dialog"
import { setThemeServerFn } from "server/theme"

export default function DashboardMenu() {
	const { theme, session } = useRouteContext({ from: "__root__" })
	const router = useRouter()

	const toggleTheme = () => {
		const themes = ["light", "dark", "auto"] as const
		const nextTheme = themes[(themes.indexOf(theme) + 1) % themes.length]
		setThemeServerFn({ data: nextTheme }).then(() => {
			router.invalidate()
		})
	}

	return (
		<header className="flex justify-end">
			{session ? (
				<DropdownMenuDemo
					name={session.user?.name}
					email={session.user?.email}
					theme={theme}
					toggleTheme={toggleTheme}
				/>
			) : (
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
			)}
		</header>
	)
}

export function DropdownMenuDemo({
	name,
	email,
	theme,
	toggleTheme,
}: {
	name: string
	email?: string
	theme: "light" | "dark" | "auto"
	toggleTheme: () => void
}) {
	const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

	return (
		<DropdownMenu open={isUserMenuOpen} onOpenChange={setIsUserMenuOpen}>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" className="cursor-pointer">
					<Menu className="size-6" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-80" align="end">
				<DropdownMenuGroup>
					<div className="flex flex-col items-center gap-1  py-10 bg-accent">
						<p className="font-semibold text-center tracking-widest flex items-center gap-2">
							<span className="p-2 px-3 rounded-full bg-background">
								{name.charAt(0).toUpperCase()}
							</span>
							Bienvenido {name}
						</p>
						<p className="flex justify-center text-xs text-muted-foreground">
							{email}
						</p>
					</div>
					<Link
						to="/admin"
						className="m-4 hover:bg-accent flex justify-end p-2 px-6 rounded-sm cursor-pointer text-sm items-center gap-2"
					>
						Admin <User size={14} className="text-muted-foreground" />
					</Link>
					<DropdownMenuSeparator />
					<button
						onClick={toggleTheme}
						className="w-[90%] m-4 hover:bg-accent p-2 px-6 rounded-sm flex items-center justify-end gap-2 text-sm cursor-pointer"
					>
						Aspecto{" "}
						{theme === "dark" ? (
							<Moon size={14} className="text-muted-foreground" />
						) : theme === "light" ? (
							<Sun size={14} className="text-muted-foreground" />
						) : (
							<Monitor size={14} className="text-muted-foreground" />
						)}
					</button>
					<DropdownMenuSeparator />
					<LogoutAlertDialog setUserMenuOpen={setIsUserMenuOpen} />
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}

export function LogoutAlertDialog({
	setUserMenuOpen,
}: {
	setUserMenuOpen: (open: boolean) => void
}) {
	const [open, setOpen] = useState(false)
	const navigate = useNavigate()
	const logout = async () => {
		await authClient.signOut({
			fetchOptions: {
				onSuccess: () => {
					// Redirect to home page after successful logout
					navigate({ to: "/login" })
					setUserMenuOpen(false)
				},
			},
		})
	}

	return (
		<AlertDialog open={open} onOpenChange={setOpen}>
			<AlertDialogTrigger asChild className="m-4 hover:bg-accent">
				<span className="flex justify-end p-2 px-6 rounded-sm cursor-pointer text-sm items-center gap-2">
					Salir <LogOut size={14} className="text-muted-foreground" />
				</span>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogTitle>
					¿Estás seguro de que quieres cerrar sesión?
				</AlertDialogTitle>
				<AlertDialogDescription>
					Esto cerrará tu sesión y necesitarás iniciar sesión de nuevo.
				</AlertDialogDescription>
				<div className="flex justify-end gap-4">
					<Button
						variant="outline"
						className="cursor-pointer"
						onClick={() => {
							setOpen(false)
							setUserMenuOpen(false)
						}}
					>
						Cancelar
					</Button>
					<Button className="cursor-pointer" onClick={logout}>
						Confirmar
					</Button>
				</div>
			</AlertDialogContent>
		</AlertDialog>
	)
}
