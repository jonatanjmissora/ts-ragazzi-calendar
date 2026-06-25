import { useSuspenseQuery } from "@tanstack/react-query"
import { Link, useNavigate, useSearch } from "@tanstack/react-router"
import { pagosPageQueryOptions } from "queries/pagos/pagos-query"
import { Button } from "../../ui/button"
import { Card, CardContent, CardTitle } from "../../ui/card"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "../../ui/dropdown-menu"
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationNext,
	PaginationPrevious,
} from "../../ui/pagination"
import { useState } from "react"
import { Ellipsis, Pencil } from "lucide-react"
import { PagoType } from "db/schema"
import { dateFormat } from "@/lib/utils"
import { BG_RUBROS } from "@/_constants"
import DeletePagoForm from "@/components/layout/pagos-delete"
import { DeleteItemAlertDialog } from "@/components/shared/delete-item-alert-dialog"

export default function PagosList({
	page,
	pageSize,
	periodoDesde,
	periodoHasta,
	rubro,
	sector,
}: {
	page: number
	pageSize: number
	periodoDesde?: string
	periodoHasta?: string
	rubro?: string
	sector?: string
}) {
	const navigate = useNavigate({ from: "/admin/pagos/" })
	const search = useSearch({ from: "/admin/pagos/" })

	const { data } = useSuspenseQuery(
		pagosPageQueryOptions(page, pageSize, {
			periodoDesde,
			periodoHasta,
			rubro,
			sector,
		})
	)

	const items = data.items
	const total = data.total
	const totalPages = Math.max(1, Math.ceil(total / pageSize))

	const goToPage = (p: number) => {
		navigate({ search: { ...search, page: p }, replace: true })
	}

	if (!items || items.length === 0) {
		return (
			<div className="flex flex-col items-center">
				<p>No hay items</p>
				<div className="flex items-center gap-2">
					<span>Por favor agregue un</span>
					<Link to="/admin/pagos/create-pago">
						<Button variant="link" className="text-base">
							nuevo pago
						</Button>
					</Link>
				</div>
			</div>
		)
	}

	return (
		<div className="flex flex-col gap-3 w-full overflow-x-auto">
			<div className="w-[200dvw] sm:w-full">
				<div className="w-full px-6 flex gap-6 items-center border-b-2 pb-2">
					<span className="w-30">Periodo</span>
					<span className="w-40">Rubro</span>
					<span className="w-40">Sector</span>
					<span className="w-40">Monto</span>
					<span className="w-40">Pagado</span>
				</div>
				{items.map(item => (
					<Card
						className={`flex flex-col gap-0 w-full py-4 relative text-xs 2xl:text-base ${BG_RUBROS[item.rubro as keyof typeof BG_RUBROS]}`}
						key={item.id}
					>
						<div className="absolute top-1/2 -translate-y-1/2 right-2">
							<DropdownMenuComponent item={item} />
						</div>
						<CardTitle></CardTitle>
						<CardContent className="flex gap-6 items-center">
							<span className="w-30">{dateFormat(String(item.periodo))}</span>
							<span className="w-40">{item.rubro.toUpperCase()}</span>
							<span className="w-40">{item.sector.toUpperCase()}</span>
							<span className="w-40">{item.monto}</span>
							<span className="w-40">
								{item.pagado ? dateFormat(String(item.pagado)) : "No"}
							</span>
						</CardContent>
					</Card>
				))}
			</div>

			<div className="flex items-center justify-center mt-4">
				<Pagination>
					<PaginationContent>
						<PaginationItem>
							<PaginationPrevious
								href="#"
								onClick={e => {
									e.preventDefault()
									goToPage(page - 1)
								}}
								className={page <= 1 ? "pointer-events-none opacity-50" : ""}
							/>
						</PaginationItem>
						{getPageNumbers(page, totalPages).map((p, i) => (
							<PaginationItem key={i}>
								{p === "..." ? (
									<PaginationEllipsis />
								) : (
									<Button
										variant={page === p ? "default" : "ghost"}
										size="icon"
										onClick={() => goToPage(p as number)}
										className={page === p ? "bg-primary text-primary-foreground" : ""}
									>
										{p}
									</Button>
								)}
							</PaginationItem>
						))}
						<PaginationItem>
							<PaginationNext
								href="#"
								onClick={e => {
									e.preventDefault()
									goToPage(page + 1)
								}}
								className={
									page >= totalPages ? "pointer-events-none opacity-50" : ""
								}
							/>
						</PaginationItem>
					</PaginationContent>
				</Pagination>
			</div>
		</div>
	)
}

const getPageNumbers = (current: number, total: number): (number | "...")[] => {
	const pages: (number | "...")[] = []
	const maxVisible = 5

	if (total <= maxVisible) {
		for (let i = 1; i <= total; i++) pages.push(i)
	} else {
		pages.push(1)
		if (current > 3) pages.push("...")

		const start = Math.max(2, current - 1)
		const end = Math.min(total - 1, current + 1)

		for (let i = start; i <= end; i++) pages.push(i)

		if (current < total - 2) pages.push("...")
		pages.push(total)
	}

	return pages
}

const DropdownMenuComponent = ({ item }: { item: PagoType }) => {
	const [isMenuOpen, setIsMenuOpen] = useState(false)
	return (
		<DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" className="cursor-pointer" aria-label="Opciones de pago">
					<Ellipsis size={14} />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				className="w-28 2xl:w-40 p-4 text-xs 2xl:text-base"
				align="end"
			>
				<DropdownMenuGroup>
					<Link to={`/admin/pagos/edit-pago`} search={{ id: item.id }}>
						<Button variant="ghost">
							<Pencil size={14} />
							Editar
						</Button>
					</Link>
					<DropdownMenuSeparator />
					<DeleteItemAlertDialog>
						<DeletePagoForm item={item} setIsMenuOpen={setIsMenuOpen} />
					</DeleteItemAlertDialog>
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
