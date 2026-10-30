import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { RolePermissionPreview } from "../RolePermissionPreview"

describe("RolePermissionPreview", () => {
  it("renders enabled permissions with Vietnamese labels", () => {
    render(
      <RolePermissionPreview
        roleName="Admin"
        permissions={{ can_manage_staff: true, can_view_dashboard: true, can_use_ai: false }}
      />,
    )
    expect(screen.getByText(/Quyền của Admin/i)).toBeInTheDocument()
    expect(screen.getByText("Quản lý nhân viên")).toBeInTheDocument()
    expect(screen.getByText("Xem tổng quan")).toBeInTheDocument()
    expect(screen.queryByText("Sử dụng AI")).not.toBeInTheDocument()
  })

  it("shows empty state when no permissions enabled", () => {
    render(<RolePermissionPreview roleName="Staff" permissions={{}} />)
    expect(screen.getByText(/Không có quyền nào được bật/i)).toBeInTheDocument()
  })
})
