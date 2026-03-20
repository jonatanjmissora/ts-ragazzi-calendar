import { useSuspenseQuery } from "@tanstack/react-query"
import { pagosByPeriodoQueryOptions } from "queries/pagos/pagos-query"
import { Suspense } from "react"
import { Ellipsis } from "lucide-react"
import { Button } from "../ui/button"
import { filteredItems, periodoConvert } from "@/lib/utils"
import DashboardFilter from "./dashboard-filter"
import { Link, useSearch } from "@tanstack/react-router"
import { Switch } from "../ui/switch"
import { BG_RUBROS } from "@/_constants"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { Pencil, Trash2 } from "lucide-react"
import { useState } from "react"
import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "../ui/alert-dialog"
import { PagoType } from "db/pagos/schema"
import DeletePagoForm from "../layout/pagos-delete"
import CheckPagoForm from "./check-pago-form"

export default function DashboardPagosPendientes() {
	const { rubro, sector } = useSearch({ from: "/_protected/" }) as {
		rubro?: string
		sector?: string
	}

	return (
		<article className="sm:w-3/4 2xl:w-2/3 mx-auto flex flex-col gap-4 p-6 border rounded-lg shadow bg-accent">
			<Suspense fallback={<div>...</div>}>
				<DashboardFilter rubro={rubro} sector={sector} />
			</Suspense>
			<GridContainer6 className=" text-lg font-semibold">
				<span></span>
				<span>vencimiento</span>
				<span>rubro</span>
				<span>sector</span>
				<span>monto</span>
				<span>menu</span>
			</GridContainer6>
			<Suspense fallback={<PagosSkelton />}>
				<PagosPendientesList rubro={rubro} sector={sector} />
			</Suspense>
		</article>
	)
}

function PagosPendientesList({
	rubro,
	sector,
}: {
	rubro?: string
	sector?: string
}) {
	const { data: pagosFromPeriodo } = useSuspenseQuery(
		pagosByPeriodoQueryOptions
	)

	const pagosPendientes = filteredItems(
		pagosFromPeriodo || [],
		undefined,
		undefined,
		rubro,
		sector
	).filter(item => item.pagado === 0)

	return (
		<div className="flex flex-col gap-2">
			{pagosPendientes?.reverse().map(item => (
				<GridContainer6
					key={item.id}
					rubro={item.rubro}
					className="my-1 py-1 rounded-lg shadow"
				>
					<Switch id="check" size="sm" className="mx-2" />
					<span>{periodoConvert(item.periodo)}</span>
					<span>{item.rubro.toUpperCase()}</span>
					<span>{item.sector.toUpperCase()}</span>
					<span>{item.monto}</span>
					<div className="flex justify-between gap-2">
						<CheckPagoForm itemId={item.id} />
						<DropdownMenuComponent item={item} />
					</div>
				</GridContainer6>
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
					<Link to="/pagos/edit-pago" search={{ id: item.id }}>
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
				<DeletePagoForm item={item} setIsMenuOpen={setIsMenuOpen} />
			</AlertDialogContent>
		</AlertDialog>
	)
}

const GridContainer6 = ({
	className,
	children,
	rubro,
}: {
	className?: string
	children: React.ReactNode
	rubro?: string
}) => {
	return (
		<div
			className={`grid grid-cols-[0.5fr_1fr_1fr_1fr_1fr_1fr] items-center gap-6 ${className} ${BG_RUBROS[rubro as keyof typeof BG_RUBROS]}`}
		>
			{children}
		</div>
	)
}

const PagosSkelton = () => {
	const backgrounds = {
		0: "bg-(--ragazzi)/65",
		1: "bg-(--palihue)/50",
		2: "bg-(--patricios)/35",
		3: "bg-(--jmolina)/20",
	} as const

	return (
		<div className="flex flex-col gap-2">
			{Array.from({ length: 4 }).map((_, index) => (
				<div
					key={Math.random()}
					className={`my-1 py-1 rounded-xl shadow h-11 ${backgrounds[index as keyof typeof backgrounds]}`}
				></div>
			))}
		</div>
	)
}
