export interface RevenueData {
  date: string;
  revenue: number;
  profit: number;
}

export interface TopProduct {
  id: number;
  skuCode: string;
  name: string;
  quantitySold: number;
  revenue: number;
}

export interface InventoryReportItem {
  id: number;
  skuCode: string;
  name: string;
  category: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  status: "Normal" | "Low" | "Out" | "Over";
}

// === Analytics — real API types ===

export interface ForecastRow {
  productId: number
  skuCode: string
  productName: string
  currentQuantity: number
  minQuantity: number
  avgDailySales: number
  daysUntilStockout: number | null
  suggestedReorderQty: number
  urgencyLevel: "CRITICAL" | "WARNING" | "LOW" | "STABLE"
}
export interface ForecastResponse { items: ForecastRow[] }

export interface ProfitBySkuRow {
  productId: number
  skuCode: string
  productName: string
  qtySold: number
  revenue: number
  cost: number
  grossProfit: number
  grossMarginPct: number | null
}
export interface ProfitBySkuResponse {
  items: ProfitBySkuRow[]
  totalRevenue: number
  totalCost: number
  totalGrossProfit: number
}

export interface RevenueTrendPoint {
  date: string
  label: string
  revenue: number
  profit: number
  orders: number
}
export interface RevenueTrendResponse {
  points: RevenueTrendPoint[]
  totalRevenue: number
  totalProfit: number
}

export interface TopOverdueDebt {
  debtId: number
  debtCode: string
  partnerType: string
  partnerName: string | null
  remainingAmount: number
  daysOverdue: number
}
export interface DebtHealth {
  receivableTotal: number
  payableTotal: number
  receivableOverdue: number
  payableOverdue: number
  overdueCount: number
  topOverdue: TopOverdueDebt[]
}
export interface CashflowHealth {
  currentBalance: number
  monthIncome: number
  monthExpense: number
  monthNet: number
  lastMonthNet: number
  status: "HEALTHY" | "WARNING" | "CRITICAL"
}
export interface DomainHealth {
  status: "HEALTHY" | "WARNING" | "CRITICAL" | "HIDDEN"
  score: number
}
export interface BusinessHealth {
  inventory: ForecastResponse
  debt: DebtHealth | null
  cashflow: CashflowHealth | null
  inventoryHealth: DomainHealth
  debtHealth: DomainHealth
  cashflowHealth: DomainHealth
  overall: DomainHealth
  financialsVisible: boolean
}
export interface BusinessSuggestion {
  category: "inventory" | "debt" | "cashflow" | "overall"
  severity: "high" | "medium" | "low"
  text: string
}
export interface BusinessInsights { suggestions: BusinessSuggestion[] }
