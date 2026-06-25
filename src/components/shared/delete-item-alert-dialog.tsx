import { Button } from "@/components/ui/button"
import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Trash2 } from "lucide-react"

export function DeleteItemAlertDialog({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button variant="ghost">
					<Trash2 size={14} />
					Borrar
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogTitle>Confirmar eliminación</AlertDialogTitle>
				<AlertDialogDescription>
					Esta acción no se puede deshacer.
				</AlertDialogDescription>
				{children}
			</AlertDialogContent>
		</AlertDialog>
	)
}
