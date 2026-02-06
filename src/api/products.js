import api from './axios'

/**
 * Product API service
 */
class ProductService {
  /**
   * Get all products (with pagination support)
   * @param {Object} params - Query parameters (page, per_page, etc.)
   * @returns {Promise}
   */
  static async getAllProducts(params = {}) {
    try {
      const response = await api.get('/api/products', { params })

      // Handle different Laravel response formats
      let productsData = null

      // Format 1: Laravel Paginated Response (most common)
      // { data: [...], current_page, total, per_page, last_page, ... }
      if (response.data?.data && Array.isArray(response.data.data) && response.data.current_page !== undefined) {
        productsData = {
          products: response.data.data,
          pagination: {
            current_page: response.data.current_page,
            last_page: response.data.last_page,
            per_page: response.data.per_page,
            total: response.data.total,
            from: response.data.from,
            to: response.data.to,
            links: response.data.links || null
          }
        }
      }
      // Format 2: Laravel Resource Collection with success wrapper
      // { success: true, data: [...], message: "..." }
      else if ((response.data?.success || response.data?.status === 'success') && Array.isArray(response.data.data)) {
        productsData = {
          products: response.data.data,
          pagination: response.data.meta || response.data.pagination || null
        }
      }
      // Format 3: Direct array response
      // [...]
      else if (Array.isArray(response.data)) {
        productsData = {
          products: response.data,
          pagination: null
        }
      }
      // Format 4: Nested products property
      // { products: [...], pagination: {...} }
      else if (response.data?.products && Array.isArray(response.data.products)) {
        productsData = {
          products: response.data.products,
          pagination: response.data.pagination || response.data.meta || null
        }
      }
      // Format 5: Resource Collection (Laravel API Resource)
      // { data: [...], meta: {...}, links: {...} }
      else if (response.data?.data && Array.isArray(response.data.data) && response.data.meta) {
        productsData = {
          products: response.data.data,
          pagination: {
            ...response.data.meta,
            links: response.data.links || null
          }
        }
      }
      // Fallback: try to extract any array from response
      else {
        const fallbackProducts =
          response.data?.data ||
          response.data?.products ||
          (Array.isArray(response.data) ? response.data : []) ||
          []

        productsData = {
          products: Array.isArray(fallbackProducts) ? fallbackProducts : [],
          pagination: null
        }
      }

      return productsData
    } catch (error) {
      // Provide more specific error information
      if (error.response?.status === 401) {
        throw new Error('Authentication required - please login first')
      } else if (error.response?.status === 403) {
        throw new Error('Access denied - insufficient permissions')
      } else if (error.code === 'ERR_NETWORK' || error.code === 'NETWORK_ERROR' || !error.response) {
        throw new Error('Could not connect to server. Please check if backend is running on ' + (api.defaults.baseURL || 'http://localhost:8000'))
      } else if (error.code === 'ERR_FAILED') {
        throw new Error('Connection failed - possible CORS issue or server not responding')
      } else {
        throw new Error(error.response?.data?.message || error.message || 'Failed to fetch products')
      }
    }
  }

  /**
   * Get product categories (distinct category values for filtering)
   * GET /api/products/categories → { data: string[] }
   * @returns {Promise<{ data: string[] }>}
   */
  static async getCategories() {
    try {
      const response = await api.get('/api/products/categories')
      const data = response.data?.data ?? response.data
      return Array.isArray(data) ? { data } : { data: data?.data ?? [] }
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch product categories')
    }
  }

  /**
   * Get products by category (and optional search, pagination)
   * GET /api/products?category={category}&search=...&paginate=...&per_page=...
   * @param {string} category - Product category (e.g. drink, snack, food, other)
   * @param {Object} params - Optional: search, paginate, per_page
   * @returns {Promise}
   */
  static async getProductsByCategory(category, params = {}) {
    try {
      const response = await api.get('/api/products', { params: { category, ...params } })
      const data = response.data?.data ?? response.data
      const list = Array.isArray(data) ? data : (data?.data ?? [])
      return list
    } catch (error) {
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

      // Handle different response formats
      if (response.data?.data) {
        return response.data.data
      } else if (response.data?.product) {
        return response.data.product
      }
      return response.data
    } catch (error) {
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

