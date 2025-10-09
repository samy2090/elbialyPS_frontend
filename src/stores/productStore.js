import { defineStore } from 'pinia'
import ProductService from '@/api/products.js'

export const useProductStore = defineStore('product', {
  state: () => ({
    products: [],
    currentProduct: null,
    loading: false,
    error: null,
  }),

  getters: {
    getProducts: (state) => state.products,
    getCurrentProduct: (state) => state.currentProduct,
  },

  actions: {
    /**
     * Fetch all products
     */
    async fetchProducts() {
      this.loading = true
      this.error = null

      try {
        const response = await ProductService.getAllProducts()
        this.products = response.products || response.data || response
        return response
      } catch (error) {
        this.error = error.message || 'Failed to fetch products'
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
        this.currentProduct = response.product || response.data || response
        return response
      } catch (error) {
        this.error = error.message || 'Failed to fetch product'
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
        this.products.push(response.product || response.data || response)
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
        // Update product in the list
        const index = this.products.findIndex(p => p.id == id)
        if (index !== -1) {
          this.products[index] = response.product || response.data || response
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
        // Remove product from the list
        this.products = this.products.filter(p => p.id != id)
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