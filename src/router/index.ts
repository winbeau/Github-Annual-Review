import { createRouter, createWebHistory } from 'vue-router'
import { useGitHubStore } from '@/stores/github'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/LoginView.vue')
    },
    {
      path: '/report',
      name: 'report',
      component: () => import('@/views/ReportView.vue'),
      meta: { requiresAuth: true }
    }
  ]
})

// Navigation guard
router.beforeEach((to, _from, next) => {
  const store = useGitHubStore()

  if (to.meta.requiresAuth && !store.token) {
    next({ name: 'home' })
  } else if (to.name === 'home' && store.token) {
    next({ name: 'report' })
  } else {
    next()
  }
})

export default router
