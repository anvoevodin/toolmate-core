import { Component } from 'solid-js'
import { Icon } from '../../components/icon'
import { ButtonClose } from '../../components/buttonClose'
import iconQuestionMark from '../../../icons/questionMark'

export type TabButtonProps = {
	label: string
	iconOuterHTML?: string
	isActive: boolean
	isDragged: boolean
	onClick: () => void
	onClose: () => void
	/** The tab can be dragged, it's called when the user presses the button (but not its close button). */
	onDragPointerDown: (e: PointerEvent) => void
}

export const TabButton: Component<TabButtonProps> = (props) => {
	return (
		<div
			class="toolmate-tab-btn toolmate-closable"
			classList={{ 'toolmate-active': props.isActive, 'toolmate-dragged': props.isDragged }}
			onClick={() => props.onClick()}
			onPointerDown={(e) => {
				if (e.target instanceof Element && e.target.closest('.toolmate-btn-close')) return
				props.onDragPointerDown(e)
			}}
		>
			<Icon content={props.iconOuterHTML || iconQuestionMark} />
			<span>{props.label}</span>
			<ButtonClose title="Close tab" onClick={() => props.onClose()} />
		</div>
	)
}
