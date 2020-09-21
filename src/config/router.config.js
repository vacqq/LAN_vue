// eslint-disable-next-line
import { UserLayout, BasicLayout, BlankLayout } from '@/layouts'
import { bxAnaalyse } from '@/core/icons'
import PageView from '../../src/layouts/PageView'

const RouteView = {
  name: 'RouteView',
  render: (h) => h('router-view')
}

export const asyncRouterMap = [

  {
    path: '/',
    name: 'index',
    component: BasicLayout,
    meta: { title: 'menu.home' },
    redirect: '/dashboard/workplace',
    children: [
      // dashboard
      {
        path: '/dashboard',
        name: 'dashboard',
        redirect: '/dashboard/workplace',
        component: RouteView,
        meta: { title: 'menu.dashboard', keepAlive: true, icon: bxAnaalyse, permission: ['dashboard'] },
        children: [
          {
            path: '/dashboard/workplace',
            name: 'Workplace',
            component: () => import('@/views/dashboard/Workplace'),
            meta: { title: 'menu.dashboard.workplace', keepAlive: true, permission: ['dashboard'] }
          }
        ]
      },

      // analysis
      {
        path: '/gridding/analysis',
        name: 'analysis',
        redirect: '/gridding/analysis/analysisSiteRank',
        component: RouteView,
        meta: { title: '统计报表', icon: 'area-chart' },
        children: [
          {
            path: '/gridding/analysis/historyData',
            name: 'historyData',
            component: () => import('@/views/gridding/analysis/historyData'),
            meta: { title: '历史数据', keepAlive: true }
          },
          {
            path: '/gridding/analysis/analysisSiteRank',
            name: 'analysisSiteRank',
            component: () => import('@/views/gridding/analysis/analysisSiteRank'),
            meta: { title: '站点排名分析', keepAlive: true }
          },
          {
            path: '/gridding/analysis/analysisAllTrend',
            name: 'analysisAllTrend',
            component: () => import('@/views/gridding/analysis/analysisAllTrend'),
            meta: { title: '综合趋势分析', keepAlive: true }
          },
          {
            path: '/gridding/analysis/analysisPlaceTrend',
            name: 'analysisPlaceTrend',
            component: () => import('@/views/gridding/analysis/analysisPlaceTrend'),
            meta: { title: '区域趋势分析', keepAlive: true }
          },
          {
            path: '/gridding/analysis/analysisSiteRelevance',
            name: 'analysisSiteRelevance',
            component: () => import('@/views/gridding/analysis/analysisSiteRelevance'),
            meta: { title: '站点相关分析', keepAlive: true }
          }
          ,


        ]
      },

      // warning
      {
        path: '/gridding/warning/warningDetail',
        name: 'warning',
        redirect: '/gridding/warning/warningDetail',
        component: RouteView,
        meta: { title: '报警管理', icon: 'warning' },
        children: [
          {
            path: '/gridding/warning/warningDetail',
            name: 'warningDetail',
            component: () => import('@/views/gridding/warning/warningDetail'),
            meta: { title: '报警数据', keepAlive: true }
          },
          {
            path: '/gridding/warning/warningRule',
            name: 'warningRule',
            component: () => import('@/views/gridding/warning/warningRule'),
            meta: { title: '报警规则配置', keepAlive: true, permission: ['SiteManage'] }
          }
        ]
      },

      {
        path: '/gridding/systemManage/userManage',
        name: 'systemManage',
        redirect: '/gridding/systemManage/userManage',
        component: RouteView,
        meta: { title: '系统管理', icon: 'setting', permission: ['SiteManage'] },
        children: [
          {
            path: '/gridding/systemManage/userManage',
            name: 'userManage',
            component: () => import('@/views/gridding/systemManage/userManage'),
            meta: { title: '用户管理', keepAlive: true }
          },
          {
            path: '/gridding/manage/SiteManage',
            name: 'SiteManage',
            component: () => import('@/views/gridding/manage/SiteManage'),
            meta: { title: '站点信息管理', keepAlive: true }
          }
        ]
      },

      {
        path: '/gridding/mySetting/changePassword',
        name: 'mySetting',
        redirect: '/gridding/mySetting/changePassword',
        component: RouteView,
        meta: { title: '个人设置', icon: 'user' },
        children: [
          {
            path: '/gridding/mySetting/changePassword',
            name: 'changePassword',
            component: () => import('@/views/gridding/mySetting/changePassword'),
            meta: { title: '密码修改', keepAlive: true }
          },
        ]
      },


      // list
      {
        hidden: true,
        path: '/list',
        name: 'list',
        component: RouteView,
        redirect: '/list/table-list',
        meta: { title: '列表页', icon: 'table', permission: ['table'] },
        children: [
          {
            path: '/list/table-list/:pageNo([1-9]\\d*)?',
            name: 'TableListWrapper',
            hideChildrenInMenu: true, // 强制显示 MenuItem 而不是 SubMenu
            component: () => import('@/views/list/TableList'),
            meta: { title: '查询表格', keepAlive: true, permission: ['table'] }
          },
          {
            path: '/list/basic-list',
            name: 'BasicList',
            component: () => import('@/views/list/BasicList'),
            meta: { title: '标准列表', keepAlive: true, permission: ['table'] }
          },
          {
            path: '/list/card',
            name: 'CardList',
            component: () => import('@/views/list/CardList'),
            meta: { title: '卡片列表', keepAlive: true, permission: ['table'] }
          },
          {
            path: '/list/search',
            name: 'SearchList',
            component: () => import('@/views/list/search/SearchLayout'),
            redirect: '/list/search/article',
            meta: { title: '搜索列表', keepAlive: true, permission: ['table'] },
            children: [
              {
                path: '/list/search/article',
                name: 'SearchArticles',
                component: () => import('../views/list/search/Article'),
                meta: { title: '搜索列表（文章）', permission: ['table'] }
              },
              {
                path: '/list/search/project',
                name: 'SearchProjects',
                component: () => import('../views/list/search/Projects'),
                meta: { title: '搜索列表（项目）', permission: ['table'] }
              },
              {
                path: '/list/search/application',
                name: 'SearchApplications',
                component: () => import('../views/list/search/Applications'),
                meta: { title: '搜索列表（应用）', permission: ['table'] }
              }
            ]
          }
        ]
      },


      // other
      {
        hidden: true,
        path: '/other',
        name: 'otherPage',
        component: PageView,
        meta: { title: '权限角色管理', icon: 'slack', permission: ['dashboard'] },
        redirect: '/other/icon-selector',
        children: [
          {
            path: '/other/icon-selector',
            name: 'TestIconSelect',
            component: () => import('@/views/other/IconSelectorView'),
            meta: { title: 'IconSelector', icon: 'tool', keepAlive: true, permission: ['dashboard'] }
          },
          {
            path: '/other/list',
            component: RouteView,
            meta: { title: '业务布局', icon: 'layout', permission: ['support'] },
            redirect: '/other/list/tree-list',
            children: [
              {
                path: '/other/list/tree-list',
                name: 'TreeList',
                component: () => import('@/views/other/TreeList'),
                meta: { title: '树目录表格', keepAlive: true }
              },
              {
                path: '/other/list/edit-table',
                name: 'EditList',
                component: () => import('@/views/other/TableInnerEditList'),
                meta: { title: '内联编辑表格', keepAlive: true }
              },
              {
                path: '/other/list/user-list',
                name: 'UserList',
                component: () => import('@/views/other/UserList'),
                meta: { title: '用户列表', keepAlive: true }
              },
              {
                path: '/other/list/role-list',
                name: 'RoleList',
                component: () => import('@/views/other/RoleList'),
                meta: { title: '角色列表', keepAlive: true }
              },
              {
                path: '/other/list/system-role',
                name: 'SystemRole',
                component: () => import('@/views/role/RoleList'),
                meta: { title: '角色列表2', keepAlive: true }
              },
              {
                path: '/other/list/permission-list',
                name: 'PermissionList',
                component: () => import('@/views/other/PermissionList'),
                meta: { title: '权限列表', keepAlive: true }
              }
            ]
          }
        ]
      }
    ]
  },
  {
    path: '*', redirect: '/404', hidden: true
  }
]

/**
 * 基础路由
 * @type { *[] }
 */
export const constantRouterMap = [
  {
    path: '/user',
    component: UserLayout,
    redirect: '/user/login',
    hidden: true,
    children: [
      {
        path: 'login',
        name: 'login',
        component: () => import(/* webpackChunkName: "user" */ '@/views/user/Login')
      },
      {
        path: 'register',
        name: 'register',
        component: () => import(/* webpackChunkName: "user" */ '@/views/user/Register')
      },
      {
        path: 'register-result',
        name: 'registerResult',
        component: () => import(/* webpackChunkName: "user" */ '@/views/user/RegisterResult')
      },
      {
        path: 'recover',
        name: 'recover',
        component: undefined
      }
    ]
  },

  {
    path: '/404',
    component: () => import(/* webpackChunkName: "fail" */ '@/views/exception/404')
  }

]
