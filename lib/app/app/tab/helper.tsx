import { State, TabState } from '../../../state'

export function getTabById(state: State, tabId: number): TabState | undefined {
	for (let i = 0; i < state.workspaces.length; i++) {
		const workspace = state.workspaces[i]
		for (let j = 0; j < workspace.areas.length; j++) {
			const area = workspace.areas[j]
			const tab = area.tabs.find((a) => a.id === tabId)
			if (tab) return tab
		}
	}
	return undefined
}

export function getNewTab(id: number): TabState {
	return {
		id,
		viewportId: 'empty',
		viewportState: {},
	}
}
