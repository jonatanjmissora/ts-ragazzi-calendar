import { defineConfig } from "vite"
import { devtools } from "@tanstack/devtools-vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import viteReact from "@vitejs/plugin-react"
import viteTsConfigPaths from "vite-tsconfig-paths"
import { fileURLToPath, URL } from "url"

import tailwindcss from "@tailwindcss/vite"
import { nitro } from "nitro/vite"

const config = defineConfig({
	resolve: {
		alias: {
			"@": fileURLToPath(new URL("./src", import.meta.url)),
		},
	},
	build: {
		rollupOptions: {
			output: {
				manualChunks(id) {
					if (
						id.includes("node_modules/react-dom") ||
						id.includes("node_modules/react/")
					)
						return "vendor-react"
					if (id.includes("node_modules/@tanstack/react-router"))
						return "vendor-router"
					if (id.includes("node_modules/@tanstack/react-query"))
						return "vendor-query"
					if (id.includes("node_modules/@tanstack/react-form"))
						return "vendor-form"
					if (id.includes("node_modules/better-auth")) return "vendor-auth"
					if (id.includes("node_modules/recharts")) return "vendor-charts"
				},
			},
		},
	},
	plugins: [
		devtools(),
		nitro(),
		tanstackStart(),
		// this is the plugin that enables path aliases
		viteTsConfigPaths({
			projects: ["./tsconfig.json"],
		}),
		tailwindcss(),
		viteReact(),
	],
})

export default config
