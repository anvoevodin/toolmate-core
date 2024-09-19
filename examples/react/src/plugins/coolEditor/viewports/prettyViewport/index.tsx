import ReactDOM from 'react-dom/client'
import { Viewport } from '@toolmate/core'
import { State, StatePortal, initialState } from './state'
import { ViewportContainer } from './viewport'
import icon from './icon'

export const getPrettyViewport = (): Viewport<State> => ({
	id: 'cool-editor-pretty-viewport',
	title: 'Pretty Viewport',
	initialState,
	iconOuterHTML: icon,
	render(act, initialState) {
		const root = document.createElement('div')
		const reactRoot = ReactDOM.createRoot(root)

		let lastState = initialState
		const statePortal: StatePortal = {
			subscribers: [],
			getState: () => {
				return lastState
			},
		}
		reactRoot.render(<ViewportContainer statePortal={statePortal} act={act} />)

		return {
			element: root,
			onStateChange(state: State) {
				lastState = state
				statePortal.subscribers.forEach((func) => func(lastState))
			},
			destroy() {
				reactRoot.unmount()
			},
		}
	},
})
