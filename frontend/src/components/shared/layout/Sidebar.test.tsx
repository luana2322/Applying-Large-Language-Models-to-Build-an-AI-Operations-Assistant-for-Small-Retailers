import { render, screen, waitFor } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { describe, expect, it, vi } from "vitest"

import { Sidebar } from "./Sidebar"

const menuPermissions = {
  can_view_dashboard: false,
  can_use_ai: false,
  can_manage_inventory: false,
  can_manage_products: false,
  can_manage_customers: false,
  can_manage_orders: false,
  can_approve: false,
  can_view_finance: true,
  can_manage_staff: false,
  can_configure_alerts: false,
  can_manage_custom_builder: false,
  can_use_custom_entities: false,
}

vi.mock("@/features/auth/store/useAuthStore", () => ({
  useAuthStore: (selector: (state: unknown) => unknown) =>
    selector({
      user: { role: "Admin" },
      menuPermissions,
      logout: vi.fn(),
    }),
}))

vi.mock("@/features/custom-builder/api/customInterfaceApi", () => ({
  getRuntimeCustomMenu: vi.fn().mockResolvedValue({ folders: [] }),
}))

describe("Sidebar analytics navigation", () => {
  it("shows the finance-gated analytics section and forecast link", async () => {
    render(
      <MemoryRouter initialEntries={["/analytics/forecast"]}>
        <Sidebar />
      </MemoryRouter>,
    )

    expect(await screen.findByText("Báo cáo")).toBeInTheDocument()
    await waitFor(() => expect(screen.getByText("Sức khỏe & Dự báo")).toBeInTheDocument())
    expect(screen.getByText("Doanh thu & Lợi nhuận")).toBeInTheDocument()
    expect(screen.getByText("Sản phẩm bán chạy")).toBeInTheDocument()
  })
})
