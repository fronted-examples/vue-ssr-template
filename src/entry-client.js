// entry-client.js
/**
 * 客户端渲染入口
 */
 import { createApp } from './main'

 const { app, router } = createApp()
 
// 等待路由准备完之后渲染 Vue实例到 id为 app 的元素内
router.onReady(() => {
  // 在id为app的div中渲染Vue实例
  app.$mount('#app')
})
 