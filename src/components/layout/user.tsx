import { authClient } from "@/lib/auth-client"
import { useNavigate, useRouteContext } from "@tanstack/react-router"
import { useState } from "react"
import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "../ui/alert-dialog"
import { Button } from "../ui/button"

export default function User() {
	const { session } = useRouteContext({ from: "__root__" })
	const [open, setOpen] = useState(false)
	const navigate = useNavigate()
	if (!session) return

	const logout = async () => {
		await authClient.signOut({
			fetchOptions: {
				onSuccess: () => {
					// Redirect to home page after successful logout
					navigate({ to: "/login" })
					setOpen(false)
				},
			},
		})
	}

	return (
		<AlertDialog open={open} onOpenChange={setOpen}>
			<AlertDialogTrigger asChild className="m-4 hover:bg-accent">
				<button className="flex flex-col items-center gap-1 py-2 bg-accent">
					<p className="font-semibold text-center tracking-widest flex items-center gap-2">
						<span className="p-2 px-3 rounded-full bg-background">
							{session.user?.name?.charAt(0).toUpperCase()}
						</span>
						Bienvenido {session.user?.name}
					</p>
					<p className="flex justify-center text-xs text-muted-foreground">
						{session.user?.email}
					</p>
				</button>
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
