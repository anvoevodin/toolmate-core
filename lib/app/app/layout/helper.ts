import { LayoutNode, LayoutSplit } from '../../../state'

export type Side = 'left' | 'right' | 'top' | 'bottom'

/** All the values are fractions (0..1) of the workspace size. */
export type Rect = {
	left: number
	top: number
	width: number
	height: number
}

export type SplitterInfo = {
	/** Indexes of children that lead from the root to the split node the splitter belongs to. */
	path: number[]
	/** The splitter is located between the children `index` and `index + 1` of the split node. */
	index: number
	direction: LayoutSplit['direction']
	/** Rect of the line between the children (so either its width or its height is 0). */
	rect: Rect
	/** Size of the split node along its direction. */
	nodeLength: number
}

export type ComputedLayout = {
	areas: Map<number, Rect>
	splitters: SplitterInfo[]
}

function sum(values: number[]): number {
	return values.reduce((acc, value) => acc + value, 0)
}

export function computeLayout(root: LayoutNode | undefined): ComputedLayout {
	const result: ComputedLayout = { areas: new Map(), splitters: [] }

	const walk = (node: LayoutNode, rect: Rect, path: number[]) => {
		if (node.type === 'area') {
			result.areas.set(node.areaId, rect)
			return
		}
		const isRow = node.direction === 'row'
		const total = sum(node.sizes) || 1
		const nodeLength = isRow ? rect.width : rect.height
		let offset = 0
		node.children.forEach((child, i) => {
			const length = (node.sizes[i] / total) * nodeLength
			const childRect: Rect = isRow
				? { left: rect.left + offset, top: rect.top, width: length, height: rect.height }
				: { left: rect.left, top: rect.top + offset, width: rect.width, height: length }
			if (i > 0) {
				result.splitters.push({
					path,
					index: i - 1,
					direction: node.direction,
					rect: isRow
						? { left: childRect.left, top: rect.top, width: 0, height: rect.height }
						: { left: rect.left, top: childRect.top, width: rect.width, height: 0 },
					nodeLength,
				})
			}
			walk(child, childRect, [...path, i])
			offset += length
		})
	}

	if (root) walk(root, { left: 0, top: 0, width: 1, height: 1 }, [])
	return result
}

export function getNodeByPath(root: LayoutNode | undefined, path: number[]): LayoutNode | undefined {
	let node = root
	for (let i = 0; i < path.length; i++) {
		if (!node || node.type !== 'split') return undefined
		node = node.children[path[i]]
	}
	return node
}

/**
 * Returns a new layout where the area `newAreaId` is placed at the `side` of the area `targetAreaId`,
 * taking half of its space. Doesn't mutate the passed layout.
 */
export function splitLayout(root: LayoutNode, targetAreaId: number, newAreaId: number, side: Side): LayoutNode {
	const direction: LayoutSplit['direction'] = side === 'left' || side === 'right' ? 'row' : 'column'
	const isBefore = side === 'left' || side === 'top'
	const newNode: LayoutNode = { type: 'area', areaId: newAreaId }

	const walk = (node: LayoutNode): LayoutNode => {
		if (node.type === 'area') {
			if (node.areaId !== targetAreaId) return node
			return {
				type: 'split',
				direction,
				children: isBefore ? [newNode, node] : [node, newNode],
				sizes: [0.5, 0.5],
			}
		}
		const children: LayoutNode[] = []
		const sizes: number[] = []
		node.children.forEach((child, i) => {
			if (node.direction === direction && child.type === 'area' && child.areaId === targetAreaId) {
				// The split goes the same direction, so no need for a nested one.
				children.push(...(isBefore ? [newNode, child] : [child, newNode]))
				sizes.push(node.sizes[i] / 2, node.sizes[i] / 2)
			} else {
				children.push(walk(child))
				sizes.push(node.sizes[i])
			}
		})
		return { ...node, children, sizes }
	}

	return walk(root)
}

/**
 * Returns a new layout without the area `areaId`, its space is shared between its siblings.
 * Doesn't mutate the passed layout.
 */
export function removeFromLayout(root: LayoutNode | undefined, areaId: number): LayoutNode | undefined {
	const walk = (node: LayoutNode): LayoutNode | undefined => {
		if (node.type === 'area') return node.areaId === areaId ? undefined : node

		const children: LayoutNode[] = []
		const sizes: number[] = []
		node.children.forEach((child, i) => {
			const newChild = walk(child)
			if (!newChild) return
			if (newChild.type === 'split' && newChild.direction === node.direction) {
				// Happens when a nested split has collapsed into a split of the same direction as this one.
				const total = sum(newChild.sizes) || 1
				newChild.children.forEach((grandChild, j) => {
					children.push(grandChild)
					sizes.push((newChild.sizes[j] / total) * node.sizes[i])
				})
			} else {
				children.push(newChild)
				sizes.push(node.sizes[i])
			}
		})

		if (children.length === 0) return undefined
		if (children.length === 1) return children[0]
		const total = sum(sizes) || 1
		return { ...node, children, sizes: sizes.map((size) => size / total) }
	}

	return root ? walk(root) : undefined
}

/**
 * Minimal length (in the same units as `areaMinLength`) the node can have along the `direction`
 * so none of the areas inside of it is smaller than `areaMinLength`.
 */
export function getMinLength(node: LayoutNode, direction: LayoutSplit['direction'], areaMinLength: number): number {
	if (node.type === 'area') return areaMinLength
	const total = sum(node.sizes) || 1
	return Math.max(
		...node.children.map((child, i) => {
			const childMin = getMinLength(child, direction, areaMinLength)
			// Children share the length of the node proportionally to their sizes.
			return node.direction === direction ? childMin / (node.sizes[i] / total) : childMin
		})
	)
}
