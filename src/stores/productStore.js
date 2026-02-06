import { defineStore } from 'pinia'
import ProductService from '@/api/products.js'

export const useProductStore = defineStore('product', {
  state: () => ({
    products: [],
    currentProduct: null,
    loading: false,
    error: null,
    pagination: null,
  }),

  getters: {
    getProducts: (state) => state.products,
    getCurrentProduct: (state) => state.currentProduct,
  },

  actions: {
    /**
     * Fetch all products
     */
    async fetchProducts(params = {}) {
      this.loading = true
      this.error = null

      try {
        const response = await ProductService.getAllProducts(params)

        // The API service should return { products: [...], pagination: {...} }
        if (response && typeof response === 'object') {
          if (response.products && Array.isArray(response.products)) {
            // Expected format: { products: [...], pagination: {...} }
            this.products = response.products
            this.pagination = response.pagination || null
          } else if (Array.isArray(response)) {
            // Direct array format
            this.products = response
            this.pagination = null
          } else if (response.data) {
            // Nested data format (fallback)
            if (Array.isArray(response.data)) {
              this.products = response.data
              this.pagination = response.pagination || null
              console.log('✓ ProductStore: Set products from response.data array')
              console.log('  Products count:', this.products.length)
            } else if (response.data.products && Array.isArray(response.data.products)) {
              this.products = response.data.products
              this.pagination = response.data.pagination || response.pagination || null
            } else {
              this.products = []
            }
          } else {
            this.products = []
          }
        } else {
          this.products = []
        }

        // Final validation: Ensure products is always an array
        if (!Array.isArray(this.products)) {
          this.products = []
        }

        return response
      } catch (error) {
        // Provide more specific error messages
        if (error.message.includes('401') || error.response?.status === 401) {
          this.error = 'You need to be logged in to view products. Please login first.'
        } else if (error.message.includes('403') || error.response?.status === 403) {
          this.error = 'You do not have permission to view products.'
        } else if (error.message.includes('Network Error') || !error.response) {
          this.error = 'Cannot connect to server. Please check if the backend is running.'
        } else {
          this.error = error.message || 'Failed to fetch products'
        }

        // Reset products on error
        this.products = []
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Fetch product by ID
     * @param {number} id - Product ID
     */
    async fetchProductById(id) {
      this.loading = true
      this.error = null

      try {
        const response = await ProductService.getProductById(id)
        return response.data || response
      } catch (error) {
        this.error = error.message || `Failed to fetch product with ID ${id}`
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Create new product
     * @param {Object} productData - Product data
     */
    async createProduct(productData) {
      this.loading = true
      this.error = null

      try {
        const response = await ProductService.createProduct(productData)
        // Add the new product to the products list
        const newProduct = response.data || response
        this.products.push(newProduct)
        return response
      } catch (error) {
        this.error = error.message || 'Failed to create product'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Update product
     * @param {number} id - Product ID
     * @param {Object} productData - Product data
     */
    async updateProduct(id, productData) {
      this.loading = true
      this.error = null

      try {
        const response = await ProductService.updateProduct(id, productData)
        const updatedProduct = response.data || response

        // Update the product in the products list
        const index = this.products.findIndex(product => product.id === id)
        if (index !== -1) {
          this.products[index] = updatedProduct
        }

        // If we're updating the current product, update that too
        if (this.currentProduct && this.currentProduct.id === id) {
          this.currentProduct = { ...this.currentProduct, ...updatedProduct }
        }

        return response
      } catch (error) {
        this.error = error.message || 'Failed to update product'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Delete product
     * @param {number} id - Product ID
     */
    async deleteProduct(id) {
      this.loading = true
      this.error = null

      try {
        const response = await ProductService.deleteProduct(id)

        // Remove the product from the products list
        this.products = this.products.filter(product => product.id !== id)

        return response
      } catch (error) {
        this.error = error.message || 'Failed to delete product'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Clear error message
     */
    clearError() {
      this.error = null
    }
  },
})

