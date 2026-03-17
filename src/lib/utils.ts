import { clsx, type ClassValue } from "clsx"
import { PagoType } from "db/schema"
import { useEffect, useState } from "react"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

export async function delay() {
	return new Promise(resolve => setTimeout(resolve, 3000))
}

export function sortByPeriodo<T extends { periodo: number | bigint }>(
	pagos: T[]
) {
	return [...pagos].sort((a, b) => Number(b.periodo) - Number(a.periodo))
}

export function sortByName<T extends { nombre: string }>(pagos: T[]) {
	return [...pagos].sort((a, b) => b.nombre.localeCompare(a.nombre))
}

export function useDebouncedValue<T>(value: T, delay: number) {
	const [debounced, setDebounced] = useState(value)

	useEffect(() => {
		const id = setTimeout(() => {
			setDebounced(value)
		}, delay)

		return () => clearTimeout(id)
	}, [value, delay])

	return debounced
}

export function filteredItems(
	pagos: PagoType[],
	periodoDesde: string | undefined,
	periodoHasta: string | undefined,
	rubro: string | undefined,
	sector: string | undefined
) {
	let filteredResult = pagos.filter(item => {
		const periodo = Number(item.periodo)
		const desde = periodoDesde ? Number(periodoDesde) : undefined
		const hasta = periodoHasta ? Number(periodoHasta) : undefined

		// Si tengo desde y hasta
		if (desde !== undefined && hasta !== undefined && desde <= hasta) {
			return periodo >= desde && periodo <= hasta
		}

		// Si solo tengo desde
		if (desde !== undefined) {
			return periodo >= desde
		}

		// Si solo tengo hasta
		if (hasta !== undefined) {
			return periodo <= hasta
		}

		// Si no tengo ni desde ni hasta, retorno todos
		return true
	})

	if (rubro) {
		filteredResult = filteredResult.filter(item => item.rubro === rubro)
	}

	if (sector) {
		filteredResult = filteredResult.filter(item => item.sector === sector)
	}

	return filteredResult
}

export const localeDateToPeriodo = (date: Date) => {
	const periodo = Number(
		date
			.toLocaleDateString("es-ES", {
				year: "numeric",
				month: "2-digit",
				day: "2-digit",
			})
			.split("/")
			.reverse()
			.join("")
	)
	console.log("PERIODO", periodo)
	return periodo
}
