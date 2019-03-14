const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CreateFileWebpack = require('create-file-webpack')
const CSSExtractPlugin = require('mini-css-extract-plugin')

function NetlifyCmsWidgetHypervisual (api, options) {


  api.chainWebpack((config, chainWebpackOpts) => {

    console.log(chainWebpackOpts)

    /*config
      .module
      .rule('netlify-cms')
      .use(extractCSS.extract([
        'css-loader',
        'postcss-loader'
      ]))*/

    /*config
      .plugin('netlify-cms-css')
      .use(new MiniCssExtractPlugin({
        // Options similar to the same options in webpackOptions.output
        // both options are optional
        filename: "styles-for-hypervisual.css",
        chunkFilename: "styles-for-hypervisual.[id].css"
      }));


    config.module
      .rule('mini-css-hypervisual')
        .test(/\.css$/)
        .use('mini-css-use-hypervisual')
          .loader(MiniCssExtractPlugin.loader)
        .end()
        .use('mini-css-use-hypervisual-2')
          .loader('css-loader')

          /*module: {
        rules: [
          {
            test: /\.css$/,
            use: [
              {
                loader: MiniCssExtractPlugin.loader,
                options: {
                  // you can specify a publicPath here
                  // by default it use publicPath in webpackOptions.output
                  publicPath: '../'
                }
              },
              "css-loader"
            ]
          }
        ]
      }*/


    var opts = {
        // path to folder in which the file will be created
        path: './dist',
        // file name
        fileName: 'test.txt',
        // content of the file
        content: 'test'
    };

    config
      .plugin('test')
      .use(CreateFileWebpack, [opts])

    /*if(!chainWebpackOpts.isProd && !chainWebpackOpts.isServer) {
      console.log('adding extract-css')
      config.plugin('extract-css')
        .use(CSSExtractPlugin, [{
          filename: `assets/css/styles.css`
        }])
    }*/

    const util = require('util')

    console.log(util.inspect(config.toConfig(), {showHidden: false, depth: 4}))


  })  
}

NetlifyCmsWidgetHypervisual.defaultOptions = () => ({
  option: 'value'
})

module.exports = NetlifyCmsWidgetHypervisual