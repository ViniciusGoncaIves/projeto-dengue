const routes = [
  {
    path: '/',
    component: () => import('layouts/LandingLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/IndexPage.vue'),
        meta: {
          landingHeader: {
            searchPlaceholder: 'Buscar dados...',
            action: { label: 'Reportar foco', to: '/report' },
          },
        },
      },
      {
        path: 'prevention',
        component: () => import('pages/PreventionPage.vue'),
        meta: {
          landingHeader: {
            action: { label: 'Reportar foco', to: '/report' },
          },
        },
      },
      {
        path: 'emergency',
        component: () => import('pages/EmergencyPage.vue'),
        meta: {
          landingHeader: {
            searchPlaceholder: 'Buscar centros de apoio...',
            action: { label: 'Emergencia 192', href: 'tel:192' },
          },
        },
      },
      {
        path: 'report',
        component: () => import('pages/ReportSitePage.vue'),
        meta: {
          landingHeader: {
            action: { label: 'Login', to: '/login' },
          },
        },
      },
    ],
  },
  {
    path: '/login',
    component: () => import('pages/LoginPage.vue'),
  },
  {
    path: '/register',
    component: () => import('pages/RegisterPage.vue'),
  },
  {
    path: '/dashboard',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', component: () => import('pages/DashboardPage.vue') },
      { path: 'denuncias/:id/editar', component: () => import('pages/ReportSitePage.vue') },
    ],
  },
  {
    path: '/denuncias',
    redirect: '/dashboard',
    meta: { requiresAuth: true },
  },
  {
    path: '/mapa',
    redirect: '/dashboard',
    meta: { requiresAuth: true },
  },
  {
    path: '/relatorios',
    redirect: '/dashboard',
    meta: { requiresAuth: true },
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
