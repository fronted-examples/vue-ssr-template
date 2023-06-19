const path = require('path')
const webpack = require('webpack')
const { VueLoaderPlugin } = require('vue-loader')
const ExtractCssChunksPlugin = require('extract-css-chunks-webpack-plugin')
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin')

const isProd = process.env.NODE_ENV === 'production'

function resolve (dir) {
  return path.join(__dirname, '..', dir)
}

module.exports = {
  mode: isProd ? 'production' : 'development',
  context: path.resolve(__dirname, '../'),
  devtool: isProd ? 'source-map' : '#cheap-module-source-map',
  output: {
    path: path.resolve(__dirname, '../dist'),
    publicPath: '/dist/',
    // chunkhash 同属一个 chunk 中的文件修改了，文件名会发生变化
    // contenthash 只有文件自己的内容变化了，文件名才会变化
    filename: '[name].[contenthash].js',
    // 此选项给打包后的非入口js文件命名，与 SplitChunksPlugin 配合使用
    chunkFilename: '[name].[contenthash].js',
  },
  resolve: {
    extensions: ['.js', '.vue', '.json', '.css'],
    alias: {
      '@': resolve('src'),
    },
  },
  performance: {
    hints: 'warning',
    //入口起点的最大体积
    maxEntrypointSize: 50000000,
    //生成文件的最大体积
    maxAssetSize: 30000000,
    //只给出 js 文件的性能提示
    assetFilter: function (assetFilename) {
      return assetFilename.endsWith('.js')
    }
  },
  module: {
    /**
     * https://juejin.cn/post/6844903689103081485
     * 使用 `mini-css-extract-plugin` 插件打包的的 `server bundle` 会使用到 document。
     * 由于 node 环境中不存在 document 对象，所以报错。
     * 解决方案：样式相关的 loader 不要放在 `webpack.base.config.js` 文件
     * 将其分拆到 `webpack.client.config.js` 和 `webpack.client.server.js` 文件
     * 其中 `mini-css-extract-plugin` 插件要放在 `webpack.client.config.js` 文件配置。
     */
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          compilerOptions: {
            preserveWhitespace: false,
          },
        },
      },
      {
        test: /\.md$/,
        use: [
          { loader: 'html-loader' },
          { loader: 'markdown-loader', options: {} }
        ]
      },
      {
        test: /\.(sc|c)ss$/,
        use: [
          {
            loader: ExtractCssChunksPlugin.loader,
            options: {
              hot: !isProd,
              reloadAll: !isProd
            }
          },
          'css-loader',
          'postcss-loader',
          'sass-loader'
        ]
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.(png|svg|jpg|gif|ico)$/,
        use: ['file-loader'],
      },
      {
        test: /\.(woff|eot|ttf)\??.*$/,
        loader: 'url-loader?name=fonts/[name].[md5:hash:hex:7].[ext]',
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': isProd ? require('../config/prod.env') : require('../config/dev.env')
    }),
    new VueLoaderPlugin(),
    new ExtractCssChunksPlugin({
      filename: isProd ? 'css/[name].[contenthash:8].css' : '[name].[contenthash:8].css',
      chunkFilename: isProd ? 'css/[name].[contenthash:8].[chunkhash:7].css' : '[name].[contenthash:8].[chunkhash:7].css'
    }),
    new FriendlyErrorsWebpackPlugin()
  ],
}
