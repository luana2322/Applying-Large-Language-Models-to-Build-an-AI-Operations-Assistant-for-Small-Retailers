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
    <div className="flex items-center gap-3 px-3.5 py-2 rounded-xl bg-slate-50/80 border border-slate-200/80 text-slate-600 shadow-sm transition-all duration-300">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
        {isThinking ? (
          <Brain className="h-3.5 w-3.5 animate-pulse" />
        ) : (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" />
        )}
      </div>

      <div className="flex-1 min-w-0 flex items-center gap-2">
        <span className="text-xs font-medium text-slate-700 truncate">
          {currentStep?.message || (isThinking ? "Đang suy luận phân tích..." : "Đang xử lý dữ liệu...")}
        </span>
        {isRunning && (
          <span className="text-[11px] tabular-nums text-slate-400 font-mono">
            ({fmtElapsed(elapsedSec)})
          </span>
        )}
      </div>

      <div className="shrink-0 flex items-center gap-1">
        <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.3s]" />
        <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.15s]" />
        <span className="h-1.5 w-1.5 rounded-full bg-violet-500 animate-bounce" />
      </div>
    </div>
  )
}
