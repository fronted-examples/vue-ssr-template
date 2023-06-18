import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'

Vue.use(Vuex)

import { getArticle } from '@/apis'

export const createStore = () => {
  return new Vuex.Store({
    state: {
      // 避免交叉污染
      posts: [],
      article: null
    },
    getters: {
      article: state => state.article
    },
    actions: {
      // 在服务端渲染期间务必让 action 返回一个 Promise
      // async 默认返回 Promise
      async getPosts ({ commit }) {
        const { data } = await axios.get('https://cnodejs.org/api/v1/topics')
        commit('setPost', data.data)
      },
      async getArticle ({ commit }) {
        const params = {
          articleId: 1
        }
        const { code, data } = await getArticle(params)

        if (code === 200) {
          commit('getArticle', data)
        }
      }
    },
    mutations: {
      setPost (state, data) {
        state.posts = data
      },
      getArticle (state, data) {
        state.article = data.article
      }
    }
  })
}
