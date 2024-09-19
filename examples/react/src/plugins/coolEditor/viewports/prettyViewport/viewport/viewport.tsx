import { Act } from '@toolmate/core'
import { FunctionComponent } from 'react'
import { incrementCounter } from '../actions'
import { State } from '../state'

type ViewportProps = {
	state: State
	act: Act<State>
}
export const Viewport: FunctionComponent<ViewportProps> = function ({ state, act }) {
	return (
		<div style={{ margin: '5px' }}>
			<p style={{ margin: '5px 0px', padding: '5px' }}>Counter: {state.counter}</p>
			<button style={{ margin: '5px 0px', padding: '5px' }} onClick={() => act(incrementCounter())}>
				Increment
			</button>
		</div>
	)
}
