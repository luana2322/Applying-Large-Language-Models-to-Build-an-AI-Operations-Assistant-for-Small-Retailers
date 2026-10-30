import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { PageTitleProvider } from "@/context/PageTitleContext"
import type { UserResponseData } from "../api/usersApi"
import { EmployeesPage } from "./EmployeesPage"

if (!window.HTMLElement.prototype.hasPointerCapture) {
  window.HTMLElement.prototype.hasPointerCapture = () => false
}
if (!window.HTMLElement.prototype.scrollIntoView) {
  window.HTMLElement.prototype.scrollIntoView = () => {}
}

const usersApiMocks = vi.hoisted(() => ({
  buildUserCreateBody: vi.fn(),
  deleteUser: vi.fn(),
  getRoles: vi.fn(),
  getUsersList: vi.fn(),
  patchUser: vi.fn(),
  postCreateUser: vi.fn(),
  roleUiToRoleId: vi.fn(),
  userResponseToEmployee: vi.fn(),
}))

vi.mock("../api/usersApi", () => ({
  buildUserCreateBody: usersApiMocks.buildUserCreateBody,
  deleteUser: usersApiMocks.deleteUser,
  getRoles: usersApiMocks.getRoles,
  getUsersList: usersApiMocks.getUsersList,
  patchUser: usersApiMocks.patchUser,
  postCreateUser: usersApiMocks.postCreateUser,
  roleUiToRoleId: usersApiMocks.roleUiToRoleId,
  userResponseToEmployee: usersApiMocks.userResponseToEmployee,
}))

vi.mock("../components/EmployeeForm", () => ({
  EmployeeForm: ({ open }: { open: boolean }) =>
    open ? (
      <div role="dialog" aria-label="employee-form">
        Employee form open
      </div>
    ) : null,
}))

vi.mock("../components/EmployeeDetailDialog", () => ({
  EmployeeDetailDialog: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? (
      <div role="dialog" aria-label="employee-detail">
        Employee detail open
      </div>
    ) : null,
}))

vi.mock("@/components/shared/ConfirmDialog", () => ({
  ConfirmDialog: ({ open, title }: { open: boolean; title: string }) =>
    open ? (
      <div role="alertdialog" aria-label={title}>
        {title}
      </div>
    ) : null,
}))

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}))

const fixtureUsers: UserResponseData[] = [
  {
    id: 1,
    employeeCode: "NV001",
    fullName: "Nguyễn Văn A",
    email: "vana@minierp.com",
    phone: "0987654321",
    roleId: 3,
    role: "Admin",
    status: "Active",
    joinedDate: "2023-01-01",
    avatar: null,
  },
  {
    id: 2,
    employeeCode: "NV002",
    fullName: "Trần Thị B",
    email: "thib@minierp.com",
    phone: "0912345678",
    roleId: 2,
    role: "Staff",
    status: "Active",
    joinedDate: "2023-02-15",
    avatar: null,
  },
  {
    id: 3,
    employeeCode: "NV003",
    fullName: "Lê Văn C",
    email: "vanc@minierp.com",
    phone: "0900112233",
    roleId: 2,
    role: "Staff",
    status: "Active",
    joinedDate: "2023-03-20",
    avatar: null,
  },
  {
    id: 4,
    employeeCode: "NV004",
    fullName: "Phạm Minh D",
    email: "minhd@minierp.com",
    phone: "0988776655",
    roleId: 2,
    role: "Staff",
    status: "Inactive",
    joinedDate: "2023-05-10",
    avatar: null,
  },
]

function apiUserToEmployee(user: UserResponseData) {
  return {
    id: user.id,
    employeeCode: user.employeeCode,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone ?? "",
    role: user.role === "Admin" ? "Admin" : "Staff",
    status: user.status === "Active" ? "Active" : "Inactive",
    joinedDate: user.joinedDate ?? "2023-01-01",
    avatar: user.avatar ?? undefined,
  }
}

function renderPage() {
  return render(
    <PageTitleProvider>
      <EmployeesPage />
    </PageTitleProvider>,
  )
}

describe("EmployeesPage redesign", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    usersApiMocks.getRoles.mockResolvedValue({
      items: [
        { id: 3, name: "Admin", permissions: { can_manage_staff: true } },
        { id: 2, name: "Staff", permissions: {} },
      ],
    })
    usersApiMocks.getUsersList.mockResolvedValue({
      items: fixtureUsers,
      page: 1,
      limit: 20,
      total: fixtureUsers.length,
    })
    usersApiMocks.userResponseToEmployee.mockImplementation(apiUserToEmployee)
    usersApiMocks.roleUiToRoleId.mockImplementation((role: "Admin" | "Staff") => (role === "Admin" ? 3 : 2))
    usersApiMocks.deleteUser.mockResolvedValue(undefined)
    usersApiMocks.patchUser.mockResolvedValue(fixtureUsers[0])
    usersApiMocks.postCreateUser.mockResolvedValue(fixtureUsers[0])
    usersApiMocks.buildUserCreateBody.mockImplementation((value) => value)
  })

  it("renders the dense admin workspace and summary metrics", async () => {
    renderPage()

    const shell = await screen.findByTestId("employees-settings-shell")
    expect(shell).toHaveClass("bg-slate-50")

    const header = screen.getByTestId("employees-settings-header")
    expect(within(header).getByText("Quản lý nhân viên")).toBeInTheDocument()
    expect(screen.getByTestId("employees-summary-total")).toHaveTextContent("4")
    expect(screen.getByTestId("employees-summary-active")).toHaveTextContent("3")
    expect(screen.getByTestId("employees-summary-inactive")).toHaveTextContent("1")

    expect(screen.getByTestId("employees-toolbar")).toBeInTheDocument()
    expect(screen.getByTestId("employees-table-panel")).toBeInTheDocument()
    expect(screen.getByTestId("employees-table")).toBeInTheDocument()
    expect(screen.getByTestId("employee-create-button")).toBeInTheDocument()
  })

  it("preserves search, role filter, create, and selection behavior", async () => {
    const user = userEvent.setup()
    renderPage()

    await screen.findByText("Nguyễn Văn A")

    await user.type(screen.getByTestId("employee-search-input"), "nguyen")
    await waitFor(() => {
      expect(usersApiMocks.getUsersList).toHaveBeenCalledWith(
        expect.objectContaining({
          search: "nguyen",
          status: "all",
          roleId: undefined,
          page: 1,
          limit: 20,
        }),
      )
    })

    await user.click(screen.getByTestId("employee-role-filter"))
    await user.click(await screen.findByRole("option", { name: "Admin" }))
    await waitFor(() => {
      expect(usersApiMocks.getUsersList).toHaveBeenCalledWith(
        expect.objectContaining({
          search: "nguyen",
          status: "all",
          roleId: 3,
          page: 1,
          limit: 20,
        }),
      )
    })

    await user.click(screen.getByTestId("employee-create-button"))
    expect(screen.getByRole("dialog", { name: "employee-form" })).toBeInTheDocument()

    const tablePanel = screen.getByTestId("employees-table-panel")
    const rowCheckboxes = within(tablePanel).getAllByRole("checkbox")
    await user.click(rowCheckboxes[1])

    expect(screen.getByTestId("employee-selected-count")).toHaveTextContent("1")
    expect(screen.getByTestId("employee-bulk-delete-button")).toBeInTheDocument()
  }, 15000)
})
