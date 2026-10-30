/**
 * View-model types cho trang "Hôm nay" (P4). Backend sở hữu mọi quy tắc
 * nghiệp vụ lõi; file này chỉ định nghĩa types cho response của GET /api/v1/today.
 */

export type TodayMoney = {
  incomeToday: number | null
  expenseToday: number | null
  netToday: number | null
  cashflowMonthNet: number | null
}

export type TodayActionSeverity = "High" | "Medium" | "Low"

export type TodayActionItem = {
  id: string
  type: string
  severity: TodayActionSeverity
  title: string
  subtitle: string
  amount: number | null
  targetPath: string
  actionLabel: string
}

export type TodayDebtHotlistItem = {
  debtId: number
  debtCode: string
  partnerType: string | null
  partnerName: string | null
  remainingAmount: number | null
  dueDate: string | null
  daysOverdue: number | null
  status: string | null
  targetPath: string
}

export type TodayInventoryNeed = {
  productId: number
  sku: string | null
  name: string | null
  quantity: number
  minQuantity: number
  level: string
  targetPath: string
}

export type TodayCloseDay = {
  fundId: number | null
  status: string
  expectedCash: number | null
  countedCash: number | null
  variance: number | null
}

export type TodayData = {
  businessDate: string
  money: TodayMoney
  actions: TodayActionItem[]
  debtHotlist: TodayDebtHotlistItem[]
  inventoryNeeds: TodayInventoryNeed[]
  closeDay: TodayCloseDay
}

