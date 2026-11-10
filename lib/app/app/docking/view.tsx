import './style.scss'
import { Component, Index, Show } from 'solid-js'
import { Icon } from '../components/icon'
import iconQuestionMark from '../../icons/questionMark'
import { getMinLength, SplitterInfo } from '../layout/helper'
import { LayoutNode } from '../../../state'
import { TabDragState } from './tabDrag'

/** Minimal size (px) an area can be squeezed to by dragging a splitter. */
const AREA_MIN_SIZE = 120

const percent = (value: number) => `${value * 100}%`

type SplittersProps = {
	splitters: SplitterInfo[]
	getWorkspaceElement: () => HTMLElement | undefined
	/** Must return the (unwrapped) split node located at the path. */
	getNode: (path: number[]) => LayoutNode | undefined
	onResize: (path: number[], index: number, size: number, nextSize: number) => void
}

/** Lines between areas that can be dragged to resize the areas. */
export const Splitters: Component<SplittersProps> = (props) => {
	return (
		<Index each={props.splitters}>
			{(splitter) => {
				let resize: { pointerId: number; move: (e: PointerEvent) => void } | undefined

				const onPointerDown = (e: PointerEvent & { currentTarget: HTMLDivElement }) => {
					const workspaceElement = props.getWorkspaceElement()
					const { path, index, direction, nodeLength } = splitter()
					const node = props.getNode(path)
					if (e.button !== 0 || resize || !workspaceElement || !node || node.type !== 'split') return
					e.preventDefault()

					const isRow = direction === 'row'
					const workspaceRect = workspaceElement.getBoundingClientRect()
					// Length (px) of the split node the splitter belongs to.
					const length = (isRow ? workspaceRect.width : workspaceRect.height) * nodeLength
					if (!(length > 0)) return
					const total = node.sizes.reduce((acc, value) => acc + value, 0) || 1
					const size = node.sizes[index]
					const nextSize = node.sizes[index + 1]
					const start = isRow ? e.clientX : e.clientY
					// How much (in units of sizes) the splitter can be moved back and forth.
					const toSize = (px: number) => (px / length) * total
					const min = Math.min(0, toSize(getMinLength(node.children[index], direction, AREA_MIN_SIZE)) - size)
					const max = Math.max(
						0,
						nextSize - toSize(getMinLength(node.children[index + 1], direction, AREA_MIN_SIZE))
					)

					resize = {
						pointerId: e.pointerId,
						move(moveEvent) {
							const delta = toSize((isRow ? moveEvent.clientX : moveEvent.clientY) - start)
							const clamped = Math.max(min, Math.min(max, delta))
							props.onResize(path, index, size + clamped, nextSize - clamped)
						},
					}
					e.currentTarget.setPointerCapture(e.pointerId)
					e.currentTarget.classList.add('toolmate-active')
				}

				const onPointerMove = (e: PointerEvent) => {
					if (resize && e.pointerId === resize.pointerId) resize.move(e)
				}

				const onPointerEnd = (e: PointerEvent & { currentTarget: HTMLDivElement }) => {
					if (!resize || e.pointerId !== resize.pointerId) return
					resize = undefined
					e.currentTarget.classList.remove('toolmate-active')
				}

				return (
					<div
						class={`toolmate-splitter toolmate-${splitter().direction}`}
						style={{
							left: percent(splitter().rect.left),
							top: percent(splitter().rect.top),
							width: percent(splitter().rect.width),
							height: percent(splitter().rect.height),
						}}
						onPointerDown={onPointerDown}
						onPointerMove={onPointerMove}
						onPointerUp={onPointerEnd}
						onPointerCancel={onPointerEnd}
						onLostPointerCapture={onPointerEnd}
					/>
				)
			}}
		</Index>
	)
}

const px = (value: number) => `${value}px`

/** Shows what is going to happen if the dragged tab is dropped right now + the tab itself near the pointer. */
export const TabDragPreview: Component<{ drag: TabDragState | undefined }> = (props) => {
	const target = () => props.drag?.target
	const sideTarget = () => {
		const t = target()
		return t?.type === 'side' ? t : undefined
	}
	const tabsTarget = () => {
		const t = target()
		return t?.type === 'tabs' ? t : undefined
	}
	const rectStyle = (t: NonNullable<ReturnType<typeof target>>) => ({
		left: px(t.rect.left),
		top: px(t.rect.top),
		width: px(t.rect.width),
		height: px(t.rect.height),
	})

	return (
		<Show when={props.drag}>
			{(drag) => (
				<>
					<Show when={sideTarget()}>
						{(t) => <div class="toolmate-drop-preview" style={rectStyle(t())} />}
					</Show>
					<Show when={tabsTarget()}>
						{(t) => <div class="toolmate-drop-marker" style={rectStyle(t())} />}
					</Show>
					<div
						class={`toolmate-drag-ghost ${target() ? '' : 'toolmate-no-target'}`}
						style={{ left: px(drag().x), top: px(drag().y) }}
					>
						<Icon content={drag().iconOuterHTML || iconQuestionMark} />
						<span>{drag().label}</span>
					</div>
				</>
			)}
		</Show>
	)
}
