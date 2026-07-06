import js from '@eslint/js'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import solid from 'eslint-plugin-solid'
import prettierRecommended from 'eslint-plugin-prettier/recommended'

export default [
	{
		ignores: ['dist', 'examples'],
	},
	js.configs.recommended,
	solid.configs['flat/typescript'],
	...tsPlugin.configs['flat/recommended'],
	tsPlugin.configs['flat/eslint-recommended'],
	prettierRecommended,
	{
		languageOptions: {
			parser: tsParser,
			parserOptions: {
				ecmaFeatures: {
					jsx: true,
				},
				sourceType: 'module',
				ecmaVersion: 2021,
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
		},
	},
]
