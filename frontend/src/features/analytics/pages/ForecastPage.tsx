import { useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { Loader2, PackageSearch } from "lucide-react"

import { usePageTitle } from "@/context/PageTitleContext"

import { getForecast } from "../api/analyticsApi"
import { BusinessHealthInsights } from "../components/BusinessHealthInsights"
import { DEMO_FORECAST } from "../demoAnalyticsData"
import type { ForecastRow } from "../types"

const URGENCY: Record<ForecastRow["urgencyLevel"], { label: string; badge: string; row: string }> = {
  CRITICAL: { label: "Khẩn", badge: "bg-red-100 text-red-700 font-bold", row: "bg-red-50/40" },
  WARNING: { label: "Cảnh báo", badge: "bg-amber-100 text-amber-700 font-semibold", row: "bg-amber-50/30" },
  LOW: { label: "Thấp", badge: "bg-blue-50 text-blue-600", row: "" },
  STABLE: { label: "Ổn định", badge: "bg-slate-100 text-slate-500", row: "" },
}

export function ForecastPage() {
  const { setTitle } = usePageTitle()

  useEffect(() => {
    setTitle("Sức khỏe & Dự báo")
  }, [setTitle])

  const forecastQuery = useQuery({
    queryKey: ["analytics", "forecast", "table"],
    queryFn: () => getForecast({ days: 30, limit: 50 }),
    retry: false,
    staleTime: 5 * 60_000,
  })

  const items = (forecastQuery.data ?? DEMO_FORECAST).items

  return (
    <div className="h-full space-y-6 overflow-y-auto bg-slate-50/30 p-4 md:p-6 lg:p-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Sức khỏe & Dự báo</h1>
        <p className="mt-1 text-sm text-slate-500">
          Phân tích tồn kho, công nợ, dòng tiền và khuyến nghị hành động
        </p>
      </div>

      <BusinessHealthInsights />

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-sm font-semibold text-slate-900">Chi tiết dự báo nhập hàng (30 ngày)</h2>
          {forecastQuery.isFetching && <Loader2 className="h-4 w-4 animate-spin text-slate-300" />}
        </div>
        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-3 p-10 text-slate-400">
            <PackageSearch className="h-10 w-10" />
            <p className="text-sm">Chưa có dữ liệu tồn kho.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-slate-100 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Mã SKU</th>
                  <th className="px-4 py-3">Tên sản phẩm</th>
                  <th className="px-4 py-3 text-right">Tồn hiện tại</th>
                  <th className="px-4 py-3 text-right">TB bán/ngày</th>
                  <th className="px-4 py-3 text-right">Ngày còn tồn</th>
                  <th className="px-4 py-3 text-right">Đề xuất nhập</th>
                  <th className="px-4 py-3 text-center">Mức độ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => {
                  const urgency = URGENCY[item.urgencyLevel] ?? URGENCY.STABLE

                  return (
                    <tr key={item.productId} className={`transition-colors hover:bg-slate-50/50 ${urgency.row}`}>
                      <td className="px-4 py-3 font-mono text-xs text-slate-500">{item.skuCode}</td>
                      <td className="max-w-[220px] truncate px-4 py-3 text-sm font-medium text-slate-900">
                        {item.productName}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-semibold tabular-nums text-slate-700">
                        {item.currentQuantity.toLocaleString("vi-VN")}
                      </td>
                      <td className="px-4 py-3 text-right text-sm tabular-nums text-slate-600">
                        {item.avgDailySales.toFixed(1)}
                      </td>
                      <td className="px-4 py-3 text-right text-sm tabular-nums">
                        {item.daysUntilStockout == null ? (
                          <span className="text-slate-400">-</span>
                        ) : (
                          <span
                            className={
                              item.daysUntilStockout <= 7
                                ? "font-bold text-red-600"
                                : item.daysUntilStockout <= 14
                                  ? "font-semibold text-amber-600"
                                  : "text-slate-700"
                            }
                          >
                            {Math.round(item.daysUntilStockout)} ngày
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-semibold tabular-nums text-indigo-600">
                        {item.suggestedReorderQty.toLocaleString("vi-VN")}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs ${urgency.badge}`}>
                          {urgency.label}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
