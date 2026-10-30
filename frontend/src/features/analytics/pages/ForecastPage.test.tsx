import { render, screen, waitFor } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { describe, expect, it, vi } from "vitest"

import { PageTitleProvider } from "@/context/PageTitleContext"
import type { ForecastResponse } from "../types"
import { ForecastPage } from "./ForecastPage"

const analyticsApiMocks = vi.hoisted(() => ({
  getForecast: vi.fn(),
}))

vi.mock("../api/analyticsApi", () => ({
  getForecast: analyticsApiMocks.getForecast,
  getBusinessHealth: vi.fn().mockResolvedValue({
    inventory: { items: [] },
    debt: null,
    cashflow: null,
    inventoryHealth: { status: "HEALTHY", score: 95 },
    debtHealth: { status: "HIDDEN", score: 0 },
    cashflowHealth: { status: "HIDDEN", score: 0 },
    overall: { status: "HEALTHY", score: 95 },
    financialsVisible: false,
  }),
  getBusinessHealthAiSuggestions: vi.fn().mockResolvedValue({ suggestions: [] }),
}))

function renderWithProviders(ui: React.ReactElement) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={qc}>
      <PageTitleProvider>{ui}</PageTitleProvider>
    </QueryClientProvider>,
  )
}

const forecast: ForecastResponse = {
  items: [
    {
      productId: 7,
      skuCode: "SKU-007",
      productName: "Tra tui loc",
      currentQuantity: 3,
      minQuantity: 10,
      avgDailySales: 1.8,
      daysUntilStockout: 2,
      suggestedReorderQty: 54,
      urgencyLevel: "CRITICAL",
    },
  ],
}

describe("ForecastPage", () => {
  it("loads 30-day forecast rows and renders the reorder table", async () => {
    analyticsApiMocks.getForecast.mockResolvedValueOnce(forecast)

    renderWithProviders(<ForecastPage />)

    await waitFor(() => expect(analyticsApiMocks.getForecast).toHaveBeenCalledWith({ days: 30, limit: 50 }))
    expect(await screen.findByRole("heading", { name: "Sức khỏe & Dự báo" })).toBeInTheDocument()
    expect(screen.getByText("SKU-007")).toBeInTheDocument()
    expect(screen.getByText("Tra tui loc")).toBeInTheDocument()
    expect(screen.getByText("54")).toBeInTheDocument()
    expect(screen.getByText("Khẩn")).toBeInTheDocument()
  })

  it("renders demo forecast rows when the API fails", async () => {
    analyticsApiMocks.getForecast.mockRejectedValueOnce(new Error("INVALID_ENVELOPE"))

    renderWithProviders(<ForecastPage />)

    expect(await screen.findByText("DEMO-INV-001")).toBeInTheDocument()
    expect(screen.getByText("Cà phê rang xay Robusta 500g")).toBeInTheDocument()
    expect(screen.queryByText("Không tải được dữ liệu. Vui lòng thử lại.")).not.toBeInTheDocument()
  })
})
