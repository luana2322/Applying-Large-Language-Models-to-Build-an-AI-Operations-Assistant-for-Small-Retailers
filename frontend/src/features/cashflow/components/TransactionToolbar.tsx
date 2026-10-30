import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Plus, Trash2, Edit2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface TransactionToolbarProps {
  searchStr: string
  onSearch: (val: string) => void
  statusFilter: string
  onStatusChange: (val: string) => void
  typeFilter: string
  onTypeChange: (val: string) => void
  dateFrom: string
  dateTo: string
  onDateFromChange: (val: string) => void
  onDateToChange: (val: string) => void
  selectedIds: number[]
  onAction: (action: string) => void
}

export function TransactionToolbar({ 
  searchStr,
  onSearch,
  statusFilter,
  onStatusChange,
  typeFilter,
  onTypeChange,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  selectedIds,
  onAction,
}: TransactionToolbarProps) {
  const hasSelection = selectedIds.length > 0

  return (
    <div className="bg-white p-4 border border-slate-200 rounded-lg shrink-0 shadow-sm flex flex-wrap items-center gap-2">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px] group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-slate-600 transition-colors" />
        <Input
          placeholder="Tìm theo mã giao dịch, nội dung..."
          className="pl-10 h-10 bg-slate-50 border-slate-200 focus:bg-white focus:border-slate-400 focus:ring-1 focus:ring-slate-100 transition-all rounded-md"
          value={searchStr}
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>

      {/* Date range */}
      <Input
        type="date"
        value={dateFrom}
        onChange={(e) => onDateFromChange(e.target.value)}
        className="h-10 w-36 border-slate-200 rounded-md bg-slate-50 focus:bg-white"
      />
      <span className="text-slate-400 text-sm">–</span>
      <Input
        type="date"
        value={dateTo}
        onChange={(e) => onDateToChange(e.target.value)}
        className="h-10 w-36 border-slate-200 rounded-md bg-slate-50 focus:bg-white"
      />

      {/* Loại */}
      <select
        value={typeFilter}
        onChange={(e) => onTypeChange(e.target.value)}
        className={cn(
          "h-10 px-3 border rounded-md text-sm bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400",
          typeFilter !== "all"
            ? "border-slate-400 bg-slate-50 font-medium text-slate-900"
            : "border-slate-200",
        )}
      >
        <option value="all">Loại</option>
        <option value="Income">Thu tiền</option>
        <option value="Expense">Chi tiền</option>
      </select>

      {/* Trạng thái */}
      <select
        value={statusFilter}
        onChange={(e) => onStatusChange(e.target.value)}
        className={cn(
          "h-10 px-3 border rounded-md text-sm bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400",
          statusFilter !== "all"
            ? "border-slate-400 bg-slate-50 font-medium text-slate-900"
            : "border-slate-200",
        )}
      >
        <option value="all">Trạng thái</option>
        <option value="Completed">Hoàn thành</option>
        <option value="Pending">Chờ xử lý</option>
        <option value="Cancelled">Đã huỷ</option>
      </select>

      {/* Actions */}
      <div className="ml-auto flex items-center gap-2">
        {hasSelection ? (
          <>
            <Button
              variant="outline"
              size="sm"
              className="h-10 px-4 text-slate-700 border-slate-200 bg-white hover:bg-slate-50 rounded-md"
              onClick={() => onAction("edit")}
            >
              <Edit2 className="h-4 w-4 mr-2" />
              Sửa ({selectedIds.length})
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-10 px-4 text-slate-700 border-slate-200 bg-white hover:bg-slate-50 rounded-md"
              onClick={() => onAction("delete")}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Xoá
            </Button>
          </>
        ) : (
          <Button
            className="h-10 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-md"
            onClick={() => onAction("create")}
          >
            <Plus className="h-4 w-4 mr-2" />
            Tạo phiếu
          </Button>
        )}
      </div>
    </div>
  )
}
