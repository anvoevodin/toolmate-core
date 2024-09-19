import { Viewport } from './viewport'
import { Act } from '@toolmate/core'
import { State, StatePortal } from '../state'
import { FunctionComponent, useEffect, useState } from 'react'

export const ViewportContainer: FunctionComponent<{ statePortal: StatePortal; act: Act<State> }> = function ({
	statePortal,
	act,
}) {
	const [state, setState] = useState(statePortal.getState())

	function onSetState(state: State) {
		setState(state)
	}

	// Mount effect.
	useEffect(() => {
		statePortal.subscribers.push(onSetState)
		setState(statePortal.getState())
	}, [])

	// Unmount effect.
	useEffect(
		() => () => {
			statePortal.subscribers.splice(statePortal.subscribers.indexOf(onSetState), 1)
		},
		[]
	)

	return <Viewport state={state} act={act} />
}
