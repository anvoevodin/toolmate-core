import questionMark from '../../../icons/questionMark'
import { Icon } from '../icon'
import './style.scss'
import { Component } from 'solid-js'

export type ButtonSmallProps = {
	onClick: (e: MouseEvent & { currentTarget: HTMLElement; target: Element }) => void
	iconOuterHTML?: string
	size?: number
	class?: string
}

export const ButtonSmall: Component<ButtonSmallProps> = (props) => {
	return (
		<button
			class={`small ${props.class ?? ''}`}
			onClick={(e) => {
				e.preventDefault()
				e.stopPropagation()
				props.onClick(e)
			}}
		>
			<Icon content={props.iconOuterHTML || questionMark} />
		</button>
	)
}
