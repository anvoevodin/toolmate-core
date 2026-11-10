import { produce } from 'solid-js/store'
import { MainContext } from '../../mainContext/types'
import { getNodeByPath } from './helper'

/** Sets sizes of the children `index` and `index + 1` of the split node located at the `path` (see `SplitterInfo`). */
export function resizeSplit(
	mainContext: MainContext,
	workspaceId: number,
	path: number[],
	index: number,
	size: number,
	nextSize: number
) {
	mainContext.setState(
		produce((state) => {
			const workspace = state.workspaces.find((w) => w.id === workspaceId)
			const node = getNodeByPath(workspace?.layout, path)
			if (!node || node.type !== 'split' || index + 1 >= node.sizes.length) {
				console.warn(`resizeSplit: there is no such split in the workspace with id "${workspaceId}"`)
				return
			}
			node.sizes[index] = size
			node.sizes[index + 1] = nextSize
		})
	)
}
