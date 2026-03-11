import { auth } from "./auth"

export async function protectedServerFn(request: Request) {
	const session = await auth.api.getSession({
		headers: request.headers,
	})

	if (!session) {
		throw new Response("Unauthorized", { status: 401 })
	}

	return session
}
