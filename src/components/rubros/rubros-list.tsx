import { useSuspenseQuery } from "@tanstack/react-query"
import { rubrosQueryOptions } from "queries/rubros/rubros-query"
import { Link } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Ellipsis, Pencil, Trash2 } from "lucide-react"
import { useState } from "react"
import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { RubroType } from "db/schema"

export default function PagosList() {
	const { data: items } = useSuspenseQuery(rubrosQueryOptions)

	if (!items || items.length === 0) {
		return (
			<div className="flex flex-col items-center">
				<p>No hay items</p>

				<div className="flex items-center gap-2">
					<span>Por favor agregue un</span>
					<Link to="/admin/create-rubro">
						<Button variant="link" className="text-base">
							nuevo rubro
						</Button>
					</Link>
				</div>
			</div>
		)
	}

	return (
		<div className="flex flex-col gap-3 w-3/4">
			{items.map(item => (
				<Card
					className="flex flex-col gap-0 w-full py-4 relative text-xs 2xl:text-base"
					key={item.id}
				>
					<div className="absolute top-1/2 -translate-y-1/2 right-2">
						<DropdownMenuComponent item={item} />
					</div>
					<CardTitle></CardTitle>
					<CardContent className="flex gap-6 items-center">
						<span>Nombre: {item.nombre.toUpperCase()}</span>
						<span>Sectores: {item.sectores.toUpperCase()}</span>
					</CardContent>
				</Card>
			))}
		</div>
	)
}

const DropdownMenuComponent = ({ item }: { item: RubroType }) => {
	const [isMenuOpen, setIsMenuOpen] = useState(false)
	return (
		<DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" className="cursor-pointer">
					<Ellipsis size={14} />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				className="w-28 2xl:w-40 p-4 text-xs 2xl:text-base"
				align="end"
			>
				<DropdownMenuGroup>
					<Link to={`/admin/edit-rubro`} search={{ id: item.id }}>
						<Button variant="ghost">
							<Pencil size={14} />
							Editar
						</Button>
					</Link>
					<DropdownMenuSeparator />
					<DeleteItemAlertDialog item={item} setIsMenuOpen={setIsMenuOpen} />
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}

export function DeleteItemAlertDialog({
	item,
	setIsMenuOpen,
}: {
	item: RubroType
	setIsMenuOpen: (open: boolean) => void
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
				<AlertDialogTitle></AlertDialogTitle>
				<AlertDialogDescription></AlertDialogDescription>
				{/* <DeleteForm item={item} setIsMenuOpen={setIsMenuOpen} /> */}
				Delete
			</AlertDialogContent>
		</AlertDialog>
	)
}
