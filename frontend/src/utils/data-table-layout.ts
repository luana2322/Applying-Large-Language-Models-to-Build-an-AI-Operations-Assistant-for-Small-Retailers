/**
 * Chuẩn layout bảng danh sách (Data Table) kế thừa từ dự án gốc mini-erp.
 * Tinh chỉnh màu sắc và kích thước theo đúng chuẩn ERP Pet Store (KiotViet/Sapo).
 */

/** Gốc `<Table>`: một thead + tbody, `table-fixed`, không cuộn ngang trên desktop (fit window). */
export const DATA_TABLE_ROOT_CLASS =
  "bg-white border-none border-separate border-spacing-0 table-fixed w-full text-left text-[12px]"

/** Vỏ bảng (wrapper) chuẩn: border + radius + shadow, dùng chung toàn project. */
export const DATA_TABLE_SHELL_CLASS =
  "flex-1 flex flex-col min-h-0 bg-white border border-[#E2E8F0] rounded-[6px] overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.05)]"

/** Vùng cuộn bảng (1 vùng cuộn cho thead sticky + tbody). */
export const DATA_TABLE_SCROLL_CLASS =
  "flex-1 overflow-y-auto relative scroll-smooth [scrollbar-gutter:stable] min-h-0"

/** Cột thao tác cuối cùng */
export const DATA_TABLE_ACTION_COL_WIDTH = "w-[120px]"

export const DATA_TABLE_ACTION_HEAD_CLASS = `${DATA_TABLE_ACTION_COL_WIDTH} text-center sticky right-0 z-30 bg-[#F8FAFC] shadow-[-4px_0_8px_-4px_rgba(15,23,42,0.08)]`

export const DATA_TABLE_ACTION_CELL_CLASS = `${DATA_TABLE_ACTION_COL_WIDTH} text-center sticky right-0 z-10 bg-white group-hover:bg-[#FFF7ED]/50 shadow-[-4px_0_8px_-4px_rgba(15,23,42,0.05)]`

/** Định nghĩa kích thước cột Tồn kho & Lô hạn Pet Store */
export const PET_INVENTORY_TABLE_COL = {
  sku: "w-[120px]",
  name: "min-w-[200px]",
  category: "w-[140px]",
  warehouse: "w-[110px]",
  batch: "w-[130px]",
  expiry: "w-[110px]",
  stock: "w-[90px] text-right",
  minStock: "w-[90px] text-right",
  status: "w-[120px] text-center",
} as const

/** Typography tiêu chuẩn */
export const TABLE_HEAD_CLASS = "h-[36px] text-[11px] font-semibold uppercase tracking-wider text-[#64748B] bg-[#F8FAFC] border-b border-[#CBD5E1] select-none"
export const TABLE_ROW_CLASS = "h-[40px] hover:bg-[#FFF7ED]/60 border-b border-[#F1F5F9] transition-colors cursor-pointer group"
export const TABLE_CELL_PRIMARY_CLASS = "px-2 font-medium text-[#0F172A]"
export const TABLE_CELL_SECONDARY_CLASS = "px-2 text-[#475569]"
export const TABLE_CELL_MONO_CLASS = "px-2 font-mono text-[11px] text-[#64748B]"
export const TABLE_CELL_NUMBER_CLASS = "px-2 text-right font-semibold text-[#0F172A] tabular-nums"
