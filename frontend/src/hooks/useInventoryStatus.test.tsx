import { describe, it, expect } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React, { PropsWithChildren } from 'react'
import { http, HttpResponse } from 'msw'
import { server } from '../test/mocks/server'
import { useInventoryStatus } from './useInventoryStatus'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })
  return function Wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

describe('useInventoryStatus Hook', () => {
  it('successfully fetches inventory status data via MSW', async () => {
    const { result } = renderHook(() => useInventoryStatus(1), {
      wrapper: createWrapper(),
    })

    // Initially loading
    expect(result.current.isLoading).toBe(true)

    // Wait until query succeeds
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data?.total_items).toBe(250)
    expect(result.current.data?.low_stock_count).toBe(8)
    expect(result.current.data?.items).toHaveLength(2)
    expect(result.current.data?.items[0].name).toBe('Sữa tươi Vinamilk 1L')
  })

  it('handles server error gracefully', async () => {
    // Override handler to simulate 500 Internal Server Error
    server.use(
      http.post('/internal/api/v1/business/inventory-status', () => {
        return new HttpResponse(null, { status: 500 })
      })
    )

    const { result } = renderHook(() => useInventoryStatus(1), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.data).toBeUndefined()
  })
})
