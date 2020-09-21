import storage from 'store'
import store from '@/store'
import { login, getInfo, logout } from '@/api/login'
import { ACCESS_TOKEN, ACCESS_LOGIN_ID } from '@/store/mutation-types'
import { welcome } from '@/utils/util'

const user = {
  users: {},
  state: {
    token: '',
    login_id: '',
    name: '',
    welcome: '',
    avatar: '',
    roles: [],
    info: {},
  },

  mutations: {
    //全局变量赋值方法
    SET_TOKEN: (state, token) => {
      state.token = token
    },
    SET_LOGIN_ID: (state, login_id) => {
      state.login_id = login_id
    },
    SET_NAME: (state, { name, welcome }) => {
      state.name = name
      state.welcome = welcome
    },
    SET_AVATAR: (state, avatar) => {
      state.avatar = avatar
    },
    SET_ROLES: (state, roles) => {
      state.roles = roles
    },
    SET_INFO: (state, info) => {
      state.info = info
    }
  },

  actions: {
    // 登录
    Login ({ commit }, userInfo) {
      // console.log("Login登录")
      // console.log(userInfo)

      return new Promise((resolve, reject) => {
        login(userInfo).then(response => {
          if (response.code == 200) {
            const result = response.result
            // console.log("Login登录进去之后")
            // console.log(response)
            storage.set(ACCESS_TOKEN, response._headers, 7 * 24 * 60 * 60 * 1000)
            storage.set(ACCESS_LOGIN_ID, result.username, 60 * 60 * 1000)
            commit('SET_TOKEN', response._headers)
            commit('SET_LOGIN_ID', result.username)
            resolve(response)//返回response数据,携带者失败与成功数据
            // console.log("Login登录要出来了")
          }
          else {
            // console.log("没有进登录事件哦")
            resolve(返回response数据)//返回response数据,携带者失败与成功数据
          }
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 获取用户信息
    GetInfo ({ commit }) {
      // console.log("GetInfo获取用户信息")
      return new Promise((resolve, reject) => {

        const user_name = storage.get(ACCESS_LOGIN_ID)
        //非空判断
        if (user_name == null) {
          user_name = "未登录"
        }
        const userParams = {
          "user_name": user_name,
        }
        getInfo(userParams).then(response => {
          const result = response.result
          // console.log("获取到的用户信息")
          // console.log(result)

          if (result.role && result.role.permissions.length > 0) {
            const role = result.role
            role.permissions = result.role.permissions
            role.permissions.map(per => {
              if (per.actionEntitySet != null && per.actionEntitySet.length > 0) {
                const action = per.actionEntitySet.map(action => { return action.action })
                per.actionList = action
              }
            })
            role.permissionList = role.permissions.map(permission => { return permission.permissionId })
            commit('SET_ROLES', result.role)
            commit('SET_INFO', result)
          } else {
            reject(new Error('getInfo: roles must be a non-null array !'))
          }
          //全局变量赋值
          //没有在登录时候赋值的,初始化加载时候加载一下user.js中数据
          commit('SET_NAME', { name: result.name, welcome: welcome() })
          commit('SET_AVATAR', result.avatar)

          resolve(response)
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 登出
    Logout ({ commit, state }) {
      return new Promise((resolve) => {
        logout(state.token).then(() => {
          resolve()
        }).catch(() => {
          resolve()
        }).finally(() => {
          commit('SET_TOKEN', '')
          commit('SET_ROLES', [])
          storage.remove(ACCESS_TOKEN)
        })
      })
    }

  }
}

export default user
