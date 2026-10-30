import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import type { Employee } from "../../types"
import { RoleChangeConfirmDialog } from "../RoleChangeConfirmDialog"

const employee: Employee = {
  id: 1,
  employeeCode: "NV001",
  fullName: "Nguyễn Văn A",
  email: "a@test.com",
  phone: "090",
  role: "Staff",
  status: "Active",
  joinedDate: "2024-01-01",
}

describe("RoleChangeConfirmDialog", () => {
  it("shows preview and calls onConfirm", async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    render(
      <RoleChangeConfirmDialog
        open
        employee={employee}
        fromRole="Staff"
        toRole="Admin"
        targetPermissions={{ can_manage_staff: true }}
        loading={false}
        onConfirm={onConfirm}
        onCancel={vi.fn()}
      />,
    )
    expect(screen.getByText(/Xác nhận đổi vai trò/i)).toBeInTheDocument()
    expect(screen.getByText("Quản lý nhân viên")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: /Xác nhận/i }))
    expect(onConfirm).toHaveBeenCalledOnce()
  })
})
