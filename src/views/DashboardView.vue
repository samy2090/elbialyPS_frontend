<template>
  <div class="site-container">
    <div class="site-header">
      <h2 class="site-title">Dashboard</h2>
    </div>
    
    <div class="site-dashboard-stats">
      <div class="site-stat-card">
        <h3>Users</h3>
        <p class="site-stat-value">125</p>
      </div>
      
      <div class="site-stat-card">
        <h3>Products</h3>
        <p class="site-stat-value">42</p>
      </div>
      
      <div class="site-stat-card">
        <h3>Orders</h3>
        <p class="site-stat-value">18</p>
      </div>
    </div>
    
    <div class="site-dashboard-content">
      <div class="site-recent-activity">
        <h3>Recent Activity</h3>
        <ul>
          <li>User John Doe registered</li>
          <li>Product XYZ was updated</li>
          <li>New order received</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DashboardView'
}
</script>

<style scoped>
.site-header {
  margin-bottom: 2rem;
}

.site-dashboard-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.site-stat-card {
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 1rem;
  text-align: center;
}

.site-stat-value {
  font-size: 2rem;
  font-weight: bold;
  margin: 0.5rem 0 0;
}

.site-dashboard-content {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

.site-recent-activity ul {
  list-style-type: none;
  padding: 0;
}

.site-recent-activity li {
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;
}

.site-recent-activity li:last-child {
  border-bottom: none;
}
</style>