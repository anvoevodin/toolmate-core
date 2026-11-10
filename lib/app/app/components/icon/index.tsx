import { Component, createEffect } from 'solid-js'
import questionMark from '../../../icons/questionMark'

export const Icon: Component<{ content: string; size?: number }> = (props) => {
	// eslint-disable-next-line solid/reactivity -- The size is not meant to be changed.
	const maxSize = props.size ?? 14
	const icon = document.createElement('div')
	icon.style.width = `${maxSize}px`
	icon.style.height = `${maxSize}px`
	icon.style.display = 'flex' // Otherwise the inline svg is aligned by the text baseline and shifts down.
	icon.style.flexShrink = '0'
	createEffect(() => {
		const dummy = document.createElement('div')
		try {
			dummy.innerHTML = props.content

			if (dummy.children.length > 1) {
				console.error('Too many children in "iconOuterHTML". Read docs (comment) for the property.')
				icon.innerHTML = questionMark
			} else if (!(dummy.children[0] instanceof SVGElement)) {
				console.error('The element in "iconOuterHTML" must be svg. Read docs (comment) for the property.')
				icon.innerHTML = questionMark
			} else {
				icon.innerHTML = props.content
			}
		} catch {
			console.error('Invalid html has been passed into "iconOuterHTML".')
			icon.innerHTML = questionMark
		}

		const svg = icon.children[0]
		svg.setAttribute('width', `${maxSize}`)
		svg.setAttribute('height', `${maxSize}`)
	})
	return icon
}
