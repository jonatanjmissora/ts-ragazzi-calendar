import { clsx, type ClassValue } from "clsx"
import { PagoType, RubroType } from "db/schema"
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

export const localeDateToPeriodo = (date: Date = new Date()) => {
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
	return periodo
}

export function arrayIntersection<T>(arr1: T[], arr2: T[]) {
	const set1 = new Set(arr1)
	const set2 = new Set(arr2)
	return [...set1].filter(item => set2.has(item))
}

export function getRubrosFromPagosFromPeriodo(pagos: PagoType[]) {
	const rubrosResult = [
		{ nombre: "ragazzi", sectores: [] as string[] },
		{ nombre: "patricios", sectores: [] as string[] },
		{ nombre: "palihue", sectores: [] as string[] },
		{ nombre: "jmolina", sectores: [] as string[] },
	]
	pagos.forEach(pago => {
		const rubro = rubrosResult.find(r => r.nombre === pago.rubro)
		if (rubro) {
			rubro.sectores.push(pago.sector)
		}
	})
	return rubrosResult
}

export function getUnusedSectoresFromPeriodo(
	pagosFromPeriodo: PagoType[],
	rubros: RubroType[]
) {
	const rubrosFromPeriodo = getRubrosFromPagosFromPeriodo(pagosFromPeriodo)
	const unusedSectores = [
		{ nombre: "ragazzi", sectores: [] as string[] },
		{ nombre: "patricios", sectores: [] as string[] },
		{ nombre: "palihue", sectores: [] as string[] },
		{ nombre: "jmolina", sectores: [] as string[] },
	]
	unusedSectores.forEach((rubro, i) => {
		rubro.sectores = rubros[i].sectores
			.split(" ")
			.filter(sector => !rubrosFromPeriodo[i].sectores.includes(sector))
	})

	return unusedSectores
}

export function periodoConvert(periodo: number) {
	const periodoString = periodo.toString()
	const month = periodoString.slice(4, 6)
	const day = periodoString.slice(6, 8)
	return `${day}-${month}`
}
