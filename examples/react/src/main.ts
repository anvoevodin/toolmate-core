import './style.css'
import '@toolmate/core/style'
import { addPlugin, render } from '@toolmate/core'
import { getCoolEditorPlugin } from './plugins/coolEditor'

addPlugin(getCoolEditorPlugin())

render()
