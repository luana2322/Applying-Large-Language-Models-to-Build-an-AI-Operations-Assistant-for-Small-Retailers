import type { ReactElement } from "react"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { MemoryRouter } from "react-router-dom"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { PageTitleProvider } from "@/context/PageTitleContext"
import { useAuthStore } from "@/features/auth/store/useAuthStore"
import type { DashboardData } from "../api/dashboardApi"
import { DashboardPage } from "./DashboardPage"

const dashboardApiMocks = vi.hoisted(() => ({
  getDashboard: vi.fn(),
}))

vi.mock("@/features/dashboard/api/dashboardApi", () => ({
  getDashboard: dashboardApiMocks.getDashboard,
}))

vi.mock("recharts", () => ({
  AreaChart: ({ children }: { children?: React.ReactNode }) => <div data-testid="area-chart">{children}</div>,
  Area: ({ dataKey, name }: { dataKey: string; name?: string }) => (
    <div data-testid={`area-${dataKey}`}>{name ?? dataKey}</div>
  ),
  CartesianGrid: () => <div />,
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
      <MemoryRouter>
        <PageTitleProvider>{ui}</PageTitleProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

const dashboardData: DashboardData = {
  financial: {
    todayRevenue: 900_000,
    yesterdayRevenue: 700_000,
    todayOrders: 3,
    pctChange: 28.57,
    avgOrderValue: 300_000,
  },
  revenueTrend: [
    { date: "2026-06-20", label: "20/06", revenue: 700_000, profit: 120_000, orders: 4 },
    { date: "2026-06-21", label: "21/06", revenue: 800_000, profit: 180_000, orders: 5 },
  ],
  channelBreakdown: { retail: 1_000_000, wholesale: 500_000, total: 1_500_000 },
  kpis: {
    totalSkus: 12,
    totalValue: 4_000_000,
    lowStockCount: 1,
    expiringSoonCount: 0,
    pendingOrders: 2,
    allOrdersTotal: 10,
    pendingApprovals: 0,
    approvalByType: { Inbound: 0, Outbound: 0, Return: 0, Debt: 0 },
  },
  recentOrders: [],
  pendingApprovals: [],
  topCustomers: [],
  cashflow: { income: 1_500_000, expense: 400_000, net: 1_100_000 },
  lowStockAlerts: [],
}

describe("DashboardPage", () => {
  beforeEach(() => {
    dashboardApiMocks.getDashboard.mockReset()
    useAuthStore.setState({
      user: {
        id: 1,
        fullName: "Owner User",
        email: "owner@example.com",
        role: "Owner",
      },
      isAuthenticated: true,
    })
  })

  it("renders gross profit KPIs and defaults the chart to both series", async () => {
    dashboardApiMocks.getDashboard.mockResolvedValueOnce(dashboardData)

    renderWithProviders(<DashboardPage />)

    await waitFor(() =>
      expect(dashboardApiMocks.getDashboard).toHaveBeenCalledWith({
        trendDays: 7,
        recentLimit: 5,
        topCustomerLimit: 5,
        alertLimit: 5,
      }),
    )
    expect(await screen.findByText("Lãi gộp kỳ này")).toBeInTheDocument()
    expect(screen.getByText("Biên lãi gộp")).toBeInTheDocument()
    expect(screen.getAllByText(/300\.000/).length).toBeGreaterThan(0)
    expect(screen.getByText("20.0%")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Doanh thu" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Lãi gộp" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Cả hai" })).toBeInTheDocument()
    expect(screen.getByTestId("area-revenue")).toBeInTheDocument()
    expect(screen.getByTestId("area-profit")).toBeInTheDocument()
  })

  it("switches the chart to gross profit only", async () => {
    const user = userEvent.setup()
    dashboardApiMocks.getDashboard.mockResolvedValueOnce(dashboardData)

    renderWithProviders(<DashboardPage />)

    await screen.findByText("Lãi gộp kỳ này")
    await user.click(screen.getByRole("button", { name: "Lãi gộp" }))

    expect(screen.queryByTestId("area-revenue")).not.toBeInTheDocument()
    expect(screen.getByTestId("area-profit")).toBeInTheDocument()
  })

  it("keeps financial profit widgets hidden for non-financial roles", async () => {
    useAuthStore.setState({
      user: {
        id: 2,
        fullName: "Staff User",
        email: "staff@example.com",
        role: "Staff",
      },
      isAuthenticated: true,
    })
    dashboardApiMocks.getDashboard.mockResolvedValueOnce(dashboardData)

    renderWithProviders(<DashboardPage />)

    await waitFor(() => expect(dashboardApiMocks.getDashboard).toHaveBeenCalled())
    expect(screen.queryByText("Lãi gộp kỳ này")).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Cả hai" })).not.toBeInTheDocument()
  })
})
