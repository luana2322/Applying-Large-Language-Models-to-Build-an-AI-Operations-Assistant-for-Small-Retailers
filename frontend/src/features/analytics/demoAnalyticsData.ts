import type {
  BusinessHealth,
  BusinessInsights,
  ForecastResponse,
  ProfitBySkuResponse,
  RevenueTrendResponse,
} from "./types"

export const DEMO_FORECAST: ForecastResponse = {
  items: [
    {
      productId: 9001,
      skuCode: "DEMO-INV-001",
      productName: "Cà phê rang xay Robusta 500g",
      currentQuantity: 6,
      minQuantity: 20,
      avgDailySales: 5.2,
      daysUntilStockout: 1.2,
      suggestedReorderQty: 156,
      urgencyLevel: "CRITICAL",
    },
    {
      productId: 9002,
      skuCode: "DEMO-INV-002",
      productName: "Sữa tươi thanh trùng 1L",
      currentQuantity: 12,
      minQuantity: 30,
      avgDailySales: 4.1,
      daysUntilStockout: 2.9,
      suggestedReorderQty: 123,
      urgencyLevel: "CRITICAL",
    },
    {
      productId: 9003,
      skuCode: "DEMO-INV-003",
      productName: "Bánh quy bơ hộp 250g",
      currentQuantity: 34,
      minQuantity: 25,
      avgDailySales: 2.4,
      daysUntilStockout: 14.2,
      suggestedReorderQty: 72,
      urgencyLevel: "WARNING",
    },
  ],
}

export const DEMO_BUSINESS_HEALTH: BusinessHealth = {
  inventory: DEMO_FORECAST,
  debt: {
    receivableTotal: 42_000_000,
    payableTotal: 18_000_000,
    receivableOverdue: 8_500_000,
    payableOverdue: 2_000_000,
    overdueCount: 4,
    topOverdue: [
      {
        debtId: 7001,
        debtCode: "DEMO-NO-001",
        partnerType: "Customer",
        partnerName: "Cửa hàng Minh An",
        remainingAmount: 8_500_000,
        daysOverdue: 9,
      },
    ],
  },
  cashflow: {
    currentBalance: 96_000_000,
    monthIncome: 64_000_000,
    monthExpense: 46_000_000,
    monthNet: 18_000_000,
    lastMonthNet: 11_500_000,
    status: "HEALTHY",
  },
  inventoryHealth: { status: "CRITICAL", score: 42 },
  debtHealth: { status: "WARNING", score: 68 },
  cashflowHealth: { status: "HEALTHY", score: 86 },
  overall: { status: "WARNING", score: 70 },
  financialsVisible: true,
}

export const DEMO_BUSINESS_INSIGHTS: BusinessInsights = {
  suggestions: [
    {
      category: "inventory",
      severity: "high",
      text: "Nhập bổ sung Cà phê rang xay Robusta và Sữa tươi trong 7 ngày tới để tránh hết hàng.",
    },
    {
      category: "debt",
      severity: "medium",
      text: "Ưu tiên nhắc thu khoản quá hạn 8.500.000 ₫ của Cửa hàng Minh An trong hôm nay.",
    },
    {
      category: "cashflow",
      severity: "low",
      text: "Dòng tiền tháng đang dương 18.000.000 ₫, có thể dùng một phần để bổ sung tồn kho nhanh.",
    },
  ],
}

export const DEMO_REVENUE_TREND: RevenueTrendResponse = {
  totalRevenue: 18_500_000,
  totalProfit: 5_200_000,
  points: [
    { date: "2026-06-15", label: "15/06", revenue: 2_100_000, profit: 520_000, orders: 18 },
    { date: "2026-06-16", label: "16/06", revenue: 2_450_000, profit: 690_000, orders: 21 },
    { date: "2026-06-17", label: "17/06", revenue: 2_900_000, profit: 830_000, orders: 25 },
    { date: "2026-06-18", label: "18/06", revenue: 2_650_000, profit: 720_000, orders: 22 },
    { date: "2026-06-19", label: "19/06", revenue: 3_300_000, profit: 950_000, orders: 29 },
    { date: "2026-06-20", label: "20/06", revenue: 2_700_000, profit: 760_000, orders: 24 },
    { date: "2026-06-21", label: "21/06", revenue: 2_400_000, profit: 730_000, orders: 20 },
  ],
}

export const DEMO_PROFIT_BY_SKU: ProfitBySkuResponse = {
  totalRevenue: 18_500_000,
  totalCost: 13_300_000,
  totalGrossProfit: 5_200_000,
  items: [
    {
      productId: 9101,
      skuCode: "DEMO-SKU-001",
      productName: "Cà phê rang xay Robusta 500g",
      qtySold: 86,
      revenue: 6_450_000,
      cost: 4_350_000,
      grossProfit: 2_100_000,
      grossMarginPct: 32.5,
    },
    {
      productId: 9102,
      skuCode: "DEMO-SKU-002",
      productName: "Sữa tươi thanh trùng 1L",
      qtySold: 112,
      revenue: 4_480_000,
      cost: 3_420_000,
      grossProfit: 1_060_000,
      grossMarginPct: 23.7,
    },
    {
      productId: 9103,
      skuCode: "DEMO-SKU-003",
      productName: "Bánh quy bơ hộp 250g",
      qtySold: 64,
      revenue: 3_200_000,
      cost: 2_310_000,
      grossProfit: 890_000,
      grossMarginPct: 27.8,
    },
  ],
}
