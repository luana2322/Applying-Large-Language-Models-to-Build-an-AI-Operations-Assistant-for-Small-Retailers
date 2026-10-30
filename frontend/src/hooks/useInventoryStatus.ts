import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

export interface InventoryItem {
  product_id: number
  name: string
  stock_quantity: number
  min_stock_level: number
  status: string
}

export interface InventoryStatusData {
  total_items: number
  low_stock_count: number
  out_of_stock_count: number
  items: InventoryItem[]
}

export function useInventoryStatus(storeId = 1) {
  return useQuery<InventoryStatusData>({
    queryKey: ['inventory-status', storeId],
    queryFn: async () => {
      const res = await axios.post(
        '/internal/api/v1/business/inventory-status',
        { status: 'all' },
        { headers: { 'X-Store-Id': String(storeId) } }
      )
      return res.data.data
    },
  })
}
