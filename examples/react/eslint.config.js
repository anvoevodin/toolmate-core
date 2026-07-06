import js from '@eslint/js'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import prettierRecommended from 'eslint-plugin-prettier/recommended'

export default [
	{
		ignores: ['dist'],
	},
	js.configs.recommended,
	...tsPlugin.configs['flat/recommended'],
	tsPlugin.configs['flat/eslint-recommended'],
	reactHooks.configs.flat['recommended-latest'],
	reactRefresh.configs.vite,
	prettierRecommended,
	{
		languageOptions: {
			parser: tsParser,
			parserOptions: {
				sourceType: 'module',
			},
			globals: {
				window: 'readonly',
				document: 'readonly',
				console: 'readonly',
			},
		},
		rules: {
			'@typescript-eslint/no-explicit-any': 'error',
			'@typescript-eslint/no-unused-vars': ['error', { args: 'all', argsIgnorePattern: '^_' }],
			'react-hooks/set-state-in-effect': 'warn',
		},
	},
]
