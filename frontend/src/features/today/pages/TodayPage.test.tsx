import type { ReactElement } from "react"
import { render, screen, waitFor } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { MemoryRouter } from "react-router-dom"
import { describe, expect, it, vi } from "vitest"

import { PageTitleProvider } from "@/context/PageTitleContext"
import type { TodayData } from "../todayViewModel"
import { TodayPage } from "./TodayPage"

const todayApiMocks = vi.hoisted(() => ({
  getToday: vi.fn(),
}))

vi.mock("../api/todayApi", () => ({
  getToday: todayApiMocks.getToday,
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

function makeToday(overrides: Partial<TodayData> = {}): TodayData {
  return {
    businessDate: "2026-06-20",
    money: {
      incomeToday: 1_200_000,
      expenseToday: 350_000,
      netToday: 850_000,
      cashflowMonthNet: 7_800_000,
    },
    actions: [
      {
        id: "debt-overdue-42",
        type: "DebtOverdue",
        severity: "High",
        title: "Thu no khach Nguyen Van A",
        subtitle: "Qua han 3 ngay",
        amount: 500_000,
        targetPath: "/cashflow/debt",
        actionLabel: "Ghi thu no",
      },
    ],
    debtHotlist: [
      {
        debtId: 42,
        debtCode: "NO-42",
        partnerType: "Customer",
        partnerName: "Nguyen Van A",
        remainingAmount: 500_000,
        dueDate: "2026-06-17",
        daysOverdue: 3,
        status: "Partial",
        targetPath: "/cashflow/debt",
      },
    ],
    inventoryNeeds: [
      {
        productId: 7,
        sku: "SKU-7",
        name: "Ca phe hat",
        quantity: 0,
        minQuantity: 5,
        level: "OUT_OF_STOCK",
        targetPath: "/inventory/stock?stockLevel=out_of_stock",
      },
      {
        productId: 8,
        sku: "SKU-8",
        name: "Tra tui loc",
        quantity: 20,
        minQuantity: 5,
        level: "STALE",
        targetPath: "/inventory/stock?status=stale-stock",
      },
    ],
    closeDay: {
      fundId: 1,
      status: "Open",
      expectedCash: 0,
      countedCash: null,
      variance: null,
    },
    ...overrides,
  }
}

describe("TodayPage", () => {
  it("renders the five daily operations sections from the Today API", async () => {
    todayApiMocks.getToday.mockResolvedValueOnce(makeToday())

    renderWithProviders(<TodayPage />)

    await waitFor(() => expect(todayApiMocks.getToday).toHaveBeenCalled())
    expect(await screen.findByRole("heading", { name: /Hôm nay/i })).toBeInTheDocument()
    expect(screen.getByText("Dòng tiền")).toBeInTheDocument()
    expect(screen.getByText("Hàng đợi hành động")).toBeInTheDocument()
    expect(screen.getByText("Công nợ cần xử lý")).toBeInTheDocument()
    expect(screen.getByText("Hàng tồn cần chú ý")).toBeInTheDocument()
    expect(screen.getByText("Chốt ngày")).toBeInTheDocument()
    expect(screen.getByText("Khẩn")).toBeInTheDocument()
    expect(screen.getByText("Đang mở")).toBeInTheDocument()
    expect(screen.getByText(/850\.000/)).toBeInTheDocument()
    expect(screen.queryAllByText("Bị ẩn theo quyền")).toHaveLength(0)
    expect(screen.getByText("Thu no khach Nguyen Van A")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /Ghi thu no/i })).toHaveAttribute("href", "/cashflow/debt")
    expect(screen.getByText(/Tồn lâu/)).toBeInTheDocument()
    expect(screen.getAllByRole("link", { name: /Xem tồn kho/i })).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ href: expect.stringContaining("/inventory/stock?stockLevel=out_of_stock") }),
        expect.objectContaining({ href: expect.stringContaining("/inventory/stock?status=stale-stock") }),
      ]),
    )
  })

  it("keeps operational sections visible when finance fields are hidden", async () => {
    todayApiMocks.getToday.mockResolvedValueOnce(
      makeToday({
        money: {
          incomeToday: null,
          expenseToday: null,
          netToday: null,
          cashflowMonthNet: null,
        },
        closeDay: {
          fundId: null,
          status: "Open",
          expectedCash: null,
          countedCash: null,
          variance: null,
        },
      }),
    )

    renderWithProviders(<TodayPage />)

    expect((await screen.findAllByText("Bị ẩn theo quyền")).length).toBeGreaterThan(0)
    expect(screen.getByText("Thu no khach Nguyen Van A")).toBeInTheDocument()
    expect(screen.getByText("Nguyen Van A")).toBeInTheDocument()
  })
})
