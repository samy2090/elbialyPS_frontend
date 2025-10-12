<template>
  <div class="loading-spinner">
    <div class="spinner-container">
      <div class="spinner-rings">
        <div class="ring-1"></div>
        <div class="ring-2"></div>
        <div class="ring-3"></div>
      </div>
      <div class="spinner-center">
        <i class="center-icon">⚡</i>
      </div>
    </div>
    <div class="loading-dots">
      <span class="dot"></span>
      <span class="dot"></span>
      <span class="dot"></span>
    </div>
    <p v-if="message" class="loading-message">{{ message }}</p>
  </div>
</template>

<script>
export default {
  name: 'LoadingSpinner',
  props: {
    message: {
      type: String,
      default: 'Loading...'
    }
  }
}
</script>

<style scoped>
.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  gap: 24px;
}

.spinner-container {
  position: relative;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner-rings {
  position: absolute;
  width: 100%;
  height: 100%;
}

.ring-1,
.ring-2,
.ring-3 {
  position: absolute;
  border-radius: 50%;
  border: 3px solid transparent;
  animation: spin 2s linear infinite;
}

.ring-1 {
  width: 80px;
  height: 80px;
  border-top: 3px solid var(--color-primary);
  border-right: 3px solid var(--color-primary);
  animation-duration: 1.5s;
  opacity: 1;
}

.ring-2 {
  width: 60px;
  height: 60px;
  top: 10px;
  left: 10px;
  border-bottom: 3px solid var(--color-secondary);
  border-left: 3px solid var(--color-secondary);
  animation-duration: 2s;
  animation-direction: reverse;
  opacity: 0.8;
}

.ring-3 {
  width: 40px;
  height: 40px;
  top: 20px;
  left: 20px;
  border-top: 3px solid var(--color-accent);
  border-bottom: 3px solid var(--color-accent);
  animation-duration: 1s;
  opacity: 0.6;
}

.spinner-center {
  position: relative;
  z-index: 10;
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(139, 92, 246, 0.4);
  animation: pulse 2s ease-in-out infinite;
}

.center-icon {
  font-size: 12px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  animation: iconSpin 3s ease-in-out infinite;
}

.loading-dots {
  display: flex;
  gap: 8px;
  align-items: center;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  animation: bounce 1.4s ease-in-out infinite both;
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.3);
}

.dot:nth-child(1) {
  animation-delay: -0.32s;
}

.dot:nth-child(2) {
  animation-delay: -0.16s;
}

.dot:nth-child(3) {
  animation-delay: 0s;
}

.loading-message {
  margin: 0;
  color: var(--color-text);
  font-size: 16px;
  font-weight: 500;
  text-align: center;
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: textPulse 2s ease-in-out infinite;
}

/* Animations */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { 
    transform: scale(1);
    box-shadow: 0 4px 15px rgba(139, 92, 246, 0.4);
  }
  50% { 
    transform: scale(1.1);
    box-shadow: 0 6px 20px rgba(139, 92, 246, 0.6);
  }
}

@keyframes iconSpin {
  0%, 100% { transform: rotate(0deg) scale(1); }
  25% { transform: rotate(90deg) scale(1.1); }
  50% { transform: rotate(180deg) scale(1); }
  75% { transform: rotate(270deg) scale(1.1); }
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes textPulse {
  0%, 100% { opacity: 0.8; }
  50% { opacity: 1; }
}

/* Size Variants */
.loading-spinner.small {
  padding: 1.5rem 1rem;
  gap: 16px;
}

.loading-spinner.small .spinner-container {
  width: 40px;
  height: 40px;
}

.loading-spinner.small .ring-1 {
  width: 40px;
  height: 40px;
}

.loading-spinner.small .ring-2 {
  width: 30px;
  height: 30px;
  top: 5px;
  left: 5px;
}

.loading-spinner.small .ring-3 {
  width: 20px;
  height: 20px;
  top: 10px;
  left: 10px;
}

.loading-spinner.small .spinner-center {
  width: 12px;
  height: 12px;
}

.loading-spinner.small .center-icon {
  font-size: 8px;
}

.loading-spinner.small .loading-message {
  font-size: 14px;
}

.loading-spinner.large {
  padding: 4rem 3rem;
  gap: 32px;
}

.loading-spinner.large .spinner-container {
  width: 120px;
  height: 120px;
}

.loading-spinner.large .ring-1 {
  width: 120px;
  height: 120px;
}

.loading-spinner.large .ring-2 {
  width: 90px;
  height: 90px;
  top: 15px;
  left: 15px;
}

.loading-spinner.large .ring-3 {
  width: 60px;
  height: 60px;
  top: 30px;
  left: 30px;
}

.loading-spinner.large .spinner-center {
  width: 36px;
  height: 36px;
}

.loading-spinner.large .center-icon {
  font-size: 18px;
}

.loading-spinner.large .loading-message {
  font-size: 18px;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .loading-spinner {
    padding: 2rem 1rem;
    gap: 20px;
  }
  
  .spinner-container {
    width: 60px;
    height: 60px;
  }
  
  .ring-1 {
    width: 60px;
    height: 60px;
  }
  
  .ring-2 {
    width: 45px;
    height: 45px;
    top: 7.5px;
    left: 7.5px;
  }
  
  .ring-3 {
    width: 30px;
    height: 30px;
    top: 15px;
    left: 15px;
  }
  
  .spinner-center {
    width: 18px;
    height: 18px;
  }
  
  .center-icon {
    font-size: 10px;
  }
  
  .loading-message {
    font-size: 14px;
  }
}
</style>