import { produce } from 'solid-js/store'
import { AreaState, WorkspaceState } from '../../../state'
import { MainContext } from '../../mainContext/types'

export function addNewWorkspace(mainContext: MainContext) {
	mainContext.setState(
		produce((s) => {
			const id = s.workspaceIdCounter++
			s.workspaces.push({ activeAreaId: 0, areas: [], id, name: `Workspace${id}` })
			if (s.workspaces.length === 1) s.currentWorkspaceId = id
			s.currentWorkspaceId = id
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
