import antd from 'ant-design-vue/es/locale-provider/zh_CN'
import momentCN from 'moment/locale/zh-cn'

const components = {
  antLocale: antd,
  momentName: 'zh-cn',
  momentLocale: momentCN
}

const locale = {
  'message': '-',
  'menu.home': '主页',
  'menu.dashboard': '仪表盘',
  'menu.dashboard.analysis': '分析页',
  'menu.dashboard.monitor': '监控页',
  'menu.dashboard.workplace': '工作台',

  'layouts.usermenu.dialog.title': '信息',
  'layouts.usermenu.dialog.content': '你确定要退出吗。',

  'app.setting.pagestyle': '页面设置',
  'app.setting.pagestyle.light': 'Light style',
  'app.setting.pagestyle.dark': 'Dark style',
  'app.setting.pagestyle.realdark': 'RealDark style',
  'app.setting.themecolor': '主题颜色',
  'app.setting.navigationmode': '布局模式',
  'app.setting.content-width': '内容宽度',
  'app.setting.fixedheader': '固定表头',
  'app.setting.fixedsidebar': '固定提要栏',
  'app.setting.sidemenu': 'Side Menu Layout',
  'app.setting.topmenu': 'Top Menu Layout',
  'app.setting.content-width.fixed': 'Fixed',
  'app.setting.content-width.fluid': 'Fluid',
  'app.setting.othersettings': '其他设置',
  'app.setting.weakmode': '夜间模式',
  'app.setting.copy': '复制设置',
  'app.setting.loading': 'Loading theme',
  'app.setting.copyinfo': '复制成功',
  'app.setting.production.hint': '设置面板仅在开发环境中显示'
}

export default {
  ...components,
  ...locale
}
