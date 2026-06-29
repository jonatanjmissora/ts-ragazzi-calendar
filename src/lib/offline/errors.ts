/**
 * Se lanza cuando el usuario esta offline y NO hay datos cacheados en IndexedDB
 * para la consulta que intenta hacer (nunca visito esa ruta estando online).
 *
 * Es distinto de un error de red transitorio (online pero sin conexion momentanea)
 * porque sabemos que tampoco hay un cache al que caer.
 *
 * Las rutas lo detectan en su `errorComponent` para mostrar el
 * <OfflineRouteBlock/> en vez del error generico.
 */
export class OfflineNoCacheError extends Error {
	constructor(message = "Sin conexion y sin datos guardados para esta pagina") {
		super(message)
		this.name = "OfflineNoCacheError"
	}
}

export function isOfflineNoCacheError(error: unknown): error is OfflineNoCacheError {
	return error instanceof OfflineNoCacheError
}
