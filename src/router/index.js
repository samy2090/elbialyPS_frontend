import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

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
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/auth/RegisterView.vue'),
    },
    {
      path: '/forgot-password',
      name: 'forgotPassword',
      component: () => import('../views/auth/ForgotPasswordView.vue'),
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/DashboardView.vue'),
    },
    {
      path: '/users',
      name: 'users',
      component: () => import('../views/Users/UserListView.vue'),
    },
    {
      path: '/users/profile',
      name: 'userProfile',
      component: () => import('../views/Users/UserProfileView.vue'),
    },
    {
      path: '/products',
      name: 'products',
      component: () => import('../views/Products/ProductListView.vue'),
    },
    {
      path: '/products/:id',
      name: 'productDetail',
      component: () => import('../views/Products/ProductDetailView.vue'),
      props: true
    },
  ],
})

export default router