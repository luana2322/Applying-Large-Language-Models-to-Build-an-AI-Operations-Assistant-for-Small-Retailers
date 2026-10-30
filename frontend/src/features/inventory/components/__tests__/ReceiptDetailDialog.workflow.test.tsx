/** @vitest-environment jsdom */
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("../../api/stockReceiptsApi", async () => {
  const actual = await vi.importActual<typeof import("../../api/stockReceiptsApi")>(
    "../../api/stockReceiptsApi"
  )
  return {
    ...actual,
    markReceivedStockReceipt: vi.fn(),
    ownerAcceptStockReceipt: vi.fn(),
  }
})

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

import { ReceiptDetailDialog } from "../ReceiptDetailDialog"
import { mockStockReceipts } from "../../mockData"
import {
  markReceivedStockReceipt,
  ownerAcceptStockReceipt,
} from "../../api/stockReceiptsApi"

const approvedReceipt = { ...mockStockReceipts[0], status: "Approved" as const, id: 1 }
const receivedReceipt = { ...mockStockReceipts[0], status: "Received" as const, id: 2 }

describe("ReceiptDetailDialog — workflow sau duyệt", () => {
  const mockOnClose = vi.fn()
  const mockOnAfterApprove = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("hiển thị button 'Xác nhận đã nhận hàng' khi status=Approved + canMarkReceived=true", () => {
    render(
      <ReceiptDetailDialog
        receipt={approvedReceipt}
        isOpen={true}
        onClose={mockOnClose}
        canMarkReceived={true}
        canOwnerAccept={false}
        onAfterApprove={mockOnAfterApprove}
      />
    )
    expect(screen.getByTestId("mark-received-btn")).toBeInTheDocument()
    expect(screen.queryByTestId("owner-accept-btn")).not.toBeInTheDocument()
  })

  it("ẨN button khi canMarkReceived=false", () => {
    render(
      <ReceiptDetailDialog
        receipt={approvedReceipt}
        isOpen={true}
        onClose={mockOnClose}
        canMarkReceived={false}
        canOwnerAccept={false}
        onAfterApprove={mockOnAfterApprove}
      />
    )
    expect(screen.queryByTestId("mark-received-btn")).not.toBeInTheDocument()
  })

  it("hiển thị button 'Owner chốt' khi status=Received + canOwnerAccept=true", () => {
    render(
      <ReceiptDetailDialog
        receipt={receivedReceipt}
        isOpen={true}
        onClose={mockOnClose}
        canMarkReceived={false}
        canOwnerAccept={true}
        onAfterApprove={mockOnAfterApprove}
      />
    )
    expect(screen.getByTestId("owner-accept-btn")).toBeInTheDocument()
    expect(screen.queryByTestId("mark-received-btn")).not.toBeInTheDocument()
  })

  it("Click 'Xác nhận đã nhận hàng' gọi markReceivedStockReceipt + close dialog", async () => {
    vi.mocked(markReceivedStockReceipt).mockResolvedValueOnce(approvedReceipt as never)

    render(
      <ReceiptDetailDialog
        receipt={approvedReceipt}
        isOpen={true}
        onClose={mockOnClose}
        canMarkReceived={true}
        canOwnerAccept={false}
        onAfterApprove={mockOnAfterApprove}
      />
    )
    fireEvent.click(screen.getByTestId("mark-received-btn"))

    await waitFor(() => {
      expect(markReceivedStockReceipt).toHaveBeenCalledWith(1)
      expect(mockOnAfterApprove).toHaveBeenCalledWith(1)
      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  it("Click 'Owner chốt' gọi ownerAcceptStockReceipt + close dialog", async () => {
    vi.mocked(ownerAcceptStockReceipt).mockResolvedValueOnce(receivedReceipt as never)

    render(
      <ReceiptDetailDialog
        receipt={receivedReceipt}
        isOpen={true}
        onClose={mockOnClose}
        canMarkReceived={false}
        canOwnerAccept={true}
        onAfterApprove={mockOnAfterApprove}
      />
    )
    fireEvent.click(screen.getByTestId("owner-accept-btn"))

    await waitFor(() => {
      expect(ownerAcceptStockReceipt).toHaveBeenCalledWith(2)
      expect(mockOnAfterApprove).toHaveBeenCalledWith(2)
      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  it("Hiển thị toast error và KHÔNG close khi API throw", async () => {
    const { toast } = await import("sonner")
    vi.mocked(markReceivedStockReceipt).mockRejectedValueOnce(new Error("Network error"))

    render(
      <ReceiptDetailDialog
        receipt={approvedReceipt}
        isOpen={true}
        onClose={mockOnClose}
        canMarkReceived={true}
        canOwnerAccept={false}
        onAfterApprove={mockOnAfterApprove}
      />
    )
    fireEvent.click(screen.getByTestId("mark-received-btn"))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled()
      expect(mockOnClose).not.toHaveBeenCalled()
    })
  })
})
