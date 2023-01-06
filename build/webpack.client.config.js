// webpack.client.config.js
const { merge } = require('webpack-merge')
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin')

const common = require('./webpack.base.config')

module.exports = merge(common, {
  entry: {
    app: './src/entry-client.js' // 客户端打包入口
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            cacheDirectory: true,
            plugins: ['@babel/plugin-transform-runtime']
          }
        }
      }
    ]
  },
  // 打包优化：将 webpack 运行时分离到一个引导 chunk 中， 
  // 以便可以在之后正确注入异步 chunk。 
  optimization: {
    splitChunks: {
      name: 'manifest',
      minChunks: Infinity
    }
  },
  plugins: [
    // 在输出目录中生成 vue-ssr-client-manifest.json
    new VueSSRClientPlugin()
  ]
})
