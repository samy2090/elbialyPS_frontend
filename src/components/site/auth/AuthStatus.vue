<template>
  <div class="auth-status">
    <div v-if="authStore.isAuthenticated && authStore.user" class="user-info">
      <div class="user-avatar">
        <div class="avatar-circle">
          <i class="icon">👤</i>
        </div>
      </div>
      <div class="user-details">
        <span class="welcome-text">Welcome back</span>
        <span class="user-name">{{ authStore.user.name }}</span>
      </div>
      <button 
        @click="handleLogout" 
        class="logout-btn" 
        :disabled="authStore.loading"
      >
        <i class="logout-icon">🚪</i>
        {{ authStore.loading ? 'Logging out...' : 'Logout' }}
      </button>
    </div>
    <div v-else class="auth-links">
      <RouterLink to="/login" class="auth-link login-link">
        <i class="link-icon">🔐</i>
        Login
      </RouterLink>
      <RouterLink to="/register" class="auth-link register-link">
        <i class="link-icon">✨</i>
        Register
      </RouterLink>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

export default {
  name: 'AuthStatus',
  setup() {
    const authStore = useAuthStore()
    const router = useRouter()
    
    const handleLogout = async () => {
      try {
        await authStore.logout()
        // Redirect to home page after logout
        router.push('/')
      } catch (error) {
        console.error('Logout failed:', error)
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
.auth-status {
  display: flex;
  align-items: center;
  margin-left: auto;
  position: relative;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 16px;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(6, 182, 212, 0.1));
  border: 1px solid rgba(139, 92, 246, 0.2);
  border-radius: 50px;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.user-info:hover {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(6, 182, 212, 0.15));
  border-color: rgba(139, 92, 246, 0.3);
  transform: translateY(-1px);
  box-shadow: 0 8px 25px rgba(139, 92, 246, 0.2);
}

.user-avatar {
  position: relative;
}

.avatar-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3);
  transition: all 0.3s ease;
}

.avatar-circle:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(139, 92, 246, 0.4);
}

.avatar-circle .icon {
  font-size: 18px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.welcome-text {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 400;
  letter-spacing: 0.5px;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.logout-btn {
  padding: 8px 16px;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
  min-width: 100px;
  justify-content: center;
}

.logout-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(239, 68, 68, 0.4);
}

.logout-btn:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
}

.logout-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: 0 4px 15px rgba(239, 68, 68, 0.2);
}

.logout-icon {
  font-size: 14px;
  transform: rotate(0deg);
  transition: transform 0.3s ease;
}

.logout-btn:hover:not(:disabled) .logout-icon {
  transform: rotate(15deg);
}

.auth-links {
  display: flex;
  gap: 12px;
  align-items: center;
}

.auth-link {
  color: var(--color-text);
  text-decoration: none;
  padding: 10px 20px;
  border-radius: 25px;
  font-weight: 500;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  border: 1px solid transparent;
}

.auth-link::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(6, 182, 212, 0.1));
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: -1;
}

.auth-link:hover::before {
  opacity: 1;
}

.auth-link:hover {
  transform: translateY(-2px);
  border-color: rgba(139, 92, 246, 0.3);
  box-shadow: 0 8px 25px rgba(139, 92, 246, 0.2);
}

.login-link {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(6, 182, 212, 0.1));
  border-color: rgba(59, 130, 246, 0.2);
}

.login-link:hover {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(6, 182, 212, 0.2));
  border-color: rgba(59, 130, 246, 0.4);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
}

.register-link {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(168, 85, 247, 0.1));
  border-color: rgba(139, 92, 246, 0.2);
}

.register-link:hover {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(168, 85, 247, 0.2));
  border-color: rgba(139, 92, 246, 0.4);
  box-shadow: 0 8px 25px rgba(139, 92, 246, 0.3);
}

.link-icon {
  font-size: 16px;
  transition: transform 0.3s ease;
}

.auth-link:hover .link-icon {
  transform: scale(1.1);
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .user-info {
    gap: 12px;
    padding: 6px 12px;
  }
  
  .avatar-circle {
    width: 35px;
    height: 35px;
  }
  
  .avatar-circle .icon {
    font-size: 16px;
  }
  
  .user-details {
    display: none;
  }
  
  .logout-btn {
    padding: 6px 12px;
    font-size: 12px;
    min-width: 80px;
  }
  
  .auth-links {
    gap: 8px;
  }
  
  .auth-link {
    padding: 8px 16px;
    font-size: 13px;
  }
  
  .link-icon {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .auth-link span {
    display: none;
  }
  
  .auth-link {
    padding: 8px;
    min-width: 40px;
    justify-content: center;
  }
  
  .logout-btn {
    padding: 6px;
    min-width: 40px;
  }
  
  .logout-btn span {
    display: none;
  }
}
</style>