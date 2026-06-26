import { defineConfig } from "vite"
import { devtools } from "@tanstack/devtools-vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import viteReact from "@vitejs/plugin-react"
import viteTsConfigPaths from "vite-tsconfig-paths"
import { fileURLToPath, URL } from "url"

import tailwindcss from "@tailwindcss/vite"
import { nitro } from "nitro/vite"
import { visualizer } from "rollup-plugin-visualizer"
import { VitePWA } from "vite-plugin-pwa"

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
				},
			},
		},
	},
	plugins: [
		devtools(),
		nitro(),
		tanstackStart(),
		viteTsConfigPaths({
			projects: ["./tsconfig.json"],
		}),
		tailwindcss(),
		VitePWA({
			registerType: "prompt",
			workbox: {
				globDirectory: ".output/public",
				globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}", "**/manifest.webmanifest"],
				swDest: ".output/public/sw.js",
				navigateFallback: "/",
				navigateFallbackDenylist: [/^\/api\//],
				runtimeCaching: [
					{
						urlPattern: /^https:\/\/.*\/api\/.*/i,
						handler: "NetworkFirst",
						options: {
							cacheName: "api-cache",
							expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 },
						},
					},
					{
						urlPattern: ({ request }) => request.mode === "navigate",
						handler: "NetworkFirst",
						options: {
							cacheName: "pages",
							expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 },
						},
					},
				],
			},
			manifest: {
				name: "Ragazzi",
				short_name: "Ragazzi",
				description: "App de gestión de pagos para vaquería",
				start_url: "/",
				display: "standalone",
				background_color: "#09090b",
				theme_color: "#09090b",
				orientation: "portrait-primary",
				icons: [
					{ src: "/logo192.png", sizes: "192x192", type: "image/png" },
					{ src: "/logo512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" },
				],
				screenshots: [
					{ src: "/screenshot-mobile.png", sizes: "390x844", type: "image/png", form_factor: "narrow" },
					{ src: "/screenshot-wide.png", sizes: "1280x720", type: "image/png", form_factor: "wide" },
				],
			},
		}),
		process.env.ANALYZE && visualizer({
			open: true,
			gzipSize: true,
			brotliSize: true,
			filename: "stats.html",
		}),
		viteReact(),
	].filter(Boolean),
})

export default config
