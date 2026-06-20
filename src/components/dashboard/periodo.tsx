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
  const ahora = new Date()
  const mesActual = ahora.getMonth()
  const anioActual = ahora.getFullYear()

  const { mes: mesUrl, anio: anioUrl } = useSearch({ from: "/_protected/" })
  const navigate = useNavigate({ from: "/" })

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
		<div className="flex items-center gap-2">
			<Button variant="ghost" size="icon-xs" onClick={prev}>
				<ChevronLeft />
			</Button>
			<span className="text-sm font-semibold text-center select-none">
				{MESES[mes]} {String(anio).slice(2)}
			</span>
			<Button variant="ghost" size="icon-xs" onClick={next}>
				<ChevronRight />
			</Button>
		</div>
	)
}
