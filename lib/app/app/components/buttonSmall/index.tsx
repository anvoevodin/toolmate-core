import './style.scss'
import { Component } from 'solid-js'

export type ButtonSmallProps = {
	iconName: string
	onClick: (e: MouseEvent & { currentTarget: HTMLElement; target: Element }) => void
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
			<i class={`ti ti-${props.iconName}`} />
		</button>
	)
}
