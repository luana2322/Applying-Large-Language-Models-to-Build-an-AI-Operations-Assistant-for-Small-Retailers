import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { describe, expect, it, vi } from "vitest"
import { DailyCloseDialog } from "./DailyCloseDialog"

const toastSuccess = vi.fn()
const toastError = vi.fn()

vi.mock("sonner", () => ({
  toast: { success: (...args: unknown[]) => toastSuccess(...args), error: (...args: unknown[]) => toastError(...args) },
}))

const getDailyClose = vi.fn()
const closeDailyCash = vi.fn()

vi.mock("../api/dailyCashClosingsApi", () => ({
  DAILY_CASH_CLOSE_QUERY_KEY: ["cashflow", "daily-close"],
  getDailyClose: (...args: unknown[]) => getDailyClose(...args),
  closeDailyCash: (...args: unknown[]) => closeDailyCash(...args),
}))

const fundOptions = [{ id: 1, code: "QUY01", name: "Quỹ chính", isDefault: true, isActive: true }]

function renderDialog(onClose = vi.fn()) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <DailyCloseDialog
        isOpen
        onClose={onClose}
        fundOptions={fundOptions}
        defaultFundId={1}
        businessDate="2026-06-20"
      />
    </QueryClientProvider>,
  )
}

describe("DailyCloseDialog", () => {
  it("shows expected cash from the preview query and submits counted cash + notes", async () => {
    getDailyClose.mockResolvedValue({
      id: null,
      fundId: 1,
      businessDate: "2026-06-20",
      expectedCash: 400000,
      countedCash: null,
      variance: null,
      notes: null,
      status: "Open",
      closedBy: null,
      closedAt: null,
    })
    closeDailyCash.mockResolvedValue({
      id: 10,
      fundId: 1,
      businessDate: "2026-06-20",
      expectedCash: 400000,
      countedCash: 390000,
      variance: -10000,
      notes: "Thiếu tiền lẻ",
      status: "Closed",
      closedBy: 1,
      closedAt: "2026-06-20T10:00:00Z",
    })

    const user = userEvent.setup()
    renderDialog()

    await waitFor(() => expect(screen.getByText(/400.000/)).toBeTruthy())

    await user.type(screen.getByLabelText(/Tiền kiểm đếm/i), "390000")
    await user.type(screen.getByLabelText(/Ghi chú/i), "Thiếu tiền lẻ")
    await user.click(screen.getByRole("button", { name: /Chốt ngày/i }))

    await waitFor(() =>
      expect(closeDailyCash).toHaveBeenCalledWith({
        fundId: 1,
        businessDate: "2026-06-20",
        countedCash: 390000,
        notes: "Thiếu tiền lẻ",
      }),
    )
    await waitFor(() => expect(screen.getByText(/-10.000/)).toBeTruthy())
  })
})
