import type { ReactElement } from "react"
import { render, screen, waitFor } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { describe, expect, it, vi } from "vitest"

import { PageTitleProvider } from "@/context/PageTitleContext"
import type { RevenueTrendResponse } from "../types"
import { RevenuePage } from "./RevenuePage"

const analyticsApiMocks = vi.hoisted(() => ({
  getRevenueTrend: vi.fn(),
}))

vi.mock("../api/analyticsApi", () => ({
  getRevenueTrend: analyticsApiMocks.getRevenueTrend,
}))

vi.mock("recharts", () => ({
  AreaChart: ({ children }: { children?: React.ReactNode }) => <div data-testid="area-chart">{children}</div>,
  Area: () => <div />,
  BarChart: ({ children }: { children?: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div />,
  CartesianGrid: () => <div />,
  Legend: () => <div />,
  ResponsiveContainer: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  Tooltip: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
}))

function renderWithProviders(ui: ReactElement) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={qc}>
      <PageTitleProvider>{ui}</PageTitleProvider>
    </QueryClientProvider>,
  )
}

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10)
}

const revenueTrend: RevenueTrendResponse = {
  totalRevenue: 1_500_000,
  totalProfit: 300_000,
  points: [
    { date: "2026-06-20", label: "20/06", revenue: 700_000, profit: 120_000, orders: 4 },
    { date: "2026-06-21", label: "21/06", revenue: 800_000, profit: 180_000, orders: 5 },
  ],
}

describe("RevenuePage", () => {
  it("loads revenue trend from the analytics API and renders summary metrics", async () => {
    const dateTo = isoDate(new Date())
    const dateFrom = isoDate(new Date(Date.now() - 29 * 86400_000))
    analyticsApiMocks.getRevenueTrend.mockResolvedValueOnce(revenueTrend)

    renderWithProviders(<RevenuePage />)

    await waitFor(() =>
      expect(analyticsApiMocks.getRevenueTrend).toHaveBeenCalledWith({
        dateFrom,
        dateTo,
      }),
    )
    expect(await screen.findByRole("heading", { name: "Doanh thu & Lợi nhuận" })).toBeInTheDocument()
    expect(screen.getByText(/1\.500\.000/)).toBeInTheDocument()
    expect(screen.getByText(/300\.000/)).toBeInTheDocument()
    expect(screen.getByText("20.0%")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "7 ngày" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "30 ngày" })).toBeInTheDocument()
  })

  it("renders demo revenue metrics when the API fails", async () => {
    analyticsApiMocks.getRevenueTrend.mockRejectedValueOnce(new Error("INVALID_ENVELOPE"))

    renderWithProviders(<RevenuePage />)

    expect(await screen.findByText(/18\.500\.000/)).toBeInTheDocument()
    expect(screen.getByText(/5\.200\.000/)).toBeInTheDocument()
    expect(screen.getByText("28.1%")).toBeInTheDocument()
  })
})
