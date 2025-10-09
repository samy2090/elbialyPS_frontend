<template>
  <nav class="navbar">
    <div class="navbar-brand">
      <router-link to="/">My App</router-link>
    </div>
    
    <div class="navbar-menu">
      <div class="navbar-start">
        <router-link to="/dashboard" class="navbar-item">Dashboard</router-link>
        <router-link to="/users" class="navbar-item">Users</router-link>
        <router-link to="/products" class="navbar-item">Products</router-link>
      </div>
      
      <div class="navbar-end">
        <div class="navbar-item" v-if="authStore.isAuthenticated">
          <span>Welcome, {{ authStore.user?.name }}</span>
          <button class="navbar-btn" @click="handleLogout">Logout</button>
        </div>
        <div class="navbar-item" v-else>
          <router-link to="/login" class="navbar-btn">Login</router-link>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'AppNavbar',
  setup() {
    const authStore = useAuthStore()
    
    const handleLogout = async () => {
      try {
        await authStore.logout()
      } catch (error) {
        console.error('Logout error:', error)
      }
    }
    
    return {
      authStore,
      handleLogout
    }
  }
}
</script>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #007bff;
  color: white;
}

.navbar-brand a {
  color: white;
  text-decoration: none;
  font-size: 1.5rem;
  font-weight: bold;
}

.navbar-menu {
  display: flex;
  align-items: center;
  width: 100%;
}

.navbar-start {
  display: flex;
  margin-left: 2rem;
}

.navbar-item {
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  margin: 0 0.25rem;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.navbar-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.navbar-end {
  display: flex;
  align-items: center;
}

.navbar-btn {
  background-color: transparent;
  color: white;
  border: 1px solid white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  margin-left: 1rem;
  transition: background-color 0.3s;
}

.navbar-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
}
</style>