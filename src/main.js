// with polyfills
import 'core-js/stable'
import 'regenerator-runtime/runtime'

import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store/'
import i18n from './locales'
import { VueAxios } from './utils/request'
import ProLayout, { PageHeaderWrapper } from '@ant-design-vue/pro-layout'
import themePluginConfig from '../config/themePluginConfig'

// mock
// WARNING: `mockjs` NOT SUPPORT `IE` PLEASE DO NOT USE IN `production` ENV.
import './mock'

import bootstrap from './core/bootstrap'
import './core/lazy_use'
import './permission' // permission control
import './utils/filter' // global filter
import './global.less'


//引入element-ui,顺便引入样式css文件
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

//引入vue-echarts,顺便引入样式css文件
import ECharts from 'vue-echarts'
import 'echarts/lib/chart/line'
// 引入柱状图
import 'echarts/lib/chart/bar';
// 引入提示框和标题组件
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/title';
import echarts from 'echarts'

//全局引入jquery
import $ from 'jquery'
//引入权限控制路由机制
//import './store/modules/permission.js'


//全局引入$echarts参数
Vue.prototype.$echarts = echarts
Vue.component('chart', ECharts)
Vue.use(ElementUI)


Vue.config.productionTip = false

// mount axios to `Vue.$http` and `this.$http`
Vue.use(VueAxios)
Vue.component('pro-layout', ProLayout)
Vue.component('page-header-wrapper', PageHeaderWrapper)

window.umi_plugin_ant_themeVar = themePluginConfig.theme

new Vue({
  router,
  store,
  i18n,
  created: bootstrap,
  render: h => h(App)
}).$mount('#app')
