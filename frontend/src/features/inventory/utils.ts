/**
 * Format number as Vietnamese currency (VND)
 * Example: 1200000 -> "1.200.000 ₫"
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format date as Vietnamese format DD/MM/YYYY
 */
export function formatDate(dateString: string | undefined | null): string {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

/**
 * Format date with time DD/MM/YYYY HH:mm
 */
export function formatDateTime(dateString: string | undefined | null): string {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/**
 * Generate receipt code: PN-YYYY-NNNN
 */
export function generateReceiptCode(index: number = 1): string {
  const year = new Date().getFullYear();
  return `PN-${year}-${String(index).padStart(4, '0')}`;
}

/**
 * Generate dispatch code: PX-YYYY-NNNN
 */
export function generateDispatchCode(index: number = 1): string {
  const year = new Date().getFullYear();
  return `PX-${year}-${String(index).padStart(4, '0')}`;
}

/**
 * Generate audit code: KK-YYYY-NNNN
 */
export function generateAuditCode(index: number = 1): string {
  const year = new Date().getFullYear();
  return `KK-${year}-${String(index).padStart(4, '0')}`;
}

/**
 * Calculate variance percentage
 */
export function calculateVariancePercent(actual: number, system: number): number {
  if (system === 0) return 0;
  return ((actual - system) / system) * 100;
}

/**
 * Lấy chữ cái đại diện ngắn gọn cho tên người dùng hiển thị trên Avatar tròn.
 * Ví dụ: "Trần Văn Minh (Nhân viên)" -> "TM"
 */
export function getUserInitials(name?: string | null, maxChars = 2): string {
  if (!name) return "U";
  // Bỏ phần chú thích trong ngoặc đơn như (Nhân viên), (Chủ cửa hàng)
  const clean = name.replace(/\(.*?\)/g, "").trim();
  if (!clean) return "U";
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length === 1) {
    return words[0].slice(0, maxChars).toUpperCase();
  }
  if (maxChars === 1) {
    return words[words.length - 1][0].toUpperCase();
  }
  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
}
