import { Link } from "react-router-dom"
import { CircleDot } from "lucide-react"

import { formatCurrency, formatDate } from "@/features/inventory/utils"
import type { TodayDebtHotlistItem } from "../todayViewModel"

type TodayDebtHotlistProps = {
  debts: TodayDebtHotlistItem[]
}

export function TodayDebtHotlist({ debts }: TodayDebtHotlistProps) {
  return (
    <section className="rounded-2xl border-l-4 border-[#ba1a1a] bg-white p-6 shadow-[0_4px_20px_rgba(15,23,42,0.05)] sm:p-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-['Plus_Jakarta_Sans'] text-lg font-bold text-[#131b2e]">
          <CircleDot className="h-5 w-5 text-[#ba1a1a]" />
          Công nợ cần xử lý
        </h2>
        <Link className="text-xs font-bold text-[#006875] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006875] focus-visible:ring-offset-2" to="/cashflow/debt">
          Xem sổ nợ
        </Link>
      </div>
      {debts.length === 0 ? (
        <div className="rounded-xl bg-[#f2f3ff] p-5 text-center">
          <p className="text-sm text-[#3b494c]">Không có công nợ đến hạn.</p>
        </div>
      ) : (
        <div className="divide-y divide-[#e2e8f0]">
          {debts.map((debt) => (
            <Link
              key={debt.debtId}
              to={debt.targetPath}
              className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0 hover:bg-[#f8fafc]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006875] focus-visible:ring-offset-2"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[#131b2e]">{debt.partnerName ?? debt.debtCode}</p>
                <p className="mt-0.5 text-xs text-[#3b494c]">
                  {debt.status ?? "-"} · Hạn {formatDate(debt.dueDate)}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-semibold tabular-nums text-[#131b2e]">
                  {debt.remainingAmount == null ? "-" : formatCurrency(debt.remainingAmount)}
                </p>
                <p
                  className={
                    debt.daysOverdue != null && debt.daysOverdue > 0
                      ? "text-xs font-bold text-[#ba1a1a]"
                      : "text-xs font-bold text-[#9a3412]"
                  }
                >
                  {debt.daysOverdue != null && debt.daysOverdue > 0
                    ? `Quá hạn ${debt.daysOverdue} ngày`
                    : "Sắp đến hạn"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}
