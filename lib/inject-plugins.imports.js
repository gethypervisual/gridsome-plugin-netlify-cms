if(!Array.isArray(pluginNames)) { pluginNames = [] }

export default function(CMS) {
  if(typeof CMS !== 'object') { return; }
  for (const [i, pluginName] of pluginNames.entries()) {
    if(this[`plugin_${i}`] && typeof this[`plugin_${i}`].attachToCMS === 'function') {
      this[`plugin_${i}`].attachToCMS(CMS)
    } else {
      injectKnownPlugin(CMS, pluginName, this[`plugin_${i}`])
    }
  }
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
}
