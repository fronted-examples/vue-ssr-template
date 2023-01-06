// entry-server.js
import { createApp } from './main'

export default async context => {
  const { app, router } = createApp()

  // 设置服务器端的 router 位置
  router.push(context.url)

  // 等待 router 将可能的异步组件和钩子解析完
  await new Promise(router.onReady.bind(router))

  return app
}
