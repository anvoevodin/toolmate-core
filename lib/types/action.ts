export type Act<State extends object = object> = (action: Action<State>) => void
export type Action<State extends object = object> = (state: State) => State
