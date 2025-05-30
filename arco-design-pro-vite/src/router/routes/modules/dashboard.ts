import { DEFAULT_LAYOUT } from '../base';
import { AppRouteRecordRaw } from '../types';

const DASHBOARD: AppRouteRecordRaw = {
  path: '/dashboard',
  name: 'dashboard',
  component: DEFAULT_LAYOUT,
  redirect: '/dashboard/workplace',
  meta: {
    locale: 'menu.dashboard',
    requiresAuth: true,
    icon: 'icon-dashboard',
    order: 0,
  },
  children: [
    {
      path: 'workplace',
      name: 'Workplace',
      component: () => import('@/views/dashboard/form/index.vue'),
      meta: {
        locale: 'workplace.form.title',
        requiresAuth: true,
        roles: ['*'],
      },
    },
    {
      path: 'product-list',
      name: 'ProductList',
      component: () => import('@/views/dashboard/product-list/index.vue'),
      meta: {
        locale: 'menu.dashboard.productList',
        requiresAuth: true,
        roles: ['*'],
      },
    },
  ],
};

export default DASHBOARD;
