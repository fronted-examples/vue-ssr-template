<template>
  <div class="markdown-body">
    <div v-html="MarkdownMsg"></div>
  </div>
</template>

<script>
import { marked } from 'marked'
import CodeCopy from '@/components/CodeCopy'
import Vue from 'vue'

export default {
  props: {
    content: String
  },
  data () {
    return {
      MarkdownMsg: ''
    }
  },
  watch: {
    content: {
      handler (newVal) {
        this.getMardownFileContent(newVal)

        if (process.env.VUE_ENV === 'client') {
          this.update()
        }
      },
      immediate: true
    }
  },
  mounted () {
    this.getMardownFileContent(this.content)
  },
  updated () {
    this.update()
  },
  methods: {
    //处理markdown数据，data为markdown文件读出的字符串
    getMardownFileContent (data) {
      this.MarkdownMsg = marked(data || '', {
        /* 默认为false，为true时显示代码标签 */
        sanitize: false
      })
    },
    //获取对应markdown代码块标签
    update () {
      this.$nextTick(() => {
        document.querySelectorAll('pre').forEach(el => {
          //   console.log(el)
          if (el.classList.contains('code-copy-added')) return
          //   https://cn.vuejs.org/v2/api/index.html#Vue-extend
          /* 使用基础 Vue 构造器，创建一个“子类”。参数是一个包含组件选项的对象 */
          let ComponentClass = Vue.extend(CodeCopy)
          let instance = new ComponentClass()
          instance.code = el.innerText
          instance.parent = el
          /* 手动挂载 */
          instance.$mount()
          el.classList.add('code-copy-added')
          el.appendChild(instance.$el)
        })
      })
    }
  }
}
</script>

<style lang="scss" >
.markdown-body {
  word-break: break-word;
  line-height: 1.75;
  font-weight: 400;
  font-size: 16px;
  overflow-x: hidden;
  color: #252933;

  /* 因为默认的代码块没有样式，所以添加一个背景色 */
  .code-copy-added {
    background: #f8f8f8;
    color: #333;
    font-family: Menlo, Monaco, Consolas, Courier New, monospace;
    margin: 10px 0;
    text-align: left;
    border-radius: 3px;
    position: relative;
  }

  .code-copy-added:hover .copy-btn {
    opacity: 1;
  }

  ol {
    list-style-type: decimal;
  }

  ul {
    list-style-type: disc;
  }

  img {
    display: block;
  }

  blockquote {
    color: #666;
    padding: 10px 23px;
    margin: 22px 0;
    border-left: 4px solid #cbcbcb;
    background-color: #f8f8f8;
  }

  blockquote > p {
    margin: 10px 0;
  }
}
</style>
