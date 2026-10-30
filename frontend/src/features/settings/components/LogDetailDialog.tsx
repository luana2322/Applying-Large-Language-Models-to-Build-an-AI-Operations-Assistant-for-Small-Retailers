// frontend/mini-erp/src/features/settings/components/LogDetailDialog.tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { SystemLog } from "../log-types"

interface LogDetailDialogProps {
  log: SystemLog | null
  open: boolean
  onClose: () => void
}

export function LogDetailDialog({ log, open, onClose }: LogDetailDialogProps) {
  if (!log) return null

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg p-0 overflow-hidden border-slate-200 shadow-2xl rounded-2xl">
        <DialogHeader className="p-6 pb-4 bg-slate-50/50 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="h-11 w-11 rounded-xl bg-slate-900 flex items-center justify-center text-white text-base font-black uppercase shrink-0">
              {log.user[0]}
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-slate-900">
                {log.user}
              </DialogTitle>
              <p className="text-xs text-slate-500 mt-0.5 font-mono">{log.timestamp}</p>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-4">
          <DetailRow label="Hành động">
            <span
              className={cn(
                "text-[10px] font-bold uppercase tracking-tight px-2 py-0.5 rounded-full border h-5 inline-flex items-center",
                log.action === "Delete"
                  ? "bg-red-50 text-red-700 border-red-100"
                  : log.action === "Create"
                    ? "bg-green-50 text-green-700 border-green-100"
                    : "bg-blue-50 text-blue-700 border-blue-100",
              )}
            >
              {log.action}
            </span>
          </DetailRow>

          <DetailRow label="Module">
            <span className="text-sm text-slate-900">{log.module}</span>
          </DetailRow>

          <DetailRow label="Mức độ">
            <Badge
              className={cn(
                "text-[10px] font-bold uppercase h-5 px-1.5 border-none",
                log.severity === "Info"
                  ? "bg-blue-50 text-blue-700"
                  : log.severity === "Warning"
                    ? "bg-orange-50 text-orange-700"
                    : "bg-red-50 text-red-700",
              )}
            >
              {log.severity}
            </Badge>
          </DetailRow>

          {log.ipAddress && (
            <DetailRow label="Địa chỉ IP">
              <span className="text-sm font-mono text-slate-900">{log.ipAddress}</span>
            </DetailRow>
          )}

          <div className="flex items-start gap-3">
            <span className="text-xs font-semibold text-slate-500 w-28 pt-0.5 shrink-0">
              Nội dung
            </span>
            <p className="text-sm text-slate-900 leading-relaxed">{log.description}</p>
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <Button variant="outline" onClick={onClose} className="px-6 border-slate-200">
            Đóng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-semibold text-slate-500 w-28 shrink-0">{label}</span>
      {children}
    </div>
  )
}
