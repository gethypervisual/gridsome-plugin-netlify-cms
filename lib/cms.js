import CMS from 'netlify-cms'
import injectPlugins from './inject-plugins'
import injectTemplates from './inject-templates'
import './preview-styles.css'

CMS.registerPreviewStyle('/assets/css/styles-for-netlify-cms.css')
CMS.registerPreviewStyle(`cms.css`)
injectPlugins(CMS)
injectTemplates(CMS)

