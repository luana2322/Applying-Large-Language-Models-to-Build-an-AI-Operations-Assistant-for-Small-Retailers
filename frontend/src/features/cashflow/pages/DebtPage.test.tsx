import type { ReactElement } from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { describe, expect, it, beforeEach, vi } from "vitest"

import { PageTitleProvider } from "@/context/PageTitleContext"
import type { Debt } from "../types"
import { DebtPage } from "./DebtPage"

const { toastErrorMock, postDebtMock, patchDebtMock } = vi.hoisted(() => ({
  toastErrorMock: vi.fn(),
  postDebtMock: vi.fn(),
  patchDebtMock: vi.fn(),
}))

let currentDebts: Debt[] = []

function makeDebt(overrides: Partial<Debt> = {}): Debt {
  return {
    id: 1,
    debtCode: "DEBT-001",
    partnerType: "Supplier",
    partnerName: "Nha cung cap A",
    customerId: null,
    supplierId: 7,
    totalAmount: 1_000_000,
    paidAmount: 200_000,
    remainingAmount: 800_000,
    dueDate: "2026-06-30",
    status: "Partial",
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

  const view = render(
    <QueryClientProvider client={queryClient}>
      <PageTitleProvider>{ui}</PageTitleProvider>
    </QueryClientProvider>,
  )

  return { ...view, queryClient }
}

vi.mock("sonner", () => ({
  toast: {
    error: toastErrorMock,
    success: vi.fn(),
  },
}))

vi.mock("../api/debtsApi", () => ({
  DEBTS_LIST_QUERY_KEY: ["debts", "list"],
  patchDebt: patchDebtMock,
  postDebt: postDebtMock,
}))

vi.mock("@/lib/api/toastApiError", () => ({
  toastApiError: vi.fn(),
}))

vi.mock("../hooks/useDebtsListQuery", () => ({
  useDebtsListQuery: () => ({
    debts: currentDebts,
    isError: false,
    error: null,
    isFetching: false,
    search: "",
    setSearch: vi.fn(),
    statusFilter: "all",
    setStatusFilter: vi.fn(),
    partnerTypeFilter: "all",
    setPartnerTypeFilter: vi.fn(),
    dueDateFrom: "",
    setDueDateFrom: vi.fn(),
    dueDateTo: "",
    setDueDateTo: vi.fn(),
    total: currentDebts.length,
    page: 1,
    totalPages: 1,
    setPage: vi.fn(),
  }),
}))

vi.mock("../components/DebtToolbar", () => ({
  DebtToolbar: ({ selectedIds, onAction }: { selectedIds: number[]; onAction: (action: string) => void }) => (
    <button type="button" onClick={() => onAction("repay")}>
      {`Ghi thanh toán (${selectedIds.length})`}
    </button>
  ),
}))

vi.mock("../components/DebtTable", () => ({
  DebtTable: ({
    data,
    selectedIds,
    onSelect,
  }: {
    data: Debt[]
    selectedIds: number[]
    onSelect: (id: number) => void
  }) => (
    <div>
      {data.map((item) => (
        <button
          key={item.id}
          type="button"
          data-testid={`select-${item.id}`}
          data-selected={selectedIds.includes(item.id) ? "yes" : "no"}
          onClick={() => onSelect(item.id)}
        >
          {item.debtCode}
        </button>
      ))}
    </div>
  ),
}))

vi.mock("../components/DebtDetailDialog", () => ({
  DebtDetailDialog: ({ debt, isOpen }: { debt: Debt | null; isOpen: boolean }) =>
    isOpen && debt ? (
      <div data-testid="debt-detail-dialog">
        <span>{debt.debtCode}</span>
        <span>{`remaining:${debt.remainingAmount}`}</span>
        <span>{`status:${debt.status}`}</span>
        <span>{`updatedAt:${debt.updatedAt}`}</span>
      </div>
    ) : null,
}))

vi.mock("../components/DebtFormDialog", () => ({
  DebtFormDialog: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="debt-form-dialog">form dialog</div> : null,
}))

describe("DebtPage", () => {
  beforeEach(() => {
    currentDebts = []
    toastErrorMock.mockReset()
    postDebtMock.mockReset()
    patchDebtMock.mockReset()
  })

  it("opens the detail dialog for one payable selected debt", async () => {
    currentDebts = [makeDebt()]
    const user = userEvent.setup()

    renderWithProviders(<DebtPage />)

    await user.click(screen.getByTestId("select-1"))
    expect(screen.getByRole("button", { name: "Ghi thanh toán (1)" })).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Ghi thanh toán (1)" }))

    expect(screen.getByTestId("debt-detail-dialog")).toHaveTextContent("DEBT-001")
    expect(screen.queryByTestId("debt-form-dialog")).not.toBeInTheDocument()
    expect(toastErrorMock).not.toHaveBeenCalled()
  })

  it("rejects settled debts from the toolbar payment flow", async () => {
    currentDebts = [
      makeDebt({
        id: 2,
        debtCode: "DEBT-SETTLED",
        status: "Cleared",
        remainingAmount: 0,
      }),
    ]
    const user = userEvent.setup()

    renderWithProviders(<DebtPage />)

    await user.click(screen.getByTestId("select-2"))
    await user.click(screen.getByRole("button", { name: "Ghi thanh toán (1)" }))

    expect(screen.queryByTestId("debt-detail-dialog")).not.toBeInTheDocument()
    expect(screen.queryByTestId("debt-form-dialog")).not.toBeInTheDocument()
    expect(toastErrorMock).toHaveBeenCalledWith("Khoản nợ này đã tất toán")
  })

  it("refreshes the open detail dialog when the selected debt data changes", async () => {
    currentDebts = [makeDebt()]
    const user = userEvent.setup()

    const view = renderWithProviders(<DebtPage />)

    await user.click(screen.getByTestId("select-1"))
    await user.click(screen.getByRole("button", { name: "Ghi thanh toán (1)" }))

    expect(screen.getByTestId("debt-detail-dialog")).toHaveTextContent("remaining:800000")
    expect(screen.getByTestId("debt-detail-dialog")).toHaveTextContent("status:Partial")
    expect(screen.getByTestId("debt-detail-dialog")).toHaveTextContent("updatedAt:2026-06-01T00:00:00Z")

    currentDebts = [
      makeDebt({
        remainingAmount: 150_000,
        paidAmount: 850_000,
        status: "Cleared",
        updatedAt: "2026-06-21T10:00:00Z",
      }),
    ]

    view.rerender(
      <QueryClientProvider
        client={view.queryClient}
      >
        <PageTitleProvider>
          <DebtPage />
        </PageTitleProvider>
      </QueryClientProvider>,
    )

    expect(screen.getByTestId("debt-detail-dialog")).toHaveTextContent("DEBT-001")
    expect(screen.getByTestId("debt-detail-dialog")).toHaveTextContent("remaining:150000")
    expect(screen.getByTestId("debt-detail-dialog")).toHaveTextContent("status:Cleared")
    expect(screen.getByTestId("debt-detail-dialog")).toHaveTextContent("updatedAt:2026-06-21T10:00:00Z")
  })
})
