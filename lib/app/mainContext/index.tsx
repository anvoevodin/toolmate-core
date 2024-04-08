import { Component, createContext, useContext } from 'solid-js'
import { JSXElement } from 'solid-js'
import { createState } from '../../state'
import type { MainContext } from './types'

const MainContext = createContext<MainContext>()

export const MainProvider: Component<{ children?: JSXElement }> = (props) => {
	const { state, setState } = createState()

	const mainContext: MainContext = {
		state,
		setState,
	}

	return <MainContext.Provider value={mainContext}>{props.children}</MainContext.Provider>
}

export function useMainContext() {
	return useContext(MainContext)
}
