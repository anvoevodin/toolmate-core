import { ContextMenu } from '@kobalte/core'
import { Component, Index, JSX } from 'solid-js'
import { Viewport } from '../../../../plugins/viewport'

type TabTypeChooserProps = {
	viewports: Map<string, Viewport>
	viewportId: string
	onChooseTabViewport: (viewport: Viewport) => void
	children?: JSX.Element
}

export const TabTypeChooser: Component<TabTypeChooserProps> = (props) => {
	return (
		<ContextMenu.Root>
			<ContextMenu.Trigger data-closed>{props.children}</ContextMenu.Trigger>
			<ContextMenu.Portal>
				<ContextMenu.Content class="context-menu__content">
					<ContextMenu.Group>
						<ContextMenu.GroupLabel class="context-menu__group-label">Viewports</ContextMenu.GroupLabel>
						<ContextMenu.Separator class="context-menu__separator" />
						<Index each={Array.from(props.viewports).map((v) => v[1])}>
							{(viewport) => (
								<ContextMenu.Item
									class="context-menu__radio-item"
									onSelect={() => props.onChooseTabViewport(viewport())}
									disabled={viewport().id === props.viewportId}
								>
									<ContextMenu.ItemIndicator class="context-menu__item-indicator" forceMount={true}>
										<i
											class={`icon ti ti-${viewport().iconName}`}
											style={{ 'font-size': `14px` }}
										/>
									</ContextMenu.ItemIndicator>
									{viewport().title}
								</ContextMenu.Item>
							)}
						</Index>
					</ContextMenu.Group>
				</ContextMenu.Content>
			</ContextMenu.Portal>
		</ContextMenu.Root>
	)
}
