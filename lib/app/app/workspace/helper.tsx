import { State } from '../../../state'

export function getWorkspaceById(state: State, workspaceId: number) {
	return state.workspaces.find(function (f) {
		return f.id === workspaceId
	})
}
