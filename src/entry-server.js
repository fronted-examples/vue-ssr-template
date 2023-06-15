// entry-server.js
import { createApp } from './app'

// 使用async/await改造上述代码
export default async (context) => {
  const { app, router, store } = createApp()
  const meta = app.$meta()
  // 用于设置服务器端router的位置
  router.push(context.url)
  context.meta = meta

  // this的指向router
  await new Promise(router.onReady.bind(router))

  const matchedComponents = router.getMatchedComponents()

  // 这里等待所有匹配组件的asyncData执行完成
  await Promise.all(
    matchedComponents.map((component) => {
      if (component.asyncData) {
        return component.asyncData({
          store,
          route: router.currentRoute,
        })
      }
    })
  )

  context.rendered = () => {
    // Renderer 会把 context.state 数据对象内联到页面模板中
    // 最终发送给客户端的页面中会包含一段脚本：window.__INITIAL_STATE__ = context.state
    // 客户端就要把页面中的 window.__INITIAL_STATE__ 拿出来填充到客户端 store 容器中
    context.state = store.state
  }
  // async对于非Promise的数据，会将他把装在Promise中，成功后返回对应的数据
  return app
}
