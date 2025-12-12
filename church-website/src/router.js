import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    component: () => import('./views/PublicLayout.vue'),
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import('./views/Home.vue')
      },
      {
        path: '/church/:slug',
        name: 'ChurchPage',
        component: () => import('./views/ChurchPage.vue')
      }
    ]
  },
  {
    path: '/admin',
    component: () => import('./views/AdminLayout.vue'),
    children: [
      {
        path: 'login',
        name: 'AdminLogin',
        component: () => import('./views/AdminLogin.vue')
      },
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: () => import('./views/AdminDashboard.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'church-info',
        name: 'ChurchInfo',
        component: () => import('./views/ChurchInfo.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'news',
        name: 'NewsManager',
        component: () => import('./views/NewsManager.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'events',
        name: 'EventsManager',
        component: () => import('./views/EventsManager.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'gallery',
        name: 'GalleryManager',
        component: () => import('./views/GalleryManager.vue'),
        meta: { requiresAuth: true }
      }
    ]
  },
  {
    path: '/super-admin',
    children: [
      {
        path: 'login',
        name: 'SuperAdminLogin',
        component: () => import('./views/SuperAdminLogin.vue')
      },
      {
        path: 'dashboard',
        name: 'SuperAdminDashboard',
        component: () => import('./views/SuperAdminDashboard.vue'),
        meta: { requiresSuperAuth: true }
      }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !localStorage.getItem('church_admin_token')) {
    next('/admin/login');
  } else if (to.meta.requiresSuperAuth && !localStorage.getItem('super_admin_token')) {
    next('/super-admin/login');
  } else {
    next();
  }
});

export default router;