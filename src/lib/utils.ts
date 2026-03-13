import { clsx, type ClassValue } from "clsx"
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
	return [...pagos].sort((a, b) => Number(a.periodo) - Number(b.periodo))
}
