export type State = {
	counter: number
}

export type StatePortal = {
	getState: () => State
	subscribers: ((state: State) => void)[]
}

export const initialState: State = {
	counter: 1,
}
