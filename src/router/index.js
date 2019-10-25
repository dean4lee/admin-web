import Vue from 'vue'
import Router from 'vue-router'
import login from '@/components/login'
import navigation from '@/components/navigation'
import index from '@/components/index'
import userinfo from '@/components/user/info'
import resetPwd from '@/components/user/reset'
import user from '@/components/sys/user'
import role from '@/components/sys/role'
import group from '@/components/sys/group'
import res from '@/components/sys/res'
import dept from '@/components/sys/dept'
import loginLog from '@/components/log/loginLog'
import operationLog from '@/components/log/operationLog'
import druidLog from '@/components/log/druidLog'

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'index',
      component: navigation
    },
    {
      path: '/login',
      name: '登陆',
      component: login
    },
    {
      path: '/navigation',
      name: '菜单导航栏',
      component: navigation,
      children: [
        {
          path: '/index',
          name: '主页面',
          component: index,
        },
        {
          path: '/info',
          name: '个人信息',
          component: userinfo,
        },
        {
          path: '/reset',
          name: '修改密码',
          component: resetPwd,
        },
        {
          path: '/sys/user',
          name: '用户管理',
          component: user,
        },
        {
          path: '/sys/role',
          name: '角色管理',
          component: role,
        },
        {
          path: '/sys/group',
          name: '用户组管理',
          component: group,
        },
        {
          path: '/sys/res',
          name: '资源管理',
          component: res,
        },
        {
          path: '/sys/dept',
          name: '部门管理',
          component: dept,
        },
        {
          path: '/log/login',
          name: '登陆日志',
          component: loginLog,
        },
        {
          path: '/log/operation',
          name: '操作日志',
          component: operationLog,
        },
        {
          path: '/log/druid',
          name: '数据监控',
          component: druidLog,
        },
      ]
    },

  ]
})
