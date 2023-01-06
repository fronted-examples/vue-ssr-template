// router/index.js
import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/pages/home.vue'

Vue.use(Router)

export default function createRouter () {
  return new Router({
    mode: 'history', // 服务端大多不支持hash模式的路由，history模式的路由前后端支持更好
    routes: [
      {
        name: 'home',
        path: '/',
        component: Home
      },
      {
        name: 'about',
        path: '/about',
        component: () => import('@/pages/about.vue')
      },
      {
        name: 'post',
        path: '/post',
        component: () => import('@/pages/post.vue')
      },
      {
        name: '404',
        path: '*',
        component: () => import('@/pages/404.vue')
      }
    ]
  })
}
