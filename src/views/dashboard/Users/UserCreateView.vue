<template>
  <div class="user-create-page">
    <!-- Header Section -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">Create New User</h1>
        <p class="page-subtitle">Add a new user to your platform with role and permissions</p>
      </div>
      <div class="header-actions">
        <button class="action-btn secondary" @click="$router.back()">
          <svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 19L5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Back to Users
        </button>
      </div>
    </div>

    <!-- Form Section -->
    <div class="form-section">
      <div class="form-container">
        <UserForm 
          @save="handleSave" 
          @cancel="$router.back()"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { useRouter } from 'vue-router'
import UserForm from '@/components/dashboard/users/UserForm.vue'

export default {
  name: 'UserCreateView',
  components: {
    UserForm
  },
  setup() {
    const router = useRouter()
    
    const handleSave = () => {
      // Redirect back to users list after creating
      router.push('/users')
    }
    
    return {
      handleSave
    }
  }
}
</script>

<style scoped>
.user-create-page {
  min-height: 100vh;
  padding: 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 2rem 0 3rem;
  border-bottom: 1px solid var(--border-primary);
  margin-bottom: 3rem;
}

.header-content h1 {
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.page-subtitle {
  color: var(--text-secondary);
  font-size: 1.125rem;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  color: var(--text-secondary);
  text-decoration: none;
  font-weight: 500;
  transition: all var(--transition-normal);
  cursor: pointer;
}

.action-btn:hover {
  background: var(--bg-quaternary);
  color: var(--text-primary);
  transform: translateY(-2px);
}

.action-btn.secondary {
  background: var(--bg-quaternary);
  border-color: var(--border-secondary);
}

.icon {
  width: 1.25rem;
  height: 1.25rem;
}

.form-section {
  display: flex;
  justify-content: center;
  padding: 0 1rem;
}

.form-container {
  width: 100%;
  max-width: 600px;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 2rem;
    align-items: stretch;
  }
  
  .header-actions {
    justify-content: stretch;
  }
  
  .action-btn {
    flex: 1;
    justify-content: center;
  }
  
  .page-title {
    font-size: 2rem !important;
  }
}

@media (max-width: 480px) {
  .user-create-page {
    padding: 0;
  }
  
  .form-section {
    padding: 0;
  }
}
</style>