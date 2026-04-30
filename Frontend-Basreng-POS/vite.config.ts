/// <reference types="vitest" />

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
	server: {
		port: 8100, // Ubah port menjadi 8100
		// proxy: {
		// 	'/api': {
		// 		target: 'https://api.rindapermai.com', // Ganti dengan URL backend
		// 		changeOrigin: true,
		// 		secure: false,
		// 	}
		// }
	},
	// preview: {
	// 	port: 8100, // Ubah port menjadi 8100
	// 	proxy: {
	// 		'/api': {
	// 			target: 'http://localhost:8080', // Ganti dengan URL backend
	// 			changeOrigin: true,
	// 			secure: false,
	// 		}
	// 	}
	// },
	optimizeDeps: {
		exclude: [`@ionic/pwa-elements/loader`],
	},
	build: {
		rollupOptions: {
			output: {
				manualChunks: {
					vendor: ['react', 'react-dom'],
					ionic: ['@ionic/react']
				},
				entryFileNames: `assets/[name]-[hash].js`,
				chunkFileNames: `assets/[name]-[hash].js`,
				assetFileNames: `assets/[name]-[hash].[ext]`
			}
		}
	},
	plugins: [
		react(),
		VitePWA({
			registerType: 'autoUpdate',
			manifest: {
				name: 'My PWA App',
				short_name: 'PWA App',
				theme_color: '#ffffff', // 🚀 WAJIB ditambahkan agar bisa diinstal
				background_color: '#ffffff',
				display: 'standalone',
				icons: [
					{
						src: '/icon.png',
						sizes: '192x192',
						type: 'image/png'
					},
					{
						src: '/icon.png',
						sizes: '512x512',
						type: 'image/png'
					}
				]
			},
			devOptions: {
				enabled: false
			},
			workbox: {
				globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
				runtimeCaching: [
					// ✅ Google Fonts
					{
						urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
						handler: 'CacheFirst',
						options: {
							cacheName: 'google-fonts',
							expiration: {
								maxEntries: 10,
								maxAgeSeconds: 60 * 60 * 24 * 365,
							},
						},
					},
					// ✅ Gambar lokal
					{
						urlPattern: ({ request }) => request.destination === 'image',
						handler: 'CacheFirst',
						options: {
							cacheName: 'images',
							expiration: {
								maxEntries: 100,
								maxAgeSeconds: 60 * 60 * 24 * 30,
							},
						},
					},
					// 🚫 API backend — jangan cache, langsung ambil dari server
					{
						urlPattern: ({ url }) => url.pathname.startsWith('/api'),
						handler: 'NetworkOnly',
						options: {
							cacheName: 'api-no-cache',
						},
					},
					// ✅ Static file (local assets JS, CSS, dsb)
					{
						urlPattern: ({ url }) =>
							url.origin === self.location.origin &&
							!url.pathname.startsWith('/api') &&
							!url.pathname.endsWith('.html'),
						handler: "CacheFirst",
						options: {
							cacheName: 'local-assets',
							expiration: {
								maxEntries: 100,
								maxAgeSeconds: 60 * 60 * 24 * 7,
							},
						},
					},
				],
				maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // 10MB
			}
		})
	],
	test: {
		globals: true,
		environment: 'jsdom',
		setupFiles: './src/setupTests.ts',
	}
});
