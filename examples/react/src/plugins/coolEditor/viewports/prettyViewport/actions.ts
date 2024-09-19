import { Action } from '@toolmate/core'
import { State } from './state'

export function incrementCounter(): Action<State> {
	return (state: State) => ({
		...state,
		counter: state.counter + 1,
	})
}
