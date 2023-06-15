// 通用 entry
import Vue from 'vue'
import App from './App.vue'
import VueMeta from 'vue-meta'
import { createRouter } from './router'
import { createStore } from './store/index'

// 注册插件
Vue.use(VueMeta)


// 导出一个工厂函数，用于创建新的
// 应用程序、router 和 store 实例
export function createApp () {
  // 创建router实例
  const router = createRouter()
  // 创建store实例
  const store = createStore()

  const app = new Vue({
    // 注入router到根vue实例
    router,
    store,
    // 根实例简单的渲染应用程序组件。
    render: h => h(App)
  })
  // 返回app和router
  return { app, router, store }
}
