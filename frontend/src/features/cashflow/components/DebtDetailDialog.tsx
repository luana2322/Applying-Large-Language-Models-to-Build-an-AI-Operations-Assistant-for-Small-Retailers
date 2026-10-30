import React, { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog"
import { formatCurrency, formatDate } from "@/features/inventory/utils"
import { Calendar, User, FileText, Scale, Timer, ShieldCheck, CheckCircle2, DollarSign, Wallet, CreditCard, History, AlertCircle, Loader2 } from "lucide-react"
import type { Debt } from "../types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { toastApiError } from "@/lib/api/toastApiError"
import { FORM_LABEL_CLASS, FORM_INPUT_CLASS } from "@/lib/data-table-layout"
import { useDebtPayments, useCashFundsList, useRecordDebtPayment } from "../hooks/useDebtPayments"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { getDebtPaymentCopy } from "../lib/debtPaymentUi"

interface DebtDetailDialogProps {
  debt: Debt | null
  isOpen: boolean
  onClose: () => void
  /** Được gọi sau khi ghi trả nợ thành công để page refetch debt mới nhất. */
  onPaymentRecorded?: (debtId: number) => void
}

/** Format YYYY-MM-DD từ Date hôm nay */
function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

export function DebtDetailDialog({ debt, isOpen, onClose, onPaymentRecorded }: DebtDetailDialogProps) {
  const [payAmount, setPayAmount] = useState("")
  const [payFundId, setPayFundId] = useState<string>("")
  const [payDate, setPayDate] = useState(todayIso())

  const fundsQuery = useCashFundsList()
  const funds = fundsQuery.data?.items ?? []

  const paymentsQuery = useDebtPayments(debt?.id)
  const payments = paymentsQuery.data ?? []

  const recordMutation = useRecordDebtPayment(debt?.id ?? 0)

  // Khi dialog mở hoặc debt thay đổi → reset form + chọn quỹ mặc định
  useEffect(() => {
    if (!isOpen) return
    setPayAmount(debt && debt.remainingAmount > 0 ? String(debt.remainingAmount) : "")
    setPayDate(todayIso())
    const defaultFund = funds.find((f) => f.isDefault && f.isActive) ?? funds.find((f) => f.isActive)
    setPayFundId(defaultFund ? String(defaultFund.id) : "")
  }, [isOpen, debt?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Khi danh sách quỹ load xong mà chưa chọn quỹ → chọn quỹ mặc định
  useEffect(() => {
    if (payFundId !== "" || funds.length === 0) return
    const defaultFund = funds.find((f) => f.isDefault && f.isActive) ?? funds.find((f) => f.isActive)
    if (defaultFund) setPayFundId(String(defaultFund.id))
  }, [funds, payFundId])

  if (!debt) return null

  const remaining = debt.remainingAmount
  const paymentCopy = getDebtPaymentCopy(debt)
  const parsedAmount = parseFloat(payAmount)
  const isAmountValid = Number.isFinite(parsedAmount) && parsedAmount > 0 && parsedAmount <= remaining
  const amountError =
    payAmount !== "" && !Number.isFinite(parsedAmount) ? "Số tiền không hợp lệ"
    : Number.isFinite(parsedAmount) && parsedAmount <= 0 ? "Số tiền phải lớn hơn 0"
    : Number.isFinite(parsedAmount) && parsedAmount > remaining ? `Số tiền vượt quá nợ còn lại (${formatCurrency(remaining)})`
    : null

  const canSubmit = isAmountValid && !recordMutation.isPending && debt.status !== "Cleared"

  const handleRecord = async () => {
    if (!canSubmit) return
    const fundIdRaw = parseInt(payFundId, 10)
    const fundIdNum = Number.isFinite(fundIdRaw) && fundIdRaw > 0 ? fundIdRaw : null
    try {
      await recordMutation.mutateAsync({
        amount: parsedAmount,
        fundId: fundIdNum,
        paidOn: payDate || todayIso(),
      })
      toast.success(paymentCopy.successMessage)
      setPayAmount("")
      if (onPaymentRecorded) onPaymentRecorded(debt.id)
    } catch (e) {
      toastApiError(e, paymentCopy.errorMessage)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden border-slate-200 shadow-xl rounded-2xl text-slate-900 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="p-8 pb-6 bg-slate-50/50 border-b border-slate-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="text-left">
              <div className="flex items-center gap-3 mb-2">
                <StatusBadge status={
                  debt.status === "InDebt" ? "Active_debt"
                  : debt.status === "Partial" ? "Partial_debt"
                  : debt.status
                } />
                <span className="text-xs font-mono text-slate-400">Mã công nợ: {debt.debtCode}</span>
              </div>
              <DialogTitle className="text-2xl font-black tracking-tight text-slate-900 uppercase">
                CHI TIẾT CÔNG NỢ
              </DialogTitle>
              <DialogDescription className="sr-only">
                Chi tiết khoản công nợ {debt.debtCode} của {debt.partnerName}
              </DialogDescription>
            </div>

            <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-slate-900 text-white">
                   <Scale size={20} />
                </div>
                <div className="text-right">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Nợ còn lại</p>
                    <p className={cn(
                      "text-xl font-black tracking-tight",
                      debt.status === "Cleared" ? "text-emerald-600" : "text-rose-600"
                    )}>
                        {formatCurrency(remaining)}
                    </p>
                </div>
            </div>
          </div>
        </DialogHeader>

        <div className="p-8 pt-6 space-y-10">
          {/* ── Thông tin khoản nợ ── */}
          <div className="grid grid-cols-2 gap-x-10 gap-y-7">
            {/* Row 1 */}
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 px-1">
                <User size={12} /> Đối tác
              </Label>
              <div className="h-14 bg-white border border-slate-100 rounded-2xl flex items-center px-5 font-bold text-slate-900 shadow-sm">
                {debt.partnerName}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 px-1">
                <ShieldCheck size={12} /> Phân loại
              </Label>
              <div className="h-14 bg-white border border-slate-100 rounded-2xl flex items-center px-5 font-bold text-slate-900 shadow-sm uppercase text-xs tracking-wider">
                {debt.partnerType === 'Customer' ? 'Khách hàng' : 'Nhà cung cấp'}
              </div>
            </div>

            {/* Row 2 */}
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 px-1">
                <DollarSign size={12} /> Tổng giá trị khoản nợ
              </Label>
              <div className="h-14 bg-white border border-slate-100 rounded-2xl flex items-center px-5 font-black text-slate-900 shadow-sm text-lg">
                {formatCurrency(debt.totalAmount)}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 px-1">
                <CheckCircle2 size={12} /> Đã thanh toán (tích lũy)
              </Label>
              <div className="h-14 bg-white border border-slate-100 rounded-2xl flex items-center px-5 font-black text-emerald-600 shadow-sm text-lg">
                {formatCurrency(debt.paidAmount)}
              </div>
            </div>

            {/* Row 3 */}
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 px-1">
                <Calendar size={12} /> Ngày ghi nhận
              </Label>
              <div className="h-14 bg-white border border-slate-100 rounded-2xl flex items-center px-5 font-bold text-slate-900 shadow-sm">
                {formatDate(debt.createdAt)}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 px-1">
                <Timer size={12} /> Hạn thanh toán
              </Label>
              <div className="h-14 bg-white border border-slate-100 rounded-2xl flex items-center px-5 font-bold text-slate-900 shadow-sm italic">
                {debt.dueDate ? formatDate(debt.dueDate) : 'Không thiết lập'}
              </div>
            </div>

            {/* Row 4 - Full Description */}
            <div className="col-span-2 space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 px-1">
                    <FileText size={12} /> Nội dung diễn giải chi tiết
                </Label>
                <div className="p-5 bg-slate-50/50 border border-slate-100 rounded-2xl font-medium text-slate-700 shadow-sm min-h-[100px] leading-relaxed italic">
                    {debt.notes || "Không có diễn giải chi tiết cho khoản nợ này."}
                </div>
            </div>
          </div>

          {/* ── Ghi trả nợ ── */}
          {debt.status !== "Cleared" && (
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-4 bg-slate-50 border-b border-slate-100">
                <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-slate-900 text-white shrink-0">
                  <CreditCard size={16} />
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-widest text-slate-500">Thao tác</p>
                  <p className="text-sm font-black text-slate-900">{paymentCopy.panelTitle}</p>
                </div>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Số tiền */}
                <div className="space-y-2">
                  <Label className={cn(FORM_LABEL_CLASS, "flex items-center gap-1.5")}>
                    <DollarSign size={12} /> Số tiền
                  </Label>
                  <Input
                    type="number"
                    min={1}
                    max={remaining}
                    step="any"
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    placeholder={`Tối đa ${formatCurrency(remaining)}`}
                    className={cn(FORM_INPUT_CLASS, "h-12 font-bold", amountError && "border-rose-400 focus:border-rose-500")}
                  />
                  {amountError && (
                    <p className="text-xs text-rose-600 flex items-center gap-1 mt-1">
                      <AlertCircle size={12} /> {amountError}
                    </p>
                  )}
                </div>

                {/* Quỹ */}
                <div className="space-y-2">
                  <Label className={cn(FORM_LABEL_CLASS, "flex items-center gap-1.5")}>
                    <Wallet size={12} /> Quỹ
                  </Label>
                  <Select value={payFundId} onValueChange={setPayFundId}>
                    <SelectTrigger className={cn(FORM_INPUT_CLASS, "h-12 font-medium w-full")}>
                      <SelectValue placeholder={fundsQuery.isPending ? "Đang tải..." : "Chọn quỹ (tùy chọn)"} />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                      <SelectItem value="none">Không chọn quỹ</SelectItem>
                      {funds.filter((f) => f.isActive).map((f) => (
                        <SelectItem key={f.id} value={String(f.id)}>
                          {f.name} {f.isDefault ? "(Mặc định)" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Ngày trả */}
                <div className="space-y-2">
                  <Label className={cn(FORM_LABEL_CLASS, "flex items-center gap-1.5")}>
                    <Calendar size={12} /> Ngày trả
                  </Label>
                  <Input
                    type="date"
                    value={payDate}
                    onChange={(e) => setPayDate(e.target.value)}
                    className={cn(FORM_INPUT_CLASS, "h-12 font-medium")}
                  />
                </div>
              </div>

              <div className="px-6 pb-6 flex items-center justify-between gap-4">
                {Number.isFinite(parsedAmount) && parsedAmount > 0 && parsedAmount <= remaining && (
                  <p className="text-xs text-slate-500 font-medium">
                    Sau khi trả: còn lại{" "}
                    <span className={cn("font-black", remaining - parsedAmount === 0 ? "text-emerald-600" : "text-rose-600")}>
                      {formatCurrency(remaining - parsedAmount)}
                    </span>
                  </p>
                )}
                <div className="ml-auto">
                  <Button
                    disabled={!canSubmit}
                    onClick={handleRecord}
                    className="px-8 font-black bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-lg shadow-slate-200 uppercase tracking-widest text-xs"
                  >
                    {recordMutation.isPending ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang ghi...</>
                    ) : (
                      <><CreditCard className="mr-2" size={16} /> {paymentCopy.actionLabel}</>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* ── Lịch sử trả nợ ── */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 bg-slate-50 border-b border-slate-100">
              <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-slate-900 text-white shrink-0">
                <History size={16} />
              </div>
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest text-slate-500">Tra cứu</p>
                <p className="text-sm font-black text-slate-900">{paymentCopy.historyTitle}</p>
              </div>
              {paymentsQuery.isFetching && (
                <Loader2 size={14} className="ml-auto animate-spin text-slate-400" />
              )}
            </div>

            {paymentsQuery.isPending ? (
              <div className="p-8 text-center text-sm text-slate-400">Đang tải lịch sử...</div>
            ) : payments.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-400 italic">
                Chưa có lần trả nào được ghi nhận.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {[...payments].reverse().map((pmt, idx) => (
                  <div key={pmt.id ?? idx} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="h-9 w-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                        <CheckCircle2 size={16} className="text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{formatCurrency(pmt.amount)}</p>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                          Mã CT: <span className="font-mono">{pmt.cashTransactionId}</span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-slate-600">
                        {new Date(pmt.paidOn).toLocaleDateString("vi-VN")}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Ngày trả</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
            <Button variant="ghost" onClick={onClose} className="px-6 font-bold text-slate-400 hover:text-slate-900 rounded-xl">Đóng</Button>
            <Button className="bg-slate-900 hover:bg-slate-800 text-white px-8 font-black uppercase tracking-widest shadow-lg shadow-slate-200 rounded-xl">
                <Wallet className="mr-2" size={18} /> In sao kê nợ
            </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
