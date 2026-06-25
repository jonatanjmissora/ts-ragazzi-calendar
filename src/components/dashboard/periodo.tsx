import { useEffect, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "../ui/button"
import { useNavigate, useSearch } from "@tanstack/react-router"

const MESES = [
	"ENERO",
	"FEBRERO",
	"MARZO",
	"ABRIL",
	"MAYO",
	"JUNIO",
	"JULIO",
	"AGOSTO",
	"SEPTIEMBRE",
	"OCTUBRE",
	"NOVIEMBRE",
	"DICIEMBRE",
]

export default function Periodo() {
	const { mes: mesUrl, anio: anioUrl } = useSearch({ from: "/_protected/" })
	const navigate = useNavigate({ from: "/" })

	const [ahora, setAhora] = useState<Date | null>(null)
	useEffect(() => { setAhora(new Date()) }, [])

	const mesActual = ahora?.getMonth() ?? 0
	const anioActual = ahora?.getFullYear() ?? 2026

	const mes = mesUrl ?? mesActual
	const anio = anioUrl ?? anioActual

	const setPeriodo = (nuevoMes: number, nuevoAnio: number) => {
		const esVigente = nuevoMes === mesActual && nuevoAnio === anioActual
		navigate({
			search: prev => ({
				...prev,
				mes: esVigente ? undefined : nuevoMes,
				anio: esVigente ? undefined : nuevoAnio,
			}),
			replace: true,
		})
	}

	const prev = () => {
		if (mes === 0) setPeriodo(11, anio - 1)
		else setPeriodo(mes - 1, anio)
	}

	const next = () => {
		if (mes === 11) setPeriodo(0, anio + 1)
		else setPeriodo(mes + 1, anio)
	}

	return (
		<div className="flex items-center gap-2 w-54 justify-between">
			<Button variant="ghost" onClick={prev} aria-label="Mes anterior">
				<ChevronLeft className="size-6" />
			</Button>
			<span className="text-sm font-semibold text-center select-none" suppressHydrationWarning>
				{MESES[mes]} {String(anio).slice(2)}
			</span>
			<Button variant="ghost" onClick={next} aria-label="Mes siguiente">
				<ChevronRight className="size-6" />
			</Button>
		</div>
	)
}
