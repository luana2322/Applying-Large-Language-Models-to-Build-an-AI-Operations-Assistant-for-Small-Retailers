// frontend/mini-erp/src/features/settings/pages/AlertSettingsPage.test.tsx
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { PageTitleProvider } from "@/context/PageTitleContext"
import { AlertSettingsPage } from "./AlertSettingsPage"

const apiMocks = vi.hoisted(() => ({
  getAlertSettingsList: vi.fn(),
  patchAlertSetting: vi.fn(),
  postCreateAlertSetting: vi.fn(),
}))

vi.mock("../api/alertSettingsApi", () => ({
  getAlertSettingsList: apiMocks.getAlertSettingsList,
  patchAlertSetting: apiMocks.patchAlertSetting,
  postCreateAlertSetting: apiMocks.postCreateAlertSetting,
}))

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}))

// Fixture: LowStock ON, HighValueTransaction ON (threshold=80_000_000), PartnerDebtDueSoon OFF
const fixtureItems = [
  {
    id: 1,
    alertType: "LowStock",
    isEnabled: true,
    thresholdValue: null,
    channel: "App",
    frequency: "Realtime",
    updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: 2,
    alertType: "HighValueTransaction",
    isEnabled: true,
    thresholdValue: 80_000_000,
    channel: "App",
    frequency: "Realtime",
    updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: 3,
    alertType: "PartnerDebtDueSoon",
    isEnabled: false,
    thresholdValue: 3,
    channel: "App",
    frequency: "Realtime",
    updatedAt: "2026-01-01T00:00:00Z",
  },
]

function renderPage() {
  return render(
    <PageTitleProvider>
      <AlertSettingsPage />
    </PageTitleProvider>,
  )
}

describe("AlertSettingsPage redesign", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    apiMocks.getAlertSettingsList.mockResolvedValue({ items: fixtureItems })
    apiMocks.patchAlertSetting.mockResolvedValue(fixtureItems[0])
    apiMocks.postCreateAlertSetting.mockResolvedValue(fixtureItems[0])
  })

  it("does not render any Xóa button after data loads", async () => {
    renderPage()

    await waitFor(() =>
      expect(screen.getByText("Cảnh báo sắp hết hàng")).toBeInTheDocument(),
    )

    expect(screen.queryByRole("button", { name: /xóa/i })).toBeNull()
  })

  it("threshold input visible when largeTransaction switch ON, hidden when toggled OFF", async () => {
    const user = userEvent.setup()
    renderPage()

    await waitFor(() =>
      expect(screen.getByText("Giao dịch giá trị lớn")).toBeInTheDocument(),
    )

    // HighValueTransaction is ON → threshold input (80000000) is visible
    expect(screen.getByDisplayValue("80000000")).toBeInTheDocument()

    // Switch order: LowStock(0), OverStock(1), NewOrder(2), LargeTransaction(3), DebtDue(4), SystemError(5)
    const switches = screen.getAllByRole("switch")
    await user.click(switches[3]) // toggle largeTransaction OFF

    expect(screen.queryByDisplayValue("80000000")).toBeNull()
  })

  it("debtDueDays input hidden when debtDue OFF, visible when toggled ON", async () => {
    const user = userEvent.setup()
    renderPage()

    await waitFor(() =>
      expect(screen.getByText("Nhắc nợ đến hạn")).toBeInTheDocument(),
    )

    // PartnerDebtDueSoon is OFF → debtDueDays input hidden
    expect(screen.queryByDisplayValue("3")).toBeNull()

    // Switch order: LowStock(0), OverStock(1), NewOrder(2), LargeTransaction(3), DebtDue(4), SystemError(5)
    const switches = screen.getAllByRole("switch")
    await user.click(switches[4]) // toggle debtDue ON

    expect(screen.getByDisplayValue("3")).toBeInTheDocument()
  })

  it("renders Lưu cấu hình button", async () => {
    renderPage()

    await waitFor(() =>
      expect(screen.getByText("Cảnh báo sắp hết hàng")).toBeInTheDocument(),
    )

    expect(
      screen.getByRole("button", { name: /lưu cấu hình/i }),
    ).toBeInTheDocument()
  })
})
