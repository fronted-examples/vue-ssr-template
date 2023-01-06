/* app.js */
/**
 * 生成Vue实例
 */
import Vue from 'vue'
import App from './App'
import createRouter from './router'

export function createApp(context) {
  const router = createRouter()
  const app = new Vue({
    router,
    context,
    render: (h) => h(App),
  })
  return {
    router,
    app,
  }
}
