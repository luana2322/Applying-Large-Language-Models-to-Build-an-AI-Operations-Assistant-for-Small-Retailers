import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Brain, Check, ChevronDown, Crown, Sparkles, X } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { usePageTitle } from "@/context/PageTitleContext"
import { cn } from "@/lib/utils"
import {
  CURRENT_PLAN_ID,
  comparisonRows,
  faqItems,
  featureHighlights,
  pricingPlans,
  type PricingPlan,
} from "@/features/ai/data/pricingPlans"

function CellValue({ value }: { value: string | boolean }) {
  if (value === true) return <Check className="mx-auto h-4 w-4 text-emerald-600" aria-label="Có" />
  if (value === false) return <X className="mx-auto h-4 w-4 text-slate-300" aria-label="Không" />
  return <span className="text-sm text-slate-700">{value}</span>
}

function PlanCard({ plan, onUpgrade }: { plan: PricingPlan; onUpgrade: (plan: PricingPlan) => void }) {
  const isCurrent = plan.id === CURRENT_PLAN_ID
  return (
    <Card className={cn("relative flex flex-col", plan.popular ? "border-slate-900 shadow-md" : "border-slate-200")}>
      {plan.popular && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-900 text-white">Phổ biến</Badge>
      )}
      <CardHeader>
        <CardTitle className="text-lg">{plan.name}</CardTitle>
        <p className="text-sm text-slate-500">{plan.tagline}</p>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-3xl font-semibold text-slate-950">{plan.priceLabel}</span>
          {plan.pricePeriod && <span className="text-sm text-slate-500">{plan.pricePeriod}</span>}
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <ul className="space-y-2 text-sm text-slate-700">
          {plan.highlights.map((line) => (
            <li key={line} className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600" />
              <span>{line}</span>
            </li>
          ))}
        </ul>
        <Button
          type="button"
          disabled={plan.ctaDisabled}
          variant={plan.popular ? "default" : "outline"}
          className={cn("mt-auto w-full", plan.popular && "bg-slate-900 text-white hover:bg-slate-800")}
          onClick={() => onUpgrade(plan)}
        >
          {plan.cta}
        </Button>
        {isCurrent && <p className="text-center text-xs text-slate-400">Bạn đang dùng gói này</p>}
      </CardContent>
    </Card>
  )
}

function FaqEntry({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-md border border-slate-200 bg-white">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium text-slate-900"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        {question}
        <ChevronDown className={cn("h-4 w-4 flex-shrink-0 text-slate-400 transition-transform", open && "rotate-180")} />
      </button>
      {open && <p className="border-t border-slate-100 px-4 py-3 text-sm text-slate-600">{answer}</p>}
    </div>
  )
}

export function AiUpgradePage() {
  const { setTitle } = usePageTitle()
  const navigate = useNavigate()
  const pricingRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setTitle("Nâng cấp gói AI")
  }, [setTitle])

  const handleUpgrade = (plan: PricingPlan) => {
    toast.info(`Nâng cấp ${plan.name} — tính năng đang được phát triển.`)
  }

  const scrollToPricing = () => {
    pricingRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <div className="mx-auto max-w-6xl space-y-12 px-4 py-8">
      {/* 1. Hero */}
      <section className="relative overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-slate-900 to-slate-700 px-6 py-12 text-white">
        <Badge className="absolute right-4 top-4 bg-white/15 text-white">Đang dùng: Free</Badge>
        <div className="flex items-center gap-2 text-sm text-slate-200">
          <Brain className="h-5 w-5" />
          Trợ lý AI
        </div>
        <h1 className="mt-3 max-w-2xl text-3xl font-semibold sm:text-4xl">Trợ lý AI cho cửa hàng của bạn</h1>
        <p className="mt-3 max-w-xl text-slate-200">
          Hỏi-đáp dữ liệu, vẽ biểu đồ, soạn phiếu nháp và tự tạo giao diện quản lý — tất cả bằng ngôn ngữ tự nhiên.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button type="button" className="bg-white text-slate-900 hover:bg-slate-100" onClick={() => navigate("/ai/chat")}>
            Dùng thử miễn phí
          </Button>
          <Button
            type="button"
            variant="outline"
            className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
            onClick={scrollToPricing}
          >
            Xem bảng giá
          </Button>
        </div>
      </section>

      {/* 2. Điểm nổi bật */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-950">Trợ lý AI làm được gì?</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featureHighlights.map((feature) => {
            const Icon = feature.icon
            return (
              <Card key={feature.title} className="gap-3 border-slate-200 py-5">
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-slate-100 text-slate-700">
                      <Icon className="h-5 w-5" />
                    </span>
                    {feature.proOnly && (
                      <Badge variant="outline" className="border-slate-300 text-slate-600">Pro</Badge>
                    )}
                  </div>
                  <h3 className="text-sm font-semibold text-slate-950">{feature.title}</h3>
                  <p className="text-sm text-slate-500">{feature.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* 3. Thẻ giá */}
      <section ref={pricingRef} className="space-y-4 scroll-mt-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-slate-950">Chọn gói phù hợp</h2>
          <p className="mt-1 text-sm text-slate-500">Nâng cấp bất kỳ lúc nào. Huỷ bất kỳ lúc nào.</p>
        </div>
        <div className="grid gap-4 pt-2 md:grid-cols-3">
          {pricingPlans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} onUpgrade={handleUpgrade} />
          ))}
        </div>
      </section>

      {/* 4. Bảng so sánh */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-950">So sánh chi tiết</h2>
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Tính năng</th>
                <th className="px-4 py-3 text-center font-medium">Free</th>
                <th className="px-4 py-3 text-center font-medium">
                  <span className="inline-flex items-center gap-1">
                    <Sparkles className="h-4 w-4 text-slate-900" /> Pro
                  </span>
                </th>
                <th className="px-4 py-3 text-center font-medium">
                  <span className="inline-flex items-center gap-1">
                    <Crown className="h-4 w-4 text-amber-500" /> Pro+
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {comparisonRows.map((row) => (
                <tr key={row.label}>
                  <td className="px-4 py-3 text-slate-700">{row.label}</td>
                  <td className="px-4 py-3 text-center"><CellValue value={row.free} /></td>
                  <td className="px-4 py-3 text-center"><CellValue value={row.pro} /></td>
                  <td className="px-4 py-3 text-center"><CellValue value={row.proPlus} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 5. FAQ */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-950">Câu hỏi thường gặp</h2>
        <div className="space-y-2">
          {faqItems.map((item) => (
            <FaqEntry key={item.question} question={item.question} answer={item.answer} />
          ))}
        </div>
      </section>
    </div>
  )
}
