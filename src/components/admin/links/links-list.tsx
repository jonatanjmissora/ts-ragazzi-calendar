import { useSuspenseQuery } from "@tanstack/react-query"
import { linksQueryOptions } from "queries/links/links-query"
import { Link } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Ellipsis, ExternalLink, Pencil } from "lucide-react"
import { useState } from "react"
import { LinkType } from "db/schema"
import DeleteLinkForm from "./links-delete"
import { DeleteItemAlertDialog } from "@/components/shared/delete-item-alert-dialog"

export default function LinksList() {
	const { data: items } = useSuspenseQuery(linksQueryOptions)

	if (!items || items.length === 0) {
		return (
			<div className="flex flex-col items-center">
				<p>No hay links</p>

				<div className="flex items-center gap-2">
					<span>Por favor agregue un</span>
					<Link to="/admin/links/create-link">
						<Button variant="link" className="text-base">
							nuevo link
						</Button>
					</Link>
				</div>
			</div>
		)
	}

	return (
		<div className="flex flex-col gap-3 w-full">
			{items.map(item => (
				<Card
					className="flex flex-col gap-0 w-full py-4 relative text-xs 2xl:text-base"
					key={item.id}
				>
					<div className="absolute -top-2 right-2">
						<DropdownMenuComponent item={item} />
					</div>
					<CardContent className="flex gap-4 items-center justify-around">
						{item.imagen && (
							<img
								src={item.imagen}
								alt={item.nombre}
								className="w-16 h-10 object-contain rounded-lg shrink-0"
							/>
						)}
						<span className="font-semibold truncate min-w-0">
							{item.nombre}
						</span>
						<a
							href={item.url}
							target="_blank"
							rel="noopener noreferrer"
							className="flex items-center gap-1 text-blue-400 hover:underline truncate min-w-0"
						>
							{item.url}
							<ExternalLink size={12} />
						</a>
					</CardContent>
				</Card>
			))}
		</div>
	)
}

const DropdownMenuComponent = ({ item }: { item: LinkType }) => {
	const [isMenuOpen, setIsMenuOpen] = useState(false)
	return (
		<DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					className="cursor-pointer"
					aria-label="Opciones de link"
				>
					<Ellipsis size={14} />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				className="w-28 2xl:w-40 p-4 text-xs 2xl:text-base"
				align="end"
			>
				<DropdownMenuGroup>
					<Link to={`/admin/links/edit-link`} search={{ id: item.id }}>
						<Button variant="ghost">
							<Pencil size={14} />
							Editar
						</Button>
					</Link>
					<DropdownMenuSeparator />
					<DeleteItemAlertDialog>
						<DeleteLinkForm item={item} setIsMenuOpen={setIsMenuOpen} />
					</DeleteItemAlertDialog>
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
