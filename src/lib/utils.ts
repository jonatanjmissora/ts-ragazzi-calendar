import { clsx, type ClassValue } from "clsx"
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
