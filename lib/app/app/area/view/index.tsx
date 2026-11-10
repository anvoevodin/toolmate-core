import './style.scss'
import { Component, Index, JSX } from 'solid-js'
import { addNewTab, removeTab, setAreaTabActive, setAreaTabViewport } from '../actions'
import { useMainContext } from '../../../mainContext'
import { TabState } from '../../../../state'
import { setActiveArea } from '../../workspace/actions'
import { TabTypeChooser } from '../../tab/view/tabTypeChooser'
import { ButtonSmall } from '../../components/buttonSmall'
import { Viewport } from '../../../../types/viewport'
import iconPlus from '../../../icons/plus'
import { TabButton } from './tabButton'

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
								<TabButton
									label={props.viewports.get(tab().viewportId)?.title ?? tab().viewportId}
									iconOuterHTML={props.viewports.get(tab().viewportId)?.iconOuterHTML}
									isActive={tab().id === props.activeTabId}
									onClick={() => {
										if (props.activeTabId === tab().id) return
										setAreaTabActive(mainContext, props.id, tab().id)
									}}
									onClose={() => removeTab(mainContext, props.id, tab().id)}
								/>
							</TabTypeChooser>
						)}
					</Index>
				</div>
				<div class="toolmate-right">
					<span class="toolmate-btn-plus">
						<ButtonSmall iconOuterHTML={iconPlus} onClick={() => addNewTab(mainContext, props.id)} />
					</span>
				</div>
			</div>
			{props.children}
		</div>
	)
}
