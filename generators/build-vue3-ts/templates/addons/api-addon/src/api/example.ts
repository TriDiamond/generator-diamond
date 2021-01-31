import request from '@/utils/request'

export function getList(params: object) {
  return request({
    url: '/example/list',
    method: 'get',
    params
  })
}
