const path = require('path')
const chalk = require('chalk')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const HtmlWebpackExcludeAssetsPlugin = require('html-webpack-exclude-assets-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const WebpackDevMiddleware = require('webpack-dev-middleware')
const CreateFileWebpack = require('create-file-webpack')
const VueLoaderPlugin = require('vue-loader/lib/plugin')

function createWebpackConfig({context, outDir, options, isProd}) {
  
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

  //let importsLoaderConfig = 'imports-loader?' + [`pluginNames=>{${netlifyCMSPlugins.map((p, i) => `${i}:'${p}'`).join('%2C')}}`].concat(netlifyCMSPlugins.map((pluginName, i) => `plugin_${i}=${pluginName}`)).join(',') + '!' + './inject-plugins.js'

  return {
    mode: isProd ? 'production' : 'development',
    entry: {
      cms: netlifyCMSPlugins.concat([path.resolve(context, options.modulePath)])
    },
    output,
    resolve: {
      modules: [path.resolve(__dirname, 'node_modules'), path.resolve(context, 'node_modules'), 'node_modules'],
      alias: {
        '~': path.resolve(context, 'src')
      }
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
        },/*
        {
          test: require.resolve('./lib/inject-plugins.js'),
          use: importsLoaderConfig
        },*/
        {
          test: /\.css$/,
          use: [
            MiniCssExtractPlugin.loader,
            "css-loader"
          ]
        },
        {
          test: /\.sass$/,
          use: [
              MiniCssExtractPlugin.loader,
              "css-loader", // translates CSS into CommonJS
              { 
                loader: "sass-loader", // compiles Sass to CSS, using Node Sass by default
                options: { indentedSyntax: true }
              }
          ]
        },
        {
          test: /\.scss$/,
          use: [
              MiniCssExtractPlugin.loader,
              "css-loader", // translates CSS into CommonJS
              "sass-loader" // compiles Sass to CSS, using Node Sass by default
          ]
        },
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env", "@babel/preset-react"]
            } 
          }
        },
        {
          test: /\.vue$/,
          loader: 'vue-loader'
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

      new VueLoaderPlugin()

    ].filter(p => p)
  }
}

module.exports = function (api, options) {

  const { context } = api

  api.chainWebpack((config, chainWebpackOpts) => {

    //console.log(api.config.plugins)

    var filesystemPlugins = api.config.plugins.filter(plugin => plugin.use === '@gridsome/source-filesystem')

    //console.log(filesystemPlugins)

    for(var plugin of filesystemPlugins) {
      console.log(path.resolve(context, `./templates/${plugin.options.typeName}.vue`))
    }

    var assetsDir = path.relative(api.config.outDir, api.config.assetsDir)

    config
      .plugin('styles-for-netlify-cms')
      .use(MiniCssExtractPlugin, [{
        // Options similar to the same options in webpackOptions.output
        // both options are optional
        filename: `${assetsDir}/css/styles-for-netlify-cms.css`,
        //filename: `${assetsDir}/css/styles${useHash ? '.[contenthash:8]' : ''}.css`
        chunkFilename: `${assetsDir}/css/[id].styles-for-netlify-cms.css`
      }]);

    // During `gridsome develop`, the MiniCssExtractPlugin isn't 
    // injected by Gridsome, so we need to do that ourselves
    if(!chainWebpackOpts.isServer && !chainWebpackOpts.isProd) {
      for(var lang of ['css', 'postcss', 'scss', 'sass', 'less', 'stylus']) {
        config.module
          .rule(lang)
          .oneOf('normal')
          .use('extract-css-loader')
          .loader(MiniCssExtractPlugin.loader)
          .before('css-loader')
        config.module
          .rule(lang)
          .oneOf('modules').resourceQuery(/module/)
          .use('extract-css-loader')
          .loader(MiniCssExtractPlugin.loader)
          .before('css-loader')
      }
    }

    config.optimization.splitChunks({
      cacheGroups: {
        default: false
      }
    })

/*    optimization: {
      splitChunks: {
        cacheGroups: {
          styles: {
            name: 'styles',
            test: /\.css$/,
            chunks: 'all',
            enforce: true
          }
        }
      }
    },*/

    const util = require('util')

    //console.log(util.inspect(config.toConfig(), {showHidden: false, depth: 7}))


  })  

  /**
   * For `gridsome build`
   */
  api.afterBuild(({config}) => {
    const { outDir } = config

    const webpackConfig = createWebpackConfig({ outDir, context, options, isProd: true })

    webpack(webpackConfig).run((err, stats) => { if(options.debug) console.log(stats.toString())})
  })

  /**
   * For `gridsome develop`: serve via webpack-dev-middleware
   */
  api.configureServer((app) => {

    const webpackConfig = createWebpackConfig({ context, options })

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
  injectPreviewStyles: true,
  debug: false
})