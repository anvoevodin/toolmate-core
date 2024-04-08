import './style.scss'
import { Component, Index, JSX } from 'solid-js'
import { addNewTab, setAreaTabActive, setAreaTabViewport } from '../actions'
import { useMainContext } from '../../../mainContext'
import { TabState } from '../../../../state'
import { setActiveArea } from '../../workspace/actions'
import { TabTypeChooser } from '../../tab/view/tabTypeChooser'
import { ButtonSmall } from '../../components/buttonSmall'
import { Viewport } from '../../../../plugins/viewport'

export type AreaProps = {
	viewports: Map<string, Viewport>

	id: number
	top: number
	left: number
	width: number
	height: number
	activeTabId: number
	tabs: TabState[]

	children?: JSX.Element
}

export const Area: Component<AreaProps> = (props) => {
	const mainContext = useMainContext()
	if (!mainContext) {
		throw new Error(`mainContext is ${mainContext} in the Area component`)
	}

	const onChooseTabViewport = (tabId: number, viewport: Viewport) => {
		setAreaTabViewport(mainContext, tabId, viewport)
	}

	return (
		<div
			class={`toolmate-area`}
			style={{
				top: `${props.top}%`,
				left: `${props.left}%`,
				width: `${props.width}%`,
				height: `${props.height}%`,
			}}
			onClick={() => {
				setActiveArea(mainContext, props.id)
			}}
		>
			<div class="toolmate-header">
				<div class="toolmate-left">
					<Index each={props.tabs}>
						{(tab) => (
							<TabTypeChooser
								viewports={props.viewports}
								viewportId={tab().viewportId}
								onChooseTabViewport={(viewport: Viewport) => onChooseTabViewport(tab().id, viewport)}
							>
								<ButtonSmall
									class={tab().id === props.activeTabId ? 'selected' : ''}
									iconName={props.viewports.get(tab().viewportId)?.iconName || 'question-mark'}
									onClick={() => {
										if (props.activeTabId === tab().id) return
										setAreaTabActive(mainContext, props.id, tab().id)
									}}
								/>
							</TabTypeChooser>
						)}
					</Index>
				</div>
				<div class="toolmate-right">
					<span class="toolmate-btn-plus">
						<ButtonSmall iconName="plus" onClick={() => addNewTab(mainContext, props.id)} />
					</span>
				</div>
			</div>
			{props.children}
		</div>
	)
}
