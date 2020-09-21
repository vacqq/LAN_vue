import request from '@/utils/request'
import Axios from '@/utils/request'


const api = {
  user: '/user',
  role: '/role',
  getAnalysisSiteRankUrl: '/AnalysisSiteRank',
  permission: '/permission',
  permissionNoPager: '/permission/no-pager',
  orgTree: '/org/tree'
}

export default api

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
