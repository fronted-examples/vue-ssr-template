'use strict'
const { merge } = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  PORT: '3000',
  BASE_URL: '"/mall"',
  VUE_APP_BASE_API: '"/user-management-service"',
  VUE_APP_SERVER_BASE_API: '"http://localhost:8088/user-management-service"',
  IMAGE_PREFIX: '"https://www.bookswings.com/minio"',
  VUE_APP_API_SOCKET_URL: '"http://localhost:8088/user-management-service/websocket"'
})
