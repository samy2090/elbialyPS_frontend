<template>
  <div class="expenses-section">
    <!-- Header -->
    <div class="expenses-section__header">
      <div class="expenses-section__header-info">
        <h1 class="expenses-section__title">Expense Management</h1>
        <p class="expenses-section__subtitle">Track expenses, categories and recurrences</p>
      </div>
    </div>

    <!-- Toast -->
    <div v-if="toastMessage" class="expenses-section__toast" :class="toastType">
      {{ toastMessage }}
    </div>

    <!-- Tabs -->
    <div class="expenses-section__tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        type="button"
        class="expenses-section__tab"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        <component :is="tab.icon" class="tab-icon" />
        {{ tab.label }}
      </button>
    </div>

    <!-- Add button row (below tabs, per active tab) -->
    <div v-if="activeTab === 'expenses'" class="expenses-section__add-row">
      <button type="button" class="expenses-section__action-btn primary" @click="openExpenseForm()">
        <svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Add Expense
      </button>
    </div>
    <div v-else-if="activeTab === 'categories'" class="expenses-section__add-row">
      <button type="button" class="expenses-section__action-btn primary" @click="openCategoryForm()">
        <svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Add Category
      </button>
    </div>
    <div v-else-if="activeTab === 'recurrences'" class="expenses-section__add-row">
      <button type="button" class="expenses-section__action-btn primary" @click="openRecurrenceForm()">
        <svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Add Recurrence
      </button>
    </div>

    <!-- Tab content -->
    <div class="expenses-section__content">
      <!-- Expenses list -->
      <div v-show="activeTab === 'expenses'" class="expenses-section__panel">
        <div class="expenses-section__filters">
          <DateRangePicker
            v-model="filtersDateRange"
            placeholder="Date range"
            title="Filter by date"
            class="expenses-section__date-picker"
            @change="onFilterChange"
          />
          <CustomDropdown
            v-model="filters.status"
            :options="filterStatusOptions"
            option-value="id"
            option-label="name"
            placeholder="All statuses"
            :show-placeholder-in-menu="false"
            class="expenses-section__status-dropdown"
            @change="onFilterChange"
          />
        </div>
        <!-- Report summary (uses same filters as list) -->
        <div class="expenses-section__report-inline">
          <div v-if="reportLoading" class="expenses-section__report-loading">
            <div class="spinner"></div>
            <span>Loading summary...</span>
          </div>
          <div v-else-if="reportError" class="expenses-section__report-error">
            <span>{{ reportError }}</span>
            <button type="button" class="expenses-section__action-btn secondary" @click="loadReportSummary">Retry</button>
          </div>
          <div v-else class="expenses-section__reports">
            <ReportSummaryCards :totals="reportSummary?.totals || {}" />
          </div>
        </div>
        <div v-if="expensesLoading" class="expenses-section__loading">
          <div class="spinner"></div>
          <p>Loading expenses...</p>
        </div>
        <div v-else-if="expensesError" class="expenses-section__error">
          <p>{{ expensesError }}</p>
          <button type="button" class="expenses-section__action-btn secondary" @click="loadExpenses">Retry</button>
        </div>
        <div v-else-if="!expensesPaginated?.data?.length" class="expenses-section__empty">
          <p>No expenses yet. Add your first expense.</p>
          <button type="button" class="expenses-section__action-btn primary" @click="openExpenseForm()">Add Expense</button>
        </div>
        <div v-else class="expenses-section__list-wrap">
          <!-- Desktop: table -->
          <div class="expenses-section__table-wrap desktop-only">
            <table class="expenses-section__table">
              <thead>
                <tr>
                  <th>Number</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in expensesPaginated.data" :key="row.id" class="expenses-section__row">
                  <td>{{ row.expense_number }}</td>
                  <td>
                    <span>{{ row.title }}</span>
                    <span v-if="row.product_id" class="expense-badge product-stock">Product (stock-in)</span>
                    <span v-if="row.product_id && (row.product?.name || row.quantity)" class="expense-product-info">
                      {{ row.product?.name || 'Product' }}{{ row.quantity != null ? ` × ${row.quantity}` : '' }}
                    </span>
                  </td>
                  <td>{{ expenseCategoryLabel(row) }}</td>
                  <td>{{ formatExpenseDate(row.expense_date) }}</td>
                  <td><CurrencyDisplay :amount="row.price" /></td>
                  <td><ExpenseStatusBadge :status="row.status" /></td>
                  <td>
                    <div class="expenses-section__row-actions">
                      <button type="button" class="row-btn view" @click="viewExpense(row)">View</button>
                      <button type="button" class="row-btn edit" @click="openExpenseForm(row)">Edit</button>
                      <button type="button" class="row-btn status" @click="toggleExpenseStatus(row)">
                        {{ row.status === 'paid' ? 'Unpaid' : 'Paid' }}
                      </button>
                      <button type="button" class="row-btn danger" @click="confirmDeleteExpense(row)">Delete</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Mobile: cards -->
          <div class="expenses-section__expense-cards mobile-only">
            <div
              v-for="row in expensesPaginated.data"
              :key="row.id"
              class="expense-card"
              @click="viewExpense(row)"
            >
              <div class="expense-card__header">
                <span class="expense-card__number">{{ row.expense_number }}</span>
                <ExpenseStatusBadge :status="row.status" />
                <span v-if="row.product_id" class="expense-badge product-stock">Product (stock-in)</span>
              </div>
              <h3 class="expense-card__title">{{ row.title }}</h3>
              <p v-if="row.product_id && (row.product?.name || row.quantity)" class="expense-card__product-info">
                {{ row.product?.name || 'Product' }}{{ row.quantity != null ? ` × ${row.quantity}` : '' }}
              </p>
              <div class="expense-card__meta">
                <span class="expense-card__category">{{ expenseCategoryLabel(row) }}</span>
                <span class="expense-card__date">{{ formatExpenseDate(row.expense_date) }}</span>
              </div>
              <div class="expense-card__amount">
                <CurrencyDisplay :amount="row.price" />
              </div>
              <div class="expense-card__actions" @click.stop>
                <button type="button" class="expense-card__btn view" @click="viewExpense(row)">View</button>
                <button type="button" class="expense-card__btn edit" @click="openExpenseForm(row)">Edit</button>
                <button type="button" class="expense-card__btn status" @click="toggleExpenseStatus(row)">
                  {{ row.status === 'paid' ? 'Unpaid' : 'Paid' }}
                </button>
                <button type="button" class="expense-card__btn danger" @click="confirmDeleteExpense(row)">Delete</button>
              </div>
            </div>
          </div>

          <PaginationBar
            v-if="expensesPaginated.last_page > 1"
            :current-page="expensesPaginated.current_page"
            :last-page="expensesPaginated.last_page"
            :prev-page-url="expensesPaginated.prev_page_url"
            :next-page-url="expensesPaginated.next_page_url"
            :from="expensesPaginated.from"
            :to="expensesPaginated.to"
            :total="expensesPaginated.total"
            :links="expensesPaginated.links || []"
            @page-change="onExpensesPageChange"
          />
        </div>
      </div>

      <!-- Categories -->
      <div v-show="activeTab === 'categories'" class="expenses-section__panel">
        <div v-if="categoriesLoading" class="expenses-section__loading">
          <div class="spinner"></div>
          <p>Loading categories...</p>
        </div>
        <div v-else-if="categoriesError" class="expenses-section__error">
          <p>{{ categoriesError }}</p>
          <button type="button" class="expenses-section__action-btn secondary" @click="loadCategories">Retry</button>
        </div>
        <div v-else-if="!categories.length" class="expenses-section__empty">
          <p>No categories yet. Add a main category first.</p>
          <button type="button" class="expenses-section__action-btn primary" @click="openCategoryForm()">Add Category</button>
        </div>
        <div v-else class="expenses-section__categories-tree">
          <div class="categories-tree">
            <template v-for="mainCat in mainCategoriesExcludingProducts" :key="mainCat.id">
              <!-- Main category row (clickable to expand/collapse) -->
              <div
                class="category-row category-row--main"
                :class="{ 'has-children': (mainCat.children || []).length }"
              >
                <div
                  class="category-row__content"
                  :class="{ 'category-row__content--clickable': (mainCat.children || []).length }"
                  :role="(mainCat.children || []).length ? 'button' : null"
                  :tabindex="(mainCat.children || []).length ? 0 : -1"
                  @click="(mainCat.children || []).length && toggleCategoryExpand(mainCat.id)"
                  @keydown.enter.space.prevent="(mainCat.children || []).length && toggleCategoryExpand(mainCat.id)"
                >
                  <div class="category-row__icon">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" stroke-width="2"/>
                    </svg>
                  </div>
                  <div class="category-row__info">
                    <span class="category-row__name">{{ mainCat.name }}</span>
                    <span class="category-row__path">{{ mainCat.full_path || mainCat.name }}</span>
                  </div>
                  <span :class="mainCat.is_active ? 'badge active' : 'badge inactive'">
                    {{ mainCat.is_active ? 'Active' : 'Inactive' }}
                  </span>
                  <div v-if="(mainCat.children || []).length" class="category-row__expand-area">
                    <span class="category-row__sub-count">{{ (mainCat.children || []).length }}</span>
                    <div
                      class="category-row__expand-icon"
                      :class="{ expanded: expandedCategoryIds.includes(mainCat.id) }"
                    >
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </div>
                  </div>
                </div>
                <div v-if="!isProductsCategory(mainCat)" class="category-row__actions" @click.stop>
                  <button type="button" class="row-btn edit" @click="openCategoryForm(mainCat)">Edit</button>
                  <button v-if="mainCat.is_active" type="button" class="row-btn warning" @click="deactivateCategory(mainCat)">Deactivate</button>
                  <button v-else type="button" class="row-btn success" @click="activateCategory(mainCat)">Activate</button>
                  <button type="button" class="row-btn danger" @click="confirmDeleteCategory(mainCat)">Delete</button>
                </div>
                <div v-else class="category-row__actions category-row__actions--readonly">
                  <span class="category-row__readonly-hint">System category — cannot edit, deactivate or delete</span>
                </div>
              </div>
              <!-- Sub-categories (nested under main, shown when expanded) -->
              <Transition name="category-expand">
                <div v-show="expandedCategoryIds.includes(mainCat.id)" class="category-row__children">
                  <div
                    v-for="subCat in (mainCat.children || [])"
                    :key="subCat.id"
                    class="category-row category-row--sub"
                  >
                <div class="category-row__content">
                  <div class="category-row__indent"></div>
                  <div class="category-row__icon category-row__icon--sub">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                  </div>
                  <div class="category-row__info">
                    <span class="category-row__name">{{ subCat.name }}</span>
                    <span class="category-row__path">{{ (mainCat.name) }}</span>
                  </div>
                  <span :class="subCat.is_active ? 'badge active' : 'badge inactive'">
                    {{ subCat.is_active ? 'Active' : 'Inactive' }}
                  </span>
                </div>
                <div class="category-row__actions">
                  <button type="button" class="row-btn edit" @click="openCategoryForm(subCat)">Edit</button>
                  <button v-if="subCat.is_active" type="button" class="row-btn warning" @click="deactivateCategory(subCat)">Deactivate</button>
                  <button v-else type="button" class="row-btn success" @click="activateCategory(subCat)">Activate</button>
                  <button type="button" class="row-btn danger" @click="confirmDeleteCategory(subCat)">Delete</button>
                </div>
              </div>
                </div>
              </Transition>
            </template>
          </div>
        </div>
      </div>

      <!-- Recurrences -->
      <div v-show="activeTab === 'recurrences'" class="expenses-section__panel">
        <div v-if="recurrencesLoading" class="expenses-section__loading">
          <div class="spinner"></div>
          <p>Loading recurrences...</p>
        </div>
        <div v-else-if="recurrencesError" class="expenses-section__error">
          <p>{{ recurrencesError }}</p>
          <button type="button" class="expenses-section__action-btn secondary" @click="loadRecurrences">Retry</button>
        </div>
        <div v-else-if="!recurrencesPaginated?.data?.length" class="expenses-section__empty">
          <p>No recurrences yet.</p>
          <button type="button" class="expenses-section__action-btn primary" @click="openRecurrenceForm()">Add Recurrence</button>
        </div>
        <div v-else class="expenses-section__list-wrap">
          <!-- Desktop: table -->
          <div class="expenses-section__table-wrap desktop-only">
            <table class="expenses-section__table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Price</th>
                  <th>Category</th>
                  <th>Frequency</th>
                  <th>Due day</th>
                  <th>Start date</th>
                  <th>End date</th>
                  <th>Last payment</th>
                  <th>Next payment</th>
                  <th>Active</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in recurrencesPaginated.data" :key="row.id" class="expenses-section__row">
                  <td>{{ row.title }}</td>
                  <td><CurrencyDisplay :amount="row.price" /></td>
                  <td>{{ recurrenceCategoryLabel(row) }}</td>
                  <td>{{ row.frequency }}</td>
                  <td>{{ row.due_day }}</td>
                  <td>{{ row.start_date ? formatExpenseDate(row.start_date) : '—' }}</td>
                  <td>{{ row.end_date ? formatExpenseDate(row.end_date) : '—' }}</td>
                  <td>{{ row.last_payment_date ? formatExpenseDate(row.last_payment_date) : '—' }}</td>
                  <td>{{ row.next_payment_date ? formatExpenseDate(row.next_payment_date) : '—' }}</td>
                  <td>
                    <span :class="row.is_active ? 'badge active' : 'badge inactive'">{{ row.is_active ? 'Active' : 'Inactive' }}</span>
                  </td>
                  <td>
                    <div class="expenses-section__row-actions">
                      <ConfirmPaymentButton
                        :loading="confirmingPaymentId === row.id"
                        label="Confirm payment"
                        @click="confirmRecurrencePayment(row)"
                      />
                      <button type="button" class="row-btn edit" @click="openRecurrenceForm(row)">Edit</button>
                      <button v-if="row.is_active" type="button" class="row-btn warning" @click="deactivateRecurrence(row)">Deactivate</button>
                      <button v-else type="button" class="row-btn success" @click="activateRecurrence(row)">Activate</button>
                      <button type="button" class="row-btn danger" @click="confirmDeleteRecurrence(row)">Delete</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Mobile: cards -->
          <div class="expenses-section__recurrence-cards mobile-only">
            <div
              v-for="row in recurrencesPaginated.data"
              :key="row.id"
              class="recurrence-card"
            >
              <div class="recurrence-card__header">
                <span class="recurrence-card__frequency">{{ row.frequency }}</span>
                <span :class="row.is_active ? 'badge active' : 'badge inactive'">{{ row.is_active ? 'Active' : 'Inactive' }}</span>
              </div>
              <h3 class="recurrence-card__title">{{ row.title }}</h3>
              <div class="recurrence-card__amount">
                <CurrencyDisplay :amount="row.price" />
              </div>
              <div class="recurrence-card__meta">
                <span class="recurrence-card__category">{{ recurrenceCategoryLabel(row) }}</span>
                <span class="recurrence-card__due">Due day {{ row.due_day }}</span>
                <span class="recurrence-card__dates" v-if="row.start_date || row.end_date">
                  {{ row.start_date ? formatExpenseDate(row.start_date) : '—' }} – {{ row.end_date ? formatExpenseDate(row.end_date) : '—' }}
                </span>
                <span class="recurrence-card__payments">
                  Last: {{ row.last_payment_date ? formatExpenseDate(row.last_payment_date) : '—' }} · Next: {{ row.next_payment_date ? formatExpenseDate(row.next_payment_date) : '—' }}
                </span>
              </div>
              <div class="recurrence-card__actions" @click.stop>
                <ConfirmPaymentButton
                  :loading="confirmingPaymentId === row.id"
                  label="Confirm payment"
                  class="recurrence-card__btn confirm"
                  @click="confirmRecurrencePayment(row)"
                />
                <button type="button" class="recurrence-card__btn edit" @click="openRecurrenceForm(row)">Edit</button>
                <button v-if="row.is_active" type="button" class="recurrence-card__btn warning" @click="deactivateRecurrence(row)">Deactivate</button>
                <button v-else type="button" class="recurrence-card__btn success" @click="activateRecurrence(row)">Activate</button>
                <button type="button" class="recurrence-card__btn danger" @click="confirmDeleteRecurrence(row)">Delete</button>
              </div>
            </div>
          </div>

          <PaginationBar
            v-if="recurrencesPaginated.last_page > 1"
            :current-page="recurrencesPaginated.current_page"
            :last-page="recurrencesPaginated.last_page"
            :prev-page-url="recurrencesPaginated.prev_page_url"
            :next-page-url="recurrencesPaginated.next_page_url"
            :from="recurrencesPaginated.from"
            :to="recurrencesPaginated.to"
            :total="recurrencesPaginated.total"
            :links="recurrencesPaginated.links || []"
            @page-change="onRecurrencesPageChange"
          />
        </div>
      </div>
    </div>

    <!-- Expense create/edit modal - Teleport to body so it appears above navbar and bottom nav (like session form modal) -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="showExpenseModal" class="session-form-modal-overlay" @click.self="closeExpenseModal">
          <div class="expenses-section__modal expense-form-modal" @click.stop>
            <div class="expenses-section__modal-header">
              <h3>{{ editingExpense ? 'Edit expense' : 'New expense' }}</h3>
              <button type="button" class="expenses-section__modal-close" @click="closeExpenseModal">×</button>
            </div>
            <div class="expenses-section__modal-body">
              <ExpenseForm
                :model-value="expenseFormData"
                :categories="categories"
                :existing-attachments="expenseFormExistingAttachments"
                :submit-label="expenseSaving ? 'Saving...' : 'Save'"
                :saving="expenseSaving"
                @submit="saveExpense"
                @cancel="closeExpenseModal"
              />
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Category create/edit modal -->
    <div v-if="showCategoryModal" class="expenses-section__modal-overlay" @click.self="closeCategoryModal">
      <div class="expenses-section__modal">
        <div class="expenses-section__modal-header">
          <h3>{{ editingCategory ? 'Edit category' : 'New category' }}</h3>
          <button type="button" class="expenses-section__modal-close" @click="closeCategoryModal">×</button>
        </div>
        <div class="expenses-section__modal-body">
          <ExpenseCategoryForm
            :model-value="categoryFormData"
            :main-categories="mainCategoriesExcludingProducts"
            :submit-label="categorySaving ? 'Saving...' : 'Save'"
            :saving="categorySaving"
            @submit="saveCategory"
            @cancel="closeCategoryModal"
          />
        </div>
      </div>
    </div>

    <!-- Recurrence create/edit modal - Teleport to body so it appears above navbar and bottom nav (like expense modal) -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="showRecurrenceModal" class="session-form-modal-overlay" @click.self="closeRecurrenceModal">
          <div class="expenses-section__modal expense-form-modal" @click.stop>
            <div class="expenses-section__modal-header">
              <h3>{{ editingRecurrence ? 'Edit recurrence' : 'New recurrence' }}</h3>
              <button type="button" class="expenses-section__modal-close" @click="closeRecurrenceModal">×</button>
            </div>
            <div class="expenses-section__modal-body">
              <ExpenseRecurrenceForm
                :model-value="recurrenceFormData"
                :categories="categories"
                :submit-label="recurrenceSaving ? 'Saving...' : 'Save'"
                :saving="recurrenceSaving"
                @submit="saveRecurrence"
                @cancel="closeRecurrenceModal"
              />
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Expense detail modal (view) -->
    <div v-if="viewingExpense" class="expenses-section__modal-overlay" @click.self="viewingExpense = null">
      <div class="expenses-section__modal modal-large">
        <div class="expenses-section__modal-header">
          <h3>Expense: {{ viewingExpense.expense_number }}</h3>
          <button type="button" class="expenses-section__modal-close" @click="viewingExpense = null">×</button>
        </div>
        <div class="expenses-section__modal-body">
          <div class="expense-detail-grid">
            <p><strong>Title:</strong> {{ viewingExpense.title }}</p>
            <p v-if="viewingExpense.product_id" class="expense-detail-product">
              <strong>Product (stock-in):</strong>
              <span class="expense-badge product-stock">Product (stock-in)</span>
              {{ viewingExpense.product?.name || 'Product' }}{{ viewingExpense.quantity != null ? ` × ${viewingExpense.quantity}` : '' }} — affected stock
            </p>
            <p><strong>Description:</strong> {{ viewingExpense.description || '—' }}</p>
            <p><strong>Amount:</strong> <CurrencyDisplay :amount="viewingExpense.price" /></p>
            <p><strong>Date:</strong> {{ formatExpenseDate(viewingExpense.expense_date) }}</p>
            <p><strong>Category:</strong> {{ expenseCategoryLabel(viewingExpense) }}</p>
            <p><strong>Status:</strong> <ExpenseStatusBadge :status="viewingExpense.status" /></p>
          </div>
          <AttachmentList
            :attachments="viewingExpenseAttachments"
            :upload-error="attachmentError"
            :deleting-id="deletingAttachmentId"
            :read-only="true"
            @upload="(file) => uploadAttachment(viewingExpense.id, file)"
            @delete="(att) => deleteAttachment(viewingExpense.id, att.id)"
          />
          <div class="expenses-section__modal-actions">
            <button type="button" class="expenses-section__action-btn secondary" @click="viewingExpense = null">Close</button>
            <button type="button" class="expenses-section__action-btn primary" @click="openExpenseForm(viewingExpense); viewingExpense = null">Edit</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete confirm modals -->
    <div v-if="deleteExpenseTarget" class="expenses-section__modal-overlay" @click.self="deleteExpenseTarget = null">
      <div class="expenses-section__modal modal-sm">
        <div class="expenses-section__modal-header">
          <h3>Delete expense</h3>
          <button type="button" class="expenses-section__modal-close" @click="deleteExpenseTarget = null">×</button>
        </div>
        <div class="expenses-section__modal-body">
          <p>Delete "{{ deleteExpenseTarget.title }}"?</p>
          <div class="expenses-section__modal-actions">
            <button type="button" class="expenses-section__action-btn secondary" @click="deleteExpenseTarget = null">Cancel</button>
            <button type="button" class="expenses-section__action-btn danger" :disabled="expenseDeleting" @click="deleteExpenseConfirm">Delete</button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="deleteCategoryTarget" class="expenses-section__modal-overlay" @click.self="deleteCategoryTarget = null">
      <div class="expenses-section__modal modal-sm">
        <div class="expenses-section__modal-header">
          <h3>Delete category</h3>
          <button type="button" class="expenses-section__modal-close" @click="deleteCategoryTarget = null">×</button>
        </div>
        <div class="expenses-section__modal-body">
          <p>Delete "{{ deleteCategoryTarget.name }}"?</p>
          <p v-if="deleteCategoryError" class="form-error">{{ deleteCategoryError }}</p>
          <div class="expenses-section__modal-actions">
            <button type="button" class="expenses-section__action-btn secondary" @click="deleteCategoryTarget = null">Cancel</button>
            <button type="button" class="expenses-section__action-btn danger" :disabled="categoryDeleting" @click="deleteCategoryConfirm">Delete</button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="deleteRecurrenceTarget" class="expenses-section__modal-overlay" @click.self="deleteRecurrenceTarget = null">
      <div class="expenses-section__modal modal-sm">
        <div class="expenses-section__modal-header">
          <h3>Delete recurrence</h3>
          <button type="button" class="expenses-section__modal-close" @click="deleteRecurrenceTarget = null">×</button>
        </div>
        <div class="expenses-section__modal-body">
          <p>Delete "{{ deleteRecurrenceTarget.title }}"?</p>
          <div class="expenses-section__modal-actions">
            <button type="button" class="expenses-section__action-btn secondary" @click="deleteRecurrenceTarget = null">Cancel</button>
            <button type="button" class="expenses-section__action-btn danger" :disabled="recurrenceDeleting" @click="deleteRecurrenceConfirm">Delete</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { expensesApi, expenseCategoriesApi, expenseRecurrencesApi, expenseReportsApi } from '@/api/expenses'
import { formatExpenseDate } from '@/utils/expenseHelpers'
import { validateAttachment } from '@/utils/expenseHelpers'
import DateRangePicker from '@/components/base/ui/DateRangePicker.vue'
import CustomDropdown from '@/components/base/ui/CustomDropdown.vue'
import CurrencyDisplay from '@/components/dashboard/expenses/CurrencyDisplay.vue'
import ExpenseStatusBadge from '@/components/dashboard/expenses/ExpenseStatusBadge.vue'
import ExpenseForm from '@/components/dashboard/expenses/ExpenseForm.vue'
import ExpenseCategoryForm from '@/components/dashboard/expenses/ExpenseCategoryForm.vue'
import ExpenseRecurrenceForm from '@/components/dashboard/expenses/ExpenseRecurrenceForm.vue'
import AttachmentList from '@/components/dashboard/expenses/AttachmentList.vue'
import PaginationBar from '@/components/dashboard/expenses/PaginationBar.vue'
import ReportSummaryCards from '@/components/dashboard/expenses/ReportSummaryCards.vue'
import ConfirmPaymentButton from '@/components/dashboard/expenses/ConfirmPaymentButton.vue'

const activeTab = ref('expenses')
const toastMessage = ref('')
const toastType = ref('success')

const tabs = [
  { id: 'expenses', label: 'Expenses', icon: 'span' },
  { id: 'recurrences', label: 'Recurrences', icon: 'span' },
  { id: 'categories', label: 'Categories', icon: 'span' },
]

function showToast(msg, type = 'success') {
  toastMessage.value = msg
  toastType.value = type
  setTimeout(() => { toastMessage.value = '' }, 3000)
}

// Filters (DateRangePicker uses { startDate, endDate })
const filtersDateRange = ref({ startDate: null, endDate: null })
const filters = ref({ status: '' })

const filterStatusOptions = [
  { id: '', name: 'All statuses' },
  { id: 'paid', name: 'Paid' },
  { id: 'unpaid', name: 'Unpaid' },
]

// Expenses
const expensesPaginated = ref({ data: [], current_page: 1, last_page: 1, from: 0, to: 0, total: 0, links: [], prev_page_url: null, next_page_url: null })
const expensesLoading = ref(false)
const expensesError = ref('')
const categories = ref([])
const categoriesLoading = ref(false)
const categoriesError = ref('')
const expandedCategoryIds = ref([])
function toggleCategoryExpand(id) {
  const idx = expandedCategoryIds.value.indexOf(id)
  if (idx >= 0) {
    expandedCategoryIds.value = expandedCategoryIds.value.filter((x) => x !== id)
  } else {
    expandedCategoryIds.value = [...expandedCategoryIds.value, id]
  }
}
// Build tree: main categories with their children (works for both flat and nested API responses)
const mainCategories = computed(() => {
  const list = categories.value || []
  const mains = list.filter((c) => !c.parent_id)
  const withChildren = mains.map((main) => {
    const children = list.filter((c) => c.parent_id === main.id)
    return {
      ...main,
      full_path: main.full_path || main.name,
      children: children.map((sub) => ({
        ...sub,
        full_path: sub.full_path || `${main.name} → ${sub.name}`,
      })),
    }
  })
  return withChildren
})

/** Main categories excluding "Products" — used for categories tree (hide Products) and for parent dropdown in add/edit category (Products cannot be parent) */
const mainCategoriesExcludingProducts = computed(() =>
  mainCategories.value.filter((c) => !isProductsCategory(c))
)

/** Category label for expense or recurrence: show both main and sub when present (e.g. "Main → Sub") */
function expenseCategoryLabel(row) {
  const cat = row?.category
  if (!cat) return '—'
  if (cat.full_path) return cat.full_path
  if (cat.parent_id && categories.value?.length) {
    const parent = categories.value.find((c) => c.id === cat.parent_id)
    if (parent) return `${parent.name} → ${cat.name}`
  }
  return cat.name || '—'
}

/** Category label for recurrence: same as expense (main → sub when present) */
function recurrenceCategoryLabel(row) {
  return expenseCategoryLabel(row)
}

const recurrencesPaginated = ref({ data: [], current_page: 1, last_page: 1, from: 0, to: 0, total: 0, links: [], prev_page_url: null, next_page_url: null })
const recurrencesLoading = ref(false)
const recurrencesError = ref('')

const reportSummary = ref(null)
const reportLoading = ref(false)
const reportError = ref('')

async function loadExpenses(page = 1) {
  expensesLoading.value = true
  expensesError.value = ''
  try {
    const params = { page, per_page: 15 }
    const startDate = filtersDateRange.value.startDate
    const endDate = filtersDateRange.value.endDate
    const status = filters.value.status
    if (status) params.status = status

    if (startDate) {
      const rangeEnd = endDate || startDate
      const res = await expensesApi.getByDateRange(startDate, rangeEnd, params)
      expensesPaginated.value = res
    } else if (status) {
      const res = await expensesApi.getByStatus(status, params)
      expensesPaginated.value = res
    } else {
      const res = await expensesApi.list(params)
      expensesPaginated.value = res
    }
  } catch (e) {
    expensesError.value = e.response?.data?.message || e.message || 'Failed to load expenses.'
    if (e.response?.status === 403) expensesError.value = 'Access denied. Admin or Staff required.'
  } finally {
    expensesLoading.value = false
  }
}

function onExpensesPageChange(page) {
  loadExpenses(page)
}

function onFilterChange() {
  loadExpenses(1)
  loadReportSummary()
}

async function loadCategories() {
  categoriesLoading.value = true
  categoriesError.value = ''
  try {
    const data = await expenseCategoriesApi.list()
    categories.value = Array.isArray(data) ? data : (data?.data || [])
  } catch (e) {
    categoriesError.value = e.response?.data?.message || e.message || 'Failed to load categories.'
    if (e.response?.status === 403) categoriesError.value = 'Access denied. Admin or Staff required.'
  } finally {
    categoriesLoading.value = false
  }
}

async function loadRecurrences(page = 1) {
  recurrencesLoading.value = true
  recurrencesError.value = ''
  try {
    const res = await expenseRecurrencesApi.list({ page, per_page: 15 })
    recurrencesPaginated.value = res
  } catch (e) {
    recurrencesError.value = e.response?.data?.message || e.message || 'Failed to load recurrences.'
    if (e.response?.status === 403) recurrencesError.value = 'Access denied. Admin or Staff required.'
  } finally {
    recurrencesLoading.value = false
  }
}

function onRecurrencesPageChange(page) {
  loadRecurrences(page)
}

async function loadReportSummary() {
  reportLoading.value = true
  reportError.value = ''
  try {
    const params = {}
    const startDate = filtersDateRange.value?.startDate
    const endDate = filtersDateRange.value?.endDate
    if (startDate) {
      params.start_date = startDate
      params.end_date = endDate || startDate
    }
    if (filters.value.status) params.status = filters.value.status

    const [summaryData, paidVsUnpaidData] = await Promise.all([
      expenseReportsApi.getSummary(params),
      expenseReportsApi.getPaidVsUnpaid(params).catch(() => null),
    ])

    const totals = { ...(summaryData?.totals || {}) }
    if (paidVsUnpaidData?.paid != null || paidVsUnpaidData?.unpaid != null) {
      totals.paid_amount = paidVsUnpaidData?.paid?.total_amount ?? totals.paid_amount ?? 0
      totals.paid_count = paidVsUnpaidData?.paid?.count ?? totals.paid_count ?? 0
      totals.unpaid_amount = paidVsUnpaidData?.unpaid?.total_amount ?? totals.unpaid_amount ?? 0
      totals.unpaid_count = paidVsUnpaidData?.unpaid?.count ?? totals.unpaid_count ?? 0
    }
    reportSummary.value = { ...summaryData, totals }
  } catch (e) {
    reportError.value = e.response?.data?.message || e.message || 'Failed to load report.'
  } finally {
    reportLoading.value = false
  }
}

watch(activeTab, (tab) => {
  if (tab === 'expenses') {
    loadExpenses()
    loadReportSummary()
  }
  if (tab === 'categories') loadCategories()
  if (tab === 'recurrences') loadRecurrences()
})

onMounted(() => {
  loadExpenses()
  loadReportSummary()
  loadCategories()
})

// Expense form
const showExpenseModal = ref(false)
const editingExpense = ref(null)
const expenseFormData = ref({})
const expenseFormExistingAttachments = ref([])
const expenseSaving = ref(false)
async function openExpenseForm(expense = null) {
  editingExpense.value = expense
  expenseFormData.value = expense ? {
    title: expense.title,
    description: expense.description || '',
    price: expense.price,
    expense_date: expense.expense_date?.slice(0, 10),
    category_id: expense.category_id,
    status: expense.status,
    product_id: expense.product_id ?? null,
    quantity: expense.quantity ?? null,
    product_category: expense.product?.category ?? null,
  } : {}
  expenseFormExistingAttachments.value = []
  if (expense?.id) {
    try {
      const atts = await expensesApi.getAttachments(expense.id)
      expenseFormExistingAttachments.value = atts || []
    } catch {
      expenseFormExistingAttachments.value = []
    }
  }
  showExpenseModal.value = true
}
function closeExpenseModal() {
  showExpenseModal.value = false
  editingExpense.value = null
  expenseFormExistingAttachments.value = []
}
async function saveExpense(payload) {
  const newAttachments = payload.new_attachments || []
  const idsToRemove = payload.attachment_ids_to_remove || []
  const body = {
    title: payload.title,
    description: payload.description ?? null,
    price: payload.price,
    expense_date: payload.expense_date,
    category_id: payload.category_id,
    status: payload.status,
  }
  if (payload.product_id != null && payload.quantity != null) {
    body.product_id = payload.product_id
    body.quantity = Number(payload.quantity) || 1
  }
  // Do not send product_id/quantity for non-product expenses to avoid backend validation errors

  expenseSaving.value = true
  try {
    let expenseId
    if (editingExpense.value?.id) {
      expenseId = editingExpense.value.id
      await expensesApi.update(expenseId, body)
      showToast('Expense updated.')
      for (const id of idsToRemove) {
        await expensesApi.deleteAttachment(expenseId, id)
      }
      for (const file of newAttachments) {
        await expensesApi.uploadAttachment(expenseId, file)
      }
    } else {
      const created = await expensesApi.create(body)
      expenseId = created?.id ?? created?.data?.id
      if (expenseId && newAttachments.length) {
        for (const file of newAttachments) {
          await expensesApi.uploadAttachment(expenseId, file)
        }
      }
      showToast('Expense created.')
    }
    closeExpenseModal()
    loadExpenses(expensesPaginated.value.current_page)
    loadReportSummary()
  } catch (e) {
    const msg = e.response?.data?.message || e.response?.data?.errors ? Object.values(e.response.data.errors || {}).flat().join(' ') || e.message : e.message
    showToast(msg || 'Failed to save.', 'error')
  } finally {
    expenseSaving.value = false
  }
}

async function toggleExpenseStatus(row) {
  try {
    if (row.status === 'paid') await expensesApi.markUnpaid(row.id)
    else await expensesApi.markPaid(row.id)
    showToast('Status updated.')
    loadExpenses(expensesPaginated.value.current_page)
    loadReportSummary()
  } catch (e) {
    showToast(e.response?.data?.message || e.message || 'Failed to update status.', 'error')
  }
}

const deleteExpenseTarget = ref(null)
const expenseDeleting = ref(false)
function confirmDeleteExpense(row) {
  deleteExpenseTarget.value = row
}
async function deleteExpenseConfirm() {
  if (!deleteExpenseTarget.value) return
  expenseDeleting.value = true
  try {
    await expensesApi.delete(deleteExpenseTarget.value.id)
    showToast('Expense deleted.')
    deleteExpenseTarget.value = null
    loadExpenses(expensesPaginated.value.current_page)
    loadReportSummary()
  } catch (e) {
    showToast(e.response?.data?.message || e.message || 'Failed to delete.', 'error')
  } finally {
    expenseDeleting.value = false
  }
}

const viewingExpense = ref(null)
const viewingExpenseAttachments = ref([])
const attachmentError = ref('')
const deletingAttachmentId = ref(null)
async function viewExpense(row) {
  try {
    const full = await expensesApi.getById(row.id)
    viewingExpense.value = full
    const atts = await expensesApi.getAttachments(row.id)
    viewingExpenseAttachments.value = atts || []
    attachmentError.value = ''
  } catch (e) {
    showToast(e.response?.data?.message || e.message || 'Failed to load expense.', 'error')
  }
}
async function uploadAttachment(expenseId, file) {
  const { valid, error } = validateAttachment(file)
  if (!valid) {
    attachmentError.value = error
    return
  }
  attachmentError.value = ''
  try {
    await expensesApi.uploadAttachment(expenseId, file)
    viewingExpenseAttachments.value = await expensesApi.getAttachments(expenseId)
    showToast('File uploaded.')
  } catch (e) {
    attachmentError.value = e.response?.data?.message || e.message || 'Upload failed.'
  }
}
async function deleteAttachment(expenseId, attachmentId) {
  deletingAttachmentId.value = attachmentId
  try {
    await expensesApi.deleteAttachment(expenseId, attachmentId)
    viewingExpenseAttachments.value = viewingExpenseAttachments.value.filter((a) => a.id !== attachmentId)
    showToast('Attachment removed.')
  } catch (e) {
    showToast(e.response?.data?.message || e.message || 'Delete failed.', 'error')
  } finally {
    deletingAttachmentId.value = null
  }
}

// Category form
const showCategoryModal = ref(false)
const editingCategory = ref(null)
const categoryFormData = ref({})
const categorySaving = ref(false)
const deleteCategoryTarget = ref(null)
const categoryDeleting = ref(false)
const deleteCategoryError = ref('')

/** Main expense category "Products" (name === "Products" && parent_id == null) — cannot be edited, deactivated or deleted */
function isProductsCategory(cat) {
  return cat && !cat.parent_id && String(cat.name || '').trim().toLowerCase() === 'products'
}

function openCategoryForm(cat = null) {
  if (cat && isProductsCategory(cat)) return
  editingCategory.value = cat
  categoryFormData.value = cat ? { id: cat.id, name: cat.name, parent_id: cat.parent_id, is_active: cat.is_active } : {}
  showCategoryModal.value = true
}
function closeCategoryModal() {
  showCategoryModal.value = false
  editingCategory.value = null
}
async function saveCategory(payload) {
  categorySaving.value = true
  try {
    if (editingCategory.value?.id) {
      await expenseCategoriesApi.update(editingCategory.value.id, payload)
      showToast('Category updated.')
    } else {
      await expenseCategoriesApi.create(payload)
      showToast('Category created.')
    }
    closeCategoryModal()
    loadCategories()
  } catch (e) {
    showToast(e.response?.data?.message || (e.response?.data?.errors && Object.values(e.response.data.errors).flat().join(' ')) || e.message, 'error')
  } finally {
    categorySaving.value = false
  }
}
async function deactivateCategory(cat) {
  if (isProductsCategory(cat)) return
  try {
    await expenseCategoriesApi.deactivate(cat.id)
    showToast('Category deactivated.')
    loadCategories()
  } catch (e) {
    showToast(e.response?.data?.message || e.message, 'error')
  }
}
async function activateCategory(cat) {
  if (isProductsCategory(cat)) return
  try {
    await expenseCategoriesApi.activate(cat.id)
    showToast('Category activated.')
    loadCategories()
  } catch (e) {
    showToast(e.response?.data?.message || e.message, 'error')
  }
}
function confirmDeleteCategory(cat) {
  if (isProductsCategory(cat)) return
  deleteCategoryTarget.value = cat
  deleteCategoryError.value = ''
}
async function deleteCategoryConfirm() {
  if (!deleteCategoryTarget.value) return
  categoryDeleting.value = true
  deleteCategoryError.value = ''
  try {
    await expenseCategoriesApi.delete(deleteCategoryTarget.value.id)
    showToast('Category deleted.')
    deleteCategoryTarget.value = null
    loadCategories()
  } catch (e) {
    deleteCategoryError.value = e.response?.data?.message || e.message || 'Cannot delete category with existing expenses. Try deactivating.'
  } finally {
    categoryDeleting.value = false
  }
}

// Recurrence form
const showRecurrenceModal = ref(false)
const editingRecurrence = ref(null)
const recurrenceFormData = ref({})
const recurrenceSaving = ref(false)
const confirmingPaymentId = ref(null)
const deleteRecurrenceTarget = ref(null)
const recurrenceDeleting = ref(false)
function openRecurrenceForm(rec = null) {
  editingRecurrence.value = rec
  recurrenceFormData.value = rec ? {
    title: rec.title,
    price: rec.price,
    category_id: rec.category_id,
    frequency: rec.frequency,
    due_day: rec.due_day,
    start_date: rec.start_date?.slice(0, 10),
    end_date: rec.end_date?.slice(0, 10) || '',
    is_active: rec.is_active,
  } : {}
  showRecurrenceModal.value = true
}
function closeRecurrenceModal() {
  showRecurrenceModal.value = false
  editingRecurrence.value = null
}
async function saveRecurrence(payload) {
  recurrenceSaving.value = true
  try {
    if (editingRecurrence.value?.id) {
      await expenseRecurrencesApi.update(editingRecurrence.value.id, payload)
      showToast('Recurrence updated.')
    } else {
      await expenseRecurrencesApi.create(payload)
      showToast('Recurrence created.')
    }
    closeRecurrenceModal()
    loadRecurrences(recurrencesPaginated.value.current_page)
  } catch (e) {
    showToast(e.response?.data?.message || (e.response?.data?.errors && Object.values(e.response.data.errors).flat().join(' ')) || e.message, 'error')
  } finally {
    recurrenceSaving.value = false
  }
}
async function confirmRecurrencePayment(row) {
  confirmingPaymentId.value = row.id
  try {
    await expenseRecurrencesApi.confirmPayment(row.id)
    showToast('Payment confirmed. Expense created.')
    loadRecurrences(recurrencesPaginated.value.current_page)
  } catch (e) {
    showToast(e.response?.data?.message || e.message, 'error')
  } finally {
    confirmingPaymentId.value = null
  }
}
function confirmDeleteRecurrence(row) {
  deleteRecurrenceTarget.value = row
}
async function deleteRecurrenceConfirm() {
  if (!deleteRecurrenceTarget.value) return
  recurrenceDeleting.value = true
  try {
    await expenseRecurrencesApi.delete(deleteRecurrenceTarget.value.id)
    showToast('Recurrence deleted.')
    deleteRecurrenceTarget.value = null
    loadRecurrences(recurrencesPaginated.value.current_page)
  } catch (e) {
    showToast(e.response?.data?.message || e.message, 'error')
  } finally {
    recurrenceDeleting.value = false
  }
}
</script>

<style scoped>
.expenses-section {
  position: relative;
  padding: 0;
  animation: expensesFadeIn 0.35s ease;
}

.expenses-section::before {
  content: '';
  position: absolute;
  top: -10%;
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
  height: 40%;
  background: radial-gradient(ellipse at center, rgba(139, 92, 246, 0.12) 0%, transparent 70%);
  pointer-events: none;
  z-index: 0;
}

@keyframes expensesFadeIn {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

.expenses-section__header {
  position: relative;
  z-index: 1;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem 1.25rem;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.06) 0%, rgba(139, 92, 246, 0.02) 100%);
  border: 1px solid rgba(139, 92, 246, 0.15);
  border-radius: 16px;
  backdrop-filter: blur(12px);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.expenses-section__title {
  font-size: clamp(1.5rem, 3vw, 1.75rem);
  font-weight: 700;
  color: rgba(255, 255, 255, 0.95);
  margin: 0 0 0.25rem;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, #fff 0%, rgba(255, 255, 255, 0.85) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 0 20px rgba(139, 92, 246, 0.3));
}

.expenses-section__subtitle {
  font-size: 0.9375rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
}

.expenses-section__action-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: all 0.25s ease;
  border: 1px solid transparent;
}

.expenses-section__action-btn .icon {
  width: 1.125rem;
  height: 1.125rem;
}

.expenses-section__action-btn.primary {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  border-color: rgba(139, 92, 246, 0.5);
  color: #fff;
  box-shadow: 0 4px 20px rgba(139, 92, 246, 0.35);
}

.expenses-section__action-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 28px rgba(139, 92, 246, 0.45);
}

.expenses-section__action-btn.secondary {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.9);
}

.expenses-section__action-btn.secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(139, 92, 246, 0.35);
}

.expenses-section__action-btn.danger {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.4);
  color: #f87171;
}

.expenses-section__action-btn.danger:hover {
  background: rgba(239, 68, 68, 0.3);
}

.expenses-section__toast {
  position: fixed;
  top: 90px;
  right: 1.5rem;
  padding: 0.75rem 1.25rem;
  border-radius: 12px;
  font-size: 0.9375rem;
  font-weight: 500;
  z-index: 1002;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
  animation: toastIn 0.3s ease;
}

.expenses-section__toast.success {
  background: rgba(16, 185, 129, 0.2);
  border: 1px solid rgba(16, 185, 129, 0.5);
  color: #6ee7b7;
}

.expenses-section__toast.error {
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.5);
  color: #fca5a5;
}

@keyframes toastIn {
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
}

.expenses-section__tabs {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding: 0.5rem;
  background: linear-gradient(180deg, rgba(15, 15, 23, 0.95) 0%, rgba(20, 20, 28, 0.9) 100%);
  border: 1px solid rgba(139, 92, 246, 0.2);
  border-radius: 16px;
  backdrop-filter: blur(16px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(139, 92, 246, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.expenses-section__tab {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.875rem 1rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.expenses-section__tab:hover {
  color: rgba(255, 255, 255, 0.95);
  background: rgba(139, 92, 246, 0.12);
  border-color: rgba(139, 92, 246, 0.25);
  box-shadow: 0 0 20px rgba(139, 92, 246, 0.15);
}

.expenses-section__tab.active {
  color: #e9d5ff;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.35), rgba(124, 58, 237, 0.25));
  border-color: rgba(139, 92, 246, 0.5);
  box-shadow: 0 4px 20px rgba(139, 92, 246, 0.35), 0 0 30px rgba(139, 92, 246, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1);
  text-shadow: 0 0 20px rgba(139, 92, 246, 0.5);
}

.expenses-section__add-row {
  position: relative;
  z-index: 1;
  margin-bottom: 1.25rem;
  padding-bottom: 0.5rem;
}

.expenses-section__add-row .expenses-section__action-btn {
  width: 100%;
  justify-content: center;
  padding: 1rem 1.5rem;
  border-radius: 14px;
  font-size: 1rem;
  box-shadow: 0 8px 24px rgba(139, 92, 246, 0.4), 0 0 40px rgba(139, 92, 246, 0.2);
}

.expenses-section__add-row .expenses-section__action-btn:hover {
  box-shadow: 0 12px 32px rgba(139, 92, 246, 0.5), 0 0 50px rgba(139, 92, 246, 0.3);
}

.expenses-section__add-row .expenses-section__action-btn .icon {
  width: 1.25rem;
  height: 1.25rem;
}

.expenses-section__content {
  position: relative;
  z-index: 1;
  min-height: 200px;
}

/* Categories tree (main + sub hierarchy) */
.expenses-section__categories-tree {
  padding: 0.5rem 0;
}

.categories-tree {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.category-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border-radius: 14px;
  margin-bottom: 0.5rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(8px);
}

.category-row:hover {
  background: rgba(255, 255, 255, 0.03);
  border-color: rgba(255, 255, 255, 0.06);
}

.category-row--main {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.12) 0%, rgba(139, 92, 246, 0.06) 100%);
  border-color: rgba(139, 92, 246, 0.2);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.category-row--main.has-children {
  border-left: 3px solid rgba(139, 92, 246, 0.4);
}

.category-row--main:hover {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.18) 0%, rgba(139, 92, 246, 0.1) 100%);
  border-color: rgba(139, 92, 246, 0.3);
}

/* Stronger hover for expandable cards – lift + glow */
.category-row--main.has-children:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(139, 92, 246, 0.15);
}

.category-row--sub {
  margin-left: 1.5rem;
  padding-left: 1rem;
  border-left: 3px solid rgba(139, 92, 246, 0.3);
  background: rgba(255, 255, 255, 0.02);
}

.category-row--sub:hover {
  background: rgba(255, 255, 255, 0.05);
}

.category-row__content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
  min-width: 0;
}

.category-row__expand-area {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: auto;
  flex-shrink: 0;
}

.category-row__sub-count {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 1.5rem;
  height: 1.5rem;
  padding: 0 0.4rem;
  background: rgba(139, 92, 246, 0.3);
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 700;
  color: #c4b5fd;
}

.category-row__content--clickable {
  cursor: pointer;
  border-radius: 8px;
  padding: 0.25rem 0;
  transition: transform 0.2s ease;
}

.category-row__content--clickable:hover {
  background: rgba(255, 255, 255, 0.04);
}

/* Chevron in pill – clear "tap to expand" affordance */
.category-row__expand-icon {
  width: 2rem;
  height: 2rem;
  min-width: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(139, 92, 246, 0.25);
  border-radius: 10px;
  color: #c4b5fd;
  transition: all 0.25s ease;
  flex-shrink: 0;
  box-shadow: 0 0 12px rgba(139, 92, 246, 0.2);
}

/* Subtle pulse when collapsed – draws attention */
.category-row--main.has-children:not(:hover) .category-row__expand-icon:not(.expanded) {
  animation: expand-hint-pulse 2.5s ease-in-out infinite;
}

@keyframes expand-hint-pulse {
  0%, 100% { opacity: 1; box-shadow: 0 0 12px rgba(139, 92, 246, 0.2); }
  50% { opacity: 0.85; box-shadow: 0 0 20px rgba(139, 92, 246, 0.35); }
}

/* Hover: chevron bounces right – "I react" */
.category-row--main.has-children .category-row__content--clickable:hover .category-row__expand-icon:not(.expanded) {
  animation: none;
  transform: translateX(4px);
  background: rgba(139, 92, 246, 0.4);
  box-shadow: 0 0 16px rgba(139, 92, 246, 0.4);
}

.category-row__expand-icon svg {
  width: 1rem;
  height: 1rem;
  transition: transform 0.25s ease;
}

.category-row__expand-icon.expanded {
  transform: rotate(90deg);
  color: #e9d5ff;
  background: rgba(139, 92, 246, 0.35);
}

.category-row__children {
  overflow: hidden;
}

.category-expand-enter-active,
.category-expand-leave-active {
  transition: all 0.25s ease;
}

.category-expand-enter-from,
.category-expand-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.category-row__indent {
  width: 1rem;
  flex-shrink: 0;
}

.category-row__icon {
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(139, 92, 246, 0.2);
  border-radius: 10px;
  color: #a78bfa;
  flex-shrink: 0;
}

.category-row__icon svg {
  width: 1.125rem;
  height: 1.125rem;
}

.category-row__icon--sub {
  background: rgba(139, 92, 246, 0.1);
  color: rgba(167, 139, 250, 0.8);
}

.category-row__icon--sub svg {
  width: 1rem;
  height: 1rem;
}

.category-row__info {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;
}

.category-row__name {
  font-weight: 600;
  font-size: 0.9375rem;
  color: rgba(255, 255, 255, 0.95);
}

.category-row--sub .category-row__name {
  font-weight: 500;
  font-size: 0.875rem;
}

.category-row__path {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
}

.category-row__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.category-row__actions--readonly {
  align-items: center;
}

.category-row__readonly-hint {
  font-size: 0.8125rem;
  color: rgba(255, 255, 255, 0.5);
  font-style: italic;
}

@media (max-width: 768px) {
  .category-row {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }

  .category-row--sub {
    margin-left: 1rem;
  }

  .category-row__actions {
    justify-content: flex-start;
  }
}

.expenses-section__panel {
  padding: 0;
}

.expenses-section__filters {
  position: relative;
  z-index: 10;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.25rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(139, 92, 246, 0.12);
  border-radius: 14px;
  backdrop-filter: blur(8px);
}

.expenses-section__select {
  padding: 0.7rem 1rem;
  background: rgba(15, 15, 23, 0.8);
  border: 1px solid rgba(139, 92, 246, 0.25);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.95);
  font-size: 0.9rem;
  transition: all 0.2s;
}

.expenses-section__select:focus,
.expenses-section__status-dropdown:focus-within {
  outline: none;
  border-color: rgba(139, 92, 246, 0.5);
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.2);
}

.expenses-section__status-dropdown {
  min-width: 140px;
}

.expenses-section__status-dropdown :deep(.custom-dropdown-menu),
.expenses-section__date-picker :deep(.date-picker-dropdown) {
  z-index: 100010;
}

.expenses-section__filter-btn {
  padding: 0.7rem 1.25rem;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(139, 92, 246, 0.2));
  border: 1px solid rgba(139, 92, 246, 0.5);
  border-radius: 12px;
  color: #c4b5fd;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.2);
}

.expenses-section__filter-btn:hover {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.4), rgba(139, 92, 246, 0.3));
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(139, 92, 246, 0.3);
}

.expenses-section__loading,
.expenses-section__error,
.expenses-section__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 3rem 1.5rem;
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
}

.expenses-section__loading .spinner {
  width: 2.5rem;
  height: 2.5rem;
  border: 3px solid rgba(139, 92, 246, 0.3);
  border-top-color: #8b5cf6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.expenses-section__list-wrap {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.expenses-section__table-wrap {
  overflow-x: auto;
  border: 1px solid rgba(139, 92, 246, 0.15);
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(15, 15, 23, 0.95) 0%, rgba(20, 20, 28, 0.9) 100%);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(139, 92, 246, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(12px);
}

/* Mobile expense cards */
.expenses-section__expense-cards {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 0.25rem 0;
}

.expense-card {
  padding: 1.25rem 1.25rem;
  background: linear-gradient(135deg, rgba(20, 20, 28, 0.98) 0%, rgba(15, 15, 23, 0.98) 100%);
  border: 1px solid rgba(139, 92, 246, 0.25);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(12px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(139, 92, 246, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05);
  position: relative;
  overflow: hidden;
}

.expense-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.6), transparent);
  opacity: 0.6;
}

.expense-card:hover,
.expense-card:active {
  transform: translateY(-4px) scale(1.01);
  border-color: rgba(139, 92, 246, 0.5);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.35), 0 0 40px rgba(139, 92, 246, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.expense-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.expense-card__number {
  font-size: 0.75rem;
  font-weight: 700;
  color: rgba(139, 92, 246, 0.9);
  letter-spacing: 0.05em;
}

.expense-card__title {
  font-size: 1rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
  margin: 0 0 0.5rem;
  line-height: 1.3;
  letter-spacing: -0.01em;
}

.expense-card__product-info {
  font-size: 0.8125rem;
  color: rgba(167, 139, 250, 0.9);
  margin: 0 0 0.5rem;
}

.expense-badge.product-stock {
  display: inline-block;
  font-size: 0.6875rem;
  font-weight: 600;
  padding: 0.2rem 0.5rem;
  border-radius: 8px;
  background: rgba(34, 197, 94, 0.2);
  border: 1px solid rgba(34, 197, 94, 0.4);
  color: #4ade80;
  margin-left: 0.5rem;
  vertical-align: middle;
}

.expense-product-info {
  display: block;
  font-size: 0.8125rem;
  color: rgba(255, 255, 255, 0.65);
  margin-top: 0.25rem;
}

.expense-detail-product {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.expense-card__meta {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-bottom: 1rem;
}

.expense-card__category {
  font-size: 0.8125rem;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.3;
}

.expense-card__date {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.45);
}

.expense-card__amount {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #a78bfa;
  text-shadow: 0 0 20px rgba(139, 92, 246, 0.4);
  letter-spacing: 0.02em;
}

.expense-card__actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
}

.expense-card__btn {
  padding: 0.65rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
}

.expense-card__btn:active {
  transform: scale(0.98);
}

.expense-card__btn.view { background: rgba(6, 182, 212, 0.2); color: #67e8f9; border-color: rgba(6, 182, 212, 0.4); }
.expense-card__btn.edit { background: rgba(139, 92, 246, 0.2); color: #c4b5fd; border-color: rgba(139, 92, 246, 0.4); }
.expense-card__btn.status { background: rgba(52, 211, 153, 0.2); color: #6ee7b7; border-color: rgba(52, 211, 153, 0.4); }
.expense-card__btn.danger { background: rgba(239, 68, 68, 0.2); color: #f87171; border-color: rgba(239, 68, 68, 0.4); }

/* Mobile recurrence cards */
.expenses-section__recurrence-cards {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 0.25rem 0;
}

.recurrence-card {
  padding: 1.25rem 1.25rem;
  background: linear-gradient(135deg, rgba(20, 20, 28, 0.98) 0%, rgba(15, 15, 23, 0.98) 100%);
  border: 1px solid rgba(139, 92, 246, 0.25);
  border-radius: 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(12px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(139, 92, 246, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05);
  position: relative;
  overflow: hidden;
}

.recurrence-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.6), transparent);
  opacity: 0.6;
}

.recurrence-card:hover,
.recurrence-card:active {
  transform: translateY(-4px) scale(1.01);
  border-color: rgba(139, 92, 246, 0.5);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.35), 0 0 40px rgba(139, 92, 246, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.recurrence-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.recurrence-card__frequency {
  font-size: 0.75rem;
  font-weight: 700;
  color: rgba(139, 92, 246, 0.9);
  text-transform: capitalize;
  letter-spacing: 0.05em;
}

.recurrence-card__title {
  font-size: 1rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
  margin: 0 0 0.5rem;
  line-height: 1.3;
  letter-spacing: -0.01em;
}

.recurrence-card__meta {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-bottom: 1rem;
}

.recurrence-card__category {
  font-size: 0.8125rem;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.3;
}

.recurrence-card__due,
.recurrence-card__dates,
.recurrence-card__payments {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.45);
}

.recurrence-card__amount {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #a78bfa;
  text-shadow: 0 0 20px rgba(139, 92, 246, 0.4);
  letter-spacing: 0.02em;
}

.recurrence-card__actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
}

.recurrence-card__actions .confirm-payment-btn,
.recurrence-card__btn {
  padding: 0.65rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
}

.recurrence-card__btn:active {
  transform: scale(0.98);
}

.recurrence-card__btn.confirm,
.recurrence-card__actions .confirm-payment-btn { background: rgba(52, 211, 153, 0.2); color: #6ee7b7; border-color: rgba(52, 211, 153, 0.4); }
.recurrence-card__btn.edit { background: rgba(139, 92, 246, 0.2); color: #c4b5fd; border-color: rgba(139, 92, 246, 0.4); }
.recurrence-card__btn.warning { background: rgba(251, 191, 36, 0.2); color: #fcd34d; border-color: rgba(251, 191, 36, 0.4); }
.recurrence-card__btn.success { background: rgba(52, 211, 153, 0.2); color: #6ee7b7; border-color: rgba(52, 211, 153, 0.4); }
.recurrence-card__btn.danger { background: rgba(239, 68, 68, 0.2); color: #f87171; border-color: rgba(239, 68, 68, 0.4); }

.expenses-section__table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.expenses-section__table th {
  text-align: left;
  padding: 1rem 1.25rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
}

.expenses-section__table td {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.9);
}

.expenses-section__row:hover td {
  background: rgba(255, 255, 255, 0.02);
}

.expenses-section__row-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.row-btn {
  padding: 0.4rem 0.75rem;
  border-radius: 8px;
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.row-btn.view { background: rgba(6, 182, 212, 0.15); color: #67e8f9; border-color: rgba(6, 182, 212, 0.35); }
.row-btn.edit { background: rgba(139, 92, 246, 0.15); color: #c4b5fd; border-color: rgba(139, 92, 246, 0.35); }
.row-btn.status { background: rgba(52, 211, 153, 0.15); color: #6ee7b7; border-color: rgba(52, 211, 153, 0.35); }
.row-btn.warning { background: rgba(251, 191, 36, 0.15); color: #fcd34d; border-color: rgba(251, 191, 36, 0.35); }
.row-btn.success { background: rgba(52, 211, 153, 0.15); color: #6ee7b7; border-color: rgba(52, 211, 153, 0.35); }
.row-btn.danger { background: rgba(239, 68, 68, 0.15); color: #f87171; border-color: rgba(239, 68, 68, 0.35); }

.row-btn:hover {
  transform: translateY(-1px);
}

.badge {
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.badge.active { color: #34d399; background: rgba(52, 211, 153, 0.15); }
.badge.inactive { color: rgba(255, 255, 255, 0.5); background: rgba(255, 255, 255, 0.08); }

.expenses-section__report-inline {
  margin-bottom: 1rem;
}

.expenses-section__report-loading,
.expenses-section__report-error {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0;
}

.expenses-section__report-error .expenses-section__action-btn {
  flex-shrink: 0;
}

.expenses-section__reports {
  padding: 0.5rem 0;
}

.expense-detail-grid {
  display: grid;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.expense-detail-grid p {
  margin: 0;
  font-size: 0.9375rem;
  color: rgba(255, 255, 255, 0.9);
}

.form-error {
  font-size: 0.75rem;
  color: #f87171;
  margin-top: 0.5rem;
}

.expenses-section__modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  animation: overlayIn 0.25s ease;
}

@keyframes overlayIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.expenses-section__modal {
  width: 100%;
  max-width: 520px;
  max-height: 90vh;
  overflow-y: auto;
  background: linear-gradient(180deg, rgba(20, 20, 28, 0.98) 0%, rgba(15, 15, 23, 0.98) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(139, 92, 246, 0.1);
  animation: modalIn 0.3s ease;
}

.expenses-section__modal.modal-large {
  max-width: 640px;
}

.expenses-section__modal.expense-form-modal {
  max-width: 600px;
  min-width: 320px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.expenses-section__modal.expense-form-modal .expenses-section__modal-body {
  overflow-y: auto;
  flex: 1 1 auto;
  min-height: 0;
}

.expenses-section__modal.modal-sm {
  max-width: 400px;
}

@keyframes modalIn {
  from { opacity: 0; transform: scale(0.96) translateY(10px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.expenses-section__modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.expenses-section__modal-header h3 {
  font-size: 1.125rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.95);
  margin: 0;
}

.expenses-section__modal-close {
  width: 2.25rem;
  height: 2.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.25rem;
  cursor: pointer;
  transition: all 0.2s;
}

.expenses-section__modal-close:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.4);
  color: #f87171;
}

.expenses-section__modal-body {
  padding: 1.5rem;
}

.expenses-section__modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.25rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

/* ========== Mobile & Futuristic Enhancements ========== */
@media (max-width: 768px) {
  .expenses-section::before {
    width: 100%;
    height: 30%;
    top: -5%;
  }

  .expenses-section__header {
    padding: 1.25rem 1rem;
    margin-bottom: 1.25rem;
    border-radius: 18px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25), 0 0 40px rgba(139, 92, 246, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.08);
  }

  .expenses-section__title {
    font-size: 1.5rem;
    filter: drop-shadow(0 0 24px rgba(139, 92, 246, 0.4));
  }


  .expenses-section__tabs {
    padding: 0.6rem;
    margin-bottom: 1rem;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.6rem;
    border-radius: 18px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(139, 92, 246, 0.15);
  }

  .expenses-section__tab {
    padding: 1rem 0.75rem;
    font-size: 0.8125rem;
    border-radius: 14px;
    min-height: 48px;
  }

  .expenses-section__tab.active {
    box-shadow: 0 6px 24px rgba(139, 92, 246, 0.4), 0 0 40px rgba(139, 92, 246, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.12);
  }

  .expenses-section__add-row {
    margin-bottom: 1rem;
  }

  .expenses-section__add-row .expenses-section__action-btn {
    padding: 1.1rem 1.5rem;
    min-height: 52px;
  }

  .expenses-section__filters {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
    padding: 1rem;
  }

  .expenses-section__filters .expenses-section__date-picker,
  .expenses-section__filters .expenses-section__select,
  .expenses-section__filters .expenses-section__status-dropdown {
    width: 100%;
    min-width: 0;
  }

  .expenses-section__filter-btn {
    width: 100%;
    padding: 0.9rem;
    min-height: 48px;
  }

  .expenses-section__table-wrap {
    border-radius: 16px;
    margin: 0 -0.5rem;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(139, 92, 246, 0.1);
  }

  .expenses-section__table th,
  .expenses-section__table td {
    padding: 0.875rem 1rem;
    font-size: 0.8125rem;
  }

  .expenses-section__row-actions {
    flex-direction: row;
    flex-wrap: wrap;
  }

  .row-btn {
    padding: 0.5rem 0.75rem;
    min-height: 40px;
  }

  .category-row {
    padding: 1.25rem 1rem;
    border-radius: 16px;
    margin-bottom: 0.75rem;
  }

  .category-row--main {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(139, 92, 246, 0.1);
  }

  .category-row--main.has-children:hover {
    box-shadow: 0 8px 28px rgba(139, 92, 246, 0.25), 0 0 40px rgba(139, 92, 246, 0.15);
  }

  .category-row--sub {
    margin-left: 1rem;
    padding: 1rem;
  }

  .category-row__icon {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 12px;
  }

  .category-row__expand-icon {
    width: 2.25rem;
    height: 2.25rem;
    min-width: 2.25rem;
    border-radius: 12px;
    min-height: 44px;
  }

  .category-row__sub-count {
    min-width: 1.75rem;
    height: 1.75rem;
    font-size: 0.8125rem;
  }

  .category-row__actions {
    width: 100%;
    justify-content: flex-start;
    gap: 0.5rem;
  }

  .category-row__actions .row-btn {
    flex: 1 1 calc(50% - 0.25rem);
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .category-row__actions .confirm-payment-btn {
    flex: 1 1 100%;
  }

  .expenses-section__toast {
    left: 1rem;
    right: 1rem;
    top: 90px;
    margin: 0 auto;
    max-width: 100%;
    border-radius: 14px;
    text-align: center;
  }

  .expenses-section__modal {
    max-width: 100%;
    margin: 0.5rem;
    border-radius: 20px;
    max-height: calc(100vh - 2rem);
  }

  .expenses-section__modal-body {
    padding: 1.25rem;
  }

  .expenses-section__loading,
  .expenses-section__error,
  .expenses-section__empty {
    padding: 2.5rem 1.5rem;
  }

  /* Expense cards – mobile enhancements */
  .expense-card {
    padding: 1.5rem 1.25rem;
  }

  .expense-card__title {
    font-size: 1.0625rem;
  }

  .expense-card__amount {
    font-size: 1.375rem;
  }

  .expense-card__btn {
    min-height: 48px;
  }

  /* Recurrence cards – mobile enhancements (match expense cards) */
  .recurrence-card {
    padding: 1.5rem 1.25rem;
  }

  .recurrence-card__title {
    font-size: 1.0625rem;
  }

  .recurrence-card__amount {
    font-size: 1.375rem;
  }

  .recurrence-card__actions .confirm-payment-btn,
  .recurrence-card__btn {
    min-height: 48px;
  }

  .desktop-only {
    display: none !important;
  }

  .mobile-only {
    display: block !important;
  }
}

/* Desktop: show table, hide cards */
@media (min-width: 769px) {
  .expenses-section__tabs {
    grid-template-columns: repeat(4, 1fr);
  }

  .desktop-only {
    display: block !important;
  }

  .mobile-only {
    display: none !important;
  }
}
</style>
