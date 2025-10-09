<template>
  <aside class="sidebar">
    <nav class="sidebar-nav">
      <ul>
        <li>
          <router-link to="/dashboard" class="sidebar-link">
            <i class="sidebar-icon">📊</i>
            <span>Dashboard</span>
          </router-link>
        </li>
        <li>
          <router-link to="/users" class="sidebar-link">
            <i class="sidebar-icon">👥</i>
            <span>Users</span>
          </router-link>
        </li>
        <li>
          <router-link to="/products" class="sidebar-link">
            <i class="sidebar-icon">📦</i>
            <span>Products</span>
          </router-link>
        </li>
        <li>
          <router-link to="/profile" class="sidebar-link">
            <i class="sidebar-icon">👤</i>
            <span>Profile</span>
          </router-link>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<script>
export default {
  name: 'AppSidebar'
}
</script>

<style scoped>
.sidebar {
  width: 250px;
  background-color: #f8f9fa;
  border-right: 1px solid #ddd;
  height: 100vh;
  position: fixed;
  overflow-y: auto;
}

.sidebar-nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar-link {
  display: flex;
  align-items: center;
  padding: 1rem 1.5rem;
  text-decoration: none;
  color: #333;
  transition: background-color 0.3s;
  border-left: 3px solid transparent;
}

.sidebar-link:hover {
  background-color: #e9ecef;
}

.sidebar-link.router-link-exact-active {
  background-color: #007bff;
  color: white;
  border-left-color: #007bff;
}

.sidebar-icon {
  margin-right: 0.75rem;
  font-size: 1.25rem;
}
</style>