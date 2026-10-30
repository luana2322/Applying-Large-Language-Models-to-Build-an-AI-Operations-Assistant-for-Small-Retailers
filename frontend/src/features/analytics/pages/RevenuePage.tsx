import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { DollarSign, Loader2, PieChart as PieChartIcon, TrendingUp } from "lucide-react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { usePageTitle } from "@/context/PageTitleContext"
import { formatCurrency } from "@/features/inventory/utils"

import { getRevenueTrend } from "../api/analyticsApi"
import { DEMO_REVENUE_TREND } from "../demoAnalyticsData"

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10)
}

export function RevenuePage() {
  const { setTitle } = usePageTitle()

  useEffect(() => {
    setTitle("Doanh thu & Lợi nhuận")
  }, [setTitle])

  const [days, setDays] = useState<30 | 7>(30)
  const dateTo = isoDate(new Date())
  const dateFrom = isoDate(new Date(Date.now() - (days - 1) * 86400_000))

  const trendQuery = useQuery({
    queryKey: ["analytics", "revenue-trend", dateFrom, dateTo],
    queryFn: () => getRevenueTrend({ dateFrom, dateTo }),
    retry: false,
    staleTime: 5 * 60_000,
  })

  const data = trendQuery.data ?? DEMO_REVENUE_TREND
  const totalRevenue = data.totalRevenue
  const totalProfit = data.totalProfit
  const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0
  const points = data.points

  return (
    <div className="h-full space-y-6 overflow-y-auto bg-slate-50/30 p-4 md:p-6 lg:p-8">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Doanh thu & Lợi nhuận</h1>
          <p className="mt-1 text-sm text-slate-500">Phân tích hiệu quả kinh doanh của cửa hàng</p>
        </div>
        <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
          {([7, 30] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setDays(option)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                days === option ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {option} ngày
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {[
          {
            label: "Tổng doanh thu",
            value: totalRevenue,
            pct: undefined as number | undefined,
            icon: DollarSign,
            color: "bg-emerald-50 text-emerald-600",
          },
          {
            label: "Tổng lợi nhuận",
            value: totalProfit,
            pct: undefined,
            icon: TrendingUp,
            color: "bg-blue-50 text-blue-600",
          },
          {
            label: "Tỷ suất lợi nhuận",
            value: 0,
            pct: profitMargin,
            icon: PieChartIcon,
            color: "bg-purple-50 text-purple-600",
          },
        ].map((card) => {
          const Icon = card.icon

          return (
            <div key={card.label} className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <div className={`rounded-lg p-3 ${card.color}`}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">{card.label}</p>
                <p className="text-2xl font-bold text-slate-900">
                  {card.pct !== undefined ? `${card.pct.toFixed(1)}%` : formatCurrency(card.value)}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="flex h-[400px] flex-col rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-6 text-lg font-semibold text-slate-900">Biểu đồ doanh thu & lợi nhuận</h3>
          <div className="min-h-0 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={points}>
                <defs>
                  <linearGradient id="colorRevenue2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorProfit2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} dy={10} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#64748b" }}
                  tickFormatter={(value) => `${(Number(value) / 1_000_000).toFixed(0)}M`}
                />
                <Tooltip
                  contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
                  formatter={(value) => formatCurrency(Number(value))}
                  labelFormatter={(label) => `Ngày ${label}`}
                />
                <Area type="monotone" dataKey="revenue" name="Doanh thu" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorRevenue2)" strokeWidth={2} />
                <Area type="monotone" dataKey="profit" name="Lợi nhuận" stroke="#10b981" fillOpacity={1} fill="url(#colorProfit2)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex h-[400px] flex-col rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-6 text-lg font-semibold text-slate-900">So sánh doanh thu & lợi nhuận</h3>
          <div className="min-h-0 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={points}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
                <Tooltip
                  contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
                  formatter={(value) => formatCurrency(Number(value))}
                />
                <Legend iconType="circle" />
                <Bar dataKey="revenue" name="Doanh thu" fill="#0ea5e9" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="profit" name="Lợi nhuận" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      {trendQuery.isFetching && <Loader2 className="hidden" />}
    </div>
  )
}
