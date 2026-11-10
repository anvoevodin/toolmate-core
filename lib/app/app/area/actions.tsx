import { produce, unwrap } from 'solid-js/store'
import { State, AreaState, WorkspaceState } from '../../../state'
import { getTabById, getNewTab } from '../tab/helper'
import { MainContext } from '../../mainContext/types'
import { Viewport } from '../../../types/viewport'
import { removeFromLayout, Side, splitLayout } from '../layout/helper'

/** Adds the first area of a workspace. More areas appear when the user splits existing ones (see `moveTabToNewArea`). */
export function addNewArea(mainContext: MainContext, workspaceId: number) {
	mainContext.setState(
		produce((s) => {
			const workspace = s.workspaces.find((w) => w.id === workspaceId)
			if (!workspace) {
				throw new Error(`addNewArea: workspace with id ${workspaceId} does not exist`)
			}
			if (workspace.areas.length) {
				throw new Error(`addNewArea: workspace with id ${workspaceId} already has areas`)
			}
			const id = s.areaIdCounter++
			workspace.areas.push({ activeTabId: 0, id, tabs: [] })
			workspace.layout = { type: 'area', areaId: id }
			workspace.activeAreaId = id
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

type AreaLocation = { workspace: WorkspaceState; area: AreaState }

function findAreaLocation(state: State, predicate: (area: AreaState) => boolean): AreaLocation | undefined {
	for (let i = 0; i < state.workspaces.length; i++) {
		const workspace = state.workspaces[i]
		const area = workspace.areas.find(predicate)
		if (area) return { workspace, area }
	}
	return undefined
}

/** Must be called inside of `produce`. Removes the tab from the area and returns it. */
function detachTab(area: AreaState, tabId: number) {
	const index = area.tabs.findIndex((t) => t.id === tabId)
	const tab = area.tabs.splice(index, 1)[0]
	if (area.activeTabId === tabId) {
		// Switch to the neighbour: the next one or the previous one if the last one has been removed.
		const neighbour = area.tabs[index] ?? area.tabs[index - 1]
		area.activeTabId = neighbour ? neighbour.id : 0
	}
	return tab
}

/**
 * Must be called inside of `produce`. Removes the area if it has no tabs so its neighbours take its space.
 * The only area of a workspace is never removed.
 */
function removeAreaIfEmpty(workspace: WorkspaceState, area: AreaState) {
	if (area.tabs.length || workspace.areas.length <= 1) return
	const areaId = area.id
	workspace.areas.splice(
		workspace.areas.findIndex((a) => a.id === areaId),
		1
	)
	workspace.layout = removeFromLayout(unwrap(workspace.layout), areaId)
	if (workspace.activeAreaId === areaId) workspace.activeAreaId = workspace.areas[0].id
}

export function removeTab(mainContext: MainContext, areaId: number, tabId: number) {
	mainContext.setState(
		produce((state) => {
			const location = findAreaLocation(state, (a) => a.id === areaId)
			if (!location) {
				console.warn(`removeTab: area with id "${areaId}" does not exist`)
				return
			}
			if (!location.area.tabs.some((t) => t.id === tabId)) {
				console.warn(`removeTab: tab with id "${tabId}" does not exist in the area "${areaId}"`)
				return
			}
			detachTab(location.area, tabId)
			removeAreaIfEmpty(location.workspace, location.area)
		})
	)
}

/**
 * Moves the tab into the area `targetAreaId` (of the same workspace) so it gets the position `index` among
 * the tabs the area has at the moment of the call. Can be used to reorder tabs within an area as well.
 */
export function moveTab(mainContext: MainContext, tabId: number, targetAreaId: number, index: number) {
	mainContext.setState(
		produce((state) => {
			const source = findAreaLocation(state, (a) => a.tabs.some((t) => t.id === tabId))
			if (!source) {
				console.warn(`moveTab: tab with id "${tabId}" does not exist`)
				return
			}
			const target = source.workspace.areas.find((a) => a.id === targetAreaId)
			if (!target) {
				console.warn(`moveTab: area with id "${targetAreaId}" does not exist in the workspace of the tab`)
				return
			}
			const sourceIndex = source.area.tabs.findIndex((t) => t.id === tabId)
			let targetIndex = Math.max(0, Math.min(index, target.tabs.length))
			if (source.area === target) {
				if (targetIndex > sourceIndex) targetIndex-- // The tab itself is going to be removed before the position.
				if (targetIndex === sourceIndex) return
			}

			const tab = detachTab(source.area, tabId)
			target.tabs.splice(targetIndex, 0, tab)
			target.activeTabId = tabId
			source.workspace.activeAreaId = target.id
			removeAreaIfEmpty(source.workspace, source.area)
		})
	)
}

/** Splits the area `targetAreaId` (of the same workspace) in two and moves the tab into the new area at the `side`. */
export function moveTabToNewArea(mainContext: MainContext, tabId: number, targetAreaId: number, side: Side) {
	mainContext.setState(
		produce((state) => {
			const source = findAreaLocation(state, (a) => a.tabs.some((t) => t.id === tabId))
			if (!source) {
				console.warn(`moveTabToNewArea: tab with id "${tabId}" does not exist`)
				return
			}
			const workspace = source.workspace
			const layout = unwrap(workspace.layout)
			if (!layout || !workspace.areas.some((a) => a.id === targetAreaId)) {
				console.warn(
					`moveTabToNewArea: area with id "${targetAreaId}" does not exist in the workspace of the tab`
				)
				return
			}
			// Splitting an area by its only tab would give the same layout.
			if (source.area.id === targetAreaId && source.area.tabs.length === 1) return

			const newAreaId = state.areaIdCounter++
			const tab = detachTab(source.area, tabId)
			workspace.areas.push({ id: newAreaId, activeTabId: tabId, tabs: [tab] })
			workspace.layout = splitLayout(layout, targetAreaId, newAreaId, side)
			workspace.activeAreaId = newAreaId
			removeAreaIfEmpty(workspace, source.area)
		})
	)
}

export function getAreaById(state: State, areaId: number): AreaState | undefined {
	return findAreaLocation(state, (a) => a.id === areaId)?.area
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
				console.warn(`setAreaTabViewport: tab with id "${tabId}" does not exist`)
				return
			}
			tab.viewportId = viewport.id
			tab.viewportState = structuredClone(viewport.initialState)
		})
	)
}
