<template>
  <div>
    <h1>Post List</h1>
    <ul>
      <li v-for="post in posts" :key="post.id">
        {{ post.title }}</li>
    </ul>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  metaInfo: {
    title: '首页'
  },
  computed: {
    ...mapState(['posts'])
  },
  asyncData ({ store, route }) {
    // 这里必须使用方法注入的store
    return store.dispatch('getPosts')
  },
  // Vue SSR 特殊为服务端渲染提供的一个生命周期钩子函数(渲染之前调用)
  // serverPrefetch () {
  //   // 发起 action，返回 Promise
  //   // this.$store.dispatch('getPosts')
  //   console.log('serverPrefetch')
  //   return this.getPosts()
  // },
  methods: {
    ...mapActions(['getPosts'])
  }
}
</script>
