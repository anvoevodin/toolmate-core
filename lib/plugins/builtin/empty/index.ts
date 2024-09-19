import iconBan from '../../../app/icons/ban'
import type { Plugin } from '../../../types/plugin'

const plugin: Plugin = {
	viewports: [
		{
			id: 'empty',
			title: 'Empty',
			initialState: {},
			iconOuterHTML: iconBan,
			render(_act) {
				const element = document.createElement('p')
				element.style.margin = '5px'
				element.innerHTML = 'Empty viewport'
				return { element, onStateChange() {}, destroy() {} }
			},
		},
	],
}

export const EmptyPlugin = plugin
