import { redirect } from "@tanstack/react-router"

export async function protectedRoute(session: unknown) {
	if (typeof navigator !== "undefined" && !navigator.onLine) {
		return
	}

	if (!session) {
		throw redirect({ to: "/login" })
	}
}
