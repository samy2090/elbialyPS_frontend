import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
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
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/auth/LoginView.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/auth/RegisterView.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/forgot-password',
      name: 'forgotPassword',
      component: () => import('../views/auth/ForgotPasswordView.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/DashboardView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/users',
      name: 'users',
      component: () => import('../views/Users/UserListView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/users/create',
      name: 'userCreate',
      component: () => import('../views/Users/UserCreateView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/users/:id',
      name: 'userDetail',
      component: () => import('../views/Users/UserDetailView.vue'),
      props: true,
      meta: { requiresAuth: true }
    },
    {
      path: '/users/:id/edit',
      name: 'userEdit',
      component: () => import('../views/Users/UserEditView.vue'),
      props: true,
      meta: { requiresAuth: true }
    },
    {
      path: '/users/profile',
      name: 'userProfile',
      component: () => import('../views/Users/UserProfileView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/products',
      name: 'products',
      component: () => import('../views/Products/ProductListView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/products/:id',
      name: 'productDetail',
      component: () => import('../views/Products/ProductDetailView.vue'),
      props: true,
      meta: { requiresAuth: true }
    },
  ],
})

// Navigation guard
router.beforeEach(async (to, from, next) => {
  // Initialize auth store
  const authStore = useAuthStore()
  
  // Try to restore auth state from localStorage
  authStore.initAuth()
  
  // Check if route requires authentication
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresGuest = to.matched.some(record => record.meta.requiresGuest)
  
  // If route requires auth but user is not authenticated
  if (requiresAuth && !authStore.isAuthenticated) {
    next('/login')
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