import { redirect } from "@tanstack/react-router"
import type { Session } from "better-auth"

export async function adminRoute(session?: Session | null) {
	if (!session || session.user?.id !== "mn9ffipQ0t54YPhuJ3gaYfu5XKp0mN3y") {
		throw redirect({ to: "/" })
	}
	return session
}
