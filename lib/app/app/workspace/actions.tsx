import { produce } from 'solid-js/store'
import { AreaState, WorkspaceState } from '../../../state'
import { MainContext } from '../../mainContext/types'

export function addNewWorkspace(mainContext: MainContext) {
	mainContext.setState(
		produce((s) => {
			const id = s.workspaceIdCounter++
			s.workspaces.push({ activeAreaId: 0, areas: [], id, name: `Workspace${id}` })
			s.currentWorkspaceId = id
		})
	)
}

export function removeWorkspace(mainContext: MainContext, id: number) {
	mainContext.setState(
		produce((s) => {
			const index = s.workspaces.findIndex((w) => w.id === id)
			if (index === -1) {
				console.warn(`removeWorkspace: workspace with id "${id}" does not exist`)
				return
			}
			s.workspaces.splice(index, 1)
			if (s.currentWorkspaceId === id) {
				// Switch to the neighbour: the next one or the previous one if the last one has been removed.
				const neighbour = s.workspaces[index] ?? s.workspaces[index - 1]
				s.currentWorkspaceId = neighbour ? neighbour.id : 0
			}
		})
	)
}

export function setWorkspaceCurrentId(mainContext: MainContext, id: number) {
	mainContext.setState({ currentWorkspaceId: id })
}

export function setActiveArea(mainContext: MainContext, areaId: number) {
	mainContext.setState(
		produce((s) => {
			let area: AreaState | undefined
			let workspace: WorkspaceState | undefined
			for (let i = 0; i < s.workspaces.length; i++) {
				const areaIndex = s.workspaces[i].areas.findIndex((d) => d.id === areaId)
				if (areaIndex !== -1) {
					workspace = s.workspaces[i]
					area = workspace.areas[areaIndex]
					break
				}
			}
			if (!workspace) {
				console.warn(`setActiveArea: there is no workplace that contains area with id "${areaId}"`)
				return
			}
			if (!area) {
				console.warn(`setActiveArea: area with id "${areaId}" does not exist in any workspace`)
				return
			}

			workspace.activeAreaId = areaId
		})
	)
}
