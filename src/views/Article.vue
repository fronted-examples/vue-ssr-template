<template>
  <section class="article">
    <markdown-preview
                      :content="article.content" />
  </section>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import MarkdownPreview from '@/components/MarkdownPreview'

export default {
  name: 'Article',
  metaInfo: {
    title: '文章'
  },
  components: {
    MarkdownPreview
  },
  data () {
    return {

    }
  },
  computed: {
    ...mapGetters(['article'])
  },
  asyncData ({ store, route }) {
    const articleId = route.params.articleId

    return store.dispatch('getArticle', articleId)
  },
  // created () {
  //   console.log('article: ', this.article)
  // }
}
</script>

<style lang="scss" scoped>
.article {
  background-color: #fff;
  padding: 32px;
  box-sizing: border-box;
}
</style>