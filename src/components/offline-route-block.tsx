import { WifiOff } from "lucide-react"

/**
 * Se muestra cuando el usuario esta offline y no tiene datos cacheados para la
 * ruta actual (nunca la visito estando online). Le ofrece volver a la pagina
 * anterior (que si esta cacheada por el SW) en vez del error generico.
 */
export function OfflineRouteBlock() {
	return (
		<div className="min-w-0 flex-1 p-4 flex flex-col items-center justify-center gap-6 text-center">
			<WifiOff size={48} className="text-amber-500" />
			<div className="flex flex-col gap-2">
				<h2 className="text-xl font-bold">Sin conexion</h2>
				<p className="text-muted-foreground max-w-sm">
					No tenes datos guardados de esta pagina para ver offline. Volve a una
					pagina que ya tengas cargada o reconectate para verla.
				</p>
			</div>
			<div className="flex gap-2 items-center flex-wrap justify-center">
				<button
					type="button"
					onClick={() => window.history.back()}
					className="px-2 py-1 bg-gray-600 dark:bg-gray-700 rounded-sm text-white uppercase font-extrabold"
				>
					Volver
				</button>
				<button
					type="button"
					onClick={() => window.location.reload()}
					className="px-2 py-1 bg-gray-600 dark:bg-gray-700 rounded-sm text-white uppercase font-extrabold"
				>
					Reintentar
				</button>
			</div>
		</div>
	)
}
