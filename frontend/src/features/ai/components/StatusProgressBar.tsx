import { useEffect, useState, useRef } from "react"
import {
  Loader2,
  Search,
  Database,
  CheckCircle2,
  BarChart3,
  FileText,
  PenLine,
  Check,
  Brain,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { ProgressPayload } from "../api/aiChatSse"

type StatusProgressBarProps = {
  currentStep: ProgressPayload | null
  isTyping: boolean
}

type PhaseConfig = {
  icon: typeof Search
  label: string
  color: string
  bgColor: string
}

const PHASE_CONFIG: Record<string, PhaseConfig> = {
  plan:    { icon: Search,       label: "Lập kế hoạch",       color: "text-blue-600",  bgColor: "bg-blue-50" },
  query:   { icon: Database,     label: "Truy vấn dữ liệu",   color: "text-violet-600", bgColor: "bg-violet-50" },
  validate:{ icon: CheckCircle2, label: "Kiểm tra dữ liệu",   color: "text-amber-600",  bgColor: "bg-amber-50" },
  chart:   { icon: BarChart3,    label: "Tạo biểu đồ",        color: "text-emerald-600",bgColor: "bg-emerald-50" },
  draft:   { icon: FileText,     label: "Tạo báo cáo",        color: "text-orange-600", bgColor: "bg-orange-50" },
  compose: { icon: PenLine,      label: "Soạn câu trả lời",   color: "text-indigo-600", bgColor: "bg-indigo-50" },
}

function fmtElapsed(sec: number): string {
  if (sec < 60) return `${sec}s`
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}p${s}s`
}

export function StatusProgressBar({ currentStep, isTyping }: StatusProgressBarProps) {
  const [elapsedSec, setElapsedSec] = useState(0)
  const startRef = useRef(0)
  const timerKey = currentStep?.type === "tool_call" ? currentStep.step : -1

  useEffect(() => {
    if (timerKey < 0) return
    startRef.current = Date.now()
    setElapsedSec(0)
    const id = setInterval(
      () => setElapsedSec(Math.floor((Date.now() - startRef.current) / 1000)),
      1000
    )
    return () => clearInterval(id)
  }, [timerKey])

  if (!currentStep && !isTyping) return null

  const phase = currentStep?.phase
  const cfg = phase ? PHASE_CONFIG[phase] : null
  const activeColor = cfg?.color ?? "text-slate-600"
  const activeBg = cfg?.bgColor ?? "bg-slate-50"
  const isRunning = currentStep?.type === "tool_call" || (!currentStep && isTyping)
  const isThinking = !isRunning && isTyping && currentStep?.type === "tool_result"

  return (
    <div className={cn(
      "flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-500",
      activeBg, "border-slate-200",
      isRunning && "shadow-sm"
    )}>
      <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", activeBg, activeColor)}>
        {isThinking ? (
          <Brain className="h-4 w-4 animate-pulse" />
        ) : cfg ? (
          <cfg.icon className="h-4 w-4" />
        ) : (
          <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          {currentStep ? (
            <span className="inline-flex items-center rounded-full bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 border border-slate-200 shadow-sm">
              Bước {currentStep.step}
            </span>
          ) : null}
          {cfg && !isThinking ? (
            <span className={cn("text-xs font-semibold", cfg.color)}>{cfg.label}</span>
          ) : null}
          {isThinking ? (
            <span className="text-xs font-semibold text-slate-500">Đang suy luận...</span>
          ) : null}
        </div>
        <p className={cn(
          "text-sm font-medium mt-0.5 flex items-center gap-2",
          isRunning ? "text-slate-800" : "text-slate-500"
        )}>
          {isThinking ? (
            <>
              <span className="inline-flex gap-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.3s]" />
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.15s]" />
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" />
              </span>
              <span className="text-slate-400">Đang suy luận bước tiếp theo...</span>
            </>
          ) : (
            <>
              {currentStep?.message ?? (isTyping ? "Đang xử lý..." : "")}
              {isRunning && (
                <span className="text-[11px] tabular-nums text-slate-400 font-mono ml-1">
                  {fmtElapsed(elapsedSec)}
                </span>
              )}
            </>
            )}
          </p>
          {currentStep?.reasoning ? (
            <details className="mt-2 group">
              <summary className="text-[10px] text-slate-400 cursor-pointer hover:text-slate-600 select-none">
                <span className="inline-block mr-1 transition-transform group-open:rotate-90">▶</span>
                Xem suy luận
              </summary>
              <pre className="mt-1.5 p-2 rounded-lg text-[11px] leading-relaxed text-slate-500 whitespace-pre-wrap font-mono bg-white/70 border border-slate-200/70">
                {currentStep.reasoning}
              </pre>
            </details>
          ) : null}
        </div>

      <div className="shrink-0">
        {isRunning ? (
          <Loader2 className={cn("h-5 w-5 animate-spin", activeColor)} />
        ) : (
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100">
            <Check className="h-3 w-3 text-emerald-600" />
          </div>
        )}
      </div>
    </div>
  )
}
