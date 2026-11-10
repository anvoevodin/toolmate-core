import './app.scss'
import { Component, createSignal, For, Index, Show } from 'solid-js'
import { Tab } from './tab/view'
import { useMainContext } from '../mainContext'
import { addNewWorkspace, removeWorkspace, setWorkspaceCurrentId } from './workspace/actions'
import { getWorkspaceById } from './workspace/helper'
import { State, WorkspaceState } from '../../state'
import { Area } from './area/view'
import { addNewArea, addNewTab, setAreaTabViewport } from './area/actions'
import { Viewport } from '../../types/viewport'
import { ButtonSmall } from './components/buttonSmall'
import { ButtonClose } from './components/buttonClose'
import { ConfirmDialog } from './components/confirmDialog'
import iconPlus from '../icons/plus'

type AppProps = {
	viewports: Map<string, Viewport>
}

export const App: Component<AppProps> = function (props) {
	const mainContext = useMainContext()
	if (!mainContext) {
		throw new Error(`mainContext is ${mainContext} in the App component`)
	}

	const addEmptyWorkspace = () => {
		const firstViewport = Array.from(props.viewports)[0][1]

		addNewWorkspace(mainContext)

		addNewArea(mainContext, mainContext.state.workspaceIdCounter - 1, 0, 0, 100, 100)
		addNewTab(mainContext, mainContext.state.areaIdCounter - 1)
		setAreaTabViewport(mainContext, mainContext.state.tabIdCounter - 1, firstViewport)
	}

	addEmptyWorkspace()

	const state = mainContext.state

	const onWorkspaceBtnClick = (workspaceId: number) => {
		setWorkspaceCurrentId(mainContext, workspaceId)
	}

	const [closingWorkspaceId, setClosingWorkspaceId] = createSignal<number>()
	const closingWorkspace = () => {
		const id = closingWorkspaceId()
		return id === undefined ? undefined : getWorkspaceById(state, id)
	}
	const closingWorkspaceTabsCount = () =>
		closingWorkspace()?.areas.reduce((count, area) => count + area.tabs.length, 0) ?? 0

	const onWorkspaceCloseClick = (workspace: WorkspaceState) => {
		// Nothing to lose when there are no tabs, so no confirmation is needed.
		if (workspace.areas.every((area) => area.tabs.length === 0)) {
			removeWorkspace(mainContext, workspace.id)
			return
		}
		setClosingWorkspaceId(workspace.id)
	}

	const isSaving = false
	const hasUnsaved = false

	return (
		<div id="toolmate-app">
			<div class="toolmate-panel-top">
				<div class="toolmate-workspaces-list">
					<For each={state.workspaces}>
						{(workspace) => (
							<div
								class={`toolmate-workspace-btn toolmate-closable ${workspace.id === state.currentWorkspaceId ? 'toolmate-active' : ''}`}
								onClick={() => onWorkspaceBtnClick(workspace.id)}
							>
								<Show when={isSaving}>
									<div class="toolmate-saving" />
								</Show>
								<span>{workspace.name}</span>
								<Show when={hasUnsaved}>
									<div class="toolmate-unsaved" />
								</Show>
								<ButtonClose title="Close workspace" onClick={() => onWorkspaceCloseClick(workspace)} />
							</div>
						)}
					</For>
					<span class="toolmate-btn-plus">
						<ButtonSmall iconOuterHTML={iconPlus} size={14} onClick={() => addEmptyWorkspace()} />
					</span>
				</div>
				<div class="toolmate-panel-top-extra" />
				<div class="toolmate-settings-list" />
			</div>
			<div class="toolmate-workspace">{getAreas(state, props.viewports)}</div>
			<ConfirmDialog
				open={closingWorkspace() !== undefined}
				title={`Close "${closingWorkspace()?.name}"?`}
				confirmLabel="Close"
				onConfirm={() => {
					const id = closingWorkspaceId()
					setClosingWorkspaceId(undefined)
					if (id !== undefined) removeWorkspace(mainContext, id)
				}}
				onCancel={() => setClosingWorkspaceId(undefined)}
			>
				{closingWorkspaceTabsCount() === 1
					? 'The tab opened in this workspace will be closed.'
					: `All ${closingWorkspaceTabsCount()} tabs opened in this workspace will be closed.`}
			</ConfirmDialog>
		</div>
	)
}

function getAreas(state: State, viewports: Map<string, Viewport>) {
	const workspace = getWorkspaceById(state, state.currentWorkspaceId)
	return (
		<Index each={workspace?.areas}>
			{(area) => (
				<Area {...area()} tabs={area().tabs} viewports={viewports}>
					<Show
						when={area().tabs.find((tab) => tab.id === area().activeTabId)}
						fallback={
							<Show
								when={area().tabs.length}
								fallback={<p class="toolmate-no-tabs">No tabs are opened</p>}
							>
								<p>The tab "{area().activeTabId}" doesn't exist</p>
							</Show>
						}
					>
						{(tab) => (
							<Show
								when={viewports.get(tab().viewportId)}
								fallback={
									<p>
										The tab "{area().activeTabId}" tries to use unknown viewport"
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
		</Index>
	)
}
