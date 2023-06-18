import axios from 'axios'
import { MessageBox, Message } from 'element-ui'

import { createStore } from '@/store'
import Cookies from 'js-cookie'

/**
 * 控制请求重试
 * @param {*} adapter 预增强的 Axios 适配器对象；
 * @param {*} options 缓存配置对象，该对象支持 2 个属性，分别用于配置不同的功能：
 *                      times：全局设置请求重试的次数；
 *                      delay：全局设置请求延迟的时间，单位是 ms。
 * @returns
 */
function retryAdapterEnhancer (adapter, options) {
  const { times = 0, delay = 300 } = options

  return async (config) => {
    const { retryTimes = times, retryDelay = delay } = config
    let __retryCount = 0

    const request = async () => {
      try {
        return await adapter(config)
      } catch (err) {
        if (!retryTimes || __retryCount >= retryTimes) {
          return Promise.reject(err)
        }

        __retryCount++

        // 延时处理
        const delay = new Promise((resolve) => {
          setTimeout(() => {
            resolve()
          }, retryDelay)
        })

        // 重新发起请求
        return delay.then(() => {
          return request()
        })
      }
    }

    return request()
  }
}
// create an axios instance
const service = axios.create({
  // 如果不存在跨域问题并且在dev.env.xxx文件中有配置的话baseURL的值可以直接使用：process.env.BASE_URL；
  // 如果使用proxy做了代理配置，那么baseURL的值直接填写'/'就可以了。
  baseURL: process.env.VUE_ENV === 'client' ? process.env.VUE_APP_BASE_API : process.env.VUE_APP_SERVER_BASE_API, // url = base url + request url
  withCredentials: true, // send cookies when cross-domain requests
  timeout: 60000, // request timeout
  adapter: retryAdapterEnhancer(axios.defaults.adapter, {
    retryDelay: 1000
  })
})

service.defaults.withCredentials = true

// 请求拦截器
service.interceptors.request.use(
  config => {
    // do something before request is sent
    const store = createStore()
    const accessToken = store.getters['user/accessToken'] || Cookies.get('accessToken')

    if (accessToken && config.url.indexOf(process.env.IMAGE_PREFIX) === -1) {
      // let each request carry token
      // ['X-Token'] is a custom headers key
      // please modify it according to the actual situation
      config.headers['Authorization'] = 'Bearer ' + accessToken
    }

    return config
  },
  error => {
    // do something with request error
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  /**
   * If you want to get http information such as headers or status
   * Please return  response => response
  */

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code
   */
  response => {
    const res = response.data
    const config = response.config

    // if the custom code is not 20000, it is judged as an error.
    if (config.responseType === 'blob') {
      // 下载请求，不抛错误
      return response
    }

    if (config.responseType === 'arraybuffer') {
      // 获取图片的二进制流
      return response
    }

    if (config.headers['Content-Type'] === 'application/octet-stream') {
      // 分片上传
      return response
    }

    if (res.code !== 200) {
      // 这里处理了非200错误,不需要再在每个页面里再去抛出请求错误
      Message({
        message: res.message || 'Error',
        type: 'error',
        duration: 5 * 1000
      })

      return Promise.reject(new Error(res.message || 'Error'))
    }

    return res
  },
  error => {
    console.log('err: ', error) // for debug

    const store = createStore()

    if (error.response) {
      if (error.response.status === 401) {
        // to re-login
        MessageBox.confirm('您的登录信息已过期，请重新登录', '确认登出', {
          confirmButtonText: '重新登录',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          // 退出登录
          // store.dispatch('user/logout').then(() => {
          //   location.href = '/mall'
          // })
        })
      } else {
        // 主动取消请求，不提示错误
        const { message } = error.response.data

        if (!axios.isCancel(error)) {
          Message({
            message: message || error,
            type: 'error',
            duration: 3 * 1000
          })
        }
      }
    }

    return Promise.reject(error)
  }
)

export default service