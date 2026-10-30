import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { usePageTitle } from "@/context/PageTitleContext"
import { formatCurrency } from "@/features/inventory/utils"

import { getProfitBySku } from "../api/analyticsApi"
import { DEMO_PROFIT_BY_SKU } from "../demoAnalyticsData"

const COLORS = ["#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10)
}

export function TopProductsPage() {
  const { setTitle } = usePageTitle()

  useEffect(() => {
    setTitle("Sản phẩm bán chạy")
  }, [setTitle])

  const [days, setDays] = useState<30 | 7>(30)
  const dateTo = isoDate(new Date())
  const dateFrom = isoDate(new Date(Date.now() - (days - 1) * 86400_000))

  const profitQuery = useQuery({
    queryKey: ["analytics", "profit-by-sku", dateFrom, dateTo],
    queryFn: () => getProfitBySku({ dateFrom, dateTo, limit: 20 }),
    retry: false,
    staleTime: 5 * 60_000,
  })

  const data = profitQuery.data ?? DEMO_PROFIT_BY_SKU
  const items = data.items
  const top5ByQty = [...items].sort((a, b) => b.qtySold - a.qtySold).slice(0, 5)
  const top5ByRevenue = [...items].sort((a, b) => b.revenue - a.revenue).slice(0, 5)

  return (
    <div className="h-full space-y-6 overflow-y-auto bg-slate-50/30 p-4 md:p-6 lg:p-8">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Sản phẩm bán chạy</h1>
          <p className="mt-1 text-sm text-slate-500">Xếp hạng mặt hàng theo doanh số và lợi nhuận</p>
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="flex h-[400px] flex-col rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-6 text-lg font-semibold text-slate-900">Top 5 theo số lượng bán</h3>
          <div className="min-h-0 flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={top5ByQty} layout="vertical" margin={{ left: 40, right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis dataKey="productName" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#64748b" }} width={150} />
                <Tooltip
                  cursor={{ fill: "#f8fafc" }}
                  contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
                />
                <Bar dataKey="qtySold" name="Số lượng" radius={[0, 4, 4, 0]} barSize={24}>
                  {top5ByQty.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex h-[400px] flex-col rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-6 text-lg font-semibold text-slate-900">Cơ cấu doanh thu Top sản phẩm</h3>
          <div className="min-h-0 flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={top5ByRevenue}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="revenue"
                  nameKey="productName"
                  label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                >
                  {top5ByRevenue.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => formatCurrency(Number(value))}
                  contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 p-6">
          <h3 className="text-lg font-semibold text-slate-900">Chi tiết doanh số & lợi nhuận</h3>
          {profitQuery.isFetching && <Loader2 className="h-4 w-4 animate-spin text-slate-300" />}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-slate-100 bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold uppercase text-slate-500">Mã SKU</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase text-slate-500">Tên sản phẩm</th>
                <th className="px-6 py-4 text-right text-xs font-semibold uppercase text-slate-500">SL bán</th>
                <th className="px-6 py-4 text-right text-xs font-semibold uppercase text-slate-500">Doanh thu</th>
                <th className="px-6 py-4 text-right text-xs font-semibold uppercase text-slate-500">Giá vốn</th>
                <th className="px-6 py-4 text-right text-xs font-semibold uppercase text-slate-500">Lợi nhuận</th>
                <th className="px-6 py-4 text-right text-xs font-semibold uppercase text-slate-500">Biên LN</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item) => {
                const revenuePct = data.totalRevenue > 0 ? (item.revenue / data.totalRevenue) * 100 : 0
                const margin = item.grossMarginPct

                return (
                  <tr key={item.productId} className="transition-colors hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-mono text-sm font-medium text-slate-600">{item.skuCode}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{item.productName}</td>
                    <td className="px-6 py-4 text-right text-sm font-semibold tabular-nums text-slate-700">
                      {item.qtySold.toLocaleString("vi-VN")}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-semibold tabular-nums text-slate-800">
                      <div className="flex flex-col items-end gap-1">
                        <span>{formatCurrency(item.revenue)}</span>
                        <div className="flex items-center gap-1.5">
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
                            <div className="h-full bg-blue-500" style={{ width: `${revenuePct}%` }} />
                          </div>
                          <span className="w-8 text-xs text-slate-400">{revenuePct.toFixed(0)}%</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-sm tabular-nums text-slate-500">{formatCurrency(item.cost)}</td>
                    <td className="px-6 py-4 text-right text-sm font-bold tabular-nums text-emerald-600">
                      {formatCurrency(item.grossProfit)}
                    </td>
                    <td className="px-6 py-4 text-right text-sm tabular-nums">
                      {margin == null ? (
                        <span className="text-slate-400">-</span>
                      ) : (
                        <span
                          className={`font-semibold ${
                            margin >= 20 ? "text-emerald-600" : margin >= 10 ? "text-amber-600" : "text-red-500"
                          }`}
                        >
                          {margin.toFixed(1)}%
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
