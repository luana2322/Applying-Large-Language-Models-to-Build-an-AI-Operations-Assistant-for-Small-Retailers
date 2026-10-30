import { render, screen, fireEvent } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { AiChatChartCard } from "./AiChatChartCard"

vi.mock("recharts", () => {
  const passthrough = ({ children, ...props }: any) => <div data-recharts={props["data-testid"] ?? "node"}>{children}</div>
  return {
    ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
    LineChart: passthrough,
    BarChart: passthrough,
    PieChart: passthrough,
    ComposedChart: passthrough,
    CartesianGrid: passthrough,
    XAxis: ({ dataKey, tick, interval }: any) => (
      <div data-testid="x-axis">
        <span data-testid="x-axis-datakey">{dataKey}</span>
        <span data-testid="x-axis-tick">{typeof tick === "object" ? `angle:${tick.angle}` : String(tick)}</span>
        <span data-testid="x-axis-interval">{String(interval)}</span>
      </div>
    ),
    YAxis: ({ yAxisId, label }: any) => <div data-testid={`y-axis-${yAxisId ?? "left"}`}>{label?.value}</div>,
    Tooltip: passthrough,
    Legend: passthrough,
    Line: ({ dataKey, name }: any) => <div data-testid={`line-${dataKey}`}>{name}</div>,
    Bar: ({ dataKey, name }: any) => <div data-testid={`bar-${dataKey}`}>{name}</div>,
    Area: ({ dataKey, name }: any) => <div data-testid={`area-${dataKey}`}>{name}</div>,
    Pie: passthrough,
    Cell: passthrough,
  }
})

const v2Spec = {
  kind: "chart",
  version: 2,
  metadata: {
    confidence: 0.86,
    chartPlan: {
      intent: "combo",
      dimension: { dataKey: "month", label: "Month", kind: "time" },
      metrics: [
        { dataKey: "revenue", label: "Revenue", unit: "VND", role: "primary" },
        { dataKey: "quantity", label: "Quantity", unit: "items", role: "secondary" },
      ],
      charts: [
        {
          id: "revenue-quantity",
          title: "Revenue and quantity",
          type: "combo",
          series: [
            { dataKey: "revenue", label: "Revenue", renderAs: "bar", axis: "left" },
            { dataKey: "quantity", label: "Quantity", renderAs: "line", axis: "right" },
          ],
          axes: {
            left: { label: "Revenue", unit: "VND" },
            right: { label: "Quantity", unit: "items" },
          },
        },
      ],
      dashboard: { enabled: false, layout: "auto" },
    },
  },
  data: [
    { month: "T1/2026", revenue: 100, quantity: 4 },
    { month: "T2/2026", revenue: 200, quantity: 7 },
  ],
  charts: [
    {
      id: "revenue-quantity",
      title: "Revenue and quantity",
      type: "combo",
      series: [
        { dataKey: "revenue", label: "Revenue", renderAs: "bar", axis: "left" },
        { dataKey: "quantity", label: "Quantity", renderAs: "line", axis: "right" },
      ],
      axes: {
        left: { label: "Revenue", unit: "VND" },
        right: { label: "Quantity", unit: "items" },
      },
    },
  ],
}

describe("AiChatChartCard", () => {
  it("renders v2 metric legend and combo series", () => {
    render(<AiChatChartCard spec={v2Spec} />)
    // "Revenue"/"Quantity" appear in both the legend and the chart series name — use getAllByText
    expect(screen.getAllByText("Revenue").length).toBeGreaterThan(0)
    expect(screen.getAllByText("Quantity").length).toBeGreaterThan(0)
    expect(screen.getByTestId("bar-revenue")).toHaveTextContent("Revenue")
    expect(screen.getByTestId("line-quantity")).toHaveTextContent("Quantity")
    expect(screen.getByTestId("y-axis-left")).toHaveTextContent("Revenue")
    expect(screen.getByTestId("y-axis-right")).toHaveTextContent("Quantity")
  })

  it("keeps legacy chart rendering", () => {
    render(<AiChatChartCard spec={{
      chartType: "bar",
      xKey: "month",
      title: "Legacy revenue",
      data: [{ month: "T1/2026", revenue: 100 }],
      series: [{ dataKey: "revenue", name: "Revenue" }],
    }} />)
    expect(screen.getByText("Legacy revenue")).toBeInTheDocument()
    // "Revenue" appears in legend + bar name; assert at least one match
    expect(screen.getAllByText("Revenue").length).toBeGreaterThan(0)
  })

  it("toggles a v2 series in the dialog", async () => {
    render(<AiChatChartCard spec={v2Spec} />)
    fireEvent.click(screen.getByRole("button", { name: /Phong to|Phóng to/ }))
    fireEvent.click(screen.getByRole("checkbox", { name: "Quantity" }))
    expect(screen.queryByTestId("line-quantity")).not.toBeInTheDocument()
  })

  it("renders a tabs dashboard with multiple charts", () => {
    const dashboardSpec = {
      ...v2Spec,
      kind: "chart_dashboard",
      dashboard: { layout: "tabs" },
      charts: [
        ...v2Spec.charts,
        {
          id: "second-chart",
          title: "Second chart",
          type: "line",
          series: [{ dataKey: "quantity", label: "Quantity 2", renderAs: "line", axis: "left" }],
          axes: { left: { label: "Quantity 2", unit: "items" } },
        },
      ],
      metadata: {
        ...v2Spec.metadata,
        chartPlan: {
          ...v2Spec.metadata.chartPlan,
          dashboard: { enabled: true, layout: "tabs" },
        },
      },
    }
    render(<AiChatChartCard spec={dashboardSpec} />)
    // Dashboard mode: the first chart still renders in the card
    expect(screen.getByTestId("bar-revenue")).toBeInTheDocument()
    // The dialog should open and render dashboard charts
    fireEvent.click(screen.getByRole("button", { name: /Phong to|Phóng to/ }))
    // After opening dialog, at least the first chart's series is still present
    expect(screen.getAllByTestId("bar-revenue").length).toBeGreaterThanOrEqual(1)
  })

  it("renders a grid dashboard with multiple charts", () => {
    const gridSpec = {
      ...v2Spec,
      kind: "chart_dashboard",
      dashboard: { layout: "grid" },
      charts: [
        ...v2Spec.charts,
        {
          id: "grid-chart",
          title: "Grid chart",
          type: "line",
          series: [{ dataKey: "quantity", label: "Grid Quantity", renderAs: "line", axis: "left" }],
          axes: { left: { label: "Grid Quantity", unit: "items" } },
        },
      ],
      metadata: {
        ...v2Spec.metadata,
        chartPlan: {
          ...v2Spec.metadata.chartPlan,
          dashboard: { enabled: true, layout: "grid" },
        },
      },
    }
    render(<AiChatChartCard spec={gridSpec} />)
    expect(screen.getByTestId("bar-revenue")).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: /Phong to|Phóng to/ }))
    expect(screen.getAllByTestId("bar-revenue").length).toBeGreaterThanOrEqual(1)
  })

  it("shows missing-config message for legacy spec with no series", () => {
    render(<AiChatChartCard spec={{
      chartType: "bar",
      xKey: "month",
      title: "Broken",
      data: [{ month: "T1" }],
      series: [],
    }} />)
    expect(screen.getByText(/Thiếu cấu hình|Thiếu/)).toBeInTheDocument()
  })

  it("formats ISO daily dates as dd/MM in data table", () => {
    render(<AiChatChartCard spec={{
      kind: "chart",
      version: 2,
      metadata: {
        chartPlan: {
          dimension: { dataKey: "date", label: "Ngày", kind: "time" },
          charts: [],
        },
      },
      data: [
        { date: "2026-06-01", revenue: 100 },
        { date: "2026-06-02", revenue: 200 },
      ],
      charts: [{
        id: "c1",
        title: "Doanh thu theo ngày",
        type: "bar",
        series: [{ dataKey: "revenue", label: "Doanh thu", renderAs: "bar", axis: "left" }],
        axes: { left: { label: "Doanh thu", unit: "VND" } },
      }],
    }} />)
    // Switch to data table view
    fireEvent.click(screen.getByRole("button", { name: /Bảng/ }))
    expect(screen.getByText("01/06")).toBeInTheDocument()
    expect(screen.getByText("02/06")).toBeInTheDocument()
  })

  it("formats ISO monthly dates as T{tháng}/{năm} when all are first-of-month", () => {
    render(<AiChatChartCard spec={{
      kind: "chart",
      version: 2,
      metadata: {
        chartPlan: {
          dimension: { dataKey: "month", label: "Tháng", kind: "time" },
          charts: [],
        },
      },
      data: [
        { month: "2026-01-01", revenue: 100 },
        { month: "2026-02-01", revenue: 200 },
      ],
      charts: [{
        id: "c1",
        title: "Doanh thu theo tháng",
        type: "bar",
        series: [{ dataKey: "revenue", label: "Doanh thu", renderAs: "bar", axis: "left" }],
        axes: { left: { label: "Doanh thu", unit: "VND" } },
      }],
    }} />)
    fireEvent.click(screen.getByRole("button", { name: /Bảng/ }))
    expect(screen.getByText("T1/2026")).toBeInTheDocument()
    expect(screen.getByText("T2/2026")).toBeInTheDocument()
  })

  it("shows hint text when chart has more than 10 data points", () => {
    render(<AiChatChartCard spec={{
      kind: "chart",
      version: 2,
      metadata: {
        chartPlan: {
          dimension: { dataKey: "date", label: "Ngày", kind: "time" },
          charts: [],
        },
      },
      data: Array.from({ length: 12 }, (_, i) => ({
        date: `2026-06-${String(i + 1).padStart(2, "0")}`,
        revenue: (i + 1) * 100,
      })),
      charts: [{
        id: "c1",
        title: "Doanh thu theo ngày",
        type: "bar",
        series: [{ dataKey: "revenue", label: "Doanh thu", renderAs: "bar", axis: "left" }],
        axes: { left: { label: "Doanh thu", unit: "VND" } },
      }],
    }} />)
    expect(screen.getByText(/chi tiết trục x/)).toBeInTheDocument()
  })

  it("hides hint text when chart has 10 or fewer data points", () => {
    render(<AiChatChartCard spec={{
      kind: "chart",
      version: 2,
      metadata: {
        chartPlan: {
          dimension: { dataKey: "date", label: "Ngày", kind: "time" },
          charts: [],
        },
      },
      data: Array.from({ length: 8 }, (_, i) => ({
        date: `2026-06-${String(i + 1).padStart(2, "0")}`,
        revenue: (i + 1) * 100,
      })),
      charts: [{
        id: "c1",
        title: "Doanh thu 8 ngày",
        type: "bar",
        series: [{ dataKey: "revenue", label: "Doanh thu", renderAs: "bar", axis: "left" }],
        axes: { left: { label: "Doanh thu", unit: "VND" } },
      }],
    }} />)
    expect(screen.queryByText(/chi tiết trục x/)).toBeNull()
  })

  it("hides hint text when data table is shown", () => {
    render(<AiChatChartCard spec={{
      kind: "chart",
      version: 2,
      metadata: {
        chartPlan: {
          dimension: { dataKey: "date", label: "Ngày", kind: "time" },
          charts: [],
        },
      },
      data: Array.from({ length: 12 }, (_, i) => ({
        date: `2026-06-${String(i + 1).padStart(2, "0")}`,
        revenue: (i + 1) * 100,
      })),
      charts: [{
        id: "c1",
        title: "Doanh thu theo ngày",
        type: "bar",
        series: [{ dataKey: "revenue", label: "Doanh thu", renderAs: "bar", axis: "left" }],
        axes: { left: { label: "Doanh thu", unit: "VND" } },
      }],
    }} />)
    // Switch to data table
    fireEvent.click(screen.getByRole("button", { name: /Bảng/ }))
    expect(screen.queryByText(/chi tiết trục x/)).toBeNull()
  })

  it("keeps pre-formatted non-ISO string labels unchanged", () => {
    render(<AiChatChartCard spec={{
      kind: "chart",
      version: 2,
      metadata: {
        chartPlan: {
          dimension: { dataKey: "product", label: "Sản phẩm", kind: "category" },
          charts: [],
        },
      },
      data: [
        { product: "SP001", revenue: 100 },
        { product: "SP002", revenue: 200 },
      ],
      charts: [{
        id: "c1",
        title: "Top sản phẩm",
        type: "bar",
        series: [{ dataKey: "revenue", label: "Doanh thu", renderAs: "bar", axis: "left" }],
        axes: { left: { label: "Doanh thu", unit: "VND" } },
      }],
    }} />)
    fireEvent.click(screen.getByRole("button", { name: /Bảng/ }))
    expect(screen.getByText("SP001")).toBeInTheDocument()
    expect(screen.getByText("SP002")).toBeInTheDocument()
  })
})
