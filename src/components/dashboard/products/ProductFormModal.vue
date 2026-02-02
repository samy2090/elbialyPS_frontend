<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="visible" class="product-form-modal-overlay" @click="handleOverlayClick">
        <div class="product-form-modal" @click.stop>
          <!-- Modal Header -->
          <div class="modal-header">
            <div class="header-content">
              <div class="header-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 7L12 3L4 7M20 7L12 11M20 7V17L12 21M12 11L4 7M12 11V21M4 7V17L12 21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div class="header-text">
                <h2 class="modal-title">{{ isEditing ? 'Edit Product' : 'Add New Product' }}</h2>
                <p class="modal-subtitle">{{ isEditing ? 'Update product information' : 'Create a new product with details' }}</p>
              </div>
            </div>
            <button @click="close" class="close-btn">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>

          <!-- Form Body -->
          <div class="modal-body">
            <ProductForm
              :product="product"
              embedded
              @product-created="onProductCreated"
              @product-updated="onProductUpdated"
              @cancel="close"
            />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'
import ProductForm from './ProductForm.vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  product: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'product-created', 'product-updated'])

const isEditing = computed(() => !!props.product)

const close = () => {
  emit('close')
}

const handleOverlayClick = (e) => {
  if (e.target === e.currentTarget) {
    close()
  }
}

const onProductCreated = () => {
  emit('product-created')
}

const onProductUpdated = () => {
  emit('product-updated')
}

</script>

<style scoped>
.product-form-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  animation: overlayFadeIn 0.3s ease;
}

@keyframes overlayFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.product-form-modal {
  background: linear-gradient(135deg, rgba(15, 15, 23, 0.98) 0%, rgba(30, 30, 45, 0.98) 100%);
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 24px;
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(139, 92, 246, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  animation: modalSlideIn 0.3s ease;
  overflow: hidden;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid rgba(139, 92, 246, 0.2);
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(15, 15, 23, 0.5) 100%);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.3) 0%, rgba(168, 85, 247, 0.3) 100%);
  border: 1px solid rgba(139, 92, 246, 0.4);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #a855f7;
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.2);
}

.header-icon svg {
  width: 24px;
  height: 24px;
}

.header-text {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.95);
  margin: 0;
  background: linear-gradient(135deg, #ffffff 0%, rgba(255, 255, 255, 0.8) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.modal-subtitle {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
}

.close-btn {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(139, 92, 246, 0.5);
  color: #a855f7;
  transform: rotate(90deg);
}

.close-btn svg {
  width: 20px;
  height: 20px;
}

.modal-body {
  padding: 2rem;
  overflow-y: auto;
  flex: 1;
}

/* Scrollbar Styling */
.modal-body::-webkit-scrollbar {
  width: 8px;
}

.modal-body::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

.modal-body::-webkit-scrollbar-thumb {
  background: rgba(139, 92, 246, 0.5);
  border-radius: 4px;
}

.modal-body::-webkit-scrollbar-thumb:hover {
  background: rgba(139, 92, 246, 0.7);
}

/* Modal Fade Transition */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .product-form-modal {
    max-width: 100%;
    max-height: 95vh;
    border-radius: 16px;
  }

  .modal-header {
    padding: 1rem 1.5rem;
  }

  .modal-body {
    padding: 1.5rem;
  }

  .header-icon {
    width: 40px;
    height: 40px;
  }

  .modal-title {
    font-size: 1.25rem;
  }
}
</style>
