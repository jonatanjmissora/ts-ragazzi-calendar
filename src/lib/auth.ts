import { betterAuth } from "better-auth"
import { tanstackStartCookies } from "better-auth/tanstack-start"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import * as schema from "../../db/schema"

// Get base URL from environment variables
const baseURL = process.env.BETTER_AUTH_BASE_URL

// Database configuration
const databaseUrl = process.env.DATABASE_URL

interface AuthOptions {
	baseURL?: string
	emailAndPassword: {
		enabled: boolean
	}
	plugins: any[]
	database?: any
}

let authOptions: AuthOptions = {
	baseURL,
	emailAndPassword: {
		enabled: true,
	},
	plugins: [tanstackStartCookies()],
}

// Only add database configuration if DATABASE_URL is available
if (databaseUrl) {
	try {
		const client = neon(databaseUrl)
		const db = drizzle(client, { schema })

		authOptions.database = drizzleAdapter(db, {
			provider: "pg",
			schema: {
				user: schema.user,
				account: schema.account,
				session: schema.session,
				verification: schema.verification,
			},
		})

		console.log("✅ Better Auth: Base de datos configurada correctamente")
	} catch (error) {
		console.error("❌ Better Auth: Error configurando la base de datos:", error)
		console.warn("⚠️ Better Auth: Funcionará sin persistencia de datos")
	}
} else {
	console.warn(
		"⚠️ Better Auth: DATABASE_URL no configurada. Funcionará sin persistencia de datos."
	)
	console.info(
		"💡 Para habilitar la persistencia, configura DATABASE_URL en tu archivo .env"
	)
}

export const auth = betterAuth(authOptions)
