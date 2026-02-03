<template>
  <form class="expense-form futuristic-form" @submit.prevent="onSubmit">
    <div class="form-grid">
      <div class="form-field full">
        <label class="form-label">Title *</label>
        <input
          v-model="form.title"
          type="text"
          class="form-input"
          placeholder="e.g. Office Rent - January 2026"
          maxlength="255"
        />
        <p v-if="errors.title" class="form-error">{{ errors.title }}</p>
      </div>
      <div class="form-field full">
        <label class="form-label">Description</label>
        <textarea
          v-model="form.description"
          class="form-input form-textarea"
          placeholder="Optional notes"
          rows="3"
        />
      </div>
      <div class="form-field">
        <label class="form-label">Price (EGP) *</label>
        <input
          v-model.number="form.price"
          type="number"
          class="form-input"
          placeholder="0.00"
          step="0.01"
          min="0"
          max="9999999.99"
        />
        <p v-if="errors.price" class="form-error">{{ errors.price }}</p>
      </div>
      <div class="form-field">
        <label class="form-label">Expense date *</label>
        <input
          v-model="form.expense_date"
          type="date"
          class="form-input"
        />
        <p v-if="errors.expense_date" class="form-error">{{ errors.expense_date }}</p>
      </div>
      <div class="form-field">
        <label class="form-label">Main category *</label>
        <CustomDropdown
          v-model="form.main_category_id"
          :options="mainCategoryOptions"
          option-value="id"
          option-label="name"
          placeholder="Select main category"
          :show-placeholder-in-menu="true"
          @change="onMainCategoryChange"
        />
        <p v-if="errors.category_id" class="form-error">{{ errors.category_id }}</p>
      </div>
      <div v-if="subCategoryOptions.length && !isProductExpense" class="form-field">
        <label class="form-label">Sub-category</label>
        <CustomDropdown
          v-model="form.sub_category_id"
          :options="subCategoryOptions"
          option-value="id"
          option-label="name"
          placeholder="Select sub-category (optional)"
          :show-placeholder-in-menu="true"
        />
      </div>
      <!-- Product expense flow: only when main category is "Products" -->
      <template v-if="isProductExpense">
        <div class="form-field full">
          <label class="form-label">Product category (type) *</label>
          <CustomDropdown
            v-model="form.product_category"
            :options="productCategoryOptions"
            option-value="id"
            option-label="name"
            placeholder="Select product category"
            :show-placeholder-in-menu="true"
            :disabled="productCategoriesLoading"
            @change="onProductCategoryChange"
          />
          <p v-if="errors.product_category" class="form-error">{{ errors.product_category }}</p>
        </div>
        <div class="form-field full">
          <label class="form-label">Product *</label>
          <CustomDropdown
            v-model="form.product_id"
            :options="productsInCategoryOptions"
            option-value="id"
            option-label="name"
            placeholder="Select product"
            :show-placeholder-in-menu="true"
            :disabled="!form.product_category || productsLoading"
            @change="onProductChange"
          />
          <p v-if="errors.product_id" class="form-error">{{ errors.product_id }}</p>
        </div>
        <div class="form-field">
          <label class="form-label">Quantity *</label>
          <input
            v-model.number="form.quantity"
            type="number"
            class="form-input"
            placeholder="1"
            min="1"
            step="1"
          />
          <p v-if="errors.quantity" class="form-error">{{ errors.quantity }}</p>
        </div>
      </template>
      <div class="form-field">
        <label class="form-label">Status *</label>
        <CustomDropdown
          v-model="form.status"
          :options="statusOptions"
          option-value="id"
          option-label="name"
          placeholder="Select status"
          :show-placeholder-in-menu="true"
        />
        <p v-if="errors.status" class="form-error">{{ errors.status }}</p>
      </div>
      <div class="form-field full">
        <label class="form-label">Attachments</label>
        <div class="attachments-block">
          <label class="attachments-upload-btn">
            <input
              ref="fileInputRef"
              type="file"
              multiple
              :accept="acceptTypes"
              class="attachments-input"
              @change="onFileSelect"
            />
            <span class="attachments-upload-text">Upload (images & documents)</span>
          </label>
          <p v-if="attachmentError" class="form-error">{{ attachmentError }}</p>
          <ul v-if="displayFiles.length" class="attachments-list">
            <li v-for="(item, index) in displayFiles" :key="item.key" class="attachments-item">
              <template v-if="item.isImage && item.previewUrl && !imageLoadFailed.has(item.key)">
                <img
                  :src="item.previewUrl"
                  :alt="item.name"
                  class="attachments-thumb"
                  @error="onImageLoadError(item.key)"
                />
              </template>
              <template v-else>
                <span class="attachments-file-icon" aria-hidden="true">
                  <!-- PDF -->
                  <svg v-if="item.fileType === 'pdf'" class="file-icon-svg pdf" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M14 2v6h6M9 13h2M9 17h2M13 13h4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <!-- Word / doc -->
                  <svg v-else-if="item.fileType === 'doc' || item.fileType === 'docx'" class="file-icon-svg doc" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M14 2v6h6M8 13h8M8 17h5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <!-- Excel -->
                  <svg v-else-if="item.fileType === 'xls' || item.fileType === 'xlsx'" class="file-icon-svg xls" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M14 2v6h6M8 10h8M8 14h8M8 18h4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <!-- CSV / txt -->
                  <svg v-else-if="item.fileType === 'csv' || item.fileType === 'txt'" class="file-icon-svg txt" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M14 2v6h6M8 12h8M8 16h8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <!-- Generic file -->
                  <svg v-else class="file-icon-svg generic" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M14 2v6h6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </span>
              </template>
              <span class="attachments-name" :title="item.name">{{ item.name }}</span>
              <button
                type="button"
                class="attachments-remove"
                :aria-label="'Remove ' + item.name"
                @click="removeFile(item, index)"
              >
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div class="form-actions">
      <button type="button" class="btn-ghost" @click="$emit('cancel')">Cancel</button>
      <button type="submit" class="btn-primary" :disabled="saving">
        <span v-if="saving" class="btn-spinner"></span>
        <span v-else>{{ submitLabel }}</span>
      </button>
    </div>
  </form>
</template>

<script setup>
import { ref, watch, computed, onBeforeUnmount } from 'vue'
import CustomDropdown from '@/components/base/ui/CustomDropdown.vue'
import { validateAttachment, resolveAttachmentUrl } from '@/utils/expenseHelpers'
import ProductService from '@/api/products.js'

const props = defineProps({
  modelValue: { type: Object, default: () => ({}) },
  categories: { type: Array, default: () => [] },
  /** Existing attachments when editing (array of { id, original_name, file_url, file_size }) */
  existingAttachments: { type: Array, default: () => [] },
  submitLabel: { type: String, default: 'Save' },
  saving: { type: Boolean, default: false },
})

const emit = defineEmits(['submit', 'cancel', 'update:modelValue'])

const form = ref({
  title: '',
  description: '',
  price: 0,
  expense_date: new Date().toISOString().slice(0, 10),
  main_category_id: null,
  sub_category_id: null,
  category_id: null,
  status: 'paid',
  product_category: '',
  product_id: null,
  quantity: null,
  ...props.modelValue,
})

const errors = ref({})
const fileInputRef = ref(null)
const pendingFiles = ref([])
const attachmentIdsToRemove = ref([])
const attachmentError = ref('')
const imageLoadFailed = ref(new Set())

const acceptTypes = 'image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv'

function getExtension(name) {
  const parts = (name || '').split('.')
  return parts.length > 1 ? parts.pop().toLowerCase() : ''
}

function isImageExtension(ext) {
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg', 'ico'].includes(ext)
}

function isImageFromName(name) {
  return isImageExtension(getExtension(name))
}

function isImageFromMime(attachment) {
  const mime = (attachment.mime_type || attachment.mimeType || attachment.type || attachment.file_type || '').toLowerCase()
  return mime.startsWith('image/')
}

function isImageFromUrl(url) {
  if (!url || typeof url !== 'string') return false
  const lower = url.toLowerCase()
  return /\.(jpg|jpeg|png|gif|webp|bmp|svg|ico)(\?|$)/.test(lower) || lower.includes('/images/')
}

function getExistingAttachmentPreviewUrl(attachment) {
  return resolveAttachmentUrl(attachment)
}

const displayFiles = computed(() => {
  const list = []
  const toRemove = attachmentIdsToRemove.value
  const existing = (props.existingAttachments || []).filter((a) => !toRemove.includes(a.id))
  for (const a of existing) {
    const name = a.original_name || a.name || 'File'
    const ext = getExtension(name)
    const previewUrl = getExistingAttachmentPreviewUrl(a)
    const isImage =
      isImageFromName(name) ||
      isImageFromMime(a) ||
      (previewUrl !== null && isImageFromUrl(previewUrl))
    list.push({
      key: 'existing-' + a.id,
      name,
      isExisting: true,
      id: a.id,
      isImage,
      previewUrl: isImage ? previewUrl : null,
      fileType: isImage ? null : ext || 'generic',
    })
  }
  const pending = pendingFiles.value
  for (let i = 0; i < pending.length; i++) {
    const entry = pending[i]
    const file = entry.file
    const isImage = file.type.startsWith('image/')
    list.push({
      key: 'pending-' + i + '-' + file.name,
      name: file.name,
      isExisting: false,
      file,
      isImage,
      previewUrl: isImage ? entry.objectUrl : null,
      fileType: isImage ? null : getExtension(file.name) || 'generic',
    })
  }
  return list
})

function onFileSelect(e) {
  attachmentError.value = ''
  const files = e.target.files
  if (!files?.length) return
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const { valid, error } = validateAttachment(file)
    if (!valid) {
      attachmentError.value = error
      break
    }
    const objectUrl = file.type.startsWith('image/') ? URL.createObjectURL(file) : null
    pendingFiles.value.push({ file, objectUrl })
  }
  e.target.value = ''
}

function removeFile(item) {
  if (item.isExisting) {
    attachmentIdsToRemove.value = [...attachmentIdsToRemove.value, item.id]
  } else {
    const entry = pendingFiles.value.find((e) => e.file === item.file)
    if (entry?.objectUrl) URL.revokeObjectURL(entry.objectUrl)
    pendingFiles.value = pendingFiles.value.filter((e) => e.file !== item.file)
  }
}

function onImageLoadError(key) {
  imageLoadFailed.value = new Set([...imageLoadFailed.value, key])
}

watch(
  () => props.existingAttachments,
  () => {
    attachmentIdsToRemove.value = []
    imageLoadFailed.value = new Set()
  },
  { immediate: true }
)

watch(
  () => props.modelValue,
  (v) => {
    if (v && typeof v === 'object' && !v.id) {
      pendingFiles.value.forEach((e) => { if (e.objectUrl) URL.revokeObjectURL(e.objectUrl) })
      pendingFiles.value = []
      attachmentIdsToRemove.value = []
      imageLoadFailed.value = new Set()
    }
  }
)

onBeforeUnmount(() => {
  pendingFiles.value.forEach((e) => { if (e.objectUrl) URL.revokeObjectURL(e.objectUrl) })
})

const list = computed(() => Array.isArray(props.categories) ? props.categories : [])

const mainCategoryOptions = computed(() => list.value.filter((c) => !c.parent_id))

/** Main expense category "Products" (name === "Products" && parent_id == null) for product-expense flow */
const productsCategoryId = computed(() => {
  const main = list.value.find((c) => !c.parent_id && String(c.name).trim().toLowerCase() === 'products')
  return main ? main.id : null
})

const isProductExpense = computed(() => {
  const mainId = form.value.main_category_id
  return mainId != null && mainId !== '' && mainId === productsCategoryId.value
})

const statusOptions = [
  { id: 'paid', name: 'Paid' },
  { id: 'unpaid', name: 'Unpaid' },
]

const subCategoryOptions = computed(() => {
  const mainId = form.value.main_category_id
  if (mainId == null || mainId === '') return []
  return list.value.filter((c) => c.parent_id === mainId)
})

// Product expense: categories from GET /api/products/categories
const productCategories = ref([])
const productCategoriesLoading = ref(false)
const productCategoryOptions = computed(() =>
  (productCategories.value || []).map((c) => ({ id: c, name: String(c).charAt(0).toUpperCase() + String(c).slice(1) }))
)

// Product expense: products from GET /api/products?category=...
const productsInCategory = ref([])
const productsLoading = ref(false)
const productsInCategoryOptions = computed(() =>
  (productsInCategory.value || []).map((p) => ({ id: p.id, name: p.name || p.sku || `Product #${p.id}` }))
)

async function loadProductCategories() {
  productCategoriesLoading.value = true
  try {
    const res = await ProductService.getCategories()
    productCategories.value = res?.data ?? []
  } catch {
    productCategories.value = []
  } finally {
    productCategoriesLoading.value = false
  }
}

async function loadProductsByCategory(category) {
  if (!category) {
    productsInCategory.value = []
    return
  }
  productsLoading.value = true
  try {
    const list = await ProductService.getProductsByCategory(category)
    productsInCategory.value = Array.isArray(list) ? list : []
  } catch {
    productsInCategory.value = []
  } finally {
    productsLoading.value = false
  }
}

function onMainCategoryChange() {
  form.value.sub_category_id = null
  if (!isProductExpense.value) {
    form.value.product_category = ''
    form.value.product_id = null
    form.value.quantity = null
  } else {
    loadProductCategories()
  }
}

function onProductCategoryChange() {
  form.value.product_id = null
  loadProductsByCategory(form.value.product_category)
}

async function onProductChange() {
  const id = form.value.product_id
  if (!id) return
  try {
    const product = await ProductService.getProductById(id)
    if (product) {
      // Price is never auto-filled; user must enter it. Only pre-fill title.
      form.value.title = form.value.title || `Stock-in: ${product.name || product.sku || 'Product'}`
    }
  } catch {
    // keep current title
  }
}

function resolveCategoryId() {
  const sub = form.value.sub_category_id
  const main = form.value.main_category_id
  if (sub != null && sub !== '') return sub
  if (main != null && main !== '') return main
  return null
}

function syncCategoryFromId(categoryId) {
  const catId = categoryId != null ? Number(categoryId) : null
  if (catId === null || Number.isNaN(catId)) return
  const categories = list.value
  if (!categories?.length) return
  const cat = categories.find((c) => Number(c.id) === catId)
  if (!cat) return
  if (cat.parent_id != null && cat.parent_id !== '') {
    form.value.main_category_id = cat.parent_id
    form.value.sub_category_id = catId
  } else {
    form.value.main_category_id = catId
    form.value.sub_category_id = null
  }
}

watch(
  () => [props.modelValue, props.categories],
  ([v]) => {
    if (v && typeof v === 'object') {
      form.value = { ...form.value, ...v }
      syncCategoryFromId(v.category_id)
      if (v.product_category) {
        form.value.product_category = v.product_category
        loadProductsByCategory(v.product_category)
      }
      if (v.product_id != null) form.value.product_id = v.product_id
      if (v.quantity != null) form.value.quantity = v.quantity
    }
  },
  { deep: true, immediate: true }
)

watch(
  [() => form.value.main_category_id, () => form.value.sub_category_id],
  () => {
    form.value.category_id = resolveCategoryId()
  },
  { deep: true }
)

// When user selects Products category, load product categories
watch(
  () => form.value.main_category_id,
  (mainId) => {
    if (mainId != null && mainId !== '' && mainId === productsCategoryId.value) {
      loadProductCategories()
    } else {
      productCategories.value = []
      productsInCategory.value = []
    }
  }
)

function validate() {
  const e = {}
  if (!String(form.value.title).trim()) e.title = 'Title is required.'
  if (form.value.price == null || form.value.price < 0) e.price = 'Price must be ≥ 0.'
  if (!form.value.expense_date) e.expense_date = 'Date is required.'
  const catId = resolveCategoryId()
  if (catId == null || catId === '') e.category_id = 'Category is required.'
  if (!['paid', 'unpaid'].includes(form.value.status)) e.status = 'Status must be Paid or Unpaid.'

  if (isProductExpense.value) {
    if (!form.value.product_category) e.product_category = 'Product category is required.'
    if (form.value.product_id == null || form.value.product_id === '') e.product_id = 'Product is required.'
    const q = form.value.quantity
    if (q == null || q === '' || Number(q) < 1) e.quantity = 'Quantity must be at least 1.'
  }

  errors.value = e
  return Object.keys(e).length === 0
}

function onSubmit() {
  if (!validate()) return
  const catId = resolveCategoryId()
  const payload = {
    ...form.value,
    category_id: catId,
    new_attachments: pendingFiles.value.map((e) => e.file),
    attachment_ids_to_remove: [...attachmentIdsToRemove.value],
  }
  // Product expenses: ensure category_id is Products and include product_id, quantity
  if (isProductExpense.value) {
    payload.category_id = productsCategoryId.value
    payload.product_id = form.value.product_id
    payload.quantity = Number(form.value.quantity) || 1
  } else {
    delete payload.product_id
    delete payload.quantity
    delete payload.product_category
  }
  emit('update:modelValue', payload)
  emit('submit', payload)
}
</script>

<style scoped>
.expense-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  min-width: 0;
  max-width: 100%;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
  min-width: 0;
}

.form-field.full {
  grid-column: 1 / -1;
  min-width: 0;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
  margin-bottom: 0.5rem;
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.95);
  font-size: 0.9375rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: rgba(139, 92, 246, 0.6);
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.2);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.form-error {
  font-size: 0.75rem;
  color: #f87171;
  margin: 0.35rem 0 0;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 0.5rem;
}

.btn-primary,
.btn-ghost {
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 100px;
}

.btn-primary {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  border: 1px solid rgba(139, 92, 246, 0.5);
  color: #fff;
  box-shadow: 0 4px 16px rgba(139, 92, 246, 0.35);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(139, 92, 246, 0.45);
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-ghost {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.9);
}

.btn-ghost:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
}

.btn-spinner {
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.attachments-block {
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  min-width: 0;
  overflow: hidden;
}

.attachments-input {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
}

.attachments-upload-btn {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  background: rgba(139, 92, 246, 0.2);
  border: 1px solid rgba(139, 92, 246, 0.4);
  border-radius: 10px;
  color: #c4b5fd;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.attachments-upload-btn:hover {
  background: rgba(139, 92, 246, 0.3);
  border-color: rgba(139, 92, 246, 0.6);
}

.attachments-upload-text {
  pointer-events: none;
}

.attachments-list {
  list-style: none;
  margin: 0.75rem 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 0;
}

.attachments-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  min-width: 0;
}

.attachments-item > :first-child {
  flex-shrink: 0;
}

.attachments-thumb {
  width: 44px;
  height: 44px;
  min-width: 44px;
  min-height: 44px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: block;
  background: rgba(0, 0, 0, 0.2);
}

.attachments-file-icon {
  width: 44px;
  height: 44px;
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-sizing: border-box;
}

.file-icon-svg {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.file-icon-svg.pdf {
  color: #ef4444;
}

.file-icon-svg.doc {
  color: #2563eb;
}

.file-icon-svg.xls {
  color: #16a34a;
}

.file-icon-svg.txt,
.file-icon-svg.generic {
  color: rgba(255, 255, 255, 0.6);
}

.attachments-name {
  flex: 1 1 0%;
  min-width: 0;
  max-width: 100%;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.9);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.attachments-remove {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  min-width: 36px;
  padding: 0;
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  color: #f87171;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.attachments-remove:hover {
  background: rgba(239, 68, 68, 0.25);
}

.attachments-remove svg {
  width: 1.125rem;
  height: 1.125rem;
}

@media (max-width: 640px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
