import { createAuthClient } from "better-auth/react"
import { toast } from "sonner"

// Check if Better Auth base URL is configured
const checkBetterAuthConfig = () => {
	const baseURL = import.meta.env.VITE_BETTER_AUTH_BASE_URL

	if (!baseURL) {
		const warningMessage =
			"⚠️ Better Auth: Base URL no configurada. Por favor, configura VITE_BETTER_AUTH_BASE_URL en tu archivo .env para que los callbacks y redirecciones funcionen correctamente."

		// Also log to console for developers
		console.warn(warningMessage)
		console.info("Ejemplo: VITE_BETTER_AUTH_BASE_URL=http://localhost:3000")

		// Delay toast to ensure Toaster is mounted
		setTimeout(() => {
			toast.warning(warningMessage, {
				duration: 10000, // Show for 10 seconds
				id: "better-auth-missing-base-url", // Prevent duplicate toasts
			})
		}, 1000) // Wait 1 second before showing toast

		return false
	}

	return true
}

export const authClient = createAuthClient({
	baseURL: import.meta.env.VITE_BETTER_AUTH_BASE_URL,
})

// Check configuration on module load
checkBetterAuthConfig()
