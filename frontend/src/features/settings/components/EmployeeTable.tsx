import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Eye, Edit2, Trash2 } from "lucide-react"
import {
  DATA_TABLE_ROOT_CLASS,
  DATA_TABLE_ACTION_HEAD_CLASS,
  DATA_TABLE_ACTION_CELL_CLASS,
  DATA_TABLE_CHECKBOX_CLASS,
  USER_TABLE_COL,
  TABLE_HEAD_CLASS,
  TABLE_CELL_PRIMARY_CLASS,
  TABLE_CELL_SECONDARY_CLASS,
  TABLE_CELL_MONO_CLASS,
} from "@/lib/data-table-layout"
import { cn } from "@/lib/utils"
import type { Employee } from "../types"
import type { RoleItemData } from "../api/usersApi"
import { EmployeeRoleCell } from "./EmployeeRoleCell"

interface EmployeeTableProps {
  data: Employee[]
  selectedIds: number[]
  onSelect: (id: number) => void
  onSelectAll: (checked: boolean) => void
  onView: (item: Employee) => void
  onEdit: (item: Employee) => void
  onDelete: (item: Employee) => void
  rolesCatalog?: RoleItemData[]
  canChangeRole?: boolean
  changingRoleUserId?: number | null
  onRoleChangeRequest?: (employee: Employee, newRoleId: number, newRoleName: string) => void
}

export function EmployeeTable({ 
  data, 
  selectedIds, 
  onSelect, 
  onSelectAll, 
  onView, 
  onEdit,
  onDelete,
  rolesCatalog = [],
  canChangeRole = false,
  changingRoleUserId = null,
  onRoleChangeRequest,
}: EmployeeTableProps) {
  const allSelected = data.length > 0 && selectedIds.length === data.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < data.length;

  return (
    <Table data-testid="employees-table" className={cn(DATA_TABLE_ROOT_CLASS, "min-w-[920px]")}>
      <TableHeader className="sticky top-0 z-30 border-b border-slate-200 bg-slate-50 shadow-sm">
        <TableRow className="border-b border-slate-200 hover:bg-transparent">
          <TableHead className={cn(USER_TABLE_COL.select, TABLE_HEAD_CLASS, "px-3 text-center")}>
            <Checkbox
              checked={allSelected ? true : someSelected ? "indeterminate" : false}
              onCheckedChange={(checked) => onSelectAll(checked as boolean)}
              className={DATA_TABLE_CHECKBOX_CLASS}
            />
          </TableHead>
          <TableHead className={cn(USER_TABLE_COL.avatar, TABLE_HEAD_CLASS, "px-3")} />
          <TableHead className={cn(USER_TABLE_COL.fullName, TABLE_HEAD_CLASS, "px-3")}>Họ và tên</TableHead>
          <TableHead className={cn(USER_TABLE_COL.role, TABLE_HEAD_CLASS, "px-3 text-center")}>Quyền hạn</TableHead>
          <TableHead className={cn(USER_TABLE_COL.email, TABLE_HEAD_CLASS, "px-3")}>Email</TableHead>
          <TableHead className={cn(USER_TABLE_COL.phone, TABLE_HEAD_CLASS, "px-3")}>Số điện thoại</TableHead>
          <TableHead className={cn(USER_TABLE_COL.status, TABLE_HEAD_CLASS, "px-3 text-center")}>Trạng thái</TableHead>
          <TableHead className={cn(DATA_TABLE_ACTION_HEAD_CLASS, TABLE_HEAD_CLASS)}>Thao tác</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody className="divide-y divide-slate-100">
        {data.length === 0 ? (
          <TableRow>
            <TableCell colSpan={8} className="h-64 text-center">
              <div
                data-testid="employees-empty-state"
                className="flex flex-col items-center justify-center gap-1 text-slate-500"
              >
                <p className="text-sm font-medium text-slate-700">Không tìm thấy nhân viên nào</p>
                <p className="text-xs text-slate-500">Kiểm tra lại từ khóa tìm kiếm hoặc bộ lọc vai trò.</p>
              </div>
            </TableCell>
          </TableRow>
        ) : (
          data.map((item) => {
            const isSelected = selectedIds.includes(item.id)
            const initials = item.fullName
              .split(" ")
              .filter(Boolean)
              .slice(-2)
              .map((name) => name[0])
              .join("")

            return (
              <TableRow
                key={item.id}
                className={cn(
                  "group h-14 border-l-2 transition-colors",
                  isSelected ? "border-l-slate-900 bg-slate-50" : "border-l-transparent hover:bg-slate-50/60",
                )}
              >
                <TableCell className="px-3 text-center">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => onSelect(item.id)}
                    className={DATA_TABLE_CHECKBOX_CLASS}
                  />
                </TableCell>
                <TableCell className="px-3">
                  <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-md border border-slate-200 bg-slate-100 text-xs font-semibold uppercase text-slate-500">
                    {item.avatar ? (
                      <img src={item.avatar} alt={item.fullName} className="h-full w-full object-cover" />
                    ) : (
                      initials
                    )}
                  </div>
                </TableCell>
                <TableCell className="px-3">
                  <div className="min-w-0">
                    <span className={cn(TABLE_CELL_PRIMARY_CLASS, "block truncate")}>{item.fullName}</span>
                    <span className={cn(TABLE_CELL_MONO_CLASS, "block truncate text-[10px] uppercase text-slate-400")}>
                      {item.employeeCode}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="px-3 text-center">
                  <EmployeeRoleCell
                    employee={item}
                    rolesCatalog={rolesCatalog}
                    canChangeRole={canChangeRole}
                    isChanging={changingRoleUserId === item.id}
                    onRequestChange={onRoleChangeRequest ?? (() => {})}
                  />
                </TableCell>
                <TableCell className={cn(USER_TABLE_COL.email, TABLE_CELL_SECONDARY_CLASS, "px-3 truncate")}>
                  {item.email}
                </TableCell>
                <TableCell className={cn(USER_TABLE_COL.phone, TABLE_CELL_MONO_CLASS, "px-3")}>
                  {item.phone}
                </TableCell>
                <TableCell className="px-3 text-center">
                  <Badge
                    className={cn(
                      "h-5 rounded-md border-none px-2 text-[10px] font-semibold uppercase",
                      item.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500",
                    )}
                  >
                    {item.status === "Active" ? "Đang làm" : "Đã nghỉ"}
                  </Badge>
                </TableCell>
                <TableCell className={cn(DATA_TABLE_ACTION_CELL_CLASS, isSelected && "bg-slate-50")}>
                  <div className="flex items-center justify-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onView(item)}
                      title="Xem"
                      className="text-slate-500 hover:text-slate-900"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onEdit(item)}
                      title="Sửa"
                      className="text-slate-500 hover:text-slate-900"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onDelete(item)}
                      title="Xóa"
                      className="text-slate-500 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )
          })
        )}
      </TableBody>
    </Table>
  )
}

