import { memo, useId, useMemo, useState } from "react"
import { BarChart3, Maximize2, PieChart as PieChartIcon, Table as TableIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import type { TooltipProps } from "recharts"
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent"

/** Shape produced by ai_python `chart_spec` legacy (Recharts-friendly). */
type ChartSpecShape = {
  chartType?: string
  xKey?: string
  title?: string
  data?: Array<Record<string, unknown>>
  series?: Array<{ dataKey?: string; name?: string }>
}

type ChartSeriesType = "bar" | "line" | "area" | "pie"
type ChartAxisSide = "left" | "right" | "none"

type ChartSeriesSpec = {
  dataKey: string
  label: string
  renderAs: ChartSeriesType
  axis?: ChartAxisSide
}

type ChartTransform = {
  sort?: "none" | "asc" | "desc"
  topN?: number | null
  bucketOthers?: boolean
  orientation?: "vertical" | "horizontal"
}

type ChartV2Spec = {
  id: string
  title: string
  type: "bar" | "line" | "area" | "pie" | "combo"
  series: ChartSeriesSpec[]
  axes?: Record<string, { label?: string; unit?: string }>
  transform?: ChartTransform
}

type ChartArtifactV2 = {
  kind?: string
  version?: number
  metadata?: { chartPlan?: Record<string, unknown>; confidence?: number }
  data?: Array<Record<string, unknown>>
  charts?: ChartV2Spec[]
  dashboard?: { layout?: "tabs" | "grid" | "auto" }
}

const CHART_PRIMARY = "#2563eb"
const CHART_PRIMARY_MID = "#3b82f6"
const SERIES_COLORS = ["#2563eb", "#16a34a", "#f59e0b", "#dc2626", "#7c3aed", "#0891b2"]
/** High-contrast hues — adjacent slices must be easy to tell apart. */
const PIE_SLICE_COLORS = [
  "#2563eb",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#ec4899",
  "#84cc16",
  "#f97316",
  "#6366f1",
]

type PieRow = Record<string, string | number> & {
  __rawX: string
  __fill: string
  __pct: number
}
const AXIS_TICK = { fontSize: 11, fill: "#64748b", fontWeight: 500 as const }
const TOOLTIP_STYLE = {
  borderRadius: 12,
  border: "1px solid #e2e8f0",
  boxShadow: "0 10px 25px -5px rgb(15 23 42 / 0.12)",
  padding: "10px 12px",
}

function isDataRow(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v)
}

type DateFormatMode = "month-year" | "day-month" | "full-date" | "raw"

/** Detect best date format mode from an array of raw x-axis values. */
function _detectDateFormat(values: string[]): DateFormatMode {
  const isoDates: Array<{ y: string; m: string; d: string }> = []
  for (const v of values) {
    if (!v) continue
    const m = v.trim().match(/^(\d{4})-(\d{2})-(\d{2})([ T]|$)/)
    if (!m) return "raw"
    isoDates.push({ y: m[1], m: m[2], d: m[3] })
  }
  if (isoDates.length === 0) return "raw"

  const months = new Set(isoDates.map((d) => d.m))
  const days = new Set(isoDates.map((d) => d.d))
  const years = new Set(isoDates.map((d) => d.y))

  const allFirstOfMonth = Array.from(days).every((d) => d === "01")

  if (allFirstOfMonth && months.size > 1) {
    return "month-year"
  }
  if (years.size > 1) {
    return "full-date"
  }
  return "day-month"
}

/** Format a single axis label according to the detected mode. */
function formatAxisLabel(value: unknown, mode: DateFormatMode): string {
  if (value === null || value === undefined) return ""
  const s = String(value).trim()
  if (!s) return ""

  if (mode === "raw") {
    return s.length > 14 ? `${s.slice(0, 14)}…` : s
  }

  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (iso) {
    const [, y, m, d] = iso
    if (mode === "month-year") return `T${parseInt(m, 10)}/${y}`
    if (mode === "day-month") return `${d}/${m}`
    if (mode === "full-date") return `${d}/${m}/${y}`
  }

  const parsed = new Date(s)
  if (!Number.isNaN(parsed.getTime()) && /\d{4}/.test(s)) {
    return `T${parsed.getMonth() + 1}/${parsed.getFullYear()}`
  }

  return s.length > 14 ? `${s.slice(0, 14)}…` : s
}

function formatChartValue(v: number | string): string {
  if (typeof v === "number" && Number.isFinite(v)) {
    return v.toLocaleString("vi-VN")
  }
  return String(v)
}

function isV2Artifact(spec: Record<string, unknown>): spec is ChartArtifactV2 {
  return spec.version === 2 && Array.isArray((spec as ChartArtifactV2).charts)
}

function legacyToV2(spec: ChartSpecShape): ChartArtifactV2 | null {
  const xKey = typeof spec.xKey === "string" ? spec.xKey : ""
  const data = Array.isArray(spec.data) ? spec.data.filter(isDataRow) : []
  const firstSeries = Array.isArray(spec.series) ? spec.series[0] : null
  const dataKey = typeof firstSeries?.dataKey === "string" ? firstSeries.dataKey : ""
  if (!xKey || !dataKey || data.length === 0) return null
  const label = typeof firstSeries?.name === "string" && firstSeries.name.trim()
    ? firstSeries.name.trim()
    : dataKey
  const chartType = spec.chartType === "line" || spec.chartType === "pie" ? spec.chartType : "bar"
  return {
    kind: "chart",
    version: 2,
    metadata: {
      chartPlan: {
        intent: "single",
        dimension: { dataKey: xKey, label: xKey, kind: "category" },
      },
    },
    data,
    charts: [{
      id: "legacy-chart",
      title: typeof spec.title === "string" ? spec.title : "Bieu do du lieu",
      type: chartType,
      series: [{ dataKey, label, renderAs: chartType, axis: "left" }],
      axes: { left: { label, unit: "" } },
    }],
  }
}

function ChartLegend({
  series,
  hidden,
  onToggle,
}: {
  series: ChartSeriesSpec[]
  hidden: Set<string>
  onToggle?: (key: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-2 text-[11px] text-slate-700">
      {series.map((item, index) => (
        <label key={item.dataKey} className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2 py-1">
          {onToggle ? (
            <input
              type="checkbox"
              aria-label={item.label}
              checked={!hidden.has(item.dataKey)}
              onChange={() => onToggle(item.dataKey)}
              className="h-3 w-3"
            />
          ) : null}
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: SERIES_COLORS[index % SERIES_COLORS.length] }} />
          <span className="font-medium">{item.label}</span>
        </label>
      ))}
    </div>
  )
}

function normalizeRows(
  rows: Array<Record<string, unknown>>,
  xKey: string,
): Array<Record<string, string | number>> {
  const rawValues = rows.map((r) => {
    const xv = r[xKey]
    return xv === null || xv === undefined ? "" : String(xv)
  })
  const mode = _detectDateFormat(rawValues)
  return rows.map((row) => {
    const xv = row[xKey]
    const raw = xv === null || xv === undefined ? "" : String(xv)
    const display = formatAxisLabel(raw, mode)
    const out: Record<string, string | number> = {
      [xKey]: display,
      __displayX: display,
      __rawX: raw,
    }
    for (const k of Object.keys(row)) {
      if (k === xKey) continue
      const yv = row[k]
      let yn: number
      if (typeof yv === "number" && Number.isFinite(yv)) yn = yv
      else if (typeof yv === "string") {
        const parsed = Number(String(yv).replace(/,/g, "").replace(/\s/g, ""))
        yn = Number.isFinite(parsed) ? parsed : 0
      } else yn = 0
      out[k] = yn
    }
    return out
  })
}

function PieTooltipContent({
  active,
  payload,
  xKey,
}: TooltipProps<ValueType, NameType> & { xKey: string }) {
  if (!active || !payload?.length) return null
  const row = payload[0]
  const pl = row?.payload as PieRow | undefined
  const name = String(row?.name ?? pl?.[xKey] ?? "")
  const value = Number(row?.value ?? 0)
  const pct = typeof pl?.__pct === "number" ? pl.__pct : 0
  const color = pl?.__fill ?? row?.color ?? PIE_SLICE_COLORS[0]

  return (
    <div className="min-w-[148px] rounded-xl border border-slate-200/90 bg-white px-3.5 py-3 shadow-lg">
      <div className="flex items-center gap-2">
        <span
          className="h-3 w-3 shrink-0 rounded-full ring-2 ring-white"
          style={{ backgroundColor: String(color) }}
          aria-hidden
        />
        <p className="text-sm font-semibold leading-snug text-slate-800">{name}</p>
      </div>
      <p className="mt-2 text-xl font-bold tabular-nums tracking-tight text-slate-900">
        {formatChartValue(value)}
      </p>
      <p className="mt-0.5 text-sm font-medium text-blue-600 tabular-nums">
        {pct.toFixed(1)}% tổng
      </p>
    </div>
  )
}

function ChartTooltipContent({
  active,
  payload,
  label,
  metricLabel,
}: TooltipProps<ValueType, NameType> & { metricLabel: string }) {
  if (!active || !payload?.length) return null
  const entries = payload.filter((item) => item?.value !== null && item?.value !== undefined)
  if (entries.length === 0) return null
  const row = entries[0]
  const rawX =
    row?.payload && typeof row.payload === "object" && "__rawX" in row.payload
      ? String((row.payload as { __rawX?: string }).__rawX ?? label)
      : String(label ?? "")
  const displayX = rawX || String(label ?? "")

  return (
    <div className="min-w-[220px] max-w-[340px] rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm shadow-xl ring-1 ring-slate-900/5">
      <p className="text-[13px] font-semibold leading-snug text-slate-900 break-words">{displayX}</p>
      <div className="mt-2 space-y-1.5">
        {entries.map((entry, index) => {
          const visualEntry = entry as typeof entry & { stroke?: unknown; fill?: unknown }
          const name = String(entry.name ?? entry.dataKey ?? metricLabel ?? "Giá trị")
          const color = String(
            entry.color ?? visualEntry.stroke ?? visualEntry.fill ?? SERIES_COLORS[index % SERIES_COLORS.length],
          )
          return (
            <div key={`${name}-${index}`} className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-white"
                  style={{ backgroundColor: color }}
                  aria-hidden
                />
                <span className="min-w-0 whitespace-normal break-words font-medium leading-snug text-slate-600">
                  {name}
                </span>
              </div>
              <span className="shrink-0 text-right font-bold tabular-nums text-slate-950">
                {formatChartValue(entry.value as number | string)}
              </span>
            </div>
          )
        })}
      </div>
      {metricLabel && metricLabel !== displayX ? (
        <p className="mt-2 border-t border-slate-100 pt-2 text-[11px] font-medium leading-snug text-slate-400 break-words">
          {metricLabel}
        </p>
      ) : null}
    </div>
  )
}

function chartAxisProps(xKey: string) {
  return {
    dataKey: xKey,
    axisLine: false,
    tickLine: false,
    tick: false as const,
    height: 16,
  }
}

function chartMargin(compact?: boolean) {
  return {
    top: 8,
    right: compact ? 16 : 24,
    bottom: 6,
    left: 0,
  }
}

function chartYAxisProps(yAxisId: string, label?: string, unit?: string) {
  const fmt = (v: number) => v >= 1000 ? `${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k` : String(v)
  const labelText = label || unit
  return {
    yAxisId,
    axisLine: false,
    tickLine: false,
    tick: AXIS_TICK,
    // Label xoay -90 can them khong gian rieng ngoai tick text, neu khong se
    // bi de len nhau (vd "45000k" chong voi nhan "Doanh thu (VND)").
    width: labelText ? 64 : 48,
    tickFormatter: fmt,
    label: labelText ? { value: labelText, angle: -90, position: "insideLeft" as const, dx: -8, style: { fontSize: 10, fill: "#94a3b8" } } : undefined,
  }
}

type V2CanvasProps = {
  gradientId: string
  chart: ChartV2Spec
  data: Array<Record<string, string | number>>
  hidden: Set<string>
  areaClassName: string
  compact?: boolean
}

function ChartCanvasV2({
  gradientId,
  chart,
  data,
  hidden,
  areaClassName,
  compact,
}: V2CanvasProps) {
  const xKey = "__rawX"
  const displayXKey = "__displayX"
  const visibleSeries = chart.series.filter((s) => !hidden.has(s.dataKey))
  const hasPie = chart.series.some((s) => s.renderAs === "pie")
  const useComposed = chart.type === "combo" || visibleSeries.length > 1

  if (hasPie) {
    const pieSeries = chart.series.find((s) => s.renderAs === "pie")!
    const total = data.reduce((sum, row) => sum + (Number(row[pieSeries.dataKey]) || 0), 0)
    const pieData: PieRow[] = data.map((row, i) => {
      const value = Number(row[pieSeries.dataKey]) || 0
      return {
        ...row,
        __rawX: String(row.__rawX ?? row[xKey] ?? ""),
        __fill: PIE_SLICE_COLORS[i % PIE_SLICE_COLORS.length],
        __pct: total > 0 ? (value / total) * 100 : 0,
      }
    })
    return (
      <div className={areaClassName}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 8, right: 12, bottom: 8, left: 12 }}>
            <Pie
              data={pieData}
              dataKey={pieSeries.dataKey}
              nameKey={xKey}
              cx="50%"
              cy="44%"
              innerRadius={0}
              outerRadius={82}
              paddingAngle={3}
              stroke="#fff"
              strokeWidth={2}
              label={false}
            >
              {pieData.map((entry, i) => (
                <Cell key={`pie-${entry.__rawX}-${i}`} fill={entry.__fill} />
              ))}
            </Pie>
            <Tooltip
              content={<PieTooltipContent xKey={xKey} />}
              wrapperStyle={{ outline: "none", zIndex: 20 }}
              offset={16}
            />
            <Legend
              verticalAlign="bottom"
              height={52}
              content={() => (
                <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 px-2 pb-1">
                  {pieData.map((entry) => (
                    <li
                      key={String(entry.__rawX)}
                      className="flex items-center gap-1.5 text-[11px] text-slate-700"
                    >
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: entry.__fill }}
                        aria-hidden
                      />
                      <span className="font-medium">{String(entry[xKey])}</span>
                      <span className="tabular-nums text-slate-500">
                        {formatChartValue(Number(entry[pieSeries.dataKey]))} ({entry.__pct.toFixed(0)}%)
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    )
  }

  const tooltip = (
    <Tooltip
      content={<ChartTooltipContent metricLabel={chart.title} />}
      cursor={{ fill: "rgba(37, 99, 235, 0.06)" }}
      wrapperStyle={{ outline: "none", zIndex: 60, pointerEvents: "none" }}
      contentStyle={TOOLTIP_STYLE}
    />
  )
  const grid = <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />

  // Bar ngang: nhiều nhóm danh mục thì tên nhóm đọc theo trục Y dễ hơn bar dọc.
  const isHorizontal =
    chart.transform?.orientation === "horizontal" && chart.series.length === 1 && !hasPie
  if (isHorizontal) {
    const barSeries = visibleSeries[0]
    return (
      <div className={areaClassName}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, bottom: 4, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
            <XAxis
              type="number"
              axisLine={false}
              tickLine={false}
              tick={AXIS_TICK}
              tickFormatter={(v: number) =>
                v >= 1000 ? `${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k` : String(v)
              }
            />
            <YAxis
              type="category"
              dataKey={displayXKey}
              axisLine={false}
              tickLine={false}
              tick={AXIS_TICK}
              width={Math.min(160, Math.max(72, ...data.map((r) => String(r.__displayX ?? "").length * 7)))}
            />
            {tooltip}
            {barSeries ? (
              <Bar dataKey={barSeries.dataKey} name={barSeries.label} fill={CHART_PRIMARY}
                   radius={[0, 6, 6, 0]} maxBarSize={28} />
            ) : null}
          </BarChart>
        </ResponsiveContainer>
      </div>
    )
  }

  const ChartCmp = useComposed ? ComposedChart : BarChart

  return (
    <div className={areaClassName}>
      <ResponsiveContainer width="100%" height="100%">
        <ChartCmp data={data} margin={chartMargin(compact)}>
          {grid}
          <XAxis {...chartAxisProps(displayXKey)} />
          <YAxis {...chartYAxisProps("left", chart.axes?.left?.label, chart.axes?.left?.unit)} />
          {chart.series.some((s) => s.axis === "right") ? (
            <YAxis {...chartYAxisProps("right", chart.axes?.right?.label, chart.axes?.right?.unit)} orientation="right" />
          ) : null}
          {tooltip}
          {visibleSeries.map((item, index) => {
            const color = SERIES_COLORS[index % SERIES_COLORS.length]
            const axisId = item.axis === "right" ? "right" : "left"
            if (item.renderAs === "line") {
              return (
                <Line key={item.dataKey} yAxisId={axisId} type="monotone" dataKey={item.dataKey}
                      name={item.label} stroke={color} strokeWidth={2.5}
                      dot={{ r: 4, fill: color, strokeWidth: 2, stroke: "#fff" }} />
              )
            }
            if (item.renderAs === "area") {
              return (
                <Area key={item.dataKey} yAxisId={axisId} type="monotone" dataKey={item.dataKey}
                      name={item.label} stroke={color} fill={color} fillOpacity={0.16} />
              )
            }
            return (
              <Bar key={item.dataKey} yAxisId={axisId} dataKey={item.dataKey} name={item.label}
                   fill={color} radius={[6, 6, 0, 0]} maxBarSize={48} />
            )
          })}
        </ChartCmp>
      </ResponsiveContainer>
    </div>
  )
}

function ChartDataTable({
  chart,
  data,
  dimLabel,
}: {
  chart: ChartV2Spec
  data: Array<Record<string, string | number>>
  dimLabel: string
}) {
  return (
    <div className="max-h-[280px] overflow-auto rounded-xl border border-slate-200">
      <table className="w-full border-collapse text-xs">
        <thead className="sticky top-0 bg-slate-50 text-slate-600">
          <tr>
            <th className="px-3 py-2 text-left font-semibold">{dimLabel || "Nhóm"}</th>
            {chart.series.map((s) => (
              <th key={s.dataKey} className="px-3 py-2 text-right font-semibold">{s.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={String(row.__rawX) + i} className="border-t border-slate-100">
              <td className="px-3 py-1.5 text-slate-700">{String(row.__rawX ?? "")}</td>
              {chart.series.map((s) => (
                <td key={s.dataKey} className="px-3 py-1.5 text-right tabular-nums text-slate-800">
                  {formatChartValue(row[s.dataKey] as number | string)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export const AiChatChartCard = memo(function AiChatChartCard({ spec }: { spec: Record<string, unknown> }) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [showTable, setShowTable] = useState(false)
  const [hidden, setHidden] = useState<Set<string>>(new Set())
  const gradientId = useId().replace(/:/g, "")

  const v2 = isV2Artifact(spec) ? (spec as ChartArtifactV2) : legacyToV2(spec as ChartSpecShape)
  const charts = v2?.charts ?? []
  const rawData = Array.isArray(v2?.data) ? v2!.data.filter(isDataRow) : []

  const firstChart = charts[0]
  const xKey = "__rawX"

  const data = useMemo(() => {
    if (!firstChart || rawData.length === 0) return []
    const dim = (v2?.metadata?.chartPlan as any)?.dimension?.dataKey
    return normalizeRows(rawData, dim || (firstChart as any).xKey || "")
  }, [rawData, firstChart, v2])

  const title = firstChart?.title ?? ""
  const isDashboard = charts.length > 1 || v2?.dashboard?.layout === "tabs" || v2?.dashboard?.layout === "grid"
  const layout = v2?.dashboard?.layout ?? "auto"

  const toggle = (key: string) => {
    setHidden((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  if (!v2 || charts.length === 0) {
    return (
      <div className="rounded-xl border border-amber-200/80 bg-amber-50/90 px-3 py-2.5 text-xs text-amber-950">
        Thiếu cấu hình trục biểu đồ từ server (xKey / series.dataKey).
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-600">
        Không có dữ liệu để vẽ biểu đồ.
      </div>
    )
  }

  const chartTitle = title || "Biểu đồ dữ liệu"

  return (
    <>
      <div className="w-full min-w-0 overflow-hidden rounded-2xl border border-slate-200/90 bg-gradient-to-b from-slate-50/80 to-white shadow-sm ring-1 ring-slate-900/[0.04]">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 bg-white/60 px-3 py-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <BarChart3 className="h-4 w-4" aria-hidden />
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-semibold leading-snug tracking-tight text-slate-800 line-clamp-1">
                {chartTitle}
              </h4>
              <p className="text-[10px] text-slate-500">{data.length} mục dữ liệu</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0 bg-white h-7 text-xs font-semibold"
              onClick={() => setShowTable((v) => !v)}
            >
              {showTable ? (
                <><BarChart3 className="h-3.5 w-3.5 mr-1" />Biểu đồ</>
              ) : (
                <><TableIcon className="h-3.5 w-3.5 mr-1" />Bảng</>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0 bg-white h-7 text-xs font-semibold"
              onClick={() => setDialogOpen(true)}
            >
              <Maximize2 className="h-3.5 w-3.5 mr-1" />
              Phóng to
            </Button>
          </div>
        </div>
        {showTable ? (
          <div className="px-3 py-3">
            <ChartDataTable
              chart={firstChart}
              data={data}
              dimLabel={(v2?.metadata?.chartPlan as any)?.dimension?.label ?? ""}
            />
          </div>
        ) : (
          <ChartCanvasV2
            gradientId={gradientId}
            chart={firstChart}
            data={data}
            hidden={hidden}
            compact
            areaClassName="h-[min(300px,38vh)] w-full min-w-[240px] px-1 pb-2 pt-3 md:h-[min(340px,42vh)]"
          />
        )}
        {!showTable && data.length > 10 && (
          <p className="px-3 pb-1 text-[10px] text-slate-400 italic">
            Nhiều điểm dữ liệu — di chuột vào cột để xem tên đầy đủ.
          </p>
        )}
        <div className="px-3 pb-2">
          <ChartLegend series={firstChart.series} hidden={hidden} />
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="flex max-h-[min(92dvh,720px)] w-full max-w-[min(96vw,1200px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-[min(96vw,1200px)]">
          <DialogHeader className="border-b border-slate-100 px-5 py-4 text-left">
            <DialogTitle className="text-base">{chartTitle}</DialogTitle>
            <div className="mt-2">
              <ChartLegend series={firstChart.series} hidden={hidden} onToggle={toggle} />
            </div>
          </DialogHeader>
          {isDashboard && layout === "tabs" ? (
            <div className="px-2 pb-4 pt-2">
              {charts.map((c) => (
                <div key={c.id} className="h-[min(560px,72vh)] w-full px-2">
                  <ChartCanvasV2
                    compact={false}
                    gradientId={`${gradientId}-${c.id}`}
                    chart={c}
                    data={data}
                    hidden={hidden}
                    areaClassName="h-[min(560px,72vh)] w-full px-2 pb-4 pt-2"
                  />
                </div>
              ))}
            </div>
          ) : isDashboard && layout === "grid" ? (
            <div className="grid grid-cols-1 gap-2 px-2 pb-4 pt-2 sm:grid-cols-2">
              {charts.map((c) => (
                <div key={c.id} className="h-[min(420px,52vh)] w-full">
                  <ChartCanvasV2
                    compact={false}
                    gradientId={`${gradientId}-${c.id}`}
                    chart={c}
                    data={data}
                    hidden={hidden}
                    areaClassName="h-[min(420px,52vh)] w-full"
                  />
                </div>
              ))}
            </div>
          ) : (
            <ChartCanvasV2
              compact={false}
              gradientId={`${gradientId}-dlg`}
              chart={firstChart}
              data={data}
              hidden={hidden}
              areaClassName="h-[min(560px,72vh)] w-full px-2 pb-4 pt-2"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
})
