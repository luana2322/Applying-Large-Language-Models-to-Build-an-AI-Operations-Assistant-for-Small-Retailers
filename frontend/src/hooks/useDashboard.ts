import { useQuery } from '@tanstack/react-query'
import { businessService } from '../services/business.service'
import { useStoreStore } from '../store/useStoreStore'

export function useDashboardData() {
  const { currentStoreId } = useStoreStore()

  const salesQuery = useQuery({
    queryKey: ['dashboard-sales', currentStoreId],
    queryFn: () => businessService.getSalesSummary(),
    staleTime: 5 * 60 * 1000,
  })

  const profitQuery = useQuery({
    queryKey: ['dashboard-profit', currentStoreId],
    queryFn: () => businessService.getProfitSummary(),
    staleTime: 5 * 60 * 1000,
  })

  const topProductsQuery = useQuery({
    queryKey: ['dashboard-top-products', currentStoreId],
    queryFn: () => businessService.getTopProducts(undefined, undefined, 'quantity', 5),
    staleTime: 5 * 60 * 1000,
  })

  const inventoryQuery = useQuery({
    queryKey: ['dashboard-inventory', currentStoreId],
    queryFn: () => businessService.getInventoryStatus(),
    staleTime: 60 * 1000,
  })

  const restockQuery = useQuery({
    queryKey: ['dashboard-restock', currentStoreId],
    queryFn: () => businessService.getRestockSuggestions(),
    staleTime: 5 * 60 * 1000,
  })

  const isLoading =
    salesQuery.isLoading ||
    profitQuery.isLoading ||
    topProductsQuery.isLoading ||
    inventoryQuery.isLoading ||
    restockQuery.isLoading

  return {
    sales: salesQuery.data,
    profit: profitQuery.data,
    topProducts: topProductsQuery.data,
    inventory: inventoryQuery.data,
    restock: restockQuery.data,
    isLoading,
    refetchAll: () => {
      salesQuery.refetch()
      profitQuery.refetch()
      topProductsQuery.refetch()
      inventoryQuery.refetch()
      restockQuery.refetch()
    },
  }
}
