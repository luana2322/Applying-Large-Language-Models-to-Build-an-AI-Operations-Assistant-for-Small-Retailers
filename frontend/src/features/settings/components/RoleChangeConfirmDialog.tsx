import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle, ArrowRight } from "lucide-react"
import type { Employee } from "../types"
import { RolePermissionPreview } from "./RolePermissionPreview"

interface RoleChangeConfirmDialogProps {
  open: boolean
  employee: Employee | null
  fromRole: string
  toRole: string
  targetPermissions: Record<string, boolean>
  loading: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function RoleChangeConfirmDialog({
  open,
  employee,
  fromRole,
  toRole,
  targetPermissions,
  loading,
  onConfirm,
  onCancel,
}: RoleChangeConfirmDialogProps) {
  if (!employee) return null

  return (
    <Dialog open={open} onOpenChange={(open) => { if (!open && !loading) onCancel() }}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle>Xác nhận đổi vai trò</DialogTitle>
          <DialogDescription>
            Thay đổi quyền hạn của nhân viên sẽ áp dụng ngay sau khi lưu.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm font-semibold text-slate-800">
            <span>{employee.fullName}</span>
            <span className="rounded bg-slate-200 px-1.5 py-0.5 text-xs text-slate-600">{fromRole}</span>
            <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
            <span className="rounded bg-blue-100 px-1.5 py-0.5 text-xs text-blue-700">{toRole}</span>
          </div>

          <RolePermissionPreview roleName={toRole} permissions={targetPermissions} compact />

          <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
            <p>
              Sau khi đổi vai trò, nhân viên cần đăng xuất và đăng nhập lại để quyền mới có hiệu lực.
            </p>
          </div>
        </div>

        <DialogFooter className="mt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Hủy
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Đang lưu…" : "Xác nhận"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
