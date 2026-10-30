import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import { OrderToolbar } from "./OrderToolbar"

const defaultProps = {
  searchStr: "",
  onSearch: vi.fn(),
  statusFilter: "all",
  onStatusChange: vi.fn(),
  selectedIds: [],
  onAction: vi.fn(),
  variant: "retailHistory" as const,
  dateFrom: "",
  dateTo: "",
  onDateFromChange: vi.fn(),
  onDateToChange: vi.fn(),
  onStatusFilterChange: vi.fn(),
  paymentStatusFilter: "all" as const,
  onPaymentStatusFilterChange: vi.fn(),
}

describe("OrderToolbar — retailHistory variant", () => {
  it("renders search input", () => {
    render(<OrderToolbar {...defaultProps} />)
    expect(screen.getByPlaceholderText(/Tìm theo mã đơn/i)).toBeTruthy()
  })

  it("renders Trạng thái select with default 'Tất cả'", () => {
    render(<OrderToolbar {...defaultProps} />)
    const selects = screen.getAllByRole("combobox")
    const statusSelect = selects.find(
      (s) => (s as HTMLSelectElement).value === "all"
    )
    expect(statusSelect).toBeTruthy()
  })

  it("renders Thanh toán select", () => {
    render(<OrderToolbar {...defaultProps} />)
    const selects = screen.getAllByRole("combobox")
    // Phải có ít nhất 2 select (status + payment)
    expect(selects.length).toBeGreaterThanOrEqual(2)
  })

  it("calls onStatusFilterChange when Trạng thái changed", () => {
    const onStatusFilterChange = vi.fn()
    render(<OrderToolbar {...defaultProps} onStatusFilterChange={onStatusFilterChange} />)
    const selects = screen.getAllByRole("combobox")
    fireEvent.change(selects[0], { target: { value: "Delivered" } })
    expect(onStatusFilterChange).toHaveBeenCalledWith("Delivered")
  })

  it("calls onPaymentStatusFilterChange when Thanh toán changed", () => {
    const onPaymentStatusFilterChange = vi.fn()
    render(<OrderToolbar {...defaultProps} onPaymentStatusFilterChange={onPaymentStatusFilterChange} />)
    const selects = screen.getAllByRole("combobox")
    fireEvent.change(selects[1], { target: { value: "Paid" } })
    expect(onPaymentStatusFilterChange).toHaveBeenCalledWith("Paid")
  })

  it("does NOT render pill buttons", () => {
    render(<OrderToolbar {...defaultProps} />)
    // Pill buttons (rounded-full) không còn tồn tại
    const buttons = screen.queryAllByRole("button")
    // Không có button nào với text "Hoàn thành", "Đã huỷ", "Đã TT", "Chưa TT", "Một phần"
    const pillTexts = ["Hoàn thành", "Đã huỷ", "Đã TT", "Chưa TT", "Một phần"]
    for (const text of pillTexts) {
      expect(buttons.find((b) => b.textContent === text)).toBeUndefined()
    }
  })
})
