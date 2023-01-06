// server.js修改部分
// 创建服务器对象
const express = require('express')
const server = express()

const { createBundleRenderer } = require('vue-server-renderer')

const setupDevServer = require('./build/setup-dev-server')
const isProd = process.env.NODE_ENV === 'production'
let devServerReady
let renderer

if (isProd) {
  // 服务端入口打包之后的文件
  const serverBundle = require('./dist/vue-ssr-server-bundle.json')
  // 模板文件
  const template = require('fs').readFileSync('./index.template.html', 'utf-8')
  // 客户端入口打包之后的文件
  const clientManifest = require('./dist/vue-ssr-client-manifest.json')
  // 创建渲染器
  renderer = createBundleRenderer(serverBundle, {
    template,
    clientManifest
  })
} else {
   // 开发模式下 监视文件修改 -> 重新打包生成文件 -> 再读取文件生成renderer
  // setupDevServer 返回一个Promise，这样在外部就能通过Promise拿到其状态
  devServerReady = setupDevServer(server, (serverBundle, template, clientManifest) => {
    // 创建渲染器
    renderer = createBundleRenderer(serverBundle, {
      template,
      clientManifest
    })
  })
}

const render = async (req, res) => {
  // 处理物理磁盘的静态资源访问
  server.use('/dist', express.static('./dist'))
  try {
    const html = await renderer.renderToString({
      title: '伍绍清',
      meta: `<meta http-equiv="X-UA-Compatible" content="IE=edge" />`,
      url: req.url
    })
    console.log('html: ', typeof html)
    res.setHeader('Content-Type', 'text/html;charset=utf-8') // 设置返回内容的编码格式，反之乱码
    res.end(html)
  } catch(e) {
    return res.status(500).end(e)
  }
}


server.get('*', isProd ? render : async (req, res) => {
  await devServerReady // 开发环境需要等待renderer生成之后再调用render
  render(req, res)
})


server.listen(8000)
