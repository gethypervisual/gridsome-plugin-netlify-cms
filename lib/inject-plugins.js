module.exports = function({pluginNames}) {
  
  if(!Array.isArray(pluginNames)) { pluginNames = [] }

  let code = pluginNames.map((pluginName, i) => `import plugin_${i} from '${pluginName}' `).join(`\n`)

  code += `
export default function(CMS) {
  if(typeof CMS !== 'object') { return; }
  ${pluginNames.map((pluginName, i) => `  if(plugin_${i} && typeof plugin_${i}.attachToCMS === 'function') {
    plugin_${i}.attachToCMS(CMS)
  } else {
    injectKnownPlugin(CMS, '${pluginName}', plugin_${i})
  }`).join(`\n\n`)}
}

function injectKnownPlugin(CMS, pluginName, plugin) {
  switch(pluginName) {
  
    case "netlify-cms-widget-youtube":
      CMS.registerWidget("youtube", window.youtubeControl, window.youtubePreview)
      break;
    
    case "netlify-cms-widget-fontawesome":
      CMS.registerWidget(
        'fontawesome',
        plugin.Solid,
        plugin.Preview,
      )
      CMS.registerWidget(
        'fontawesome-solid',
        plugin.Solid,
        plugin.Preview,
      )
      CMS.registerWidget(
        'fontawesome-regular',
        plugin.Regular,
        plugin.Preview,
      )
      CMS.registerWidget(
        'fontawesome-brands',
        plugin.Brands,
        plugin.Preview,
      )
      break;
    
    case "netlify-cms-widget-material-icons":
      CMS.registerWidget(
        "material-icons",
        plugin.Control,
        plugin.Preview
      );
      CMS.registerPreviewStyle(
        "https://fonts.googleapis.com/css?family=Material+Icons"
      );
      break;
  
    case "netlify-cms-widget-color":
      CMS.registerWidget("color", plugin.Control);
      break;

    case "netlify-cms-widget-native-color":
      CMS.registerWidget("native-color", plugin.Control)
      break;

  }
}`

  return {code}
}
