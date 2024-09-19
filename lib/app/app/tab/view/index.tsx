import { Component, createEffect } from 'solid-js'
import { useMainContext } from '../../../mainContext'
import { Act } from '../../../../main'
import { TabState } from '../../../../state'
import { setViewportState } from '../actions'
import { Viewport, ViewportInstance } from '../../../../types/viewport'

type TabProps = {
	viewport: Viewport
	state: TabState
}

export const Tab: Component<TabProps> = function (props) {
	const mainContext = useMainContext()
	if (!mainContext) {
		throw new Error(`mainContext is ${mainContext} in the Tab component`)
	}

	let viewportInstance: ViewportInstance | undefined

	let ref: HTMLDivElement | undefined
	let lastId: string | undefined

	createEffect(() => {
		if (lastId === props.viewport.id) {
			return
		}
		if (!ref) {
			throw new Error(`ref is ${ref} in Tab:createEffect`)
		}
		if (viewportInstance) {
			viewportInstance.destroy()
			viewportInstance = undefined
		}
		const act: Act = (action) => {
			const newState = action(props.state.viewportState)
			setViewportState(mainContext, props.state.id, newState)
		}
		viewportInstance = props.viewport.render(act, props.state.viewportState)
		ref.innerHTML = ''
		ref.appendChild(viewportInstance.element)
		lastId = props.viewport.id
	})

	createEffect(() => {
		if (!viewportInstance) {
			throw new Error(`viewportInstance is ${viewportInstance} in Tab:createEffect`)
		}
		viewportInstance.onStateChange(props.state.viewportState)
	})

	return <div class="toolmate-content" ref={ref} />
}
