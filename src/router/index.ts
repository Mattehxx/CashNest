import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { authGuard } from './guards'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: { public: true },
  },
  {
    path: '/',
    component: () => import('@/components/app/AppShell.vue'),
    children: [
      { path: '', name: 'dashboard', component: () => import('@/views/DashboardView.vue') },
      { path: 'conti', name: 'accounts', component: () => import('@/views/AccountsView.vue') },
      { path: 'categorie', name: 'categories', component: () => import('@/views/CategoriesView.vue') },
      { path: 'ricorrenti', name: 'recurring', component: () => import('@/views/RecurringView.vue') },
    ],
  },
  {
    path: '/no-family',
    name: 'no-family',
    component: () => import('@/views/NoFamilyView.vue'),
  },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

router.beforeEach(authGuard)

export default router
