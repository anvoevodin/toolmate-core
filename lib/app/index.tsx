import './style/root.scss'
import './style/defaults.scss'
import './style/context-menu.scss'

import { render as solidjsRender } from 'solid-js/web'

import { App } from './app/app'
import { MainProvider } from './mainContext'
import { getViewportsMap } from '../plugins/plugin'

let isRendered = false

export function render() {
	if (isRendered) {
		console.warn(`render() was already called before. Ignoring this call.`)
		return
	}
	const rootElement = document.createElement('div')
	rootElement.id = 'toolmate-root-container'
	document.body.append(rootElement)

	solidjsRender(
		() => (
			<MainProvider>
				<App viewports={getViewportsMap()} />
			</MainProvider>
		),
		document.getElementById(rootElement.id) as HTMLElement
	)

	isRendered = true
}
