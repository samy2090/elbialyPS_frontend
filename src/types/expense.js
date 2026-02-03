/**
 * Expense Management — Type definitions (mirror backend)
 * Use for API responses and form validation.
 */

// ============ User (minimal, for created_by/updated_by) ============
/** @typedef {{ id: number, name: string, username?: string, email?: string }} UserRef */

// ============ Expense Category ============
/**
 * @typedef {Object} ExpenseCategory
 * @property {number} id
 * @property {string} name
 * @property {number|null} parent_id
 * @property {boolean} is_active
 * @property {number|null} created_by
 * @property {number|null} updated_by
 * @property {string} created_at
 * @property {string} updated_at
 * @property {ExpenseCategory|null} [parent]
 * @property {ExpenseCategory[]} [children]
 * @property {string} [full_path]
 */

// ============ Expense ============
/**
 * @typedef {Object} Expense
 * @property {number} id
 * @property {string} expense_number
 * @property {string} title
 * @property {string|null} description
 * @property {number} price
 * @property {string} expense_date
 * @property {number} category_id
 * @property {boolean} is_recurring
 * @property {number|null} recurring_id
 * @property {'paid'|'unpaid'} status
 * @property {string|null} paid_at
 * @property {number|null} created_by
 * @property {number|null} updated_by
 * @property {string} created_at
 * @property {string} updated_at
 * @property {string|null} deleted_at
 * @property {ExpenseCategory} [category]
 * @property {ExpenseRecurrence|null} [recurrence]
 * @property {ExpenseAttachment[]} [attachments]
 * @property {UserRef|null} [creator]
 * @property {UserRef|null} [updater]
 */

// ============ Expense Recurrence ============
/**
 * @typedef {Object} ExpenseRecurrence
 * @property {number} id
 * @property {string} title
 * @property {number} price
 * @property {number} category_id
 * @property {'monthly'|'yearly'} frequency
 * @property {number} due_day
 * @property {string} start_date
 * @property {string|null} end_date
 * @property {string|null} last_reminded_at
 * @property {boolean} is_active
 * @property {string} created_at
 * @property {string} updated_at
 * @property {ExpenseCategory} [category]
 * @property {Expense[]} [expenses]
 * @property {string|null} [next_due_date]
 */

// ============ Expense Attachment ============
/**
 * @typedef {Object} ExpenseAttachment
 * @property {number} id
 * @property {number} expense_id
 * @property {string} file_path
 * @property {string} file_type
 * @property {string} original_name
 * @property {number} file_size
 * @property {number|null} created_by
 * @property {number|null} updated_by
 * @property {string} created_at
 * @property {string} updated_at
 * @property {string} [file_url]
 * @property {string} [file_size_human]
 * @property {UserRef|null} [creator]
 */

// ============ Pagination (Laravel default) ============
/**
 * @typedef {Object} PaginatedResponse
 * @template T
 * @property {number} current_page
 * @property {T[]} data
 * @property {string} first_page_url
 * @property {number} from
 * @property {number} last_page
 * @property {string} last_page_url
 * @property {{ url: string|null, label: string, active: boolean }[]} links
 * @property {string|null} next_page_url
 * @property {string} path
 * @property {number} per_page
 * @property {string|null} prev_page_url
 * @property {number} to
 * @property {number} total
 */

// ============ Report types ============
/** @typedef {{ period: { start_date: string|null, end_date: string|null }, totals: { total_expenses: number, total_amount: number, paid_amount: number, unpaid_amount: number, paid_count: number, unpaid_count: number } }} SummaryReport */

/** @typedef {{ category_id: number, category_name: string, category_path: string, expense_count: number, total_amount: number, paid_amount: number, unpaid_amount: number }} ByCategoryReportItem */

/** @typedef {{ period: { start_date: string|null, end_date: string|null }, paid: { count: number, total_amount: number }, unpaid: { count: number, total_amount: number } }} PaidVsUnpaidReport */

/** @typedef {{ month: number, month_name: string, expense_count: number, total_amount: number, paid_amount: number, unpaid_amount: number }} MonthlySummaryMonth */

/** @typedef {{ year: number, months: MonthlySummaryMonth[], yearly_total: { expense_count: number, total_amount: number, paid_amount: number, unpaid_amount: number } }} MonthlySummaryReport */

/** @typedef {{ id: number, title: string, price: number, category: { id: number, name: string, path: string }, frequency: string, due_day: number, next_due_date: string, days_until_due: number, last_reminded_at: string|null }} UpcomingRecurringItem */

/** @typedef {{ id: number, title: string, price: number, category: { id: number, name: string, path: string }, frequency: string, due_day: number, next_due_date: string, days_overdue: number, last_reminded_at: string|null }} OverdueRecurringItem */

export default {}
