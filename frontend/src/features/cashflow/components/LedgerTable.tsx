import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/features/inventory/utils"
import {
  DATA_TABLE_ROOT_CLASS,
  LEDGER_TABLE_COL,
  TABLE_HEAD_CLASS,
  TABLE_CELL_PRIMARY_CLASS,
  TABLE_CELL_SECONDARY_CLASS,
  TABLE_CELL_MONO_CLASS,
  TABLE_CELL_NUMBER_CLASS,
} from "@/lib/data-table-layout"
import { cn } from "@/lib/utils"
import type { LedgerEntry } from "../types"
import {
  ledgerSourceKindLabel,
  ledgerTransactionTypeLabel,
} from "../lib/ledgerDisplayLabels"
import { calculateLedgerTotals, signedLedgerAmount } from "../lib/ledgerTotals"

const TRANSACTION_TYPE_TEXT_CLASS: Record<string, string> = {
  SalesRevenue:     "text-emerald-700",
  PurchaseCost:     "text-rose-600",
  OperatingExpense: "text-orange-600",
  Refund:           "text-blue-600",
}

const SOURCE_KIND_BADGE_CLASS: Record<string, string> = {
  Manual:          "bg-slate-100 text-slate-700 border-slate-200",
  DebtCollection:  "bg-blue-50 text-blue-700 border-blue-200",
  DebtPayment:     "bg-amber-50 text-amber-700 border-amber-200",
  PurchasePayment: "bg-violet-50 text-violet-700 border-violet-200",
}

interface LedgerTableProps {
  data: LedgerEntry[]
}

function formatSignedLedgerAmount(entry: LedgerEntry): string {
  const v = signedLedgerAmount(entry)
  if (v === null) return "—"
  const abs = Math.abs(v)
  const body = formatCurrency(abs)
  if (v > 0) return `+${body}`
  if (v < 0) return `−${body}`
  return body
}

export function LedgerTable({ data }: LedgerTableProps) {
  const totals = calculateLedgerTotals(data)

  return (
    <Table className={DATA_TABLE_ROOT_CLASS}>
      <TableHeader className="sticky top-0 z-30 bg-slate-50 border-b shadow-sm">
        <TableRow className="hover:bg-transparent">
          <TableHead className={cn(LEDGER_TABLE_COL.date, TABLE_HEAD_CLASS, "px-4")}>Ngày</TableHead>
          <TableHead className={cn(LEDGER_TABLE_COL.type, TABLE_HEAD_CLASS, "px-4")}>Loại nghiệp vụ</TableHead>
          <TableHead className={cn(LEDGER_TABLE_COL.reference, TABLE_HEAD_CLASS, "px-4")}>Nguồn / Tham chiếu</TableHead>
          <TableHead className={cn(LEDGER_TABLE_COL.code, TABLE_HEAD_CLASS, "px-4")}>Số chứng từ</TableHead>
          <TableHead className={cn(LEDGER_TABLE_COL.description, TABLE_HEAD_CLASS, "px-4")}>Diễn giải</TableHead>
          <TableHead className={cn(LEDGER_TABLE_COL.amount, TABLE_HEAD_CLASS, "text-right px-4")}>Số tiền</TableHead>
          <TableHead className={cn(LEDGER_TABLE_COL.debit, TABLE_HEAD_CLASS, "text-right px-4")}>PS Nợ</TableHead>
          <TableHead className={cn(LEDGER_TABLE_COL.credit, TABLE_HEAD_CLASS, "text-right px-4")}>PS Có</TableHead>
          <TableHead className={cn(LEDGER_TABLE_COL.balance, TABLE_HEAD_CLASS, "text-right px-4")}>Số dư</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody className="divide-y divide-slate-100">
        {data.length === 0 ? (
          <TableRow>
            <TableCell colSpan={9} className="h-64 text-center">
              <div className="flex flex-col items-center justify-center text-slate-400 gap-2">
                <p className="text-sm">Chưa có dữ liệu sổ cái</p>
              </div>
            </TableCell>
          </TableRow>
        ) : (
          data.map((item) => {
            const rawAmt = signedLedgerAmount(item)
            return (
              <TableRow key={item.id} className="hover:bg-slate-50/50 h-14 group">
                <TableCell className={cn(TABLE_CELL_SECONDARY_CLASS, "px-4 whitespace-nowrap")}>
                  {new Date(item.date).toLocaleDateString("vi-VN")}
                </TableCell>
                <TableCell className="px-4 min-w-0">
                  <span className={cn(
                    "block text-sm font-semibold truncate",
                    item.transactionType
                      ? (TRANSACTION_TYPE_TEXT_CLASS[item.transactionType] ?? "text-slate-700")
                      : "text-slate-400"
                  )}>
                    {ledgerTransactionTypeLabel(item.transactionType)}
                  </span>
                </TableCell>
                <TableCell className={cn(TABLE_CELL_SECONDARY_CLASS, "px-4 text-xs min-w-0")}>
                  <Badge className={cn(
                    "font-semibold text-[10px] border shadow-none",
                    SOURCE_KIND_BADGE_CLASS[item.referenceType ?? ""] ?? "bg-slate-50 text-slate-600 border-slate-200"
                  )}>
                    {ledgerSourceKindLabel(item.referenceType)}
                  </Badge>
                </TableCell>
                <TableCell className={cn(TABLE_CELL_MONO_CLASS, "px-4")}>{item.transactionCode}</TableCell>
                <TableCell className="px-4">
                  <span className={TABLE_CELL_PRIMARY_CLASS}>{item.description ?? "—"}</span>
                </TableCell>
                <TableCell
                  className={cn(
                    TABLE_CELL_NUMBER_CLASS,
                    "text-right px-4 font-semibold tabular-nums",
                    rawAmt != null && rawAmt > 0 && "text-emerald-600",
                    rawAmt != null && rawAmt < 0 && "text-rose-600",
                    rawAmt === 0 && "text-slate-600",
                  )}
                >
                  {formatSignedLedgerAmount(item)}
                </TableCell>
                <TableCell className={cn(TABLE_CELL_NUMBER_CLASS, "text-right px-4 text-rose-600")}>
                  {item.debit > 0 ? formatCurrency(item.debit) : "—"}
                </TableCell>
                <TableCell className={cn(TABLE_CELL_NUMBER_CLASS, "text-right px-4 text-emerald-600")}>
                  {item.credit > 0 ? formatCurrency(item.credit) : "—"}
                </TableCell>
                <TableCell className={cn(TABLE_CELL_NUMBER_CLASS, "text-right px-4 text-slate-900 font-bold")}>
                  {formatCurrency(item.balance)}
                </TableCell>
              </TableRow>
            )
          })
        )}
      </TableBody>
      {data.length > 0 ? (
        <TableFooter className="sticky bottom-0 z-20 bg-slate-50 border-t border-slate-200">
          <TableRow className="hover:bg-slate-50">
            <TableCell colSpan={5} className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
              Tổng trang hiện tại
            </TableCell>
            <TableCell
              className={cn(
                TABLE_CELL_NUMBER_CLASS,
                "text-right px-4 font-bold",
                totals.amount > 0 && "text-emerald-700",
                totals.amount < 0 && "text-rose-700",
              )}
            >
              {totals.amount > 0 ? "+" : totals.amount < 0 ? "−" : ""}
              {formatCurrency(Math.abs(totals.amount))}
            </TableCell>
            <TableCell className={cn(TABLE_CELL_NUMBER_CLASS, "text-right px-4 font-bold text-rose-700")}>
              {formatCurrency(totals.debit)}
            </TableCell>
            <TableCell className={cn(TABLE_CELL_NUMBER_CLASS, "text-right px-4 font-bold text-emerald-700")}>
              {formatCurrency(totals.credit)}
            </TableCell>
            <TableCell className={cn(TABLE_CELL_NUMBER_CLASS, "text-right px-4 font-bold text-slate-950")}>
              {formatCurrency(totals.finalBalance)}
            </TableCell>
          </TableRow>
        </TableFooter>
      ) : null}
    </Table>
  )
}
