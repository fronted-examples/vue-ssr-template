const fs = require('fs')
const path = require('path')
const webpack = require('webpack')
const chokidar = require('chokidar')
const devMiddleware = require('webpack-dev-middleware')
const hotMiddleware = require('webpack-hot-middleware')
const resolve = (file) => path.resolve(__dirname, file)

const serverConfig = require('./webpack.server.config.js')
const clientConfig = require('./webpack.client.config.js')

module.exports = (server, callback) => {
  let ready
  const onReady = new Promise((resolve) => (ready = resolve))

  // 监视构建 --> 更新 Renderer
  let template
  let serverBundle
  let clientManifest

  // update更新函数
  const update = () => {
    // 当资源都构建好后，在调用callback，重新生成 Renderer渲染器（server.js）
    if (template && serverBundle && clientManifest) {
      // 调用callback，意味着开发模式下打包构建成功了，让Promise变为resolve状态，onReady的Promise也就成功了，在server.js中渲染时候(路由)，如果是开发模式就直接onReady，调用render渲染
      ready()
      callback(serverBundle, template, clientManifest)
    }
  }

  //update() // 初始调用

  // 处理模板文件：监视构建 template -> 调用 update -> 更新 Renderer 渲染器
  const templatePath = resolve('../index.template.html') // 获取模板文件路径
  template = fs.readFileSync(templatePath, 'utf-8') // 初始获取模板文件内容
  //update() // 初始化
  // 监视资源变化，fs.watch、fs.watchFile不太好使用，推荐使用第三方包 chokidar 监听文件的变化
  chokidar.watch(templatePath).on('change', (event, path) => {
    // 文件发生改变后重新获取文件内容，调用update函数更新 Renderer
    template = fs.readFileSync(templatePath, 'utf-8')
    update()
  })


  // 服务端监视打包：监视构建 serverBundle -> 调用 update -> 更新 Renderer 渲染器
  // 使用webpack构建的实例
  const serverCompiler = webpack(serverConfig)
  // 把数据存储到内存中，极大的提高构建的速度
  // devMiddleware构建完成后不会退出，以监视模式监视资源的变动，从新打包构建和手动调用watch类似
  const serverDevMiddleware = devMiddleware(serverCompiler, {
    // 配置 webpack-dev-middleware ^3.7.2 选项
    // 这里我建议不要配置，因为服务端打包日志被清除后，无法跟踪服务端的异常
    // logLevel: 'silent' // 关闭日志输出 ，由 FriendlyErrorsWebpackPlugin（webpack.base.config.js） 处理
  })
  // done表示当每次编译结束的时候都会触发钩子
  // 参数1：插件名
  serverCompiler.hooks.done.tap('server', () => {
    // 读取内存中的文件
    // serverDevMiddleware.fileSystem 获取到devMiddleware内部操作文件系统的对象，相当于nodejs中的fs
    serverBundle = JSON.parse(
      serverDevMiddleware.fileSystem.readFileSync(
        resolve('../dist/vue-ssr-server-bundle.json'),
        'utf-8',
      ),
    )
    update()
  })


  // ======================== 配置热更新 ========================
  // 使用webpack-hot-middleware实现热更新（https://github.com/webpack-contrib/webpack-hot-middleware）
  clientConfig.plugins.push(new webpack.HotModuleReplacementPlugin())
  clientConfig.entry.app = [
    'webpack-hot-middleware/client?quiet=true&reload=true', // 和服务端交互处理热更新一个客户端脚本
    clientConfig.entry.app, // 本来的脚本
  ]
  clientConfig.output.filename = '[name].js' // 热更新模式下确保hash一致

  // 客户端构建：监视构建 clientManifest -> 调用 update -> 更新 Renderer 渲染器
  // webpack构建实例
  const clientCompiler = webpack(clientConfig)
  const clientDevMiddleware = devMiddleware(clientCompiler, {
    // 重要！输出资源的访问路径前缀，应该和 客户端打包输出的 publicPath 一致
    publicPath: clientConfig.output.publicPath,
    logLevel: 'silent'
  })
  // 调用钩子，注册插件
  clientCompiler.hooks.done.tap('client', () => {
    // fileSystem 获取内部操作文件系统的对象 类似 NodeJS 的 fs（操纵磁盘中的文件）
    clientManifest = JSON.parse(
      clientDevMiddleware.fileSystem.readFileSync(
        resolve('../dist/vue-ssr-client-manifest.json'),
        'utf-8',
      ),
    )
    update()
  })

  server.use(
    hotMiddleware(clientCompiler, {
      log: false, // 关闭热更新本身的日志输出
    }),
  )

  // 重要！！！将 clientDevMiddleware 挂载到 Express 服务中，提供对其内部内存中数据的访问
  server.use(clientDevMiddleware)

  // 客户端构建：监视构建 clientManifest --> 调用 update --> 更新 Renderer 渲染器
  return onReady
}
