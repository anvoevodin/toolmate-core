import { createStore } from 'solid-js/store'

export type TabState = {
	id: number
	viewportId: string
	viewportState: object

	targetTabId?: number
}

export type AreaState = {
	id: number
	top: number
	left: number
	width: number
	height: number
	activeTabId: number
	tabs: TabState[]
}

export type WorkspaceState = {
	id: number
	name: string
	activeAreaId: number
	areas: AreaState[]
}

export type State = {
	areaIdCounter: number
	tabIdCounter: number
	workspaceIdCounter: number
	currentWorkspaceId: number
	workspaces: WorkspaceState[]
}

export function createState() {
	const [state, setState] = createStore<State>({
		areaIdCounter: 1,
		tabIdCounter: 1,
		workspaceIdCounter: 1,
		currentWorkspaceId: 0,
		workspaces: [],
	})
	return { state, setState }
}
