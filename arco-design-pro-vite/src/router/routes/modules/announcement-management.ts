import { DEFAULT_LAYOUT } from '../base';
import { AppRouteRecordRaw } from '../types';

const ANNOUNCEMENT_MANAGEMENT: AppRouteRecordRaw = {
  path: '/announcement-management',
  name: 'announcement-management',
  component: DEFAULT_LAYOUT,
  meta: {
    locale: 'menu.announcementManagement',
    requiresAuth: true,
    icon: 'icon-notification',
    order: 2,
    roles: ['admin'],
  },
  children: [
    {
      path: 'list',
      name: 'AnnouncementManagementList',
      component: () => import('@/views/announcement-management/index.vue'),
      meta: {
        locale: 'menu.announcementManagement.list',
        requiresAuth: true,
        roles: ['admin'],
      },
    },
  ],
};

export default ANNOUNCEMENT_MANAGEMENT;
