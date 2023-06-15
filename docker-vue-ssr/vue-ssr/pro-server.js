/**
 * 服务端入口，仅运行于服务端
 */
// 创建一个 express 的 server 实例
const express = require('express')
const app = express()
const fs = require('fs')
const cookieParser = require('cookie-parser')
const { createBundleRenderer } = require('vue-server-renderer')
const { minify } = require('html-minifier')

const port = 3000
let renderer

const template = fs.readFileSync('./index.template.html', 'utf-8')
// 生产模式，直接基于已构建好的包创建渲染器
const serverBundle = require('./dist/vue-ssr-server-bundle.json')
const clientManifest = require('./dist/vue-ssr-client-manifest.json')
// 创建一个渲染器
renderer = createBundleRenderer(serverBundle, {
  template, // (可选) 设置页面模板
  clientManifest, // (可选) 客户端构建
})

app.use(cookieParser())

// 开头的路径，需要与 output 中设置的 publicPath 保持一致
app.use('/dist', express.static('./dist'))

const render = async (request, response) => {
  try {
    // renderToString支持promise
    const context = {
      // entry-server.js用于设置服务器端router的位置
      url: request.url,
      cookies: request.cookies,
      request: request
    }

    const html = await renderer.renderToString(context)

    response.setHeader('Content-Type', 'text/html; charset=utf-8')
    response.end(minify(html, { collapseWhitespace: true, minifyCSS: true }))
  } catch (error) {
    console.log('server error: ', error)
    // response.status(500).end('Internal Server Error')
    if (error.response.status === 404 || error.response.status === 400) {
      response.status(404).redirect('/mall/404?message=' + error.response.message)
    }

    if (error.response.status === 500) {
      response.status(500).redirect('/mall/500')
    }
  }
}

/**
 * 添加路由
 * 服务端路由设置为 *，意味着所有的路由都会进入这里,不然会导致刷新页面，获取不到页面的bug
 * 并且vue-router设置的404页面无法进入
 */
app.get('/*', async (request, response) => {
  render(request, response)
}
  // render // 生产模式：使用构建好的包直接渲染
)

app.listen(port, () => {
  console.log(`server running at port ${port}`)
})
