import { DEFAULT_LAYOUT } from '../base';
import { AppRouteRecordRaw } from '../types';

const USER_PROFILE: AppRouteRecordRaw = {
  path: '/user-profile',
  name: 'user-profile',
  component: DEFAULT_LAYOUT,
  meta: {
    locale: 'menu.userProfile',
    requiresAuth: true,
    icon: 'icon-user',
    hideInMenu: true,
    order: 2,
  },
  children: [
    {
      path: '',
      name: 'UserProfile',
      component: () => import('@/views/user-profile/index.vue'),
      meta: {
        locale: 'menu.userProfile',
        requiresAuth: true,
        hideInMenu: true,
      },
    },
  ],
};

export default USER_PROFILE;
