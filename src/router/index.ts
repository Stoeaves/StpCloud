import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router';

// 定义路由规则
const routes: Array<RouteRecordRaw> = [
  {
    path: '/', // 路径以 / 开头
    name: 'Home',
    component: () => import('@/views/HomeView.vue'), // 确保路径别名 @ 配置正确
  },
  // 其他路由...
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
  // 通配符路由放在最后
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
  },
];

// 创建路由实例，这里先使用 hash 模式排除问题
const router = createRouter({
  history: createWebHashHistory(), // 使用 hash 模式
  routes,
});

export default router;
