import { useSuspenseQuery } from "@tanstack/react-query"
import { Link, useSearch } from "@tanstack/react-router"
import { pagosQueryOptions } from "queries/pagos/pagos-query"
import { Button } from "../ui/button"
import { Card, CardContent, CardTitle } from "../ui/card"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { useState } from "react"
import { Ellipsis, Pencil, Trash2 } from "lucide-react"
import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "../ui/alert-dialog"
import { PagoType } from "db/pagos/schema"
import DeleteForm from "./pagos-delete"
import { sortByPeriodo } from "@/lib/utils"
import { filteredItems } from "@/lib/utils"

export default function PagosList() {
	const { data: items } = useSuspenseQuery(pagosQueryOptions)
	const { "periodo-desde": periodoDesde, "periodo-hasta": periodoHasta } =
		useSearch({ from: "/admin/" })

	if (!items || items.length === 0) {
		return (
			<div className="flex flex-col items-center">
				<p>No hay items</p>

				<div className="flex items-center gap-2">
					<span>Por favor agregue un</span>
					<Link to="/admin/create-pago">
						<Button variant="link" className="text-base">
							nuevo pago
						</Button>
					</Link>
				</div>
			</div>
		)
	}
	const sortedItems = sortByPeriodo(
		filteredItems(items, periodoDesde, periodoHasta)
	)

	return (
		<div className="flex flex-col gap-3 w-3/4">
			{sortedItems.map(item => (
				<Card
					className="flex flex-col gap-0 w-full py-4 relative text-xs 2xl:text-base bg-accent"
					key={item.id}
				>
					<div className="absolute top-1/2 -translate-y-1/2 right-2">
						<DropdownMenuComponent item={item} />
					</div>
					<CardTitle></CardTitle>
					<CardContent className="flex gap-6 items-center">
						<span>Periodo: {item.periodo}</span>
						<span>Rubro: {item.rubro.toUpperCase()}</span>
						<span>Sector: {item.sector.toUpperCase()}</span>
						<span>Monto: {item.monto}</span>
						<span>Pagado: {item.pagado ? item.pagado : "No"}</span>
					</CardContent>
				</Card>
			))}
		</div>
	)
}

const DropdownMenuComponent = ({ item }: { item: PagoType }) => {
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
					<Link to={`/admin/edit-pago`} search={{ id: item.id }}>
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
	item: PagoType
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
				<DeleteForm item={item} setIsMenuOpen={setIsMenuOpen} />
			</AlertDialogContent>
		</AlertDialog>
	)
}
