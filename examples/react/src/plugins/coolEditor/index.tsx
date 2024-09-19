import './style.css'
import { Plugin } from '@toolmate/core'
import { getPrettyViewport } from './viewports/prettyViewport'

export const getCoolEditorPlugin = (): Plugin => ({
	viewports: [getPrettyViewport()],
})
