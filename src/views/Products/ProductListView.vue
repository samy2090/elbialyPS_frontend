<template>
  <div class="site-container">
    <div class="site-header">
      <h2 class="site-title">Products</h2>
      <button class="site-btn" @click="handleCreateProduct">
        Add Product
      </button>
    </div>
    
    <div v-if="productStore.loading" class="site-loading">
      <p>Loading products...</p>
    </div>
    
    <div v-else-if="productStore.error" class="site-alert site-alert-error">
      {{ productStore.error }}
    </div>
    
    <div v-else>
      <div class="site-table-container">
        <table class="site-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Description</th>
              <th>Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="product in productStore.getProducts" :key="product.id">
              <td>{{ product.id }}</td>
              <td>{{ product.name }}</td>
              <td>{{ product.description }}</td>
              <td>{{ product.price }}</td>
              <td>
                <button class="site-btn site-btn-sm site-btn-secondary" @click="handleEditProduct(product)">
                  Edit
                </button>
                <button class="site-btn site-btn-sm site-btn-danger" @click="handleDeleteProduct(product.id)">
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { onMounted } from 'vue'
import { useProductStore } from '@/stores/productStore'

export default {
  name: 'ProductListView',
  setup() {
    const productStore = useProductStore()
    
    // Load products when component mounts
    onMounted(async () => {
      try {
        await productStore.fetchProducts()
      } catch (error) {
        console.error('Failed to load products:', error)
      }
    })
    
    const handleCreateProduct = () => {
      // Implement create product logic
      console.log('Create product')
    }
    
    const handleEditProduct = (product) => {
      // Implement edit product logic
      console.log('Edit product', product)
    }
    
    const handleDeleteProduct = async (id) => {
      try {
        if (confirm('Are you sure you want to delete this product?')) {
          await productStore.deleteProduct(id)
        }
      } catch (error) {
        console.error('Failed to delete product:', error)
      }
    }
    
    return {
      productStore,
      handleCreateProduct,
      handleEditProduct,
      handleDeleteProduct
    }
  }
}
</script>

<style scoped>
.site-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.site-table-container {
  overflow-x: auto;
}

.site-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

.site-table th,
.site-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.site-table th {
  background-color: #f8f9fa;
  font-weight: bold;
}

.site-btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
  margin-right: 0.25rem;
}

.site-btn-secondary {
  background-color: #6c757d;
  border-color: #6c757d;
}

.site-btn-danger {
  background-color: #dc3545;
  border-color: #dc3545;
}
</style>