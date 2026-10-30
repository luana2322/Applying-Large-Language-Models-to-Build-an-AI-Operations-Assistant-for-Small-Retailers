import { useEffect, useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { formatCurrency, formatDate } from "@/features/inventory/utils"
import {
  Calendar,
  Tag,
  FileText,
  Banknote,
  ArrowUpCircle,
  ArrowDownCircle,
  CheckCircle2,
  CreditCard,
  Activity,
  User,
  Landmark,
  AlertTriangle,
  XCircle,
  Loader2,
} from "lucide-react"
import type { Transaction } from "../types"
import { paymentMethodLabel } from "../utils"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { FORM_LABEL_CLASS } from "@/lib/data-table-layout"
import { ApiRequestError } from "@/lib/api/http"
import { toast } from "sonner"
import {
  CASH_TRANSACTIONS_LIST_QUERY_KEY,
  CASH_TRANSACTION_DETAIL_QUERY_KEY,
  getCashTransactionById,
  patchCashTransaction,
} from "../api/cashTransactionsApi"

interface TransactionDetailDialogProps {
  /** Task066 — fetch khi mở dialog */
  transactionId: number | null
  isOpen: boolean
  onClose: () => void
  /** Gọi sau khi huỷ giao dịch thành công để page refetch. */
  onCancelSuccess?: () => void
}

export function TransactionDetailDialog({
  transactionId,
  isOpen,
  onClose,
  onCancelSuccess,
}: TransactionDetailDialogProps) {
  const detailQuery = useQuery({
    queryKey: [...CASH_TRANSACTION_DETAIL_QUERY_KEY, transactionId],
    queryFn: () => getCashTransactionById(transactionId!),
    enabled: isOpen && transactionId != null && transactionId > 0,
  })

  useEffect(() => {
    if (!detailQuery.isError) return
    const e = detailQuery.error
    if (e instanceof ApiRequestError) {
      toast.error(e.body?.message ?? e.message)
    } else {
      toast.error(e instanceof Error ? e.message : "Không tải được chi tiết")
    }
  }, [detailQuery.isError, detailQuery.error])

  const transaction: Transaction | undefined = detailQuery.data

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden border-slate-200 shadow-xl rounded-2xl text-slate-900">
        {!transactionId ? null : detailQuery.isLoading ? (
          <div className="p-16 flex flex-col items-center justify-center text-slate-500 text-sm font-medium">
            Đang tải chi tiết…
          </div>
        ) : detailQuery.isError || !transaction ? (
          <div className="p-16 flex flex-col items-center gap-4 text-center">
            <p className="text-sm text-slate-600">Không hiển thị được giao dịch.</p>
            <Button variant="outline" onClick={onClose}>
              Đóng
            </Button>
          </div>
        ) : (
          <DetailBody
            transaction={transaction}
            onClose={onClose}
            onCancelSuccess={onCancelSuccess}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

/** Dialog xác nhận huỷ — bắt buộc nhập lý do + cảnh báo nếu gắn công nợ. */
function CancelConfirmDialog({
  transaction,
  isOpen,
  onClose,
  onConfirmed,
}: {
  transaction: Transaction
  isOpen: boolean
  onClose: () => void
  onConfirmed: (reason: string) => Promise<void>
}) {
  const [reason, setReason] = useState("")
  const [submitting, setSubmitting] = useState(false)

  // Reset lý do mỗi lần mở
  useEffect(() => {
    if (isOpen) setReason("")
  }, [isOpen])

  const isDebtLinked =
    transaction.sourceKind === "DebtCollection" ||
    transaction.sourceKind === "DebtPayment"

  const trimmedReason = reason.trim()
  const canSubmit = trimmedReason.length > 0 && !submitting

  const handleConfirm = async () => {
    if (!canSubmit) return
    setSubmitting(true)
    try {
      await onConfirmed(trimmedReason)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !submitting && onClose()}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-slate-200 shadow-xl rounded-2xl text-slate-900">
        <DialogHeader className="p-6 pb-4 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
              <XCircle size={18} className="text-rose-600" />
            </div>
            <DialogTitle className="text-base font-bold text-slate-900">
              Xác nhận huỷ giao dịch
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-5">
          {/* Cảnh báo công nợ */}
          {isDebtLinked && (
            <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <AlertTriangle size={16} className="text-amber-600 mt-0.5 shrink-0" />
              <p className="text-sm text-amber-800 leading-relaxed font-medium">
                Giao dịch này gắn với công nợ — huỷ sẽ hoàn lại số nợ tương ứng.
              </p>
            </div>
          )}

          <p className="text-sm text-slate-600">
            Huỷ giao dịch{" "}
            <span className="font-mono font-semibold text-slate-900">
              {transaction.transactionCode}
            </span>
            ? Hành động này không thể hoàn tác.
          </p>

          {/* Lý do huỷ — bắt buộc */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Lý do huỷ <span className="text-rose-500">*</span>
            </Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Nhập lý do huỷ giao dịch…"
              rows={3}
              className={cn(
                "resize-none text-sm rounded-xl border-slate-200 focus:border-slate-400 focus:ring-0",
                reason.trim().length === 0 && reason.length > 0
                  ? "border-rose-300"
                  : "",
              )}
              disabled={submitting}
              autoFocus
            />
            {reason.length > 0 && reason.trim().length === 0 && (
              <p className="text-xs text-rose-500 font-medium">
                Lý do không được để trống hoặc chỉ chứa khoảng trắng.
              </p>
            )}
          </div>
        </div>

        <div className="p-5 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={submitting}
            className="px-5 font-semibold text-slate-500 hover:text-slate-900 rounded-xl"
          >
            Bỏ qua
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!canSubmit}
            className={cn(
              "px-6 font-bold rounded-xl text-white",
              canSubmit
                ? "bg-rose-600 hover:bg-rose-700"
                : "bg-slate-300 cursor-not-allowed",
            )}
          >
            {submitting ? (
              <>
                <Loader2 size={14} className="mr-2 animate-spin" /> Đang huỷ…
              </>
            ) : (
              "Xác nhận huỷ"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function DetailBody({
  transaction,
  onClose,
  onCancelSuccess,
}: {
  transaction: Transaction
  onClose: () => void
  onCancelSuccess?: () => void
}) {
  const isIncome = transaction.direction === "Income"
  const queryClient = useQueryClient()
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)

  const handleCancelConfirmed = async (cancelReason: string) => {
    try {
      await patchCashTransaction(transaction.id, {
        status: "Cancelled",
        cancelReason,
      })
      toast.success("Đã huỷ giao dịch")
      // Invalidate list + detail để page refetch
      await queryClient.invalidateQueries({ queryKey: [...CASH_TRANSACTIONS_LIST_QUERY_KEY] })
      await queryClient.invalidateQueries({
        queryKey: [...CASH_TRANSACTION_DETAIL_QUERY_KEY, transaction.id],
      })
      setIsCancelDialogOpen(false)
      onCancelSuccess?.()
      onClose()
    } catch (e) {
      if (e instanceof ApiRequestError) {
        const msg = e.body?.message?.trim()
        toast.error(msg && msg.length > 0 ? msg : "Không huỷ được giao dịch. Vui lòng thử lại.")
      } else {
        toast.error(e instanceof Error ? e.message : "Không huỷ được giao dịch. Vui lòng thử lại.")
      }
    }
  }

  return (
    <>
      <DialogHeader className="p-8 pb-6 bg-slate-50/50 border-b border-slate-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="text-left">
            <div className="flex items-center gap-3 mb-2">
              <span
                className={cn(
                  "px-2.5 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wide border border-slate-200 bg-slate-50 text-slate-700",
                )}
              >
                {transaction.status === "Completed"
                  ? "Hoàn thành"
                  : transaction.status === "Pending"
                    ? "Chờ duyệt"
                    : "Đã hủy"}
              </span>
              <span className="text-xs font-mono text-slate-400">Mã giao dịch: {transaction.transactionCode}</span>
            </div>
            <DialogTitle className="text-2xl font-black tracking-tight text-slate-900 uppercase">
              CHI TIẾT {isIncome ? "PHIẾU THU" : "PHIẾU CHI"}
            </DialogTitle>
          </div>

          <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-slate-900 text-white">
              {isIncome ? <ArrowUpCircle size={20} /> : <ArrowDownCircle size={20} />}
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Giá trị biến động</p>
              <p className="text-xl font-semibold tabular-nums tracking-tight text-slate-900">
                {isIncome ? "+" : "-"}
                {formatCurrency(transaction.amount)}
              </p>
            </div>
          </div>
        </div>
      </DialogHeader>

      <div className="p-8 pt-6 space-y-10">
        <div className="grid grid-cols-2 gap-x-10 gap-y-7">
          <div className="space-y-2">
            <Label className={FORM_LABEL_CLASS}>
              <Tag size={12} className="inline mr-1" /> Dòng tiền
            </Label>
            <div className="h-14 bg-white border border-slate-100 rounded-2xl flex items-center px-5 font-bold text-slate-900 shadow-sm">
              {transaction.category}
            </div>
          </div>

          <div className="space-y-2">
            <Label className={FORM_LABEL_CLASS}>
              <Calendar size={12} className="inline mr-1" /> Ngày thực hiện
            </Label>
            <div className="h-14 bg-white border border-slate-100 rounded-2xl flex items-center px-5 font-bold text-slate-900 shadow-sm">
              {formatDate(transaction.transactionDate)}
            </div>
          </div>

          <div className="space-y-2">
            <Label className={FORM_LABEL_CLASS}>
              <CreditCard size={12} className="inline mr-1" /> Hình thức thanh toán
            </Label>
            <div className="h-14 bg-white border border-slate-100 rounded-2xl flex items-center px-5 font-bold text-slate-900 shadow-sm">
              {paymentMethodLabel(transaction.paymentMethod)}
            </div>
          </div>

          <div className="space-y-2">
            <Label className={FORM_LABEL_CLASS}>
              <Landmark size={12} className="inline mr-1" /> Quỹ tiền
            </Label>
            <div className="h-14 bg-white border border-slate-100 rounded-2xl flex items-center px-5 font-bold text-slate-900 shadow-sm">
              {transaction.fundCode?.trim() ||
                (transaction.fundId != null && transaction.fundId > 0 ? `Quỹ #${transaction.fundId}` : "—")}
            </div>
          </div>

          <div className="col-span-2 space-y-2">
            <Label className={FORM_LABEL_CLASS}>
              <Activity size={12} className="inline mr-1" /> Tình trạng phiếu
            </Label>
            <div className="h-14 bg-white border border-slate-100 rounded-2xl flex items-center px-5 font-bold text-slate-900 shadow-sm">
              {transaction.status === "Completed"
                ? "Đã hoàn thành"
                : transaction.status === "Pending"
                  ? "Đang chờ xử lý"
                  : "Đã hủy bỏ"}
            </div>
          </div>

          {(Boolean(transaction.createdByName?.trim()) ||
            Boolean(transaction.performedByName?.trim()) ||
            transaction.createdBy != null ||
            transaction.performedBy != null) && (
            <div className="col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className={FORM_LABEL_CLASS}>
                  <User size={12} className="inline mr-1" /> Người tạo
                </Label>
                <div className="h-14 bg-white border border-slate-100 rounded-2xl flex items-center px-5 font-medium text-slate-800 shadow-sm">
                  {transaction.createdByName?.trim() || `ID ${transaction.createdBy ?? "—"}`}
                </div>
              </div>
              <div className="space-y-2">
                <Label className={FORM_LABEL_CLASS}>
                  <User size={12} className="inline mr-1" /> Thực hiện gần nhất
                </Label>
                <div className="h-14 bg-white border border-slate-100 rounded-2xl flex items-center px-5 font-medium text-slate-800 shadow-sm">
                  {transaction.performedByName?.trim() || `ID ${transaction.performedBy ?? "—"}`}
                </div>
              </div>
            </div>
          )}

          <div className="col-span-2 space-y-2">
            <Label className={FORM_LABEL_CLASS}>
              <FileText size={12} className="inline mr-1" /> Nội dung diễn giải
            </Label>
            <div className="p-5 bg-slate-50/50 border border-slate-100 rounded-2xl font-medium text-slate-700 shadow-sm min-h-[100px] leading-relaxed italic">
              {transaction.description || "Không có diễn giải chi tiết cho giao dịch này."}
            </div>
          </div>

          {/* Hiển thị lý do huỷ nếu đã bị huỷ */}
          {transaction.status === "Cancelled" && transaction.cancelReason && (
            <div className="col-span-2 space-y-2">
              <Label className={FORM_LABEL_CLASS}>
                <XCircle size={12} className="inline mr-1" /> Lý do huỷ
              </Label>
              <div className="p-5 bg-rose-50/40 border border-rose-100 rounded-2xl text-sm font-medium text-rose-800 shadow-sm min-h-[60px] leading-relaxed">
                {transaction.cancelReason}
              </div>
            </div>
          )}
        </div>

        <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl flex items-start gap-4">
          <div className="h-10 w-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-900 shrink-0 shadow-sm">
            <CheckCircle2 size={18} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Xác thực hệ thống</p>
            <p className="text-xs text-slate-500 leading-relaxed font-medium italic">
              Chứng từ này được xác thực bởi bộ phận kế toán. Mọi thay đổi sẽ được lưu vết vĩnh viễn trong nhật ký hoạt động của doanh nghiệp để phục vụ công tác đối soát nợ.
            </p>
          </div>
        </div>
      </div>

      <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-between gap-3">
        <div>
          {/* Nút huỷ chỉ hiển thị với giao dịch chưa bị huỷ */}
          {transaction.status !== "Cancelled" && (
            <Button
              variant="outline"
              onClick={() => setIsCancelDialogOpen(true)}
              className="border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 hover:text-rose-700 font-bold rounded-xl px-5"
            >
              <XCircle size={15} className="mr-2" />
              Huỷ giao dịch
            </Button>
          )}
        </div>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={onClose} className="px-6 font-bold text-slate-400 hover:text-slate-900 rounded-xl">
            Đóng
          </Button>
          <Button className="bg-slate-900 hover:bg-slate-800 text-white px-8 font-black uppercase tracking-widest shadow-lg shadow-slate-200 rounded-xl">
            <Banknote className="mr-2" size={18} /> In chứng từ
          </Button>
        </div>
      </div>

      {/* Dialog xác nhận huỷ */}
      <CancelConfirmDialog
        transaction={transaction}
        isOpen={isCancelDialogOpen}
        onClose={() => setIsCancelDialogOpen(false)}
        onConfirmed={handleCancelConfirmed}
      />
    </>
  )
}
