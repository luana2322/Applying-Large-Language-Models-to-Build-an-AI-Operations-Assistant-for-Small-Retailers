import { useCallback, useMemo, useState } from "react"
import { Edit3, Search, SlidersHorizontal, Table2 } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useAuthStore } from "@/features/auth/store/useAuthStore"
import type { MenuPermissions } from "@/features/auth/types/menuPermissions"
import { cn } from "@/lib/utils"
import { patchResource } from "../api/aiEditableTableApi"
import type { ArtifactTablePayload } from "../api/aiEditableTableTypes"

type Props = {
  payload: ArtifactTablePayload
}

type RowFilter = "all" | "edited" | "editable"

function hasWritePermission(perms: MenuPermissions, resourceUrl: string): boolean {
  const url = resourceUrl.toLowerCase()
  if (url.includes("/products") || url.includes("/catalog")) return perms.can_manage_products
  if (url.includes("/inventory") || url.includes("/stock") || url.includes("/audit")) {
    return perms.can_manage_inventory
  }
  if (url.includes("/orders") || url.includes("/order")) return perms.can_manage_orders
  if (url.includes("/customers")) return perms.can_manage_customers
  return (
    perms.can_manage_products ||
    perms.can_manage_inventory ||
    perms.can_manage_orders ||
    perms.can_manage_customers
  )
}

function formatCell(value: unknown): string {
  if (value === null || value === undefined) return ""
  if (typeof value === "object") return JSON.stringify(value, null, 1)
  return String(value)
}

function displayCell(value: unknown): string {
  const text = formatCell(value)
  return text.trim() ? text : "-"
}

function getPkValue(row: Record<string, unknown>, pkField: string): string {
  const value = row[pkField]
  return value === null || value === undefined ? "" : String(value)
}

function rowHasValidPk(row: Record<string, unknown>, pkField: string): boolean {
  return getPkValue(row, pkField).trim().length > 0
}

export function AiChatEditableTableCard({ payload }: Props) {
  const { columns, rows, resourceUrl, pkField } = payload
  const menuPermissions = useAuthStore((s) => s.menuPermissions)
  const canEdit = hasWritePermission(menuPermissions, resourceUrl)

  const editableColumns = useMemo(() => columns.filter((c) => c.editable), [columns])

  const [open, setOpen] = useState(false)
  const [editedCells, setEditedCells] = useState<Record<string, Record<string, unknown>>>({})
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [rowFilter, setRowFilter] = useState<RowFilter>("all")

  const changedEntries = Object.entries(editedCells).filter(([, fields]) => Object.keys(fields).length > 0)
  const changedPkSet = useMemo(() => new Set(changedEntries.map(([pk]) => pk)), [changedEntries])
  const hasChanges = changedEntries.length > 0
  const hasActiveFilter = searchQuery.trim().length > 0 || rowFilter !== "all"

  function handleCellChange(pkValue: string, key: string, value: string) {
    if (!pkValue.trim()) return
    setEditedCells((prev) => ({
      ...prev,
      [pkValue]: { ...(prev[pkValue] ?? {}), [key]: value },
    }))
  }

  const getCellValue = useCallback((row: Record<string, unknown>, key: string): string => {
    const pkValue = getPkValue(row, pkField)
    const edited = editedCells[pkValue]?.[key]
    return edited !== undefined ? String(edited) : formatCell(row[key])
  }, [editedCells, pkField])

  const filteredRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return rows.filter((row) => {
      const pkValue = getPkValue(row, pkField)
      const matchesSearch = !q || columns.some((col) => getCellValue(row, col.key).toLowerCase().includes(q))
      if (!matchesSearch) return false
      if (rowFilter === "edited") return changedPkSet.has(pkValue)
      if (rowFilter === "editable") return rowHasValidPk(row, pkField) && editableColumns.length > 0
      return true
    })
  }, [rows, pkField, columns, searchQuery, rowFilter, changedPkSet, editableColumns.length, getCellValue])

  function handleDiscard() {
    setEditedCells({})
    setConfirmOpen(false)
  }

  async function handleConfirmSave() {
    setIsSubmitting(true)
    try {
      await Promise.all(changedEntries.map(([pkValue, fields]) => patchResource(resourceUrl, pkValue, fields)))
      toast.success(`Đã lưu ${changedEntries.length} dòng`)
      setEditedCells({})
      setConfirmOpen(false)
    } catch {
      toast.error("Lưu thất bại. Kiểm tra lại dữ liệu và quyền, sau đó thử lại.")
    } finally {
      setIsSubmitting(false)
    }
  }

  function filterButton(label: string, value: RowFilter) {
    const active = rowFilter === value
    return (
      <Button
        key={value}
        type="button"
        variant={active ? "default" : "outline"}
        size="sm"
        aria-pressed={active}
        onClick={() => setRowFilter(value)}
        className={cn(
          "h-8 rounded-md px-3 text-xs",
          active ? "bg-slate-900 text-white hover:bg-slate-800" : "border-slate-200 text-slate-700",
        )}
      >
        {label}
      </Button>
    )
  }

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)} className="gap-2">
        <Table2 className="h-4 w-4" />
        Xem bảng dữ liệu
      </Button>

      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen)
          if (!nextOpen) {
            setSearchQuery("")
            setRowFilter("all")
          }
        }}
      >
        <DialogContent
          className="flex max-h-[min(92dvh,920px)] w-[min(98vw,1520px)] max-w-[min(98vw,1520px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-[min(98vw,1520px)]"
          data-active-filter={hasActiveFilter ? "true" : undefined}
        >
          <DialogHeader className="border-b px-5 py-4">
            <div className="flex flex-wrap items-center gap-2 pr-8">
              <Table2 className="h-5 w-5 text-blue-600" />
              <DialogTitle className="mr-2 text-base">Bảng dữ liệu</DialogTitle>
              <Search className="hidden" aria-hidden="true" />
              <SlidersHorizontal className="hidden" aria-hidden="true" />
              <Badge variant="outline" className="border-slate-200 text-slate-700">
                {rows.length} dòng
              </Badge>
              <Badge variant="outline" className="border-slate-200 text-slate-700">
                {columns.length} cột
              </Badge>
              <Badge variant="outline" className="border-amber-200 text-amber-700">
                {changedEntries.length} dòng đã sửa
              </Badge>
              <Badge
                variant="outline"
                className={canEdit ? "border-blue-200 text-blue-700" : "border-slate-200 text-slate-500"}
              >
                {canEdit ? "Có thể sửa" : "Chỉ xem"}
              </Badge>
            </div>
            <DialogDescription className="sr-only">
              Tìm kiếm, lọc, xem và sửa dữ liệu.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-wrap items-center gap-2 border-b bg-slate-50/70 px-5 py-3">
            <div className="relative min-w-[220px] flex-1 sm:max-w-sm">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                type="search"
                role="searchbox"
                aria-label="Tìm kiếm"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Tìm kiếm..."
                className="h-8 border-slate-200 bg-white pl-8 text-sm shadow-none focus-visible:border-blue-500 focus-visible:ring-0"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {filterButton("Tất cả", "all")}
              {filterButton("Đã sửa", "edited")}
              {filterButton("Có thể sửa", "editable")}
            </div>
            {canEdit && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDiscard}
                disabled={!hasChanges || isSubmitting}
                className="ml-auto h-8 border-slate-200 text-xs"
              >
                Hủy thay đổi
              </Button>
            )}
          </div>

          <div className="flex-1 overflow-auto px-4 py-3">
            <Table className="w-max min-w-full text-sm border-separate border-spacing-0">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  {columns.map((col) => (
                    <TableHead
                      key={col.key}
                      className={cn(
                        "sticky top-0 z-10 bg-white border-b border-slate-200 px-3 py-2 text-left font-semibold text-slate-700 whitespace-nowrap",
                        col.editable && canEdit && "text-blue-700",
                      )}
                    >
                      {col.label}
                      {col.editable && canEdit && <Edit3 className="inline ml-1 h-3 w-3 opacity-60" />}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-28 text-center text-sm text-slate-500">
                      Không có dòng nào phù hợp.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRows.map((row, ri) => {
                    const pkValue = getPkValue(row, pkField)
                    const rowEdited = changedPkSet.has(pkValue)
                    return (
                      <TableRow
                        key={pkValue || ri}
                        data-edited={rowEdited ? "true" : undefined}
                        className={cn("hover:bg-slate-50/60", rowEdited && "bg-amber-50/60")}
                      >
                        {columns.map((col) => (
                          <TableCell key={col.key} className="px-3 py-1.5 border-b border-slate-100">
                            {canEdit && rowHasValidPk(row, pkField) && col.editable ? (
                              <>
                                <span className="sr-only">{getCellValue(row, col.key)}</span>
                                <Input
                                  aria-label={`Sửa ${col.label} của ${pkField} ${pkValue}`}
                                  value={getCellValue(row, col.key)}
                                  onChange={(event) => handleCellChange(pkValue, col.key, event.target.value)}
                                  className="h-8 w-full min-w-[120px] border-slate-200 text-sm shadow-none focus-visible:border-blue-500 focus-visible:ring-0"
                                />
                              </>
                            ) : (
                              <span
                                title={displayCell(row[col.key])}
                                className={cn(
                                  "block max-w-[220px] truncate text-slate-700",
                                  col.pk && "font-mono text-xs text-slate-400",
                                )}
                              >
                                {displayCell(row[col.key])}
                              </span>
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>

          <DialogFooter className="items-center border-t px-5 py-3 sm:justify-between">
            <p className="mr-auto text-xs text-slate-500">
              Hiển thị {filteredRows.length} / {rows.length} dòng
            </p>
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Đóng
            </Button>
            {canEdit && (
              <Button
                size="sm"
                className="bg-blue-600 text-white hover:bg-blue-700"
                onClick={() => setConfirmOpen(true)}
                disabled={!hasChanges || isSubmitting}
              >
                Lưu thay đổi ({changedEntries.length})
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Xác nhận lưu thay đổi</DialogTitle>
            <DialogDescription>
              Xem lại các dòng đã thay đổi trước khi lưu.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 space-y-2">
            <p className="text-sm text-slate-600">
              Sẽ cập nhật <span className="font-semibold">{changedEntries.length} dòng</span> trong hệ thống:
            </p>
            <ul className="text-xs text-slate-500 space-y-1 max-h-40 overflow-auto">
              {changedEntries.map(([pkValue, fields]) => (
                <li key={pkValue} className="flex gap-2">
                  <span className="font-mono shrink-0">
                    {pkField}={pkValue}
                  </span>
                  <span>{Object.entries(fields).map(([k, v]) => `${k}=${v}`).join(", ")}</span>
                </li>
              ))}
            </ul>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setConfirmOpen(false)} disabled={isSubmitting}>
              Hủy
            </Button>
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleConfirmSave}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Đang lưu..." : "Xác nhận lưu"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
