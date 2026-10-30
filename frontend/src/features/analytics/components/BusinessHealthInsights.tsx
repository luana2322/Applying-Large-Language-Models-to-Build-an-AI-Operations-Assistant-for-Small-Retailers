import { useQuery } from "@tanstack/react-query"
import { HandCoins, Loader2, Package, Sparkles, Wallet } from "lucide-react"

import { formatCurrency } from "@/features/inventory/utils"

import { getBusinessHealth, getBusinessHealthAiSuggestions } from "../api/analyticsApi"
import { DEMO_BUSINESS_HEALTH, DEMO_BUSINESS_INSIGHTS } from "../demoAnalyticsData"
import type { BusinessHealth, BusinessSuggestion, DomainHealth } from "../types"

const STATUS_STYLE: Record<DomainHealth["status"], { label: string; pill: string; dot: string }> = {
  HEALTHY: { label: "Ổn định", pill: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
  WARNING: { label: "Cảnh báo", pill: "bg-amber-50 text-amber-700", dot: "bg-amber-500" },
  CRITICAL: { label: "Khẩn", pill: "bg-red-50 text-red-700", dot: "bg-red-500" },
  HIDDEN: { label: "Bị ẩn", pill: "bg-slate-100 text-slate-400", dot: "bg-slate-300" },
}

const SEVERITY_STYLE: Record<BusinessSuggestion["severity"], string> = {
  high: "border-l-red-500 bg-red-50/40",
  medium: "border-l-amber-500 bg-amber-50/30",
  low: "border-l-slate-300 bg-slate-50/40",
}

const CATEGORY_LABEL: Record<BusinessSuggestion["category"], string> = {
  inventory: "Tồn kho",
  debt: "Công nợ",
  cashflow: "Dòng tiền",
  overall: "Tổng thể",
}

const EMPTY_BUSINESS_HEALTH: BusinessHealth = {
  inventory: { items: [] },
  debt: {
    receivableTotal: 0,
    payableTotal: 0,
    receivableOverdue: 0,
    payableOverdue: 0,
    overdueCount: 0,
    topOverdue: [],
  },
  cashflow: {
    currentBalance: 0,
    monthIncome: 0,
    monthExpense: 0,
    monthNet: 0,
    lastMonthNet: 0,
    status: "HEALTHY",
  },
  inventoryHealth: { status: "HIDDEN", score: 0 },
  debtHealth: { status: "HIDDEN", score: 0 },
  cashflowHealth: { status: "HIDDEN", score: 0 },
  overall: { status: "HIDDEN", score: 0 },
  financialsVisible: true,
}

export function BusinessHealthInsights() {
  const healthQuery = useQuery({
    queryKey: ["analytics", "business-health"],
    queryFn: getBusinessHealth,
    retry: false,
    staleTime: 5 * 60_000,
  })

  const usingDemoHealth = healthQuery.isError
  const health = healthQuery.data ?? (usingDemoHealth ? DEMO_BUSINESS_HEALTH : EMPTY_BUSINESS_HEALTH)

  const aiQuery = useQuery({
    queryKey: ["analytics", "business-health", "ai"],
    queryFn: () => getBusinessHealthAiSuggestions(healthQuery.data!),
    enabled: !!healthQuery.data,
    retry: false,
    staleTime: 10 * 60_000,
  })

  const shouldUseDemoSuggestions = (usingDemoHealth && !healthQuery.isFetching) || aiQuery.isError
  const suggestions =
    aiQuery.data?.suggestions ??
    (shouldUseDemoSuggestions ? DEMO_BUSINESS_INSIGHTS.suggestions : [])

  const cards = [
    {
      key: "inventory",
      label: "Tồn kho",
      icon: Package,
      health: health.inventoryHealth,
      detail: `${health.inventory.items.filter((item) => item.urgencyLevel === "CRITICAL").length} mặt hàng khẩn`,
    },
    {
      key: "debt",
      label: "Công nợ",
      icon: HandCoins,
      health: health.debtHealth,
      detail: health.debt ? `Quá hạn: ${formatCurrency(health.debt.receivableOverdue)}` : "Bị ẩn theo quyền",
    },
    {
      key: "cashflow",
      label: "Dòng tiền",
      icon: Wallet,
      health: health.cashflowHealth,
      detail: health.cashflow ? `Ròng tháng: ${formatCurrency(health.cashflow.monthNet)}` : "Bị ẩn theo quyền",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon
          const style = STATUS_STYLE[card.health.status]

          return (
            <div key={card.key} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2 text-slate-500">
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate text-sm font-medium">{card.label}</span>
                </div>
                <span
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${style.pill}`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                  {style.label}
                </span>
              </div>
              <p className="mt-3 text-sm text-slate-600">{card.detail}</p>
            </div>
          )
        })}
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-indigo-500" />
          <h2 className="text-sm font-semibold text-slate-900">Khuyến nghị từ AI</h2>
          {(healthQuery.isFetching || aiQuery.isFetching) && <Loader2 className="ml-1 h-4 w-4 animate-spin text-slate-300" />}
        </div>
        {suggestions.length === 0 ? (
          <p className="text-sm italic text-slate-400">Chưa có đủ dữ liệu để đưa ra khuyến nghị.</p>
        ) : (
          <ul className="space-y-2">
            {suggestions.map((suggestion, index) => (
              <li
                key={`${suggestion.category}-${index}`}
                className={`flex items-start gap-3 rounded-lg border-l-4 px-3 py-2 ${SEVERITY_STYLE[suggestion.severity]}`}
              >
                <span className="mt-0.5 shrink-0 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-bold text-slate-500">
                  {CATEGORY_LABEL[suggestion.category]}
                </span>
                <span className="text-sm text-slate-700">{suggestion.text}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
