import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'
import dts from 'vite-plugin-dts'

export default defineConfig({
	plugins: [solid(), dts({ include: ['lib'] })],
	build: {
		lib: {
			entry: resolve(import.meta.dirname, 'lib/main.ts'),
			formats: ['es'],
		},
		rolldownOptions: {
			output: {
				assetFileNames: (asset) =>
					asset.name?.endsWith('.css') ? 'assets/style[extname]' : 'assets/[name][extname]',
				entryFileNames: '[name].js',
			},
		},
	},
})
