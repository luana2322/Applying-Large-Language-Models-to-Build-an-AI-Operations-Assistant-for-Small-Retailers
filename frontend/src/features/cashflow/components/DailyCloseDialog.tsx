import { useEffect, useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Landmark, Wallet, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { ApiRequestError } from "@/lib/api/http"
import { formatCurrency } from "@/features/inventory/utils"
import { FORM_LABEL_CLASS, FORM_INPUT_CLASS } from "@/lib/data-table-layout"
import { cn } from "@/lib/utils"
import {
  DAILY_CASH_CLOSE_QUERY_KEY,
  getDailyClose,
  closeDailyCash,
  type DailyCashClosing,
} from "../api/dailyCashClosingsApi"
import type { CashFundItem } from "../api/cashFundsApi"

interface DailyCloseDialogProps {
  isOpen: boolean
  onClose: () => void
  fundOptions: CashFundItem[]
  defaultFundId: number | null
  businessDate: string
}

export function DailyCloseDialog({
  isOpen,
  onClose,
  fundOptions,
  defaultFundId,
  businessDate,
}: DailyCloseDialogProps) {
  const queryClient = useQueryClient()
  const fundId = defaultFundId ?? fundOptions[0]?.id ?? null
  const [countedCash, setCountedCash] = useState("")
  const [notes, setNotes] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [closedResult, setClosedResult] = useState<DailyCashClosing | null>(null)

  const closeQuery = useQuery({
    queryKey: [...DAILY_CASH_CLOSE_QUERY_KEY, fundId, businessDate],
    queryFn: () => getDailyClose(fundId!, businessDate),
    enabled: isOpen && fundId != null,
  })

  useEffect(() => {
    if (!isOpen) return
    setCountedCash("")
    setNotes("")
    setClosedResult(null)
  }, [isOpen, fundId, businessDate])

  useEffect(() => {
    if (!closeQuery.isError) return
    const e = closeQuery.error
    toast.error(e instanceof ApiRequestError ? e.body?.message ?? e.message : "Không tải được dữ liệu chốt ngày")
  }, [closeQuery.isError, closeQuery.error])

  const data = closeQuery.data
  const fundName = fundOptions.find((f) => f.id === fundId)?.name ?? "—"

  const handleSubmit = async () => {
    if (fundId == null) return
    const amount = Number(countedCash)
    if (!Number.isFinite(amount) || amount < 0) {
      toast.error("Số tiền kiểm đếm không hợp lệ")
      return
    }
    setSubmitting(true)
    try {
      const result = await closeDailyCash({
        fundId,
        businessDate,
        countedCash: amount,
        notes: notes.trim() || undefined,
      })
      await queryClient.invalidateQueries({ queryKey: [...DAILY_CASH_CLOSE_QUERY_KEY, fundId, businessDate] })
      toast.success("Đã chốt quỹ ngày " + businessDate)
      setClosedResult(result)
    } catch (e) {
      toast.error(e instanceof ApiRequestError ? e.body?.message ?? e.message : "Không chốt được quỹ ngày")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg p-0 gap-0 border-slate-200 shadow-xl rounded-2xl overflow-hidden text-slate-900">
        <DialogHeader className="p-8 pb-6 bg-slate-50/50 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl flex items-center justify-center bg-slate-800 text-white">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-0.5">Tài chính & Thu chi</p>
              <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">CHỐT QUỸ NGÀY</DialogTitle>
            </div>
          </div>
        </DialogHeader>

        <div className="p-8 pt-6 space-y-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Landmark size={14} /> {fundName} — {businessDate}
          </div>

          <div className="space-y-2">
            <Label className={FORM_LABEL_CLASS}>
              <Wallet size={12} className="inline mr-1" /> Số dư dự kiến
            </Label>
            <p className={cn(FORM_INPUT_CLASS, "h-14 flex items-center font-black text-lg")}>
              {closeQuery.isLoading ? "Đang tải…" : formatCurrency(data?.expectedCash ?? 0)}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="counted-cash" className={FORM_LABEL_CLASS}>
              Tiền kiểm đếm thực tế
            </Label>
            <Input
              id="counted-cash"
              type="number"
              value={countedCash}
              onChange={(e) => setCountedCash(e.target.value)}
              className={cn(FORM_INPUT_CLASS, "h-14 font-black text-lg")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="close-notes" className={FORM_LABEL_CLASS}>
              Ghi chú
            </Label>
            <Input
              id="close-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="VD: Thiếu tiền lẻ..."
              className={cn(FORM_INPUT_CLASS, "h-14 font-medium")}
            />
          </div>

          {closedResult ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-700">
              Chênh lệch: {formatCurrency(closedResult.variance ?? 0)}
            </div>
          ) : null}
        </div>

        <DialogFooter className="p-8 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose} className="px-6 font-bold text-slate-400 hover:text-slate-900 rounded-xl">
            Đóng
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || fundId == null}
            className="px-8 font-semibold bg-slate-900 hover:bg-slate-800 rounded-lg text-white"
          >
            <CheckCircle2 className="mr-2" size={18} /> Chốt ngày
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
