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
  },
  {
    path: '/members',
    children: [
      {
        path: 'login',
        name: 'MembersLogin',
        component: () => import('./views/MembersLogin.vue')
      },
      {
        path: 'dashboard',
        name: 'MembersDashboard',
        component: () => import('./views/MembersDashboard.vue'),
        meta: { requiresMembersAuth: true }
      },
      {
        path: 'list',
        name: 'MembersList',
        component: () => import('./views/MembersList.vue'),
        meta: { requiresMembersAuth: true }
      },
      {
        path: 'add',
        name: 'AddMember',
        component: () => import('./views/AddMember.vue'),
        meta: { requiresMembersAuth: true }
      },
      {
        path: 'edit/:id',
        name: 'EditMember',
        component: () => import('./views/EditMember.vue'),
        meta: { requiresMembersAuth: true }
      },
      {
        path: 'send-sms',
        name: 'SendSMS',
        component: () => import('./views/SendSMS.vue'),
        meta: { requiresMembersAuth: true }
      },
      {
        path: 'sms-logs',
        name: 'SMSLogs',
        component: () => import('./views/SMSLogs.vue'),
        meta: { requiresMembersAuth: true }
      },
      {
        path: 'kontingent',
        name: 'MembersKontingent',
        component: () => import('./views/MembersKontingent.vue'),
        meta: { requiresMembersAuth: true }
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
  } else if (to.meta.requiresMembersAuth && !localStorage.getItem('members_admin_token')) {
    next('/members/login');
  } else {
    next();
  }
});

export default router;