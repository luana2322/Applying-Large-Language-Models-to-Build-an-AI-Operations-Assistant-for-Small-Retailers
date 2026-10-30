import { http, HttpResponse } from 'msw'

export const handlers = [
  // Mock current store endpoint
  http.get('/api/v1/store/current', () => {
    return HttpResponse.json({
      store_id: 1,
      store_code: 'STORE-001',
      name: 'Tạp hóa An Bình (Quận 5, TP.HCM)',
      status: 'ACTIVE',
    })
  }),

  // Mock AI Chat Gateway endpoint
  http.post('/api/v1/chat', async ({ request }) => {
    const body = (await request.json()) as { message?: string; session_id?: string }
    const message = body?.message || ''

    if (message.includes('doanh thu') || message.includes('bán được')) {
      return HttpResponse.json({
        request_id: 'mock-req-001',
        session_id: body?.session_id || 'mock-session',
        intent: 'SALES_ANALYSIS',
        answer: 'Hôm nay cửa hàng đạt tổng doanh thu là 14.850.000 VNĐ với 42 đơn hàng.',
        tool_calls: [
          {
            name: 'get_sales_summary',
            status: 'success',
            arguments: { start_date: '2026-10-17', end_date: '2026-10-17' },
          },
        ],
        data: {
          total_revenue: 14850000,
          total_orders: 42,
          currency: 'VND',
        },
      })
    }

    return HttpResponse.json({
      request_id: 'mock-req-default',
      session_id: body?.session_id || 'mock-session',
      intent: 'GENERAL',
      answer: 'Xin chào! Tôi là Trợ lý Vận hành Bán lẻ (Retail Operations Assistant). Tôi có thể hỗ trợ gì cho bạn?',
      tool_calls: [],
      data: null,
    })
  }),

  // Mock Internal Business Tool: Sales Summary
  http.post('/internal/api/v1/business/sales-summary', () => {
    return HttpResponse.json({
      success: true,
      store_id: 1,
      code: 'OK',
      data: {
        total_revenue: 125000000,
        net_revenue: 121500000,
        total_orders: 340,
        average_order_value: 367647,
      },
    })
  }),

  // Mock Internal Business Tool: Inventory Status
  http.post('/internal/api/v1/business/inventory-status', () => {
    return HttpResponse.json({
      success: true,
      store_id: 1,
      code: 'OK',
      data: {
        total_items: 250,
        low_stock_count: 8,
        out_of_stock_count: 2,
        items: [
          { product_id: 101, name: 'Sữa tươi Vinamilk 1L', stock_quantity: 4, min_stock_level: 10, status: 'LOW_STOCK' },
          { product_id: 102, name: 'Mì Hảo Hảo Tôm Chua Cay', stock_quantity: 0, min_stock_level: 20, status: 'OUT_OF_STOCK' },
        ],
      },
    })
  }),
]
