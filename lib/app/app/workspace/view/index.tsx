import { Component, createMemo, For, Show } from 'solid-js'
import { unwrap } from 'solid-js/store'
import { useMainContext } from '../../../mainContext'
import { WorkspaceState } from '../../../../state'
import { Viewport } from '../../../../types/viewport'
import { Area } from '../../area/view'
import { moveTab, moveTabToNewArea } from '../../area/actions'
import { Tab } from '../../tab/view'
import { computeLayout, getNodeByPath } from '../../layout/helper'
import { resizeSplit } from '../../layout/actions'
import { createTabDrag } from '../../docking/tabDrag'
import { Splitters, TabDragPreview } from '../../docking/view'

type WorkspaceProps = {
	workspace: WorkspaceState
	viewports: Map<string, Viewport>
}

/** Areas of a workspace + everything for docking: splitters to resize the areas and drag and drop of tabs. */
export const Workspace: Component<WorkspaceProps> = (props) => {
	const mainContext = useMainContext()
	if (!mainContext) {
		throw new Error(`mainContext is ${mainContext} in the Workspace component`)
	}

	let element: HTMLDivElement | undefined

	const layout = createMemo(() => computeLayout(props.workspace.layout))

	const tabDrag = createTabDrag({
		getWorkspaceElement: () => element,
		getTabsCount: (areaId) => props.workspace.areas.find((a) => a.id === areaId)?.tabs.length ?? 0,
		onDrop(tab, target) {
			if (target.type === 'tabs') moveTab(mainContext, tab.tabId, target.areaId, target.index)
			else moveTabToNewArea(mainContext, tab.tabId, target.areaId, target.side)
		},
	})

	return (
		<div class="toolmate-workspace" ref={element}>
			<For each={props.workspace.areas}>
				{(area) => (
					<Area
						viewports={props.viewports}
						area={area}
						rect={layout().areas.get(area.id)}
						draggedTabId={tabDrag.drag()?.tabId}
						onTabDragPointerDown={tabDrag.start}
					>
						<Show
							when={area.tabs.find((tab) => tab.id === area.activeTabId)}
							fallback={
								<Show
									when={area.tabs.length}
									fallback={<p class="toolmate-no-tabs">No tabs are opened</p>}
								>
									<p>The tab "{area.activeTabId}" doesn't exist</p>
								</Show>
							}
						>
							{(tab) => (
								<Show
									when={props.viewports.get(tab().viewportId)}
									fallback={
										<p>
											The tab "{area.activeTabId}" tries to use unknown viewport "
											{tab().viewportId}"
										</p>
									}
								>
									{(viewport) => <Tab viewport={viewport()} state={tab()} />}
								</Show>
							)}
						</Show>
					</Area>
				)}
			</For>
			<Splitters
				splitters={layout().splitters}
				getWorkspaceElement={() => element}
				getNode={(path) => getNodeByPath(unwrap(props.workspace.layout), path)}
				onResize={(path, index, size, nextSize) =>
					resizeSplit(mainContext, props.workspace.id, path, index, size, nextSize)
				}
			/>
			<TabDragPreview drag={tabDrag.drag()} />
		</div>
	)
}
