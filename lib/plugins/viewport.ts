import { Act } from '../types/action'

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
	 * Name of the icon e.g. 'cookie'.
	 * You can find available icons here https://tabler.io/icons.
	 */
	iconName: string
	initialState: State
	storageFilter?: string[]

	render(act: Act<State>, initialState: State): ViewportInstance
}
