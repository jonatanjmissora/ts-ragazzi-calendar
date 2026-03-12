import {
	Link,
	useNavigate,
	useRouteContext,
	useRouter,
} from "@tanstack/react-router"
import { LogOut, Monitor, Moon, Sun } from "lucide-react"
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

export default function Header() {
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
		<header className="py-8 w-[90%] 2xl:w-[80%] mx-auto">
			<nav className="flex items-center justify-between">
				<Link to="/" className="text-xl font-semibold">
					Logo
				</Link>

				<Link to="/admin">Admin</Link>

				{session ? (
					<DropdownMenuDemo
						name={session.user?.name}
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
			</nav>
		</header>
	)
}

export function DropdownMenuDemo({
	name,
	theme,
	toggleTheme,
}: {
	name: string
	theme: "light" | "dark" | "auto"
	toggleTheme: () => void
}) {
	const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

	return (
		<DropdownMenu open={isUserMenuOpen} onOpenChange={setIsUserMenuOpen}>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" className="cursor-pointer">
					Bienvenido {name}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-40 p-4" align="end">
				<DropdownMenuGroup>
					<LogoutAlertDialog setUserMenuOpen={setIsUserMenuOpen} />
					<DropdownMenuSeparator />

					<button
						onClick={toggleTheme}
						className="w-[75%] m-4 hover:bg-accent p-2 rounded-sm flex items-center justify-end gap-2 text-sm cursor-pointer"
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
			<AlertDialogTrigger asChild className="w-[75%] m-4 hover:bg-accent">
				<span className="flex justify-end p-2 rounded-sm cursor-pointer text-sm items-center gap-2">
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
