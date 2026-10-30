// frontend/mini-erp/src/features/settings/pages/LogsPage.test.tsx
import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { PageTitleProvider } from "@/context/PageTitleContext"
import { LogsPage } from "./LogsPage"

const apiMocks = vi.hoisted(() => ({
  getSystemLogsList: vi.fn(),
}))

vi.mock("../api/systemLogsApi", () => ({
  getSystemLogsList: apiMocks.getSystemLogsList,
}))

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}))

const fixtureLogs = {
  items: [
    {
      id: 1,
      timestamp: "2026-06-15T10:00:00Z",
      user: "admin",
      action: "Create",
      module: "Products",
      description: "Tạo sản phẩm mới",
      severity: "Info",
      ipAddress: "192.168.1.1",
    },
    {
      id: 2,
      timestamp: "2026-06-15T11:00:00Z",
      user: "staff",
      action: "Delete",
      module: "Orders",
      description: "Xóa đơn hàng",
      severity: "Warning",
      ipAddress: null,
    },
    {
      id: 3,
      timestamp: "2026-06-15T12:00:00Z",
      user: "manager",
      action: "Update",
      module: "Inventory",
      description: "Cập nhật kho hàng",
      severity: "Error",
      ipAddress: "192.168.1.2",
    },
  ],
  page: 1,
  limit: 20,
  total: 3,
}

function renderPage() {
  return render(
    <PageTitleProvider>
      <LogsPage />
    </PageTitleProvider>,
  )
}

describe("LogsPage redesign", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    apiMocks.getSystemLogsList.mockResolvedValue(fixtureLogs)
  })

  it("clicking view button opens detail dialog with log description", async () => {
    const user = userEvent.setup()
    renderPage()

    await waitFor(() => expect(screen.queryByText("Đang tải...")).toBeNull())

    const viewButtons = screen.getAllByTitle("Chi tiết")
    await user.click(viewButtons[0])

    const dialog = screen.getByRole("dialog")
    expect(dialog).toBeInTheDocument()
    expect(within(dialog).getByText("Tạo sản phẩm mới")).toBeInTheDocument()
  })

  it("shows correct pagination info text", async () => {
    renderPage()

    await waitFor(() => expect(screen.queryByText("Đang tải...")).toBeNull())

    expect(screen.getByText(/Trang 1 \/ 1 · 3 bản ghi/)).toBeInTheDocument()
  })
})
