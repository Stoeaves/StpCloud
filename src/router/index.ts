import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router';
import { startProgress, closeProgress } from '../lib/nprogress';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/HomeView.vue'),
  },

  {
    path: '/admin',
    name: 'Admin',
    component: () => import('@/views/AdminView.vue'),
  },
  {
    path: '/download/:pathMatch(.*)*',
    name: 'Download',
    component: () => import('@/views/DownloadView.vue'),
  },

  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

router.beforeEach((_to, _from, next) => {
  startProgress();
  next();
});

router.afterEach(() => {
  closeProgress();
});

export default router;
