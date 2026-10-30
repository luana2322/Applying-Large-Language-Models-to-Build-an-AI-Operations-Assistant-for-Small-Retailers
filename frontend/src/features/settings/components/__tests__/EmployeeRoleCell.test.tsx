import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import type { RoleItemData } from "../../api/usersApi"
import type { Employee } from "../../types"
import { EmployeeRoleCell } from "../EmployeeRoleCell"

const catalog: RoleItemData[] = [
  { id: 3, name: "Admin", permissions: { can_manage_staff: true } },
  { id: 2, name: "Staff", permissions: {} },
]

const employee: Employee = {
  id: 1,
  employeeCode: "NV001",
  fullName: "Test User",
  email: "t@test.com",
  phone: "090",
  role: "Staff",
  status: "Active",
  joinedDate: "2024-01-01",
}

describe("EmployeeRoleCell", () => {
  it("renders read-only badge when canChangeRole is false", () => {
    render(
      <EmployeeRoleCell
        employee={employee}
        rolesCatalog={catalog}
        canChangeRole={false}
        onRequestChange={vi.fn()}
      />,
    )
    expect(screen.getByText("Staff")).toBeInTheDocument()
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument()
  })

  it("renders select when canChangeRole is true", () => {
    render(
      <EmployeeRoleCell
        employee={employee}
        rolesCatalog={catalog}
        canChangeRole={true}
        onRequestChange={vi.fn()}
      />,
    )
    expect(screen.getByRole("combobox")).toBeInTheDocument()
  })
})
