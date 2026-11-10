import { createSignal, onCleanup } from 'solid-js'
import { Side } from '../layout/helper'

/** All the values are in pixels, relative to the workspace element. */
export type PixelRect = {
	left: number
	top: number
	width: number
	height: number
}

export type DropTarget =
	| {
			/** The tab is going to be inserted into the tabs panel of the area at the position `index`. */
			type: 'tabs'
			areaId: number
			index: number
			/** Where to show the insertion marker. */
			rect: PixelRect
	  }
	| {
			/** The area is going to be split, the tab is going to be moved into a new area at the `side`. */
			type: 'side'
			areaId: number
			side: Side
			/** The space the new area is going to take. */
			rect: PixelRect
	  }

export type DraggedTab = {
	tabId: number
	areaId: number
	label: string
	iconOuterHTML?: string
}

export type TabDragState = DraggedTab & {
	/** Position of the pointer in the viewport (client) coordinates. */
	x: number
	y: number
	target?: DropTarget
}

type TabDragOptions = {
	getWorkspaceElement: () => HTMLElement | undefined
	getTabsCount: (areaId: number) => number
	onDrop: (tab: DraggedTab, target: DropTarget) => void
}

/** How far (px) the pointer must go with the pressed button to start dragging (so clicks are still clicks). */
const DRAG_THRESHOLD = 5
/** A tab snaps to a side of an area when the pointer is closer to it than this part of the area's size... */
const SIDE_ZONE_FRACTION = 0.33
/** ...but not farther than this amount of pixels. */
const SIDE_ZONE_MAX = 140

export function findDropTarget(
	workspaceElement: HTMLElement,
	x: number,
	y: number,
	tab: DraggedTab,
	sourceTabsCount: number
): DropTarget | undefined {
	const origin = workspaceElement.getBoundingClientRect()
	const toLocal = (left: number, top: number, width: number, height: number): PixelRect => ({
		left: left - origin.left,
		top: top - origin.top,
		width,
		height,
	})
	const contains = (r: DOMRect) => x >= r.left && x < r.right && y >= r.top && y < r.bottom

	const areaElements = workspaceElement.querySelectorAll<HTMLElement>(':scope > .toolmate-area')
	for (let i = 0; i < areaElements.length; i++) {
		const areaElement = areaElements[i]
		const areaRect = areaElement.getBoundingClientRect()
		if (!contains(areaRect)) continue
		const areaId = Number(areaElement.dataset.areaId)

		const header = areaElement.querySelector<HTMLElement>(':scope > .toolmate-header')
		const headerRect = header?.getBoundingClientRect()
		if (header && headerRect && y < headerRect.bottom) {
			// Over the tabs panel: the tab is going to be placed before the first tab which center is after the pointer.
			const tabRects = Array.from(header.querySelectorAll<HTMLElement>('.toolmate-tab-btn')).map((element) =>
				element.getBoundingClientRect()
			)
			let index = tabRects.findIndex((r) => x < r.left + r.width / 2)
			if (index === -1) index = tabRects.length
			const gap = 2
			let markerX = headerRect.left
			if (index < tabRects.length) markerX = tabRects[index].left - gap
			else if (tabRects.length) markerX = tabRects[tabRects.length - 1].right
			return {
				type: 'tabs',
				areaId,
				index,
				rect: toLocal(markerX, headerRect.top + 2, gap, headerRect.height - 4),
			}
		}

		// Splitting an area by its only tab would give the same layout.
		if (areaId === tab.areaId && sourceTabsCount <= 1) return undefined

		// Over the content: snap to the closest side if it's close enough.
		const contentTop = headerRect ? headerRect.bottom : areaRect.top
		const zoneX = Math.min(areaRect.width * SIDE_ZONE_FRACTION, SIDE_ZONE_MAX)
		const zoneY = Math.min((areaRect.bottom - contentTop) * SIDE_ZONE_FRACTION, SIDE_ZONE_MAX)
		const candidates: [Side, number][] = [
			['left', (x - areaRect.left) / zoneX],
			['right', (areaRect.right - x) / zoneX],
			['top', (y - contentTop) / zoneY],
			['bottom', (areaRect.bottom - y) / zoneY],
		]
		const [side, distance] = candidates.reduce((closest, candidate) =>
			candidate[1] < closest[1] ? candidate : closest
		)
		if (!(distance < 1)) return undefined

		const halfWidth = areaRect.width / 2
		const halfHeight = areaRect.height / 2
		let rect: PixelRect
		if (side === 'left') rect = toLocal(areaRect.left, areaRect.top, halfWidth, areaRect.height)
		else if (side === 'right') rect = toLocal(areaRect.left + halfWidth, areaRect.top, halfWidth, areaRect.height)
		else if (side === 'top') rect = toLocal(areaRect.left, areaRect.top, areaRect.width, halfHeight)
		else rect = toLocal(areaRect.left, areaRect.top + halfHeight, areaRect.width, halfHeight)
		return { type: 'side', areaId, side, rect }
	}
	return undefined
}

/** Handles dragging of tabs (by pointer events). Must be called during creation of a component. */
export function createTabDrag(options: TabDragOptions) {
	const [drag, setDrag] = createSignal<TabDragState>()

	let pending: { tab: DraggedTab; startX: number; startY: number; pointerId: number } | undefined

	const stop = () => {
		pending = undefined
		setDrag(undefined)
		window.removeEventListener('pointermove', onPointerMove)
		window.removeEventListener('pointerup', onPointerUp)
		window.removeEventListener('pointercancel', stop)
		window.removeEventListener('keydown', onKeyDown, true)
		window.removeEventListener('blur', stop)
		document.body.classList.remove('toolmate-dragging-tab')
	}

	/** The browser fires "click" when the button is released after dragging - it must not activate anything. */
	const swallowNextClick = () => {
		const swallowClick = (e: MouseEvent) => {
			e.stopPropagation()
			e.preventDefault()
		}
		window.addEventListener('click', swallowClick, { capture: true, once: true })
		setTimeout(() => window.removeEventListener('click', swallowClick, true), 0)
	}

	const onPointerMove = (e: PointerEvent) => {
		if (!pending || e.pointerId !== pending.pointerId) return
		if (!drag()) {
			if (Math.hypot(e.clientX - pending.startX, e.clientY - pending.startY) < DRAG_THRESHOLD) return
			document.body.classList.add('toolmate-dragging-tab')
		}
		const workspaceElement = options.getWorkspaceElement()
		const target = workspaceElement
			? findDropTarget(
					workspaceElement,
					e.clientX,
					e.clientY,
					pending.tab,
					options.getTabsCount(pending.tab.areaId)
				)
			: undefined
		setDrag({ ...pending.tab, x: e.clientX, y: e.clientY, target })
	}

	const onPointerUp = (e: PointerEvent) => {
		if (!pending || e.pointerId !== pending.pointerId) return
		const state = drag()
		const tab = pending.tab
		stop()
		if (!state) return // It was just a click.

		swallowNextClick()
		if (state.target) options.onDrop(tab, state.target)
	}

	const onKeyDown = (e: KeyboardEvent) => {
		if (e.key !== 'Escape' || !drag()) return
		e.preventDefault()
		e.stopPropagation()
		stop()
		// The button is still pressed.
		window.addEventListener('pointerup', swallowNextClick, { once: true })
	}

	const start = (e: PointerEvent, tab: DraggedTab) => {
		if (e.button !== 0 || !e.isPrimary || pending) return
		pending = { tab, startX: e.clientX, startY: e.clientY, pointerId: e.pointerId }
		window.addEventListener('pointermove', onPointerMove)
		window.addEventListener('pointerup', onPointerUp)
		window.addEventListener('pointercancel', stop)
		window.addEventListener('keydown', onKeyDown, true)
		window.addEventListener('blur', stop)
	}

	onCleanup(stop)

	return { drag, start }
}
