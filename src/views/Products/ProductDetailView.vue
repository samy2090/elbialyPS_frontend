<template>
  <div class="site-container">
    <div class="site-header">
      <h2 class="site-title">Product Details</h2>
      <button class="site-btn site-btn-secondary" @click="goBack">
        Back to Products
      </button>
    </div>
    
    <div v-if="productStore.loading" class="site-loading">
      <p>Loading product...</p>
    </div>
    
    <div v-else-if="productStore.error" class="site-alert site-alert-error">
      {{ productStore.error }}
    </div>
    
    <div v-else-if="productStore.getCurrentProduct" class="site-product-detail">
      <div class="site-product-info">
        <h3>{{ productStore.getCurrentProduct.name }}</h3>
        <p>{{ productStore.getCurrentProduct.description }}</p>
        <p class="site-product-price">${{ productStore.getCurrentProduct.price }}</p>
      </div>
      
      <div class="site-product-actions">
        <button class="site-btn site-btn-secondary" @click="handleEditProduct">
          Edit Product
        </button>
        <button class="site-btn site-btn-danger" @click="handleDeleteProduct">
          Delete Product
        </button>
      </div>
    </div>
    
    <div v-else>
      <p>Product not found.</p>
    </div>
  </div>
</template>

<script>
import { onMounted } from 'vue'
import { useProductStore } from '@/stores/productStore'
import { useRouter } from 'vue-router'

export default {
  name: 'ProductDetailView',
  props: {
    id: {
      type: [String, Number],
      required: true
    }
  },
  setup(props) {
    const productStore = useProductStore()
    const router = useRouter()
    
    // Load product when component mounts
    onMounted(async () => {
      try {
        await productStore.fetchProductById(props.id)
      } catch (error) {
        console.error('Failed to load product:', error)
      }
    })
    
    const goBack = () => {
      router.push('/products')
    }
    
    const handleEditProduct = () => {
      // Implement edit product logic
      console.log('Edit product', props.id)
    }
    
    const handleDeleteProduct = async () => {
      try {
        if (confirm('Are you sure you want to delete this product?')) {
          await productStore.deleteProduct(props.id)
          router.push('/products')
        }
      } catch (error) {
        console.error('Failed to delete product:', error)
      }
    }
    
    return {
      productStore,
      goBack,
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

.site-product-detail {
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 1rem;
}

.site-product-info h3 {
  margin-top: 0;
}

.site-product-price {
  font-size: 1.5rem;
  font-weight: bold;
  color: #28a745;
}

.site-product-actions {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #ddd;
}

.site-product-actions .site-btn {
  margin-right: 0.5rem;
}
</style>