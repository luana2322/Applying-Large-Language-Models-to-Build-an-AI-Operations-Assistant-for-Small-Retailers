import { Link } from "react-router-dom"

import { formatCurrency } from "@/features/inventory/utils"
import type { TodayCloseDay } from "../todayViewModel"

type TodayCloseDayPanelProps = {
  closeDay: TodayCloseDay
}

function amount(value: number | null, hidden: boolean) {
  if (value != null) return formatCurrency(value)
  return hidden ? "Bị ẩn theo quyền" : "-"
}

export function TodayCloseDayPanel({ closeDay }: TodayCloseDayPanelProps) {
  const financeHidden = closeDay.expectedCash == null
  const isClosed = closeDay.status === "Closed"
  const statusLabel = isClosed ? "Đã chốt" : "Đang mở"
  const statusPill = isClosed
    ? "bg-[#dcfce7] text-[#15803d]"
    : "bg-[#ffedd5] text-[#9a3412]"
  const varianceIsNonZero = closeDay.variance != null && closeDay.variance !== 0

  return (
    <section className="flex flex-col rounded-2xl bg-white p-6 shadow-[0_4px_20px_rgba(15,23,42,0.05)] sm:p-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-['Plus_Jakarta_Sans'] text-lg font-bold text-[#131b2e]">Chốt ngày</h2>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase ${statusPill}`}>{statusLabel}</span>
      </div>
      <div className="space-y-4">
        <div className="rounded-xl bg-[#f2f3ff] p-4">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-[#3b494c]">Tiền dự kiến</p>
          <p className="font-['Plus_Jakarta_Sans'] text-xl font-extrabold tabular-nums text-[#006875]">
            {amount(closeDay.expectedCash, financeHidden)}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl bg-[#f2f3ff] p-4">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-[#3b494c]">Tiền đếm</p>
            <p className="font-bold tabular-nums text-[#3b494c]">{amount(closeDay.countedCash, financeHidden)}</p>
          </div>
          <div className="rounded-xl bg-[#f2f3ff] p-4">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-[#3b494c]">Chênh lệch</p>
            <p
              className={`font-bold tabular-nums ${
                varianceIsNonZero ? "text-[#ba1a1a]" : "text-[#3b494c]"
              }`}
            >
              {amount(closeDay.variance, financeHidden)}
            </p>
          </div>
        </div>
        <Link
          className="mt-2 inline-flex w-full items-center justify-center rounded-xl border-2 border-[#006875] bg-white px-4 py-3 text-sm font-bold text-[#006875] transition-colors hover:bg-[#00e5ff]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006875] focus-visible:ring-offset-2"
          to="/cashflow/transactions"
        >
          Mở dòng tiền
        </Link>
      </div>
    </section>
  )
}
