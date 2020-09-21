import router from './router'
import store from './store'
import storage from 'store'
import NProgress from 'nprogress' // progress bar
import '@/components/NProgress/nprogress.less' // progress bar custom style
import notification from 'ant-design-vue/es/notification'
import { setDocumentTitle, domTitle } from '@/utils/domUtil'
import { ACCESS_TOKEN } from '@/store/mutation-types'
import { i18nRender } from '@/locales'

NProgress.configure({ showSpinner: false }) // NProgress Configuration

const whiteList = ['login', 'register', 'registerResult'] // no redirect whitelist
const loginRoutePath = '/user/login'
const defaultRoutePath = '/dashboard/workplace'

router.beforeEach((to, from, next) => {
  // console.log("路过beforeEach")
  // console.log(store)
  NProgress.start() // start progress bar
  to.meta && (typeof to.meta.title !== 'undefined' && setDocumentTitle(`${i18nRender(to.meta.title)} - ${domTitle}`))
  /* has token */
  //storage仓库存储
  // console.log("to.path" + to.path)
  if (storage.get(ACCESS_TOKEN)) {
    //此处进行拦截器管理
    if (to.path === loginRoutePath) {
      // console.log("进入to.path==loginRoutePath页面")
      next({ path: defaultRoutePath })
      NProgress.done()
    } else {
      // console.log("store.getters.roles.length" + store.getters.roles.length)
      // console.log("store.getters.roles")
      // console.log(store.getters.roles)

      // check login user.roles is null
      if (store.getters.roles.length === 0) {
        // console.log("进入store.getters.roles.length === 0页面")
        // console.log(store.getters.roles)
        // console.log(store.getters.username)
        // request login userInfo
        store.dispatch('GetInfo').then(res => {
          const roles = res.result && res.result.role
          // console.log("初始化页面获取到的GetInfo")
          // console.log(res)

          // generate dynamic router
          store.dispatch('GenerateRoutes', { roles }).then(() => {
            // 根据roles权限生成可访问的路由表
            // 动态添加可访问路由表
            router.addRoutes(store.getters.addRouters)
            // 请求带有 redirect 重定向时，登录自动重定向到该地址
            const redirect = decodeURIComponent(from.query.redirect || to.path)
            if (to.path === redirect) {
              // console.log("跳转到to.path路由redirect" + redirect)
              // set the replace: true so the navigation will not leave a history record
              next({ ...to, replace: true })
            } else {
              // 跳转到目的路由
              // console.log("跳转到目的路由")
              next({ path: redirect })
            }
          })
        })
          .catch(() => {
            // notification.error({
            //   message: '错误',
            //   description: '请求用户信息失败，请重试'
            // })
            // 失败时，获取用户信息失败时，调用登出，来清空历史保留信息
            store.dispatch('Logout').then(() => {
              next({ path: loginRoutePath, query: { redirect: to.fullPath } })
            })
          })
      } else {
        next()
      }
    }
  } else {
    if (whiteList.includes(to.name)) {
      // 在免登录白名单，直接进入
      next()
    } else {
      console.log("loginRoutePath" + loginRoutePath)
      next({ path: loginRoutePath, query: { redirect: to.fullPath } })
      NProgress.done() // if current page is login will not trigger afterEach hook, so manually handle it
    }
  }
})

router.afterEach(() => {
  NProgress.done() // finish progress bar
})
