import { createRouter, createWebHistory } from 'vue-router';
import Login from './views/Login.vue';
import SMSManager from './views/SMSManager.vue';

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresGuest: true }
  },
  {
    path: '/sms-manager',
    name: 'SMSManager',
    component: SMSManager,
    meta: { requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Navigation guard
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');

  if (to.meta.requiresAuth && !token) {
    next('/login');
  } else if (to.meta.requiresGuest && token) {
    next('/sms-manager');
  } else {
    next();
  }
});

export default router;
