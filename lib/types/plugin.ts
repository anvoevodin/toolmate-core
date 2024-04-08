import { Viewport } from '../plugins/viewport'
import { Auth } from './auth'

// I had to use "any" instead of "object" here to not trigger the error "Type 'object' is not assignable
// to type State" on the plugins' side. E.g. the following code would trigger the error:
// ```
// const SomeCoolViewport: Viewport<State> = { ... }
// const SomeCoolPlugin: Plugin = { viewports: [SomeCoolViewport] } // <- error, SomeCoolViewport's state is not object.
// ```
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Plugin<ViewportsStatesType extends object = any> = {
	auths?: Auth[]
	viewports?: Viewport<ViewportsStatesType>[]
}
