import './style.scss'
import { Component } from 'solid-js'
import { Icon } from '../icon'
import iconX from '../../../icons/x'

export type ButtonCloseProps = {
	title?: string
	onClick: () => void
}

/**
 * Tiny cross that is meant to be placed inside a tab-like element that has the class "toolmate-closable".
 * It's visible only when the parent is hovered.
 */
export const ButtonClose: Component<ButtonCloseProps> = (props) => {
	return (
		<button
			class="toolmate-btn-close"
			title={props.title}
			onClick={(e) => {
				e.preventDefault()
				e.stopPropagation()
				props.onClick()
			}}
		>
			<Icon content={iconX} size={10} />
		</button>
	)
}
