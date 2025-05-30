import localeLogin from '@/views/login/locale/zh-CN';

/** simple end */
import localeSettings from './zh-CN/settings';

export default {
  'messageBox.logout': '退出',
  'menu.dashboard': '设备-产品内容',
  'menu.server.dashboard': '仪表盘-服务端',
  'menu.server.workplace': '工作台-服务端',
  'menu.server.monitor': '实时监控-服务端',
  'menu.list': '列表页',
  'menu.result': '结果页',
  'menu.exception': '异常页',
  'menu.form': '表单页',
  'menu.profile': '详情页',
  'menu.visualization': '数据可视化',
  'menu.user': '个人中心',
  'menu.userManagement': '门店管理',
  'menu.userManagement.list': '门店列表',
  'menu.arcoWebsite': 'Arco Design',
  'menu.cashier': '茶饮药膳收银台',
  'menu.backend': '茶饮药膳后台',
  'menu.faq': '常见问题',
  'navbar.docs': '文档中心',
  'navbar.action.locale': '切换为中文',
  'workplace.form.title': '甄选产品',
  'menu.dashboard.productList': '产品列表',
  // 门店管理相关
  'userManagement.title': '门店管理',
  'userManagement.createUser': '创建门店',
  'userManagement.editUser': '编辑门店',
  'userManagement.table.id': 'ID',
  'userManagement.table.nickname': '门店名称',
  'userManagement.table.phone': '联系电话',
  'userManagement.table.password': '密码',
  'userManagement.table.role': '门店类型',
  'userManagement.table.deviceCount': '关联设备',
  'userManagement.table.actions': '操作',
  'userManagement.form.nickname': '门店名称',
  'userManagement.form.nicknamePlaceholder': '请输入门店名称',
  'userManagement.form.phone': '联系电话',
  'userManagement.form.phonePlaceholder': '请输入联系电话',
  'userManagement.form.password': '密码',
  'userManagement.form.passwordPlaceholder': '请输入密码',
  'userManagement.form.role': '门店类型',
  'userManagement.form.rolePlaceholder': '请选择门店类型',
  'userManagement.form.deviceIds': '关联设备',
  'userManagement.form.deviceIdsPlaceholder':
    '请输入关联设备id,多个设备id用英文逗号隔开,如:device001,device002',
  'userManagement.role.user': '普通门店',
  'userManagement.role.admin': '旗舰门店',
  'userManagement.actions.edit': '编辑',
  'userManagement.actions.delete': '删除',
  ...localeSettings,
  ...localeLogin,
};
