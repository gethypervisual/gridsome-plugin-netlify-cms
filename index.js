const path = require('path')
const chalk = require('chalk')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const HtmlWebpackExcludeAssetsPlugin = require('html-webpack-exclude-assets-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const WebpackDevMiddleware = require('webpack-dev-middleware')

function createWebpackConfig({context, outDir, options, isProd, pathPrefix}) {

  const netlifyCMSPlugins = Array.isArray(options.plugins) ? options.plugins : []

  /**
   * Make it clear that if a cms.js module is provided, this plugin won't set inject plugins automatically
   */
  if(options.modulePath !== module.exports.defaultOptions().modulePath && typeof options.plugins !== 'undefined') {
    console.warn(chalk.yellow(`You have provided gridsome-plugin-netlify-cms with a ${chalk.bold('modulePath')} option, which means the ${chalk.bold('plugins')} option will not have any effect. \nYou should ${chalk.bold('require')} the plugins manually in ${chalk.underline(chalk.gray(options.modulePath))}.`))
  }

  /**
   * Hash output filename in for `gridsome build`, but not for `gridsome develop`
   */
  let output = {
    filename: isProd ? '[name].[contenthash:8].js' : '[name].js',
    publicPath: options.publicPath
  }
  if(outDir) { output.path = `${outDir}${options.publicPath}` }

  /**
   * - bundle both the provided plugins (from the parent project's node_modules folder) and the CMS module
   * - use val-loader to create the inject-plugins module dynamically before compiling, allowing for static
   *   imports of the provided plugin packages
   */

  return {
    mode: isProd ? 'production' : 'development',
    entry: {
      cms: [path.resolve(context, options.modulePath)]
        .concat(netlifyCMSPlugins)
        .concat([
          options.enableIdentityWidget && require.resolve('./lib/cms-identity.js'),
        ])
        .filter(p => p),
    },
    output,
    resolve: {
      modules: [path.resolve(__dirname, 'node_modules'), path.resolve(context, 'node_modules'), 'node_modules']
    },
    resolveLoader: {
      modules: [path.resolve(__dirname, 'node_modules'), path.resolve(context, 'node_modules'), 'node_modules']
    },
    module: {
      rules: [
        {
          test: require.resolve('./lib/inject-plugins.js'),
          use: [
            {
              loader: `val-loader`,
              options: {
                pluginNames: netlifyCMSPlugins
              }
            }
          ]
        },
        {
          test: /css$/,
          use: [
            MiniCssExtractPlugin.loader,
            "css-loader"
          ]
        }
      ]
    },
    plugins: [

      /**
       * Copy config.yml to output dir
       */
      new CopyWebpackPlugin([{from: options.configPath, to: 'config.yml'}]),

      /**
       * Use a simple filename with no hash so we can access from source by
       * path.
       */
      new MiniCssExtractPlugin({
        filename: `cms.css`,
        chunkFilename: "[id].css"
      }),

      /**
       * Auto generate CMS index.html page.
       */
      new HtmlWebpackPlugin({
        title: options.htmlTitle,
        chunks: [`cms`],
        excludeAssets: [/cms\.css/],
        template: options.htmlPath,
        inject: options.injectScript,
        basePath: `${options.publicPath}/`
      }),

      new HtmlWebpackExcludeAssetsPlugin(),

      /**
       * Pass in needed Gridsome config values.
       */

      new webpack.DefinePlugin({
        __PATH_PREFIX__: JSON.stringify(pathPrefix),
        CMS_PUBLIC_PATH: JSON.stringify(options.publicPath),
      }),
    ].filter(p => p),
  }
}

module.exports = function (api, options) {

  const { context } = api
  const { pathPrefix } = api._app.config

  /**
   * For `gridsome build`
   */
  api.afterBuild(({config}) => {
    const { outDir } = config

    const webpackConfig = createWebpackConfig({
      outDir,
      context,
      options,
      isProd: true,
      pathPrefix
    })

    webpack(webpackConfig).run((err, stats) => { if(options.debug) console.log(stats.toString())})
  })

  /**
   * For `gridsome develop`: serve via webpack-dev-middleware
   */
  api.configureServer((app) => {

    const webpackConfig = createWebpackConfig({ context, options, pathPrefix: '' })

    const compiler = webpack(webpackConfig)

    const devMiddleware = WebpackDevMiddleware(compiler, {
      noInfo: !options.debug,
      publicPath: options.publicPath,
      logLevel: options.debug ? null : 'silent'
    })

    app.use(devMiddleware)
  })

}

module.exports.defaultOptions = () => ({
  htmlTitle: 'Content Editor',
  configPath: 'src/admin/config.yml',
  modulePath: `${__dirname}/lib/cms.js`,
  htmlPath: `${__dirname}/templates/index.html`,
  publicPath: '/admin',
  injectScript: true,
  enableIdentityWidget: true,
  debug: false
})
