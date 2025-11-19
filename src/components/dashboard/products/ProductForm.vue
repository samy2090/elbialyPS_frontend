<template>
  <div class="product-form-container">
    <div class="form-card large">
      <div class="form-header large">
        <h2 class="form-title large">{{ isEditing ? 'Edit Product' : 'Add New Product' }}</h2>
        <p class="form-subtitle large">{{ isEditing ? 'Update product information' : 'Create a new product with details' }}</p>
      </div>

      <!-- Error Alert -->
      <div v-if="productStore.error" class="error-alert">
        <div class="alert-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2"/>
            <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2"/>
          </svg>
        </div>
        <span class="alert-message">{{ productStore.error }}</span>
      </div>

      <form @submit.prevent="handleSubmit" class="product-form form-container">
        <!-- Name Field -->
        <div class="form-field">
          <label class="field-label">
            <svg class="label-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 7L12 3L4 7M20 7L12 11M20 7V17L12 21M12 11L4 7M12 11V21M4 7V17L12 21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Product Name
          </label>
          <input 
            v-model="form.name" 
            type="text" 
            class="form-input" 
            placeholder="Enter product name"
            required 
          />
        </div>

        <!-- SKU Field -->
        <div class="form-field">
          <label class="field-label">
            <svg class="label-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            SKU
          </label>
          <input 
            v-model="form.sku" 
            type="text" 
            class="form-input" 
            placeholder="Enter SKU"
            required 
          />
        </div>

        <!-- Category Field -->
        <div class="form-field">
          <label class="field-label">
            <svg class="label-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M9 22V12H15V22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Category
          </label>
          <select 
            v-model="form.category" 
            class="form-select"
          >
            <option value="drink">Drink</option>
            <option value="snack">Snack</option>
            <option value="food">Food</option>
            <option value="other">Other</option>
          </select>
        </div>

        <!-- Price and Cost Row -->
        <div class="form-row">
          <div class="form-field">
            <label class="field-label">
              <svg class="label-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2V22M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6313 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6313 13.6815 18 14.5717 18 15.5C18 16.4283 17.6313 17.3185 16.9749 17.9749C16.3185 18.6313 15.4283 19 14.5 19H6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Price
            </label>
            <input 
              v-model="form.price" 
              type="number" 
              step="0.01"
              class="form-input" 
              placeholder="0.00"
              required 
            />
          </div>

          <div class="form-field">
            <label class="field-label">
              <svg class="label-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2V22M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6313 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6313 13.6815 18 14.5717 18 15.5C18 16.4283 17.6313 17.3185 16.9749 17.9749C16.3185 18.6313 15.4283 19 14.5 19H6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Cost
            </label>
            <input 
              v-model="form.cost" 
              type="number" 
              step="0.01"
              class="form-input" 
              placeholder="0.00"
              required 
            />
          </div>
        </div>

        <!-- Stock Field -->
        <div class="form-field">
          <label class="field-label">
            <svg class="label-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M9 22V12H15V22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Stock
          </label>
          <input 
            v-model="form.stock" 
            type="number" 
            class="form-input" 
            placeholder="0"
            required 
          />
        </div>

        <!-- Note Field -->
        <div class="form-field">
          <label class="field-label">
            <svg class="label-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M14 2V8H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M16 13H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M16 17H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M10 9H9H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Note
          </label>
          <textarea 
            v-model="form.note" 
            class="form-input form-textarea" 
            placeholder="Enter product notes (optional)"
            rows="3"
          />
        </div>

        <!-- Is Active Field -->
        <div class="form-field">
          <label class="field-label checkbox-label">
            <input 
              v-model="form.is_active" 
              type="checkbox" 
              class="form-checkbox"
            />
            <span>Product is Active</span>
          </label>
        </div>

        <!-- Form Actions -->
        <div class="form-actions">
          <button 
            type="submit" 
            class="action-btn primary"
            :disabled="productStore.loading"
          >
            <svg v-if="!productStore.loading" class="btn-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 21L5 21C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3L16 3L21 8V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M17 21V13H7V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M7 3V8H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <div v-else class="loading-spinner"></div>
            {{ productStore.loading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Product' : 'Create Product') }}
          </button>
          <button 
            type="button" 
            class="action-btn secondary" 
            @click="$emit('cancel')"
          >
            <svg class="btn-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useProductStore } from '@/stores/productStore'

export default {
  name: 'ProductForm',
  props: {
    product: {
      type: Object,
      default: null
    }
  },
  emits: ['product-created', 'product-updated', 'cancel'],
  setup(props, { emit }) {
    const productStore = useProductStore()
    
    const isEditing = ref(!!props.product)
    
    const form = ref({
      name: '',
      sku: '',
      category: 'drink',
      price: '',
      cost: '',
      stock: 0,
      note: '',
      is_active: true
    })
    
    // Populate form if editing existing product
    onMounted(() => {
      if (props.product) {
        form.value.name = props.product.name || ''
        form.value.sku = props.product.sku || ''
        form.value.category = props.product.category || 'drink'
        form.value.price = props.product.price || ''
        form.value.cost = props.product.cost || ''
        form.value.stock = props.product.stock || 0
        form.value.note = props.product.note || ''
        form.value.is_active = props.product.is_active !== undefined ? props.product.is_active : true
      }
    })
    
    const handleSubmit = async () => {
      try {
        productStore.clearError()
        
        // Convert price and cost to strings (as they come from API as strings)
        const submitData = {
          ...form.value,
          price: String(form.value.price),
          cost: String(form.value.cost),
          stock: Number(form.value.stock)
        }
        
        if (isEditing.value) {
          // Editing existing product
          await productStore.updateProduct(props.product.id, submitData)
          emit('product-updated')
        } else {
          // Creating new product
          await productStore.createProduct(submitData)
          emit('product-created')
        }
      } catch (error) {
        console.error('Failed to save product:', error)
      }
    }
    
    return {
      form,
      isEditing,
      productStore,
      handleSubmit
    }
  }
}
</script>

