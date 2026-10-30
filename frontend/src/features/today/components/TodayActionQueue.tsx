import { Link } from "react-router-dom"
import { AlertCircle, ArrowRight, CheckCircle2 } from "lucide-react"

import { formatCurrency } from "@/features/inventory/utils"
import type { TodayActionItem } from "../todayViewModel"

type TodayActionQueueProps = {
  actions: TodayActionItem[]
}

const severityConfig: Record<TodayActionItem["severity"], { label: string; pill: string }> = {
  High: { label: "Khẩn", pill: "bg-[#ffdad6] text-[#93000a]" },
  Medium: { label: "Trung bình", pill: "bg-[#ffedd5] text-[#9a3412]" },
  Low: { label: "Thấp", pill: "bg-[#f2f3ff] text-[#3b494c]" },
}

export function TodayActionQueue({ actions }: TodayActionQueueProps) {
  return (
    <section className="flex min-h-[300px] flex-col rounded-2xl bg-white p-6 shadow-[0_4px_20px_rgba(15,23,42,0.05)] sm:p-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-['Plus_Jakarta_Sans'] text-lg font-bold text-[#131b2e]">
          <AlertCircle className="h-5 w-5 text-[#006875]" />
          Hàng đợi hành động
        </h2>
        <span className="text-xs font-bold text-[#6b7a7d]">{actions.length} việc</span>
      </div>
      {actions.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#bac9cc] bg-[#f2f3ff]/40">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#e2e7ff]">
            <CheckCircle2 className="h-8 w-8 text-[#006875]" />
          </div>
          <p className="font-medium italic text-[#3b494c]">Không có việc khẩn trong ngày.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {actions.map((item) => {
            const sev = severityConfig[item.severity] ?? { label: item.severity, pill: "bg-[#f2f3ff] text-[#3b494c]" }
            return (
              <div
                key={item.id}
                className="flex flex-col gap-3 rounded-xl border border-[#e2e8f0] p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${sev.pill}`}>
                      <AlertCircle className="h-3 w-3" />
                      {sev.label}
                    </span>
                    <p className="font-semibold text-[#131b2e]">{item.title}</p>
                  </div>
                  <p className="mt-1 text-sm text-[#3b494c]">
                    {item.subtitle}
                    {item.amount != null ? ` · ${formatCurrency(item.amount)}` : ""}
                  </p>
                </div>
                <Link
                  className="inline-flex shrink-0 items-center justify-center gap-1 rounded-xl bg-[#006875] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#00829a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006875] focus-visible:ring-offset-2"
                  to={item.targetPath}
                >
                  {item.actionLabel}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
