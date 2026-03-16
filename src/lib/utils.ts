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
	periodoDesdeSimbolo: ">" | "<" | "=" | undefined,
	periodoHasta: string | undefined
) {
	const result = pagos.filter(item => {
		const periodo = Number(item.periodo)
		const desde =
			Number(periodoDesde) < 20200000 ? 20200000 : Number(periodoDesde)
		const hasta =
			Number(periodoHasta) < desde ? undefined : Number(periodoHasta)

		if (periodoDesdeSimbolo === "=") {
			return periodo === desde
		} else if (periodoDesdeSimbolo === "<") {
			return periodo <= desde
		} else if (periodoDesdeSimbolo === ">") {
			if (hasta) {
				return periodo >= desde && periodo <= hasta
			}
			return periodo >= desde
		} else {
			return true
		}
	})
	return result
}
