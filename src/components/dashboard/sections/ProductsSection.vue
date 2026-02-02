<template>
  <div class="products-content">
    <!-- Header Section -->
    <div class="products-header">
      <div class="header-info">
        <h1 class="section-title">Products Management</h1>
        <p class="section-subtitle">Manage your products inventory and details</p>
      </div>
      <div class="header-actions">
        <button @click="showCreateModal = true" class="action-btn primary">
          <svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5V19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Add New Product
        </button>
      </div>
    </div>

    <!-- Search -->
    <div class="products-search-row">
      <SearchInput
        v-model="searchQuery"
        placeholder="Search by name or SKU..."
        :debounce="300"
        @search="onSearch"
      />
    </div>

    <!-- Success Notification -->
    <div v-if="showSuccess" class="success-notification">
      <div class="notification-content">
        <svg class="success-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.7088 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18457 2.99721 7.13633 4.39828 5.49707C5.79935 3.85782 7.69279 2.71867 9.79619 2.24318C11.8996 1.76769 14.1003 1.98245 16.07 2.86" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>{{ successMessage }}</span>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="productStore.loading && !productsLoaded" class="loading-state">
      <div class="loading-spinner">
        <div class="spinner"></div>
      </div>
      <p class="loading-text">Loading products...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="productStore.error && !productsLoaded" class="error-state">
      <div class="error-card">
        <div class="error-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2"/>
            <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2"/>
          </svg>
        </div>
        <h3 class="error-title">Error Loading Products</h3>
        <p class="error-message">{{ productStore.error }}</p>
        <button @click="loadProducts(searchQuery ? { search: searchQuery } : {})" class="action-btn secondary">
          <svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 4V10H7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M23 20V14H17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14L18.36 18.36A9 9 0 0 1 3.51 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Retry
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="productsLoaded && productStore.getProducts.length === 0" class="empty-state">
      <div class="empty-icon">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 7L12 3L4 7M20 7L12 11M20 7V17L12 21M12 11V21M4 7V17L12 21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <h3 class="empty-title">No Products Found</h3>
      <p class="empty-message">Get started by adding your first product to the inventory.</p>
      <button @click="showCreateModal = true" class="action-btn primary">
        <svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 5V19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Add Your First Product
      </button>
    </div>

    <!-- Products Table/Cards -->
    <div v-else-if="productStore.getProducts.length > 0" class="products-display">
      <!-- Desktop Table View -->
      <div class="products-table-container desktop-only">
        <div class="table-card">
          <table class="products-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="product in productStore.getProducts" :key="product.id" class="product-row">
                <td>
                  <div class="product-info">
                    <div class="product-avatar">
                      {{ getProductInitials(product.name) }}
                    </div>
                    <div class="product-details">
                      <button @click="viewProduct(product)" class="product-name">
                        {{ product.name }}
                      </button>
                      <span class="product-id">ID: {{ product.id }}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="product-sku">{{ product.sku }}</span>
                </td>
                <td>
                  <span :class="getCategoryClass(product)" class="category-badge">
                    {{ product.category }}
                  </span>
                </td>
                <td>
                  <span class="product-price">{{ parseFloat(product.price || 0).toFixed(2) }}</span>
                </td>
                <td>
                  <span :class="getStockClass(product)" class="stock-badge">
                    {{ product.stock }}
                  </span>
                </td>
                <td>
                  <span :class="getStatusClass(product)" class="status-badge">
                    {{ product.is_active ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td>
                  <div class="product-actions">
                    <button @click="viewProduct(product)" class="action-btn small secondary" title="View Product">
                      <svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
                      </svg>
                    </button>
                    <button @click="editProduct(product)" class="action-btn small primary" title="Edit Product">
                      <svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </button>
                    <button @click="deleteProduct(product)" :disabled="productStore.loading" class="action-btn small danger" title="Delete Product">
                      <svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 6H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Mobile Cards View -->
      <div class="products-cards-container mobile-only">
        <div 
          v-for="product in productStore.getProducts" 
          :key="product.id" 
          class="product-card"
        >
          <div class="product-card-header">
            <div class="product-avatar">
              {{ getProductInitials(product.name) }}
            </div>
            <div class="product-info">
              <h3 class="product-name">{{ product.name }}</h3>
              <p class="product-sku">{{ product.sku }}</p>
            </div>
          </div>
          <div class="product-card-content">
            <div class="product-badges">
              <span :class="getCategoryClass(product)" class="category-badge">
                {{ product.category }}
              </span>
              <span :class="getStatusClass(product)" class="status-badge">
                {{ product.is_active ? 'Active' : 'Inactive' }}
              </span>
            </div>
            <div class="product-meta">
              <div class="meta-item">
                <span class="meta-label">Price:</span>
                <span class="meta-value">{{ parseFloat(product.price || 0).toFixed(2) }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Stock:</span>
                <span :class="getStockClass(product)" class="stock-badge">
                  {{ product.stock }}
                </span>
              </div>
            </div>
            <div class="product-actions">
              <button @click="viewProduct(product)" class="action-btn small secondary">
                View
              </button>
              <button @click="editProduct(product)" class="action-btn small primary">
                Edit
              </button>
              <button @click="deleteProduct(product)" :disabled="productStore.loading" class="action-btn small danger">
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="user-modal-overlay" @click="closeDeleteModal">
      <div class="user-modal delete-modal" @click.stop>
        <div class="modal-header">
          <h3>Delete Product</h3>
          <button @click="closeDeleteModal" class="close-btn">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2"/>
              <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2"/>
            </svg>
          </button>
        </div>
        <div class="modal-content">
          <p>Are you sure you want to delete the product "{{ deletingProduct?.name }}"?</p>
          <p class="warning-text">This action cannot be undone.</p>
        </div>
        <div class="modal-actions">
          <button @click="closeDeleteModal" class="action-btn secondary">Cancel</button>
          <button @click="confirmDeleteProduct" :disabled="productStore.loading" class="action-btn danger">Delete Product</button>
        </div>
      </div>
    </div>

    <!-- Product Detail Modal -->
    <div v-if="selectedProduct" class="product-modal-overlay" @click="closeProductModal">
      <div class="product-modal product-detail-modal" @click.stop>
        <div class="modal-header">
          <h3>Product Details</h3>
          <button @click="closeProductModal" class="close-btn">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2"/>
              <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2"/>
            </svg>
          </button>
        </div>
        <div class="modal-content modal-detail-content">
          <div class="modal-product-header">
            <div class="product-avatar large">
              {{ getProductInitials(selectedProduct.name) }}
            </div>
            <div class="modal-product-info">
              <h4>{{ selectedProduct.name }}</h4>
              <p>SKU: {{ selectedProduct.sku }}</p>
              <div class="product-badges">
                <span :class="getCategoryClass(selectedProduct)" class="category-badge">
                  {{ selectedProduct.category }}
                </span>
                <span :class="getStatusClass(selectedProduct)" class="status-badge">
                  {{ selectedProduct.is_active ? 'Active' : 'Inactive' }}
                </span>
              </div>
            </div>
          </div>

          <div class="modal-details-grid">
            <div class="modal-detail-section">
              <h5 class="modal-section-title">Product Information</h5>
              <div class="modal-detail-card">
                <div class="modal-detail-item">
                  <span class="modal-detail-label">Product ID</span>
                  <span class="modal-detail-value">{{ selectedProduct.id }}</span>
                </div>
                <div class="modal-detail-item">
                  <span class="modal-detail-label">Name</span>
                  <span class="modal-detail-value">{{ selectedProduct.name }}</span>
                </div>
                <div class="modal-detail-item">
                  <span class="modal-detail-label">SKU</span>
                  <span class="modal-detail-value">{{ selectedProduct.sku }}</span>
                </div>
                <div class="modal-detail-item">
                  <span class="modal-detail-label">Category</span>
                  <span class="modal-detail-value">
                    <span :class="getCategoryClass(selectedProduct)" class="category-badge">
                      {{ selectedProduct.category }}
                    </span>
                  </span>
                </div>
                <div class="modal-detail-item">
                  <span class="modal-detail-label">Price</span>
                  <span class="modal-detail-value">{{ parseFloat(selectedProduct.price || 0).toFixed(2) }}</span>
                </div>
                <div class="modal-detail-item">
                  <span class="modal-detail-label">Cost</span>
                  <span class="modal-detail-value">{{ parseFloat(selectedProduct.cost || 0).toFixed(2) }}</span>
                </div>
                <div class="modal-detail-item">
                  <span class="modal-detail-label">Stock</span>
                  <span class="modal-detail-value">
                    <span :class="getStockClass(selectedProduct)" class="stock-badge">
                      {{ selectedProduct.stock }}
                    </span>
                  </span>
                </div>
                <div v-if="selectedProduct.note" class="modal-detail-item">
                  <span class="modal-detail-label">Note</span>
                  <span class="modal-detail-value">{{ selectedProduct.note }}</span>
                </div>
                <div class="modal-detail-item">
                  <span class="modal-detail-label">Status</span>
                  <span class="modal-detail-value">
                    <span :class="getStatusClass(selectedProduct)" class="status-badge">
                      {{ selectedProduct.is_active ? 'Active' : 'Inactive' }}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            <div class="modal-detail-section">
              <h5 class="modal-section-title">Timestamps</h5>
              <div class="modal-detail-card">
                <div v-if="selectedProduct.created_at" class="modal-detail-item">
                  <span class="modal-detail-label">Created At</span>
                  <span class="modal-detail-value">{{ formatDateTime(selectedProduct.created_at) }}</span>
                </div>
                <div v-if="selectedProduct.updated_at" class="modal-detail-item">
                  <span class="modal-detail-label">Updated At</span>
                  <span class="modal-detail-value">{{ formatDateTime(selectedProduct.updated_at) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Product Modal -->
    <ProductFormModal
      :visible="showEditModal && !!editingProduct"
      :product="editingProduct"
      @close="closeEditModal"
      @product-updated="onProductUpdated"
    />

    <!-- Create Product Modal -->
    <ProductFormModal
      :visible="showCreateModal"
      :product="null"
      @close="closeCreateModal"
      @product-created="onProductCreated"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useProductStore } from '@/stores/productStore'
import { SearchInput } from '@/components/base'
import ProductFormModal from '@/components/dashboard/products/ProductFormModal.vue'
import { useBodyScrollLock } from '@/composables/useBodyScrollLock'

const productStore = useProductStore()

// Reactive state
const searchQuery = ref('')
const productsLoaded = ref(false)
const selectedProduct = ref(null)
const editingProduct = ref(null)
const showEditModal = ref(false)
const showCreateModal = ref(false)
const showDeleteModal = ref(false)

// Lock body scroll when any modal is open
const isAnyModalOpen = computed(() => showEditModal.value || showCreateModal.value || showDeleteModal.value || !!selectedProduct.value)
useBodyScrollLock(isAnyModalOpen)
const deletingProduct = ref(null)
const successMessage = ref('')
const showSuccess = ref(false)

// Methods
const loadProducts = async (params = {}) => {
  try {
    console.log('ProductsSection: Loading products...', params)
    productsLoaded.value = false
    await productStore.fetchProducts(params)
    productsLoaded.value = true
    console.log('ProductsSection: Products loaded. Count:', productStore.getProducts.length)
    
    if (productStore.getProducts.length === 0) {
      console.warn('ProductsSection: Products array is empty after fetch')
    }
  } catch (error) {
    console.error('ProductsSection: Error loading products:', error)
    productsLoaded.value = true
  }
}

const onSearch = (query) => {
  const search = (query || '').trim()
  loadProducts(search ? { search } : {})
}

const getProductInitials = (name) => {
  if (!name) return 'P'
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

const getCategoryClass = (product) => {
  const category = (product.category || '').toLowerCase()
  return `category-${category}`
}

const getStatusClass = (product) => {
  return product.is_active ? 'status-active' : 'status-inactive'
}

const getStockClass = (product) => {
  const stock = parseInt(product.stock || 0)
  if (stock === 0) return 'stock-empty'
  if (stock < 10) return 'stock-low'
  return 'stock-ok'
}

const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const viewProduct = (product) => {
  selectedProduct.value = product
}

const editProduct = (product) => {
  editingProduct.value = product
  showEditModal.value = true
}

const closeProductModal = () => {
  selectedProduct.value = null
}

const closeEditModal = () => {
  showEditModal.value = false
  editingProduct.value = null
}

const closeCreateModal = () => {
  showCreateModal.value = false
}

const showSuccessMessage = (message) => {
  successMessage.value = message
  showSuccess.value = true
  setTimeout(() => {
    showSuccess.value = false
  }, 3000)
}

const onProductCreated = () => {
  closeCreateModal()
  loadProducts(searchQuery.value ? { search: searchQuery.value } : {})
  showSuccessMessage('Product created successfully!')
}

const onProductUpdated = () => {
  closeEditModal()
  loadProducts(searchQuery.value ? { search: searchQuery.value } : {})
  showSuccessMessage('Product updated successfully!')
}

const deleteProduct = (product) => {
  deletingProduct.value = product
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  deletingProduct.value = null
}

const confirmDeleteProduct = async () => {
  if (deletingProduct.value) {
    try {
      await productStore.deleteProduct(deletingProduct.value.id)
      loadProducts(searchQuery.value ? { search: searchQuery.value } : {})
      showSuccessMessage('Product deleted successfully!')
      closeDeleteModal()
    } catch (error) {
      console.error('Failed to delete product:', error)
      // Error is already handled by the store
      closeDeleteModal()
    }
  }
}

// Lifecycle
onMounted(() => {
  console.log('ProductsSection: Component mounted, loading products...')
  loadProducts()
})

// Emit events to parent component
defineEmits(['product-selected', 'product-created', 'product-updated'])
</script>

<style scoped>
.products-search-row {
  margin-bottom: 1.25rem;
  max-width: 24rem;
}

/* Responsive */
@media (max-width: 768px) {
  .desktop-only {
    display: none !important;
  }
  
  .mobile-only {
    display: block !important;
  }
}

@media (min-width: 769px) {
  .desktop-only {
    display: block !important;
  }
  
  .mobile-only {
    display: none !important;
  }
}
</style>

