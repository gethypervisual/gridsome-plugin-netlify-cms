module.exports = function({pluginNames}) {
  
  if(!Array.isArray(pluginNames)) { return {code: ''}}

  let code = pluginNames.map((pluginName, i) => `import plugin_${i} from '${pluginName}'\n`)

  code += `
export default function(CMS) {
  if(typeof CMS !== 'object') { return; }
  ${pluginNames.map((pluginName, i) => `  if(typeof plugin_${i}.attachToCMS === 'function') {
    plugin_${i}.attachToCMS(CMS)
  }`)}
}`

  return {code}
}
