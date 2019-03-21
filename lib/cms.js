import CMS from 'netlify-cms'
import injectPlugins from './inject-plugins'
import './preview-styles.css'

injectPlugins(CMS)
CMS.registerPreviewStyle(`cms.css`)

