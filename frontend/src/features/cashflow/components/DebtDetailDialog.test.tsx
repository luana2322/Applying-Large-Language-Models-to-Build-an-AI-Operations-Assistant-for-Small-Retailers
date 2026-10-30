import type { ReactElement } from "react"
import { render, screen } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { describe, expect, it, vi } from "vitest"

import type { Debt } from "../types"
import { DebtDetailDialog } from "./DebtDetailDialog"

const cashFundsState: { items: { id: number; code: string; name: string; isDefault: boolean; isActive: boolean }[] } = {
  items: [],
}

vi.mock("../hooks/useDebtPayments", () => ({
  useDebtPayments: () => ({ data: [], isPending: false, isFetching: false }),
  useCashFundsList: () => ({ data: cashFundsState, isPending: false }),
  useRecordDebtPayment: () => ({ mutateAsync: vi.fn(), isPending: false }),
}))

function makeDebt(overrides: Partial<Debt> = {}): Debt {
  return {
    id: 1,
    debtCode: "DEBT-001",
    partnerType: "Customer",
    partnerName: "Khach hang A",
    customerId: 5,
    supplierId: null,
    totalAmount: 1_000_000,
    paidAmount: 0,
    remainingAmount: 1_000_000,
    dueDate: "2026-06-30",
    status: "InDebt",
    notes: null,
    createdAt: "2026-06-01T00:00:00Z",
    updatedAt: "2026-06-01T00:00:00Z",
    ...overrides,
  }
}

function renderWithProviders(ui: ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>,
  )
}

describe("DebtDetailDialog", () => {
  it("shows Ghi thu no panel and history labels for customer debt", () => {
    renderWithProviders(
      <DebtDetailDialog
        debt={makeDebt({ partnerType: "Customer" })}
        isOpen={true}
        onClose={vi.fn()}
      />,
    )

    // Panel title + button both say "Ghi thu nợ" after implementation
    expect(screen.queryAllByText("Ghi thu nợ").length).toBeGreaterThan(0)
    // No "Ghi trả nợ" text should appear for customer
    expect(screen.queryAllByText("Ghi trả nợ")).toHaveLength(0)
    // History section heading is unique
    expect(screen.getByText("Lịch sử thu nợ")).toBeTruthy()
  })

  it("shows Ghi tra no panel and history labels for supplier debt", () => {
    renderWithProviders(
      <DebtDetailDialog
        debt={makeDebt({ partnerType: "Supplier", supplierId: 7, customerId: null })}
        isOpen={true}
        onClose={vi.fn()}
      />,
    )

    // Panel title + button both say "Ghi trả nợ" for supplier
    expect(screen.queryAllByText("Ghi trả nợ").length).toBeGreaterThan(0)
    expect(screen.getByText("Lịch sử trả nợ")).toBeTruthy()
  })

  it("constrains the Fund select to the grid column so long fund names do not overflow into the date field", () => {
    cashFundsState.items = [
      { id: 1, code: "QUY01", name: "Tiền mặt quỹ chính", isDefault: true, isActive: true },
    ]

    const { baseElement } = renderWithProviders(
      <DebtDetailDialog
        debt={makeDebt({ partnerType: "Supplier", supplierId: 7, customerId: null })}
        isOpen={true}
        onClose={vi.fn()}
      />,
    )

    const fundTrigger = baseElement.querySelector('[data-slot="select-trigger"]')
    expect(fundTrigger).toBeTruthy()
    expect((fundTrigger as HTMLElement).className).toMatch(/w-full/)
  })
})
