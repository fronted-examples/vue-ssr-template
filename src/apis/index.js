import request from '@/utils/request'

export const getArticle = (params) => {
  return request({
    url: '/article/getArticleByArticleId',
    method: 'get',
    params
  })
}