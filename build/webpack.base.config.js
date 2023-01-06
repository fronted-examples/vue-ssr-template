// webpack.base.config.js
const path = require('path')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin')

const resolve = file => path.resolve(__dirname, file)
const isProd = process.env.NODE_ENV === 'production'

const devToolOption = {}

if (!isProd) {
  devToolOption.devtool = 'cheap-module-eval-source-map'
}

module.exports = {
  mode: isProd ? 'production' : 'development',
  output: {
    path: resolve('../dist/'),
    publicPath: '/dist/',
    filename: '[name].[chunkhash].js'
  },
  resolve: {
    alias: {
      '@': resolve('../src/')
    },
    extensions: ['.js', '.vue', '.json']
  },
  ...devToolOption,
  module: {
    rules: [
      // 处理图片资源
      {
        test: /\.(png|jpg|gif)$/i,
        use: {
          loader: 'url-loader',
          options: {
            limit: 8192
          }
        }
      },
      // 处理字体资源 
      { 
        test: /\.(woff|woff2|eot|ttf|otf)$/, 
        use: [ 'file-loader', ], 
      },
      // 处理 .vue 资源 
      { 
        test: /\.vue$/, 
        loader: 'vue-loader' 
      },
      // 处理 CSS 资源 
      // 它会应用到普通的 `.css` 文件 
      // 以及 `.vue` 文件中的 `<style>` 块 
      { 
        test: /\.css$/, 
        use: [ 'vue-style-loader', 'css-loader' ] 
      }
    ]
  },
  plugins: [ 
    new VueLoaderPlugin(), 
    new FriendlyErrorsWebpackPlugin() 
  ]
}
