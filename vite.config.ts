import { resolve } from 'path'
import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'
import dts from 'vite-plugin-dts'

export default defineConfig({
	plugins: [solid(), dts({ include: ['lib'] })],
	build: {
		lib: {
			entry: resolve(__dirname, 'lib/main.ts'),
			formats: ['es'],
		},
		rollupOptions: {
			output: {
				assetFileNames: 'assets/[name][extname]',
				entryFileNames: '[name].js',
			},
		},
	},
})
