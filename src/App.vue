<template>
  <div id="app">
    <ul>
      <li>
        <router-link to='/mall'>Home</router-link>
      </li>
      <li>
        <router-link
                     to='/mall/about'>About</router-link>
      </li>
      <li>
        <router-link
                     to="/mall/posts">Posts</router-link>
      </li>
      <li>
        <router-link
                     to="/mall/article/1">article</router-link>
      </li>
    </ul>
    <!-- 路由出口 -->
    <router-view />
  </div>
</template>

<script>
export default {
  name: "App",
  data () {
    return {
      tdk: {
        title: '',
        keywords: '',
        description: ''
      },
      isRouterAlive: true
    }
  },
  metaInfo () {
    const title = this.tdk.title

    return {
      title: `${title} - 购物天堂`,
      meta: [
        { name: 'keywords', content: this.tdk.keywords },
        { name: 'description', content: this.tdk.description }
      ]
    }
  },
};
</script>
