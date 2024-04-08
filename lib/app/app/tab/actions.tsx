import { produce } from 'solid-js/store'
import { getTabById } from './helper'
import { MainContext } from '../../mainContext/types'

export function setViewportState(mainContext: MainContext, tabId: number, viewportState: object) {
	mainContext.setState(
		produce((state) => {
			const tab = getTabById(state, tabId)
			if (!tab) {
				console.warn(`setViewportState: tab with id "${tabId}" does not exist`)
				return
			}
			tab.viewportState = viewportState
		})
	)
}
