import { DEFAULT_LAYOUT } from '../base';
import { AppRouteRecordRaw } from '../types';

const USER_MANAGEMENT: AppRouteRecordRaw = {
  path: '/user-management',
  name: 'user-management',
  component: DEFAULT_LAYOUT,
  meta: {
    locale: 'menu.userManagement',
    requiresAuth: true,
    icon: 'icon-user',
    order: 1,
    roles: ['admin'],
  },
  children: [
    {
      path: 'list',
      name: 'UserManagementList',
      component: () => import('@/views/user-management/index.vue'),
      meta: {
        locale: 'menu.userManagement.list',
        requiresAuth: true,
        roles: ['admin'],
      },
    },
  ],
};

export default USER_MANAGEMENT;
