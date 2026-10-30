import { render, screen, waitFor } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { describe, expect, it, vi } from "vitest"

import type { BusinessHealth, BusinessInsights } from "../types"
import { BusinessHealthInsights } from "./BusinessHealthInsights"

const analyticsApiMocks = vi.hoisted(() => ({
  getBusinessHealth: vi.fn(),
  getBusinessHealthAiSuggestions: vi.fn(),
}))

vi.mock("../api/analyticsApi", () => ({
  getBusinessHealth: analyticsApiMocks.getBusinessHealth,
  getBusinessHealthAiSuggestions: analyticsApiMocks.getBusinessHealthAiSuggestions,
}))

function renderWithQueryClient(ui: React.ReactElement) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>)
}

const businessHealth: BusinessHealth = {
  inventory: {
    items: [
      {
        productId: 1,
        skuCode: "SKU-001",
        productName: "Ca phe hat",
        currentQuantity: 0,
        minQuantity: 5,
        avgDailySales: 2.5,
        daysUntilStockout: 0,
        suggestedReorderQty: 75,
        urgencyLevel: "CRITICAL",
      },
    ],
  },
  debt: {
    receivableTotal: 2_000_000,
    payableTotal: 500_000,
    receivableOverdue: 700_000,
    payableOverdue: 0,
    overdueCount: 1,
    topOverdue: [],
  },
  cashflow: {
    currentBalance: 10_000_000,
    monthIncome: 4_000_000,
    monthExpense: 1_500_000,
    monthNet: 2_500_000,
    lastMonthNet: 1_200_000,
    status: "HEALTHY",
  },
  inventoryHealth: { status: "CRITICAL", score: 40 },
  debtHealth: { status: "WARNING", score: 65 },
  cashflowHealth: { status: "HEALTHY", score: 90 },
  overall: { status: "WARNING", score: 70 },
  financialsVisible: true,
}

const insights: BusinessInsights = {
  suggestions: [
    {
      category: "inventory",
      severity: "high",
      text: "Nhap hang SKU-001 truoc khi het ban.",
    },
  ],
}

describe("BusinessHealthInsights", () => {
  it("renders health cards and requests AI suggestions with the loaded snapshot", async () => {
    analyticsApiMocks.getBusinessHealth.mockResolvedValueOnce(businessHealth)
    analyticsApiMocks.getBusinessHealthAiSuggestions.mockResolvedValueOnce(insights)

    renderWithQueryClient(<BusinessHealthInsights />)

    expect(screen.getByText("Tồn kho")).toBeInTheDocument()
    expect(await screen.findByText("1 mặt hàng khẩn")).toBeInTheDocument()
    expect(screen.getByText(/Quá hạn: 700\.000/)).toBeInTheDocument()
    expect(screen.getByText(/Ròng tháng: 2\.500\.000/)).toBeInTheDocument()
    expect(await screen.findByText("Nhap hang SKU-001 truoc khi het ban.")).toBeInTheDocument()

    await waitFor(() =>
      expect(analyticsApiMocks.getBusinessHealthAiSuggestions).toHaveBeenCalledWith(businessHealth),
    )
  })

  it("shows demo business-health data when the API cannot be parsed", async () => {
    analyticsApiMocks.getBusinessHealth.mockRejectedValueOnce(new Error("INVALID_ENVELOPE"))
    analyticsApiMocks.getBusinessHealthAiSuggestions.mockRejectedValueOnce(new Error("INVALID_ENVELOPE"))

    renderWithQueryClient(<BusinessHealthInsights />)

    expect(await screen.findByText("2 mặt hàng khẩn")).toBeInTheDocument()
    expect(screen.getByText(/Quá hạn: 8\.500\.000/)).toBeInTheDocument()
    expect(screen.getByText(/Ròng tháng: 18\.000\.000/)).toBeInTheDocument()
    expect(screen.getByText(/Nhập bổ sung Cà phê rang xay Robusta/)).toBeInTheDocument()
    expect(screen.queryByText("Không tải được dữ liệu sức khỏe kinh doanh.")).not.toBeInTheDocument()
  })
})
