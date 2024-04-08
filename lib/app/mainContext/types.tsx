import { State } from '../../state'
import { SetStoreFunction } from 'solid-js/store'

export type MainContext = {
	state: State
	setState: SetStoreFunction<State>
}
