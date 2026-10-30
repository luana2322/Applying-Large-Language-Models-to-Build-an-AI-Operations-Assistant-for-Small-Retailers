import { useEffect, useState } from "react"
import { usePageTitle } from "@/context/PageTitleContext"
import { useAuthStore } from "@/features/auth/store/useAuthStore"
import type { Employee } from "../types"
import { EmployeeTable } from "../components/EmployeeTable"
import { EmployeeToolbar } from "../components/EmployeeToolbar"
import { EmployeeDetailDialog } from "../components/EmployeeDetailDialog"
import {
  EmployeeForm,
  type EmployeeCreateFormData,
  type EmployeeEditFormData,
} from "../components/EmployeeForm"
import { RoleChangeConfirmDialog } from "../components/RoleChangeConfirmDialog"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { toast } from "sonner"
import { ApiRequestError } from "@/lib/api/http"
import {
  buildUserCreateBody,
  deleteUser,
  getRoles,
  getUsersList,
  type RoleItemData,
  patchUser,
  postCreateUser,
  roleUiToRoleId,
  userResponseToEmployee,
} from "../api/usersApi"
import { Plus, UserCheck, UsersRound, UserX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"



const FALLBACK_ROLES: RoleItemData[] = [
  { id: 3, name: "Admin", permissions: {} },
  { id: 2, name: "Staff", permissions: {} },
]

export function EmployeesPage() {
  const { setTitle } = usePageTitle()

  const [employees, setEmployees] = useState<Employee[]>([])
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [loadingList, setLoadingList] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isOwner = useAuthStore((s) => s.user?.role === "Owner")
  const [rolesCatalog, setRolesCatalog] = useState<RoleItemData[]>(FALLBACK_ROLES)
  const [pendingRoleChange, setPendingRoleChange] = useState<{
    employee: Employee
    newRoleId: number
    newRoleName: string
  } | null>(null)
  const [changingRoleUserId, setChangingRoleUserId] = useState<number | null>(null)
  const [roleChangeLoading, setRoleChangeLoading] = useState(false)

  // Selection/Confirm states
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null)
  const [isDeletingBulk, setIsDeletingBulk] = useState(false)

  // Detail & Form states
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | undefined>()
  const [createServerFieldErrors, setCreateServerFieldErrors] = useState<Record<string, string> | undefined>()
  const [editServerFieldErrors, setEditServerFieldErrors] = useState<Record<string, string> | undefined>()

  useEffect(() => {
    setTitle("Quản Lý Nhân Viên")
  }, [setTitle])

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const data = await getRoles()
        if (!cancelled && data.items.length > 0) setRolesCatalog(data.items)
      } catch {
        if (!cancelled) toast.error("Không tải được danh sách vai trò, dùng options mặc định")
      }
    })()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    let cancelled = false
    void (async () => {
      setLoadingList(true)
      try {
        const roleId =
          roleFilter === "Admin" ? 3 : roleFilter === "Staff" ? 2 : undefined
        const data = await getUsersList({
          search,
          status: "all",
          roleId,
          page: 1,
          limit: 20,
        })
        if (cancelled) return
        setEmployees(data.items.map(userResponseToEmployee))
      } catch (e) {
        if (cancelled) return
        const msg = e instanceof ApiRequestError ? e.body.message : "Không thể tải danh sách nhân viên"
        toast.error(msg)
        setError(msg)
      } finally {
        if (!cancelled) setLoadingList(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [search, roleFilter])

  const refetchUsersList = async () => {
    const roleId = roleFilter === "Admin" ? 3 : roleFilter === "Staff" ? 2 : undefined
    const data = await getUsersList({ search, status: "all", roleId, page: 1, limit: 20 })
    setEmployees(data.items.map(userResponseToEmployee))
  }

  const filtered = employees

  const totalEmployees = employees.length
  const activeEmployees = employees.filter((employee) => employee.status === "Active").length
  const inactiveEmployees = employees.filter((employee) => employee.status === "Inactive").length

  const summaryItems = [
    {
      key: "total",
      label: "Tổng nhân viên",
      value: totalEmployees,
      icon: UsersRound,
      testId: "employees-summary-total",
      tone: "text-slate-600 bg-slate-50 border-slate-200",
    },
    {
      key: "active",
      label: "Đang làm",
      value: activeEmployees,
      icon: UserCheck,
      testId: "employees-summary-active",
      tone: "text-emerald-700 bg-emerald-50 border-emerald-100",
    },
    {
      key: "inactive",
      label: "Đã nghỉ",
      value: inactiveEmployees,
      icon: UserX,
      testId: "employees-summary-inactive",
      tone: "text-slate-500 bg-slate-50 border-slate-200",
    },
  ]

  // Handlers
  const handleSelect = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? filtered.map(e => e.id) : [])
  }

  const handleToolbarAction = (action: string) => {
    if (action === "delete") {
      setIsDeletingBulk(true)
    } else if (action === "create") {
      setEditingEmployee(undefined)
      setCreateServerFieldErrors(undefined)
      setIsFormOpen(true)
    }
  }

  const handleView = (item: Employee) => {
    setSelectedEmployee(item)
    setIsDetailOpen(true)
  }
  const handleEdit = (item: Employee) => {
    setCreateServerFieldErrors(undefined)
    setEditServerFieldErrors(undefined)
    setEditingEmployee(item)
    setIsFormOpen(true)
  }
  const handleDelete = (item: Employee) => setDeleteTarget(item)

  const confirmDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteUser(deleteTarget.id)
      toast.success(`Đã vô hiệu hóa nhân viên: ${deleteTarget.fullName}`)
      await refetchUsersList()
      setDeleteTarget(null)
    } catch (e) {
      if (e instanceof ApiRequestError) {
        toast.error(e.body.message)
      } else {
        toast.error("Không thể vô hiệu hóa nhân viên")
      }
      throw e
    }
  }

  const confirmBulkDelete = () => {
    setEmployees(prev => prev.filter(e => !selectedIds.includes(e.id)))
    toast.success(`Đã xóa ${selectedIds.length} nhân viên`)
    setSelectedIds([])
    setIsDeletingBulk(false)
  }

  const handleRoleChangeRequest = (employee: Employee, newRoleId: number, newRoleName: string) => {
    setPendingRoleChange({ employee, newRoleId, newRoleName })
  }

  const handleConfirmRoleChange = async () => {
    if (!pendingRoleChange) return
    const { employee, newRoleId } = pendingRoleChange
    setRoleChangeLoading(true)
    setChangingRoleUserId(employee.id)
    try {
      const updated = await patchUser(employee.id, { roleId: newRoleId })
      setEmployees((prev) => prev.map((e) => (e.id === employee.id ? userResponseToEmployee(updated) : e)))
      toast.success("Đã đổi vai trò")
      setPendingRoleChange(null)
    } catch (e) {
      if (e instanceof ApiRequestError) {
        toast.error(e.body.message)
        if (e.status === 403 || e.status === 400) setPendingRoleChange(null)
      } else {
        toast.error("Không thể đổi vai trò")
      }
    } finally {
      setRoleChangeLoading(false)
      setChangingRoleUserId(null)
    }
  }

  return (
    <div data-testid="employees-settings-shell" className="h-full overflow-y-auto bg-slate-50 p-4 md:p-6">
      <div className="mx-auto flex min-h-full max-w-7xl flex-col gap-4">
        <section
          data-testid="employees-settings-header"
          className="rounded-md border border-slate-200 bg-white px-4 py-4 shadow-xs"
        >
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-slate-600">
                  <UsersRound className="h-4 w-4" />
                </div>
                <h1 className="text-xl font-semibold text-slate-950">Quản lý nhân viên</h1>
              </div>
              <p className="mt-2 max-w-2xl text-sm text-slate-500">
                Quản lý tài khoản, quyền hạn và trạng thái làm việc của nhân sự trong hệ thống.
              </p>
            </div>

            <div className="flex flex-col gap-3 lg:flex-row lg:items-start">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {summaryItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <div
                      key={item.key}
                      className="min-w-[112px] rounded-md border border-slate-200 bg-white px-3 py-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-xs font-medium text-slate-500">{item.label}</span>
                        <span className={cn("rounded-md border p-1", item.tone)}>
                          <Icon className="h-3.5 w-3.5" />
                        </span>
                      </div>
                      <div data-testid={item.testId} className="mt-1 text-lg font-semibold tabular-nums text-slate-950">
                        {item.value}
                      </div>
                    </div>
                  )
                })}
              </div>

              <Button
                type="button"
                data-testid="employee-create-button"
                className="h-10 shrink-0 bg-slate-900 text-white hover:bg-slate-800"
                onClick={() => handleToolbarAction("create")}
              >
                <Plus className="h-4 w-4" />
                Thêm nhân viên
              </Button>
            </div>
          </div>
        </section>

        <div className="flex min-h-0 flex-1 flex-col gap-3">
          <EmployeeToolbar
            searchStr={search}
            onSearch={setSearch}
            roleFilter={roleFilter}
            onRoleChange={setRoleFilter}
            selectedIds={selectedIds}
            onAction={handleToolbarAction}
          />

          <section
            data-testid="employees-table-panel"
            className="flex min-h-[420px] flex-1 flex-col overflow-hidden rounded-md border border-slate-200 bg-white shadow-xs"
          >
            {loadingList && (
              <div
                data-testid="employees-loading-strip"
                className="border-b border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-500"
              >
                Đang tải danh sách nhân viên...
              </div>
            )}
            <div className="min-h-0 flex-1 overflow-auto">
              <EmployeeTable
                data={filtered}
                selectedIds={selectedIds}
                onSelect={handleSelect}
                onSelectAll={handleSelectAll}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
                rolesCatalog={rolesCatalog}
                canChangeRole={isOwner}
                changingRoleUserId={changingRoleUserId}
                onRoleChangeRequest={handleRoleChangeRequest}
              />
            </div>
          </section>
        </div>

      </div>

      {/* Confirmations */}
      <ConfirmDialog 
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Xác nhận xóa"
        description={`Bạn có chắc muốn xóa nhân viên "${deleteTarget?.fullName}" khỏi hệ thống?`}
      />

      <ConfirmDialog 
        open={isDeletingBulk}
        onOpenChange={setIsDeletingBulk}
        onConfirm={confirmBulkDelete}
        title="Xác nhận xóa nhiều"
        description={`Bạn có chắc chắn muốn xóa ${selectedIds.length} nhân viên đã chọn?`}
      />

      <EmployeeDetailDialog 
        employee={selectedEmployee}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        rolesCatalog={rolesCatalog}
      />

      <EmployeeForm
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open)
          if (!open) {
            setCreateServerFieldErrors(undefined)
            setEditServerFieldErrors(undefined)
          }
        }}
        employee={editingEmployee}
        serverFieldErrors={editingEmployee ? editServerFieldErrors : createServerFieldErrors}
        canChangeRole={isOwner}
        rolesCatalog={rolesCatalog}
        onSubmit={async (data) => {
          if (editingEmployee) {
            const d = data as EmployeeEditFormData
            try {
              setEditServerFieldErrors(undefined)
              const updated = await patchUser(editingEmployee.id, {
                fullName: d.fullName,
                staffCode: d.employeeCode,
                email: d.email,
                phone: d.phone,
                status: d.status,
                roleId: roleUiToRoleId(d.role),
              })
              setEmployees((prev) =>
                prev.map((e) => (e.id === editingEmployee.id ? userResponseToEmployee(updated) : e)),
              )
              toast.success("Cập nhật nhân viên thành công")
              return
            } catch (e) {
              if (e instanceof ApiRequestError) {
                toast.error(e.body.message)
                if ((e.status === 400 || e.status === 409) && e.body.details) {
                  setEditServerFieldErrors(e.body.details)
                }
              } else {
                toast.error("Không thể cập nhật nhân viên")
              }
              throw e
            }
          }
          const d = data as EmployeeCreateFormData
          try {
            setCreateServerFieldErrors(undefined)
            const created = await postCreateUser(buildUserCreateBody(d))
            setEmployees((prev) => [userResponseToEmployee(created), ...prev])
            toast.success("Thêm nhân viên thành công")
          } catch (e) {
            if (e instanceof ApiRequestError) {
              toast.error(e.body.message)
              if (e.status === 400 && e.body.details) {
                setCreateServerFieldErrors(e.body.details)
              }
            } else {
              toast.error("Không thể tạo nhân viên")
            }
            throw e /* tín hiệu để form không đóng dialog */
          }
        }}
      />

      <RoleChangeConfirmDialog
        open={pendingRoleChange !== null}
        employee={pendingRoleChange?.employee ?? null}
        fromRole={pendingRoleChange?.employee.role ?? "Staff"}
        toRole={pendingRoleChange?.newRoleName ?? ""}
        targetPermissions={
          rolesCatalog.find((r) => r.id === pendingRoleChange?.newRoleId)?.permissions ?? {}
        }
        loading={roleChangeLoading}
        onConfirm={() => void handleConfirmRoleChange()}
        onCancel={() => !roleChangeLoading && setPendingRoleChange(null)}
      />
    </div>
  )
}
