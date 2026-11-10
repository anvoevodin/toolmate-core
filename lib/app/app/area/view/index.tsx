import './style.scss'
import { Component, Index, JSX } from 'solid-js'
import { addNewTab, removeTab, setAreaTabActive, setAreaTabViewport } from '../actions'
import { useMainContext } from '../../../mainContext'
import { AreaState } from '../../../../state'
import { setActiveArea } from '../../workspace/actions'
import { TabTypeChooser } from '../../tab/view/tabTypeChooser'
import { ButtonSmall } from '../../components/buttonSmall'
import { Viewport } from '../../../../types/viewport'
import { Rect } from '../../layout/helper'
import { DraggedTab } from '../../docking/tabDrag'
import iconPlus from '../../../icons/plus'
import { TabButton } from './tabButton'

export type AreaProps = {
	viewports: Map<string, Viewport>
	area: AreaState
	/** Where the area is located in the workspace. */
	rect: Rect | undefined
	/** Id of the tab that is being dragged by the user at the moment (if any). */
	draggedTabId: number | undefined
	onTabDragPointerDown: (e: PointerEvent, tab: DraggedTab) => void

	children?: JSX.Element
}

const percent = (value: number | undefined) => `${(value ?? 0) * 100}%`

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
			data-area-id={props.area.id}
			style={{
				top: percent(props.rect?.top),
				left: percent(props.rect?.left),
				width: percent(props.rect?.width),
				height: percent(props.rect?.height),
			}}
			onClick={() => {
				setActiveArea(mainContext, props.area.id)
			}}
		>
			<div class="toolmate-header">
				<div class="toolmate-left">
					<Index each={props.area.tabs}>
						{(tab) => {
							const viewport = () => props.viewports.get(tab().viewportId)
							const label = () => viewport()?.title ?? tab().viewportId
							return (
								<TabTypeChooser
									viewports={props.viewports}
									viewportId={tab().viewportId}
									onChooseTabViewport={(viewport: Viewport) =>
										onChooseTabViewport(tab().id, viewport)
									}
								>
									<TabButton
										label={label()}
										iconOuterHTML={viewport()?.iconOuterHTML}
										isActive={tab().id === props.area.activeTabId}
										isDragged={tab().id === props.draggedTabId}
										onClick={() => {
											if (props.area.activeTabId === tab().id) return
											setAreaTabActive(mainContext, props.area.id, tab().id)
										}}
										onClose={() => removeTab(mainContext, props.area.id, tab().id)}
										onDragPointerDown={(e) =>
											props.onTabDragPointerDown(e, {
												tabId: tab().id,
												areaId: props.area.id,
												label: label(),
												iconOuterHTML: viewport()?.iconOuterHTML,
											})
										}
									/>
								</TabTypeChooser>
							)
						}}
					</Index>
				</div>
				<div class="toolmate-right">
					<span class="toolmate-btn-plus">
						<ButtonSmall iconOuterHTML={iconPlus} onClick={() => addNewTab(mainContext, props.area.id)} />
					</span>
				</div>
			</div>
			{props.children}
		</div>
	)
}
