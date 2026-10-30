import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import { TransactionToolbar } from "./TransactionToolbar"

const defaultProps = {
  searchStr: "",
  onSearch: vi.fn(),
  statusFilter: "all",
  onStatusChange: vi.fn(),
  typeFilter: "all",
  onTypeChange: vi.fn(),
  dateFrom: "",
  dateTo: "",
  onDateFromChange: vi.fn(),
  onDateToChange: vi.fn(),
  selectedIds: [],
  onAction: vi.fn(),
}

describe("TransactionToolbar", () => {
  it("renders search input", () => {
    render(<TransactionToolbar {...defaultProps} />)
    expect(screen.getByPlaceholderText(/Tìm theo mã giao dịch/i)).toBeTruthy()
  })

  it("renders Loại select", () => {
    render(<TransactionToolbar {...defaultProps} />)
    const selects = screen.getAllByRole("combobox")
    expect(selects.length).toBeGreaterThanOrEqual(2)
  })

  it("renders Trạng thái select", () => {
    render(<TransactionToolbar {...defaultProps} />)
    const selects = screen.getAllByRole("combobox")
    expect(selects.length).toBeGreaterThanOrEqual(2)
  })

  it("calls onTypeChange when Loại changed", () => {
    const onTypeChange = vi.fn()
    render(<TransactionToolbar {...defaultProps} onTypeChange={onTypeChange} />)
    const selects = screen.getAllByRole("combobox")
    fireEvent.change(selects[0], { target: { value: "Income" } })
    expect(onTypeChange).toHaveBeenCalledWith("Income")
  })

  it("calls onStatusChange when Trạng thái changed", () => {
    const onStatusChange = vi.fn()
    render(<TransactionToolbar {...defaultProps} onStatusChange={onStatusChange} />)
    const selects = screen.getAllByRole("combobox")
    fireEvent.change(selects[1], { target: { value: "Completed" } })
    expect(onStatusChange).toHaveBeenCalledWith("Completed")
  })

  it("renders Tạo phiếu button when no selection", () => {
    render(<TransactionToolbar {...defaultProps} selectedIds={[]} />)
    expect(screen.getByText(/Tạo phiếu/i)).toBeTruthy()
  })

  it("renders Sửa and Xoá buttons when items selected", () => {
    render(<TransactionToolbar {...defaultProps} selectedIds={[1, 2]} />)
    expect(screen.getByText(/Sửa/i)).toBeTruthy()
    expect(screen.getByText(/Xoá/i)).toBeTruthy()
  })

  it("does NOT render PillGroup buttons", () => {
    render(<TransactionToolbar {...defaultProps} />)
    const pillTexts = ["Thu tiền", "Chi tiền", "Hoàn thành", "Chờ xử lý", "Đã huỷ"]
    for (const text of pillTexts) {
      // Không được tìm thấy là button — nếu tìm thấy trong select option thì OK
      const buttons = screen.queryAllByRole("button")
      expect(buttons.find((b) => b.textContent?.trim() === text)).toBeUndefined()
    }
  })
})
