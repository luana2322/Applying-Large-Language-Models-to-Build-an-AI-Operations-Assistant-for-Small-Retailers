import { useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"

import { usePageTitle } from "@/context/PageTitleContext"
import { getToday } from "../api/todayApi"
import { TodayActionQueue } from "../components/TodayActionQueue"
import { TodayCloseDayPanel } from "../components/TodayCloseDayPanel"
import { TodayDebtHotlist } from "../components/TodayDebtHotlist"
import { TodayInventoryNeeds } from "../components/TodayInventoryNeeds"
import { TodayMoneyStrip } from "../components/TodayMoneyStrip"

function localIsoDate() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

export function TodayPage() {
  const { setTitle } = usePageTitle()
  const businessDate = localIsoDate()
  const todayQ = useQuery({
    queryKey: ["today", businessDate],
    queryFn: () => getToday({ businessDate }),
    staleTime: 30_000,
  })

  useEffect(() => {
    setTitle("Hôm nay")
  }, [setTitle])

  if (todayQ.isLoading) {
    return (
      <div className="flex min-h-full items-center justify-center bg-[#faf8ff] text-[#006875]">
        <Loader2 className="h-7 w-7 animate-spin" />
      </div>
    )
  }

  if (todayQ.isError || !todayQ.data) {
    return (
      <div className="min-h-full bg-[#faf8ff] p-6">
        <div className="mx-auto max-w-screen-xl rounded-2xl border border-[#ffdad6] bg-[#ffdad6] p-5 text-sm font-medium text-[#93000a]">
          Không tải được dữ liệu Hôm nay. Vui lòng thử lại.
        </div>
      </div>
    )
  }

  const data = todayQ.data

  return (
    <div className="min-h-full bg-[#faf8ff]">
      <div className="mx-auto max-w-screen-xl space-y-6 p-4 sm:p-6 lg:space-y-8 lg:p-8">
        <header className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#006875] to-[#006875]/40 p-6 text-white shadow-lg sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/80">Vận hành hàng ngày</p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="font-['Plus_Jakarta_Sans'] text-3xl font-extrabold tracking-tight sm:text-4xl">Hôm nay</h1>
              <p className="mt-1 text-sm text-white/90">Ngày nghiệp vụ: {data.businessDate}</p>
            </div>
            <p className="hidden max-w-xl text-sm italic text-white/80 lg:block">
              Một màn hình duy nhất cho tiền, việc cần làm, công nợ, tồn kho và chốt ngày.
            </p>
          </div>
        </header>

        <TodayMoneyStrip money={data.money} />
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <TodayActionQueue actions={data.actions} />
          <TodayCloseDayPanel closeDay={data.closeDay} />
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <TodayDebtHotlist debts={data.debtHotlist} />
          <TodayInventoryNeeds items={data.inventoryNeeds} />
        </div>
      </div>
    </div>
  )
}
