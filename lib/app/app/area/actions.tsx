import { produce } from 'solid-js/store'
import { State, AreaState } from '../../../state'
import { getTabById, getNewTab } from '../tab/helper'
import { MainContext } from '../../mainContext/types'
import { Viewport } from '../../../plugins/viewport'

export function addNewArea(
	mainContext: MainContext,
	workspaceId: number,
	left: number,
	top: number,
	width: number,
	height: number
) {
	mainContext.setState(
		produce((s) => {
			const id = s.areaIdCounter++
			const workspace = s.workspaces.find((w) => w.id === workspaceId)
			if (!workspace) {
				throw new Error(`addNewArea: workspace with id ${workspaceId} does not exist`)
			}
			workspace.areas.push({ activeTabId: 0, height, width, left, top, id, tabs: [] })
			if (workspace.areas.length === 1) workspace.activeAreaId = id
		})
	)
}

export function addNewTab(mainContext: MainContext, areaId: number) {
	mainContext.setState(
		produce((state) => {
			for (let i = 0; i < state.workspaces.length; i++) {
				const workspace = state.workspaces[i]
				const area = workspace.areas.find((d) => d.id === areaId)
				if (area) {
					const newTabId = state.tabIdCounter++
					area.tabs.push(getNewTab(newTabId))
					area.activeTabId = newTabId
					break
				}
			}
		})
	)
}

export function getAreaById(state: State, areaId: number): AreaState | undefined {
	for (let i = 0; i < state.workspaces.length; i++) {
		const workspace = state.workspaces[i]
		const area = workspace.areas.find((d) => d.id === areaId)
		if (area) return area
	}
	return undefined
}

export function setAreaTabActive(mainContext: MainContext, areaId: number, tabId: number) {
	mainContext.setState(
		produce((state) => {
			const area = getAreaById(state, areaId)
			if (!area) {
				console.warn(`setAreaTabActive: area with id "${areaId}" does not exist`)
				return
			}
			area.activeTabId = tabId
		})
	)
}

export function setAreaTabViewport(mainContext: MainContext, tabId: number, viewport: Viewport) {
	mainContext.setState(
		produce((state) => {
			const tab = getTabById(state, tabId)
			if (!tab) {
				console.warn(`setAreaTabViewport: area with id "${tabId}" does not exist`)
				return
			}
			if (!tab) {
				console.warn(`setAreaTabViewport: area with id "${tabId}" does not exist`)
				return
			}
			tab.viewportId = viewport.id
			tab.viewportState = structuredClone(viewport.initialState)
		})
	)
}
