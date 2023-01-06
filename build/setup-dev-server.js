// setupDevServer
const fs = require('fs')
const path = require('path')
const chokidar = require('chokidar')
const webpack = require('webpack')
const webpackDevMiddleware = require('webpack-dev-middleware')
const hotMiddleware = require('webpack-hot-middleware')

const resolve = (file) => path.resolve(__dirname, file)

module.exports = function setupDevServer(server, cb) {
  let ready
  const p = new Promise((res) => (ready = res))

  let serverBundle
  let template
  let clientManifest

  const update = () => {
    // 三个文件都生成好之后才能重新生成renderer
    if (serverBundle && template && clientManifest) {
      ready() // 调用resolve方法改变Promise状态
      cb(serverBundle, template, clientManifest)
    }
  }

  // 监视template 文件变化，并重新构建template -> 调用update更新renderer
  // 读取template文件，构建template，文件更新之后重新读取template文件，构建template
  const templatePath = resolve('../index.template.html')
  template = fs.readFileSync(templatePath, 'utf-8')
  // 监视资源变化，使用chokidar，基于fs.watch fs.watchFile
  chokidar.watch(templatePath).on('change', () => {
    template = fs.readFileSync(templatePath, 'utf-8')
    update()
  })

  // 监视serverBundle 文件变化，并重新构建serverBundle -> 调用update更新renderer
  // 构建serverBundle需要使用webpack打包
  const serverConfig = require('./webpack.server.config')
  const serverCompiler = webpack(serverConfig)
  // webpackDevMiddleware会将打包生成的文件存放在内存中，自动以监视模式运行，不用手动通过watch监视文件变化
  const serverDevMiddleware = webpackDevMiddleware(serverCompiler)
  // 注册一个插件,在每次执行完构建之后，读取内存中的构建结果，生成serverBundle
  serverCompiler.hooks.done.tap('server', () => {
    // 从内存中读取打包之后的结果需要借助webpackDevMiddleware的返回值.serverDevMiddleware.context.outputFileSystem就和node文件系统的fs模块是一样的，读取的文件地址都不用改变
    const serverCompilerResult =
      serverDevMiddleware.context.outputFileSystem.readFileSync(
        resolve('../dist/vue-ssr-server-bundle.json'),
        'utf-8',
      )
    // 读取的结果时字符串，需要转换从js代码
    serverBundle = JSON.parse(serverCompilerResult)
    update()
  })

  // 监视clientManifest 文件变化，并重新构建clientManifest -> 调用update更新renderer
  // clientManifest的打包和serverBundle的打包类似,都需要经过webpack打包
  const clientConfig = require('./webpack.client.config')
  // 增加热更新配置
  // 1.添加HotModuleReplacementPlugin插件
  clientConfig.plugins.push(new webpack.HotModuleReplacementPlugin())
  // 2.修改入口，将 webpack-hot-middleware/client 添加到入口数组最前面
  clientConfig.entry.app = [
    'webpack-hot-middleware/client?quiet=true&reload=true',
    clientConfig.entry.app,
  ]
  // 3.去掉output.filename中的chunk，webpack-hot-middleware需要保证每次输出的文件名字一致。
  clientConfig.output.filename = '[name].js'
  const clientComparer = webpack(clientConfig)
  // 使用webpack-dev-middleware监视clientManifest打包
  const clientDevMiddleware = webpackDevMiddleware(clientComparer, {
    publicPath: clientConfig.output.publicPath
  })
  // 注册插件，在client文件打包之后执行回调
  clientComparer.hooks.done.tap('client', () => {
    // 读取clientManifest打包之后的结果并重新构建，然后调用update
    clientManifest = JSON.parse(
      clientDevMiddleware.context.outputFileSystem.readFileSync(
        resolve('../dist/vue-ssr-client-manifest.json'),
        'utf-8',
      ),
    )
    update()
  })

  // 3.在server中挂载插件
  server.use(
    hotMiddleware(clientComparer, {
      log: false, // 关闭hotMiddleware本身的日志输出
    }),
  )

  // 将clientDevMiddleware挂载到Express服务中，提供对其内部内存中数据的访问
  server.use(clientDevMiddleware)

  return p
}
