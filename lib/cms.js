import CMS from 'netlify-cms'
import injectPlugins from './inject-plugins'
import './preview-styles.css'

CMS.registerPreviewStyle('/assets/css/styles-for-netlify-cms.css')
injectPlugins(CMS)
CMS.registerPreviewStyle(`cms.css`)

