// 客户端入口
import Vue from 'vue'
import { createApp } from './app'

// 客户端特定引导逻辑……

const { app, router, store } = createApp()

Vue.mixin({
  // 组件挂载前
  beforeMount () {
    const { asyncData } = this.$options
    if (asyncData) {
      // 将获取数据操作分配给 promise
      // 以便在组件中，我们可以在数据准备就绪后
      // 通过运行 `this.dataPromise.then(...)` 来执行其他任务
      this.dataPromise = asyncData({
        store: this.$store,
        route: this.$route
      })
    }
  },

  // 路由更新前
  beforeRouteUpdate (to, from, next) {
    const { asyncData } = this.$options
    if (asyncData) {
      asyncData({
        store: this.$store,
        route: to
      }).then(next).catch(next)
    } else {
      next()
    }
  }
})

if (window.__INITIAL_STATE__) {
  // 将window.__INITIAL_STATE__的数据替换到客户端的store中
  store.replaceState(window.__INITIAL_STATE__)
}

// 这里假定 App.vue 模板中根元素具有 `id="app"`
router.onReady(() => {
  app.$mount('#app')
})
