import { Act } from './action'

export type ViewportInstance = {
	element: HTMLDivElement
	onStateChange(state: object): void
	destroy: () => void

	onTargetStateChange?(state: object): void
	onStorageChange?: (path: string, file: unknown) => void
}

export type Viewport<State extends object = object> = {
	id: string
	title: string
	/**
	 * SVG of an icon as a string e.g. "<svg ...>...</svg>".
	 * You can find available icons here https://tabler.io/icons (use "Copy SVG" button).
	 */
	initialState: State
	iconOuterHTML?: string
	storageFilter?: string[]

	render(act: Act<State>, initialState: State): ViewportInstance
}
