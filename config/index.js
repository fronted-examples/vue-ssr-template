'use strict'

module.exports = {
  dev: {
    proxyTable: {
      '/user-management-service': {
        target: 'http://localhost:8088/user-management-service',
        secure: false, // 如果是https接口，需要配置该参数，表示是否校验证书，开发环境改为false
        changeOrigin: true,
        pathRewrite: {
          '^/user-management-service': ''
        }
      }
    }
  }
}