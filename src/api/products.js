import api from './axios'

/**
 * Product API service
 */
class ProductService {
  /**
   * Get all products
   * @returns {Promise}
   */
  static async getAllProducts() {
    try {
      const response = await api.get('/api/products')
      return response.data
    } catch (error) {
      console.error('Get Products Error:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch products')
    }
  }

  /**
   * Get product by ID
   * @param {number} id - Product ID
   * @returns {Promise}
   */
  static async getProductById(id) {
    try {
      const response = await api.get(`/api/products/${id}`)
      return response.data
    } catch (error) {
      console.error('Get Product Error:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch product')
    }
  }

  /**
   * Create new product
   * @param {Object} productData - Product data
   * @returns {Promise}
   */
  static async createProduct(productData) {
    try {
      const response = await api.post('/api/products', productData)
      return response.data
    } catch (error) {
      console.error('Create Product Error:', error)
      throw new Error(error.response?.data?.message || 'Failed to create product')
    }
  }

  /**
   * Update product
   * @param {number} id - Product ID
   * @param {Object} productData - Product data
   * @returns {Promise}
   */
  static async updateProduct(id, productData) {
    try {
      const response = await api.put(`/api/products/${id}`, productData)
      return response.data
    } catch (error) {
      console.error('Update Product Error:', error)
      throw new Error(error.response?.data?.message || 'Failed to update product')
    }
  }

  /**
   * Delete product
   * @param {number} id - Product ID
   * @returns {Promise}
   */
  static async deleteProduct(id) {
    try {
      const response = await api.delete(`/api/products/${id}`)
      return response.data
    } catch (error) {
      console.error('Delete Product Error:', error)
      throw new Error(error.response?.data?.message || 'Failed to delete product')
    }
  }
}

export default ProductService