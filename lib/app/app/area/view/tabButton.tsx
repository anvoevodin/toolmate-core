import { Component } from 'solid-js'
import { Icon } from '../../components/icon'
import { ButtonClose } from '../../components/buttonClose'
import iconQuestionMark from '../../../icons/questionMark'

export type TabButtonProps = {
	label: string
	iconOuterHTML?: string
	isActive: boolean
	onClick: () => void
	onClose: () => void
}

export const TabButton: Component<TabButtonProps> = (props) => {
	return (
		<div
			class={`toolmate-tab-btn toolmate-closable ${props.isActive ? 'toolmate-active' : ''}`}
			onClick={() => props.onClick()}
		>
			<Icon content={props.iconOuterHTML || iconQuestionMark} />
			<span>{props.label}</span>
			<ButtonClose title="Close tab" onClick={() => props.onClose()} />
		</div>
	)
}
