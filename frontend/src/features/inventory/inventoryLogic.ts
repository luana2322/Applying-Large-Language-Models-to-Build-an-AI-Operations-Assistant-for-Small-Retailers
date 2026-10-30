import type { InventoryFilters, InventoryItem, InventoryKPIs } from './types';

/**
 * P3 — Inventory Action Signals (SDD Task 3).
 *
 * `expiring-soon` và `stale-stock` không có tham số `stockLevel` riêng ở BE
 * (tránh mở rộng schema/API trong phase UI này); các cờ `isExpiringSoon` /
 * `isStale` đã được BE tính sẵn trên mỗi dòng (`InventoryListService`), nên
 * FE chỉ cần lọc lại trên trang dữ liệu đã tải — không tự tính rule nghiệp vụ.
 */
export function applyStockActionFilter(
  items: InventoryItem[],
  status: InventoryFilters['status'],
): InventoryItem[] {
  switch (status) {
    case 'expiring-soon':
      return items.filter((item) => item.isExpiringSoon);
    case 'stale-stock':
      return items.filter((item) => item.isStale === true);
    default:
      return items;
  }
}

export function applyBulkDelete(items: InventoryItem[], idsToDelete: number[]): InventoryItem[] {
  return items.filter(item => !idsToDelete.includes(item.id));
}

export function applyBulkApprove(items: InventoryItem[], idsToApprove: number[]): InventoryItem[] {
  return items.map(item => {
    if (idsToApprove.includes(item.id)) {
      return { ...item, status: 'Active' };
    }
    return item;
  });
}

export function recalculateKPIs(items: InventoryItem[]): InventoryKPIs {
  let totalValue = 0;
  let lowStockCount = 0;
  let expiringSoonCount = 0;

  for (const item of items) {
    totalValue += item.quantity * item.costPrice;
    if (item.quantity <= item.minQuantity) {
      lowStockCount++;
    }
    if (item.isExpiringSoon) {
      expiringSoonCount++;
    }
  }

  return {
    totalSKUs: items.length,
    totalValue,
    lowStockCount,
    expiringSoonCount,
  };
}
