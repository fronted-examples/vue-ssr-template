/**
* 服务端入口，仅运行于服务端
*/
// 创建一个 express 的 server 实例
const express = require('express')
const server = express()
const fs = require('fs')
const cookieParser = require('cookie-parser')
const { createBundleRenderer } = require('vue-server-renderer')
const proxyMiddleware = require('http-proxy-middleware')

const isPro = process.env.NODE_ENV === 'production'
let renderer
let onReady

if (isPro) {
  const template = fs.readFileSync('./index.template.html', 'utf-8')
  // 生产模式，直接基于已构建好的包创建渲染器
  const serverBundle = require('./dist/vue-ssr-server-bundle.json')
  const clientManifest = require('./dist/vue-ssr-client-manifest.json')
  // 创建一个渲染器
  renderer = createBundleRenderer(serverBundle, {
    template, // (可选) 设置页面模板
    clientManifest // (可选) 客户端构建
  })
} else {
  const setupDevServer = require('./build/setup-dev-server')

  // 开发模式 --> 监视打包构建（客户端 + 服务端） --> 重新生成 Renderer 渲染器
  onReady = setupDevServer(server, (serverBundle, template, clientManifest) => {
    renderer = createBundleRenderer(serverBundle, {
      template, // (可选) 设置页面模板
      clientManifest // (可选) 客户端构建
    })
  })
}

server.use(cookieParser())

// 开头的路径，需要与 output 中设置的 publicPath 保持一致
server.use('/dist', express.static('./dist'))

const render = async (request, response) => {
  try {
    const context = {
      // entry-server.js用于设置服务器端router的位置
      url: request.url,
      cookies: request.cookies,
      request: request
    }

    // renderToString支持promise
    const html = await renderer.renderToString(context)

    response.setHeader('Content-Type', 'text/html; charset=utf-8')
    response.end(html)
  } catch (error) {
    console.log('err: ', error)
    res.status(500).end('Internal Server Error')
  }
}

if (!isPro) {
  const config = require('./config')

  Object.keys(config.dev.proxyTable).forEach(function (context) {
    var options = config.dev.proxyTable[context]
    if (typeof options === 'string') {
      options = { target: options }
    }

    server.use(proxyMiddleware(options.filter || context, options))
  })
}

/**
 * 添加路由
 * 服务端路由设置为 *，意味着所有的路由都会进入这里，不然会导致刷新页面，获取不到页面的bug
 * 并且vue-router设置的404页面无法进入
 */
server.get('*', async (request, response) => {
  if (!isPro) {
    await onReady
  }

  render(request, response)
})

server.listen(3000, () => {
  console.log('server running at port 3000')
})
