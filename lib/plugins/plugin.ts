import { Plugin } from '../types/plugin'
import { Auth } from '../types/auth'
import { Viewport } from './viewport'
import { EmptyPlugin } from './builtin/empty'

const authsMap: Map<string, Auth> = new Map()
const viewportsMap: Map<string, Viewport> = new Map()

export function addPlugin(plugin: Plugin) {
	if (plugin.auths) {
		plugin.auths.forEach((auth) => {
			authsMap.set(auth.id, auth)
		})
	}
	if (plugin.viewports) {
		plugin.viewports.forEach((viewport) => {
			viewportsMap.set(viewport.id, viewport)
		})
	}
}

export function getViewportsMap() {
	return viewportsMap
}

export function getAccessToken(authId: string, payload: unknown): Promise<unknown> {
	const auth = authsMap.get(authId)
	if (!auth) {
		throw new Error(`Toolmate:core:getAccessToken: Auth with id "${authId}" doesn't exist`)
	}
	return auth.getAccessToken(payload)
}

addPlugin(EmptyPlugin)
