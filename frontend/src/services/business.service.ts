import { apiClient } from './api'

export interface ToolResponse<T> {
  success: boolean
  store_id: number
  code: string
  data: T
  message?: string
}

export const businessService = {
  async getSalesSummary(start_date?: string, end_date?: string, group_by?: string) {
    const res = await apiClient.post<ToolResponse<any>>(
      '/internal/api/v1/business/sales-summary',
      { start_date, end_date, group_by }
    )
    return res.data.data
  },

  async getProfitSummary(start_date?: string, end_date?: string) {
    const res = await apiClient.post<ToolResponse<any>>(
      '/internal/api/v1/business/profit-summary',
      { start_date, end_date }
    )
    return res.data.data
  },

  async getTopProducts(start_date?: string, end_date?: string, metric = 'quantity', limit = 5) {
    const res = await apiClient.post<ToolResponse<any>>(
      '/internal/api/v1/business/top-products',
      { start_date, end_date, metric, limit }
    )
    return res.data.data
  },

  async getInventoryStatus(productId?: number, category?: string, status = 'all') {
    const res = await apiClient.post<ToolResponse<any>>(
      '/internal/api/v1/business/inventory-status',
      { product_id: productId, category, status }
    )
    return res.data.data
  },

  async getSlowMovingProducts(lookback_days = 30, min_stock_quantity = 5, max_sales_quantity = 2) {
    const res = await apiClient.post<ToolResponse<any>>(
      '/internal/api/v1/business/slow-moving-products',
      { lookback_days, min_stock_quantity, max_sales_quantity }
    )
    return res.data.data
  },

  async getExpenseSummary(start_date?: string, end_date?: string, category?: string) {
    const res = await apiClient.post<ToolResponse<any>>(
      '/internal/api/v1/business/expense-summary',
      { start_date, end_date, category }
    )
    return res.data.data
  },

  async getRestockSuggestions(productId?: number, planning_days = 14, lookback_days = 30) {
    const res = await apiClient.post<ToolResponse<any>>(
      '/internal/api/v1/business/restock-suggestions',
      { product_id: productId, planning_days, lookback_days }
    )
    return res.data.data
  },
}
