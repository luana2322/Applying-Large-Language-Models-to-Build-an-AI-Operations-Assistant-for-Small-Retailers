import { Wallet, ArrowDownLeft, ArrowUpRight, Landmark } from "lucide-react"

import { formatCurrency } from "@/features/inventory/utils"
import type { TodayMoney } from "../todayViewModel"

type TodayMoneyStripProps = {
  money: TodayMoney
}

function moneyText(value: number | null) {
  return value == null ? "Bị ẩn theo quyền" : formatCurrency(value)
}

export function TodayMoneyStrip({ money }: TodayMoneyStripProps) {
  const cards = [
    {
      label: "Thu hôm nay",
      value: money.incomeToday,
      icon: ArrowDownLeft,
      iconTint: "bg-[#006875]/10 text-[#006875]",
      valueClass: "text-[#131b2e]",
      hoverBorder: "hover:border-[#00e5ff]",
    },
    {
      label: "Chi hôm nay",
      value: money.expenseToday,
      icon: ArrowUpRight,
      iconTint: "bg-[#a33800]/10 text-[#a33800]",
      valueClass: "text-[#131b2e]",
      hoverBorder: "hover:border-[#cd4800]",
    },
    {
      label: "Ròng hôm nay",
      value: money.netToday,
      icon: Wallet,
      iconTint: "bg-[#7212ff]/10 text-[#7212ff]",
      valueClass: money.netToday != null && money.netToday < 0 ? "text-[#ba1a1a]" : "text-[#131b2e]",
      hoverBorder: "hover:border-[#7212ff]",
    },
    {
      label: "Ròng tháng",
      value: money.cashflowMonthNet,
      icon: Landmark,
      iconTint: "bg-[#dae2fd] text-[#131b2e]",
      valueClass: "text-[#131b2e]",
      hoverBorder: "hover:border-[#006875]",
    },
  ]

  return (
    <section className="rounded-2xl bg-white p-6 shadow-[0_4px_20px_rgba(15,23,42,0.05)]">
      <div className="mb-4 flex items-center gap-2">
        <Wallet className="h-5 w-5 text-[#006875]" />
        <h2 className="font-['Plus_Jakarta_Sans'] text-lg font-bold text-[#131b2e]">Dòng tiền</h2>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className={`rounded-2xl border border-white bg-white p-6 shadow-[0_4px_20px_rgba(15,23,42,0.05)] transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(15,23,42,0.1)] ${card.hoverBorder}`}
          >
            <div className="mb-4 flex items-start justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#3b494c]">{card.label}</span>
              <span className={`rounded-lg p-2 ${card.iconTint}`}>
                <card.icon className="h-[18px] w-[18px]" />
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className={`font-['Plus_Jakarta_Sans'] text-2xl font-extrabold tabular-nums ${card.valueClass}`}>
                {moneyText(card.value)}
              </span>
              {card.value != null && <span className="text-sm font-bold text-[#3b494c]">đ</span>}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
