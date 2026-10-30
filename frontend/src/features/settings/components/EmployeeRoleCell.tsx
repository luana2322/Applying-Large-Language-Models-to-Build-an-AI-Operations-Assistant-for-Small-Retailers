import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import type { RoleItemData } from "../api/usersApi"
import type { Employee } from "../types"

interface EmployeeRoleCellProps {
  employee: Employee
  rolesCatalog: RoleItemData[]
  canChangeRole: boolean
  isChanging?: boolean
  onRequestChange: (employee: Employee, newRoleId: number, newRoleName: string) => void
}

export function EmployeeRoleCell({
  employee,
  rolesCatalog,
  canChangeRole,
  isChanging,
  onRequestChange,
}: EmployeeRoleCellProps) {
  if (!canChangeRole) {
    return (
      <span
        className={cn(
          "inline-flex h-5 items-center rounded-md border px-2 text-[10px] font-semibold uppercase",
          employee.role === "Admin"
            ? "border-red-200 bg-red-50 text-red-700"
            : "border-slate-200 bg-slate-50 text-slate-700",
        )}
      >
        {employee.role}
      </span>
    )
  }

  const assignableRoles = rolesCatalog.filter(
    (r) => r.name === "Admin" || r.name === "Staff",
  )

  return (
    <Select
      value={employee.role}
      onValueChange={(val) => {
        if (val === employee.role) return
        const role = rolesCatalog.find((r) => r.name === val)
        if (role) {
          onRequestChange(employee, role.id, role.name)
        }
      }}
      disabled={isChanging}
    >
      <SelectTrigger
        className={cn(
          "h-7 min-w-[100px] text-[11px] font-semibold",
          isChanging && "opacity-50",
        )}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {assignableRoles.map((role) => (
          <SelectItem key={role.id} value={role.name}>
            {role.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
