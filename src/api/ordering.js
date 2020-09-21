import request from '@/utils/request'

const api = {
  user: '/user',
  role: '/role',
  get_ordering: '/v1/SelectOrdering',
  permission: '/permission',
  permissionNoPager: '/permission/no-pager',
  orgTree: '/org/tree'
}

export default api


export function getOrderingList (parameter) {
  return request({
    url: api.get_ordering,
    method: 'post',
    params: parameter
  })
}

export function getOrgTree (parameter) {
  return request({
    url: api.orgTree,
    method: 'get',
    params: parameter
  })
}

export function saveSub (sub) {
  return request({
    url: '/sub',
    method: sub.id === 0 ? 'post' : 'put',
    data: sub
  })
}
