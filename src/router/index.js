import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/site/HomeView.vue'
import ProfileView from '../views/site/ProfileView.vue'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/site/AboutView.vue'),
    },
    {
      path: '/feed',
      name: 'publicFeed',
      component: () => import('../views/site/PublicFeedView.vue'),
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView,
      meta: { requiresAuth: true }
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/site/auth/LoginView.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/site/auth/RegisterView.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/forgot-password',
      name: 'forgotPassword',
      component: () => import('../views/site/auth/ForgotPasswordView.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/dashboard/DashboardView.vue'),
      meta: { requiresAuth: true, requiresDashboardAccess: true }
    },
    {
      path: '/users',
      name: 'users',
      component: () => import('../views/dashboard/Users/UserListView.vue'),
      meta: { requiresAuth: true, requiresDashboardAccess: true }
    },
    {
      path: '/users/create',
      name: 'userCreate',
      component: () => import('../views/dashboard/Users/UserCreateView.vue'),
      meta: { requiresAuth: true, requiresDashboardAccess: true }
    },
    {
      path: '/users/:id',
      name: 'userDetail',
      component: () => import('../views/dashboard/Users/UserDetailView.vue'),
      meta: { requiresAuth: true, requiresDashboardAccess: true }
    },
    {
      path: '/users/:id/edit',
      name: 'userEdit',
      component: () => import('../views/dashboard/Users/UserEditView.vue'),
      meta: { requiresAuth: true, requiresDashboardAccess: true }
    },
    {
      path: '/expenses',
      name: 'expenses',
      redirect: () => ({ path: '/dashboard', query: { section: 'expenses' } }),
      meta: { requiresAuth: true, requiresDashboardAccess: true }
    },
    {
      path: '/spin-wheel',
      name: 'spinWheelAdmin',
      redirect: () => ({ path: '/dashboard', query: { section: 'spin-wheel-settings' } }),
      meta: { requiresAuth: true, requiresDashboardAccess: true }
    },
    {
      path: '/posts',
      name: 'postsAdmin',
      redirect: () => ({ path: '/dashboard', query: { section: 'posts-all' } }),
      meta: { requiresAuth: true, requiresDashboardAccess: true }
    },
  ],
})

// Navigation guard
router.beforeEach(async (to, from, next) => {
  // Initialize auth store
  const authStore = useAuthStore()

  // Try to restore auth state from localStorage
  authStore.initAuth()

  // Check if route requires authentication or dashboard access (admin/staff only)
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresDashboardAccess = to.matched.some(record => record.meta.requiresDashboardAccess)
  const requiresGuest = to.matched.some(record => record.meta.requiresGuest)

  // If route requires auth but user is not authenticated
  if (requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  }
  // If route requires dashboard (admin/staff) but user is not allowed
  else if (requiresDashboardAccess && !authStore.canAccessDashboard) {
    next({ path: '/', query: { error: 'unauthorized' } })
  }
  // If route requires guest but user is authenticated
  else if (requiresGuest && authStore.isAuthenticated) {
    next('/dashboard')
  }
  // Allow navigation
  else {
    next()
  }
})

export default router