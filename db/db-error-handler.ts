export async function dbOp<T>(
  operation: () => Promise<T>,
  context: string
): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    const stack = error instanceof Error ? error.stack : undefined
    console.error(`[DB ERROR] ${context}: ${message}`)
    if (stack) console.error(stack)
    throw new Error(`Error en base de datos (${context})`)
  }
}
