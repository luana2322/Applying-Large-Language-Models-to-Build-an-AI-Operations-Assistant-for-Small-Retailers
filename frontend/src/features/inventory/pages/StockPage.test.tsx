import type { ReactElement } from "react"
import { render, waitFor } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { MemoryRouter } from "react-router-dom"
import { StockPage } from "./StockPage"
import { beforeEach, describe, it, expect, vi } from "vitest"
import { PageTitleProvider } from "@/context/PageTitleContext"
import { getInventoryList } from "../api/inventoryApi"

const inventoryApiMocks = vi.hoisted(() => {
  const emptySummary = {
    totalSkus: 0,
    totalValue: 0,
    lowStockCount: 0,
    expiringSoonCount: 0,
  }
  const emptyListPage = {
    summary: emptySummary,
    items: [] as [],
    page: 1,
    limit: 20,
    total: 0,
  }
  return { emptySummary, emptyListPage }
})

vi.mock("../api/inventoryApi", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../api/inventoryApi")>()
  const { emptySummary, emptyListPage } = inventoryApiMocks
  return {
    ...actual,
    getInventoryList: vi.fn().mockResolvedValue(emptyListPage),
    getInventorySummary: vi.fn().mockResolvedValue(emptySummary),
  }
})

vi.mock("../api/stockReceiptsApi", () => ({
  postStockReceipt: vi.fn(),
}))

vi.mock("../api/dispatchApi", () => ({
  postStockDispatch: vi.fn(),
}))

function renderWithProviders(ui: ReactElement, route = "/inventory/stock") {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={[route]}>
        <PageTitleProvider>{ui}</PageTitleProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

// Mock IntersectionObserver
vi.stubGlobal("IntersectionObserver", class {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
})

// Mock components to simplify
vi.mock("../components/StockToolbar", () => ({
  StockToolbar: ({ status }: { status: string }) => <div data-testid="stock-toolbar" data-status={status} />,
}))

vi.mock("../components/StockBatchDetailsDialog", () => ({
  StockBatchDetailsDialog: () => <div data-testid="stock-batch-dialog" />,
}))

describe("StockPage Layout Test", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("initializes out-of-stock filter from Today stockLevel link", async () => {
    renderWithProviders(<StockPage />, "/inventory/stock?stockLevel=out_of_stock")

    await waitFor(() => {
      expect(document.querySelector("[data-testid='stock-toolbar']")?.getAttribute("data-status")).toBe("out-of-stock")
    })
    await waitFor(() => {
      expect(getInventoryList).toHaveBeenCalledWith(
        expect.objectContaining({ stockLevel: "out_of_stock" }),
      )
    })
  })

  it("initializes stale stock filter from Today status link", async () => {
    renderWithProviders(<StockPage />, "/inventory/stock?status=stale-stock")

    await waitFor(() => {
      expect(document.querySelector("[data-testid='stock-toolbar']")?.getAttribute("data-status")).toBe("stale-stock")
    })
    await waitFor(() => {
      expect(getInventoryList).toHaveBeenCalledWith(
        expect.objectContaining({ stockLevel: "all" }),
      )
    })
  })

  it("should render one scrollable stock table (thead + tbody aligned)", async () => {
    const { container } = renderWithProviders(<StockPage />)

    const mainContainer = container.firstChild as HTMLElement
    expect(mainContainer.className).toContain("h-full")
    expect(mainContainer.className).toContain("flex-col")

    await waitFor(() => {
      const tableWrapper = container.querySelector(".shadow-md.rounded-xl")
      expect(tableWrapper).toBeTruthy()
      const scroll = tableWrapper?.querySelector(".overflow-y-auto")
      expect(scroll).toBeTruthy()
      expect(scroll?.querySelector("thead")).toBeTruthy()
      expect(scroll?.querySelector('[data-testid="stock-table"]')).toBeTruthy()
    })
  })

  // AC3: Filter bar should NOT have shadow-sm
  it("should have filter bar without shadow", () => {
    const { container } = renderWithProviders(<StockPage />)
    
    // Filter Bar is the 3rd child (after Header section and KPI section)
    // It should be a div with class "bg-white border border-slate-200 rounded-lg p-4 shrink-0"
    // We look for a div that has BOTH border-slate-200 and rounded-lg but NO shadow
    const allDivs = container.querySelectorAll('div');
    const filterBar = Array.from(allDivs).find(div => 
      div.className.includes('border-slate-200') && 
      div.className.includes('rounded-lg') &&
      !div.className.includes('shadow') &&
      div.className.includes('p-4')
    );
    
    expect(filterBar).toBeTruthy();
  })
})
