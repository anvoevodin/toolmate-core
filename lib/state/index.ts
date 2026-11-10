import { createStore } from 'solid-js/store'

export type TabState = {
	id: number
	viewportId: string
	viewportState: object

	targetTabId?: number
}

export type AreaState = {
	id: number
	activeTabId: number
	tabs: TabState[]
}

export type LayoutArea = {
	type: 'area'
	areaId: number
}

export type LayoutSplit = {
	type: 'split'
	/** "row" - children are placed from left to right, "column" - from top to bottom. */
	direction: 'row' | 'column'
	children: LayoutNode[]
	/** Fractions of the split's space the children take. The order is the same as in `children`. */
	sizes: number[]
}

export type LayoutNode = LayoutArea | LayoutSplit

export type WorkspaceState = {
	id: number
	name: string
	activeAreaId: number
	areas: AreaState[]
	/** Tree that describes how the areas are placed. Every area has exactly one leaf here. */
	layout?: LayoutNode
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
