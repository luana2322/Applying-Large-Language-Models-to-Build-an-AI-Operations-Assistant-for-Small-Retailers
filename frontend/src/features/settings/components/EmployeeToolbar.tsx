import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, SlidersHorizontal, Trash2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface EmployeeToolbarProps {
  searchStr: string
  onSearch: (val: string) => void
  roleFilter: string
  onRoleChange: (val: string) => void
  selectedIds: number[]
  onAction: (action: string) => void
}

export function EmployeeToolbar({
  searchStr,
  onSearch,
  roleFilter,
  onRoleChange,
  selectedIds,
  onAction,
}: EmployeeToolbarProps) {
  const hasSelection = selectedIds.length > 0

  return (
    <div
      data-testid="employees-toolbar"
      className="flex shrink-0 flex-col gap-3 rounded-md border border-slate-200 bg-white px-3 py-3 shadow-xs lg:flex-row lg:items-center lg:justify-between"
    >
      <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1 sm:max-w-[360px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            data-testid="employee-search-input"
            placeholder="Tìm theo tên, mã NV, email..."
            value={searchStr}
            onChange={(event) => onSearch(event.target.value)}
            className="h-10 rounded-md border-slate-200 bg-slate-50 pl-9 text-sm focus-visible:ring-slate-200"
          />
        </div>

        <Select value={roleFilter} onValueChange={onRoleChange}>
          <SelectTrigger
            data-testid="employee-role-filter"
            className="h-10 w-full rounded-md border-slate-200 bg-white text-sm shadow-none sm:w-[172px]"
          >
            <SlidersHorizontal className="mr-2 h-4 w-4 text-slate-400" />
            <SelectValue placeholder="Vai trò" />
          </SelectTrigger>
          <SelectContent position="popper" className="rounded-md border-slate-200 bg-white shadow-lg">
            <SelectItem value="all">Tất cả vai trò</SelectItem>
            <SelectItem value="Admin">Admin</SelectItem>
            <SelectItem value="Staff">Staff</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 lg:justify-end">
        <div
          data-testid="employee-selected-count"
          className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600"
        >
          Đã chọn <span className="font-semibold tabular-nums text-slate-950">{selectedIds.length}</span>
        </div>

        {hasSelection && (
          <Button
            type="button"
            data-testid="employee-bulk-delete-button"
            variant="destructive"
            size="sm"
            className="h-10 rounded-md px-3"
            onClick={() => onAction("delete")}
          >
            <Trash2 className="h-4 w-4" />
            Xóa {selectedIds.length}
          </Button>
        )}
      </div>
    </div>
  )
}
