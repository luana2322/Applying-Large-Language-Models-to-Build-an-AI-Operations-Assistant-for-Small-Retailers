/** @vitest-environment jsdom */
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("../../api/dispatchApi", async () => {
  const actual = await vi.importActual<typeof import("../../api/dispatchApi")>(
    "../../api/dispatchApi"
  )
  return {
    ...actual,
    markPreparingStockDispatch: vi.fn(),
    markDispatchedStockDispatch: vi.fn(),
    markDeliveredStockDispatch: vi.fn(),
    markDoneStockDispatch: vi.fn(),
  }
})

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

import { DispatchDetailDialog } from "../DispatchDetailDialog"
import { mockStockDispatchs } from "../../mockData"
import {
  markPreparingStockDispatch,
  markDispatchedStockDispatch,
  markDeliveredStockDispatch,
  markDoneStockDispatch,
} from "../../api/dispatchApi"

const baseDispatch = { ...mockStockDispatchs[0], id: 1, manualDispatch: true }

describe("DispatchDetailDialog — workflow manual", () => {
  const mockOnClose = vi.fn()
  const mockOnAfterWorkflowAction = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("hiển thị 'Bắt đầu chuẩn bị' khi status=Approved + canMarkPreparing", () => {
    render(
      <DispatchDetailDialog
        dispatch={{ ...baseDispatch, status: "Approved" }}
        isOpen={true}
        onClose={mockOnClose}
        isManual={true}
        canMarkPreparing={true}
        onAfterWorkflowAction={mockOnAfterWorkflowAction}
      />
    )
    expect(screen.getByTestId("mark-preparing-btn")).toBeInTheDocument()
  })

  it("hiển thị 'Đã xuất kho' khi status=Preparing + canMarkDispatched", () => {
    render(
      <DispatchDetailDialog
        dispatch={{ ...baseDispatch, status: "Preparing" }}
        isOpen={true}
        onClose={mockOnClose}
        isManual={true}
        canMarkDispatched={true}
        onAfterWorkflowAction={mockOnAfterWorkflowAction}
      />
    )
    expect(screen.getByTestId("mark-dispatched-btn")).toBeInTheDocument()
  })

  it("hiển thị 'Đã giao hàng' khi status=Dispatched + canMarkDelivered", () => {
    render(
      <DispatchDetailDialog
        dispatch={{ ...baseDispatch, status: "Dispatched" }}
        isOpen={true}
        onClose={mockOnClose}
        isManual={true}
        canMarkDelivered={true}
        onAfterWorkflowAction={mockOnAfterWorkflowAction}
      />
    )
    expect(screen.getByTestId("mark-delivered-btn")).toBeInTheDocument()
  })

  it("hiển thị 'Hoàn tất' khi status=Delivered + canMarkDone", () => {
    render(
      <DispatchDetailDialog
        dispatch={{ ...baseDispatch, status: "Delivered" }}
        isOpen={true}
        onClose={mockOnClose}
        isManual={true}
        canMarkDone={true}
        onAfterWorkflowAction={mockOnAfterWorkflowAction}
      />
    )
    expect(screen.getByTestId("mark-done-btn")).toBeInTheDocument()
  })

  it("KHÔNG hiển thị button workflow khi isManual=false", () => {
    render(
      <DispatchDetailDialog
        dispatch={{ ...baseDispatch, status: "Approved", manualDispatch: false }}
        isOpen={true}
        onClose={mockOnClose}
        isManual={false}
        canMarkPreparing={true}
        onAfterWorkflowAction={mockOnAfterWorkflowAction}
      />
    )
    expect(screen.queryByTestId("mark-preparing-btn")).not.toBeInTheDocument()
  })

  it("Click 'Bắt đầu chuẩn bị' gọi markPreparingStockDispatch + close", async () => {
    vi.mocked(markPreparingStockDispatch).mockResolvedValueOnce(baseDispatch as never)

    render(
      <DispatchDetailDialog
        dispatch={{ ...baseDispatch, status: "Approved" }}
        isOpen={true}
        onClose={mockOnClose}
        isManual={true}
        canMarkPreparing={true}
        onAfterWorkflowAction={mockOnAfterWorkflowAction}
      />
    )
    fireEvent.click(screen.getByTestId("mark-preparing-btn"))

    await waitFor(() => {
      expect(markPreparingStockDispatch).toHaveBeenCalledWith(1)
      expect(mockOnAfterWorkflowAction).toHaveBeenCalled()
      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  it("Click 'Đã giao hàng' gọi markDeliveredStockDispatch + close", async () => {
    vi.mocked(markDeliveredStockDispatch).mockResolvedValueOnce(baseDispatch as never)
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true)

    render(
      <DispatchDetailDialog
        dispatch={{ ...baseDispatch, status: "Dispatched" }}
        isOpen={true}
        onClose={mockOnClose}
        isManual={true}
        canMarkDelivered={true}
        onAfterWorkflowAction={mockOnAfterWorkflowAction}
      />
    )
    fireEvent.click(screen.getByTestId("mark-delivered-btn"))

    await waitFor(() => {
      expect(confirmSpy).toHaveBeenCalled()
      expect(markDeliveredStockDispatch).toHaveBeenCalledWith(1)
      expect(mockOnAfterWorkflowAction).toHaveBeenCalled()
      expect(mockOnClose).toHaveBeenCalled()
    })
  })
})
