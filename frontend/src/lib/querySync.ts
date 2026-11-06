import type { QueryClient } from "@tanstack/react-query"
import { POS_PRODUCTS_SEARCH_QUERY_KEY } from "@/features/orders/api/posProductsApi"

/**
 * Đồng bộ toàn bộ dữ liệu tồn kho, danh sách sản phẩm, đơn hàng và bảng điều khiển
 * ngay sau khi có bất kỳ thay đổi nào (bán lẻ POS, hủy đơn, nhập kho, xuất kho, điều chỉnh kho).
 */
export async function syncAllInventoryAndOrders(queryClient: QueryClient) {
  await Promise.allSettled([
    // 1. Toàn bộ đơn hàng & lịch sử bán lẻ
    queryClient.invalidateQueries({ queryKey: ["orders"] }),
    queryClient.invalidateQueries({ queryKey: ["sales-orders"] }),

    // 2. Tồn kho và sản phẩm trên POS (cưỡng bức refetch active query ngay lập tức)
    queryClient.refetchQueries({ queryKey: POS_PRODUCTS_SEARCH_QUERY_KEY, type: "active" }),
    queryClient.invalidateQueries({ queryKey: POS_PRODUCTS_SEARCH_QUERY_KEY }),

    // 3. Danh mục & Danh sách sản phẩm
    queryClient.invalidateQueries({ queryKey: ["product-management"] }),
    queryClient.invalidateQueries({ queryKey: ["products"] }),
    queryClient.invalidateQueries({ queryKey: ["product-detail"] }),

    // 4. Kho hàng: Danh sách tồn kho, Phiếu nhập, Phiếu xuất, Kiểm kê
    queryClient.invalidateQueries({ queryKey: ["inventory"] }),
    queryClient.invalidateQueries({ queryKey: ["stock-receipts"] }),
    queryClient.invalidateQueries({ queryKey: ["stock-dispatches"] }),
    queryClient.invalidateQueries({ queryKey: ["stock-receipt-detail"] }),
    queryClient.invalidateQueries({ queryKey: ["stock-dispatch-detail"] }),

    // 5. Thống kê & Dashboard
    queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
    queryClient.invalidateQueries({ queryKey: ["today"] }),
    queryClient.invalidateQueries({ queryKey: ["analytics"] }),
    queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  ])
}
