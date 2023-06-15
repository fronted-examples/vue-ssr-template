import Vue from 'vue'
import VueRouter from 'vue-router'
// webpack中配置@指向src
import Home from '@/views/Home'

Vue.use(VueRouter)

export function createRouter () {
  return new VueRouter({
    // 同构应用不能使用 hash 路由，应该使用 history 模式，兼容前后端
    mode: 'history',
    routes: [
      {
        path: '/',
        name: 'Home',
        component: Home
      }, {
        path: '/about',
        name: 'About',
        // 懒加载路由 按需加载，异步的
        component: () => import('@/views/About')
      }, {
        path: '/posts',
        name: 'Posts',
        component: () => import('@/views/Post')
      }, {
        path: '/article/:articleId',
        name: 'Article',
        component: () => import('@/views/Article')
      }, {
        path: '*',
        name: 'error404',
        component: () => import('@/views/404')
      }
    ]
  })
}
