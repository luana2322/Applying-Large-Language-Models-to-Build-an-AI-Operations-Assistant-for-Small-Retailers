import { Link } from "react-router-dom"
import { PackageCheck } from "lucide-react"

import type { TodayInventoryNeed } from "../todayViewModel"

type TodayInventoryNeedsProps = {
  items: TodayInventoryNeed[]
}

const levelConfig: Record<string, { label: string; pill: string }> = {
  OUT_OF_STOCK: { label: "Hết hàng", pill: "bg-[#ffdad6] text-[#93000a]" },
  LOW_STOCK: { label: "Tồn thấp", pill: "bg-[#ffedd5] text-[#9a3412]" },
  STALE: { label: "Tồn lâu", pill: "bg-[#f2f3ff] text-[#3b494c]" },
}

function levelLabel(level: string) {
  return levelConfig[level]?.label ?? level
}

function levelPill(level: string) {
  return levelConfig[level]?.pill ?? "bg-[#f2f3ff] text-[#3b494c]"
}

export function TodayInventoryNeeds({ items }: TodayInventoryNeedsProps) {
  return (
    <section className="rounded-2xl border-l-4 border-[#006875] bg-white p-6 shadow-[0_4px_20px_rgba(15,23,42,0.05)] sm:p-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-['Plus_Jakarta_Sans'] text-lg font-bold text-[#131b2e]">
          <PackageCheck className="h-5 w-5 text-[#006875]" />
          Hàng tồn cần chú ý
        </h2>
        <Link className="text-xs font-bold text-[#006875] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006875] focus-visible:ring-offset-2" to="/inventory/stock">
          Xem tồn kho
        </Link>
      </div>
      {items.length === 0 ? (
        <div className="rounded-xl bg-[#f2f3ff] p-5 text-center">
          <p className="text-sm text-[#3b494c]">Tồn kho đang ổn định.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {items.map((item) => (
            <div
              key={item.productId}
              className="flex items-center justify-between gap-3 rounded-xl border border-[#e2e8f0] p-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="rounded-lg bg-[#ffedd5] p-2 text-[#9a3412]">
                  <PackageCheck className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#131b2e]">
                    {item.name ?? item.sku ?? item.productId}
                  </p>
                  <p className="mt-0.5 text-xs text-[#3b494c]">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 font-bold ${levelPill(item.level)}`}>
                      {levelLabel(item.level)}
                    </span>{" "}
                    · {item.quantity}/{item.minQuantity}
                  </p>
                </div>
              </div>
              <Link
                className="shrink-0 rounded-lg border border-[#e2e8f0] px-3 py-1.5 text-sm font-medium text-[#006875] hover:bg-[#f8fafc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006875] focus-visible:ring-offset-2"
                to={item.targetPath}
              >
                Xem tồn kho
              </Link>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
