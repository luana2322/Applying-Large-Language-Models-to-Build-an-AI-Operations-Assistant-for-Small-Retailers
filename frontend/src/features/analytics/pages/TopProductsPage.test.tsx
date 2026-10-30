import type { ReactElement } from "react"
import { render, screen, waitFor } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { describe, expect, it, vi } from "vitest"

import { PageTitleProvider } from "@/context/PageTitleContext"
import type { ProfitBySkuResponse } from "../types"
import { TopProductsPage } from "./TopProductsPage"

const analyticsApiMocks = vi.hoisted(() => ({
  getProfitBySku: vi.fn(),
}))

vi.mock("../api/analyticsApi", () => ({
  getProfitBySku: analyticsApiMocks.getProfitBySku,
}))

vi.mock("recharts", () => ({
  BarChart: ({ children }: { children?: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
  Bar: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  CartesianGrid: () => <div />,
  Cell: () => <div />,
  Pie: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  PieChart: ({ children }: { children?: React.ReactNode }) => <div data-testid="pie-chart">{children}</div>,
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

const profitBySku: ProfitBySkuResponse = {
  totalRevenue: 2_000_000,
  totalCost: 1_300_000,
  totalGrossProfit: 700_000,
  items: [
    {
      productId: 11,
      skuCode: "SKU-011",
      productName: "Ca phe sua",
      qtySold: 12,
      revenue: 1_200_000,
      cost: 900_000,
      grossProfit: 300_000,
      grossMarginPct: 25,
    },
  ],
}

describe("TopProductsPage", () => {
  it("loads profit-by-SKU data and renders profit detail columns", async () => {
    const dateTo = isoDate(new Date())
    const dateFrom = isoDate(new Date(Date.now() - 29 * 86400_000))
    analyticsApiMocks.getProfitBySku.mockResolvedValueOnce(profitBySku)

    renderWithProviders(<TopProductsPage />)

    await waitFor(() =>
      expect(analyticsApiMocks.getProfitBySku).toHaveBeenCalledWith({
        dateFrom,
        dateTo,
        limit: 20,
      }),
    )
    expect(await screen.findByRole("heading", { name: "Sản phẩm bán chạy" })).toBeInTheDocument()
    expect(screen.getByText("SKU-011")).toBeInTheDocument()
    expect(screen.getByText("Ca phe sua")).toBeInTheDocument()
    expect(screen.getByText("Giá vốn")).toBeInTheDocument()
    expect(screen.getByText("Lợi nhuận")).toBeInTheDocument()
    expect(screen.getByText("Biên LN")).toBeInTheDocument()
    expect(screen.getByText("25.0%")).toBeInTheDocument()
  })

  it("renders demo profit-by-SKU rows when the API fails", async () => {
    analyticsApiMocks.getProfitBySku.mockRejectedValueOnce(new Error("INVALID_ENVELOPE"))

    renderWithProviders(<TopProductsPage />)

    expect(await screen.findByText("DEMO-SKU-001")).toBeInTheDocument()
    expect(screen.getByText("Cà phê rang xay Robusta 500g")).toBeInTheDocument()
    expect(screen.getByText("32.5%")).toBeInTheDocument()
  })
})
