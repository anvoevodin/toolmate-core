module.exports = {
	root: true,
	env: { browser: true, es2020: true },
	extends: [
		'eslint:recommended',
		'plugin:solid/typescript',
		'plugin:@typescript-eslint/recommended',
		'plugin:@typescript-eslint/eslint-recommended',
		'plugin:prettier/recommended',
	],
	ignorePatterns: ['dist', '.eslintrc.cjs'],
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaFeatures: {
			jsx: true,
		},
		sourceType: 'module',
		ecmaVersion: 2021,
	},
	plugins: ['@typescript-eslint', 'solid'],
	rules: {
		'@typescript-eslint/no-explicit-any': 'error',
		'@typescript-eslint/no-unused-vars': ['error', { args: 'all', argsIgnorePattern: '^_' }],
	},
}
