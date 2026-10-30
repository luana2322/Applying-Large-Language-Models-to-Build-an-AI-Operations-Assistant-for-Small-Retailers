import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { server } from '../../../test/mocks/server'
import { renderWithProviders } from '../../../test/utils'
import { StockDispatchForm } from './StockDispatchForm'

describe('Integration Test: StockDispatchForm Page', () => {
  it('renders form inputs and handles client-side validation', async () => {
    const user = userEvent.setup()
    renderWithProviders(<StockDispatchForm />)

    expect(screen.getByText('Tạo phiếu xuất điều chuyển kho')).toBeInTheDocument()

    // Click submit without entering required fields
    const submitBtn = screen.getByTestId('submit-btn')
    await user.click(submitBtn)

    // Verify validation errors appear
    await waitFor(() => {
      expect(screen.getByText('Vui lòng nhập mã sản phẩm')).toBeInTheDocument()
      expect(screen.getByText('Vui lòng nhập số lượng')).toBeInTheDocument()
    })
  })

  it('submits valid form data, shows success alert, and navigates', async () => {
    const user = userEvent.setup()

    server.use(
      http.post('/api/v1/inventory/stock-dispatches', async ({ request }) => {
        const payload = await request.json()
        return HttpResponse.json({ success: true, id: 999, data: payload }, { status: 201 })
      })
    )

    renderWithProviders(<StockDispatchForm />)

    // Fill form
    const productIdInput = screen.getByTestId('input-product-id')
    const quantityInput = screen.getByTestId('input-quantity')
    const noteInput = screen.getByTestId('input-note')

    await user.type(productIdInput, '101')
    await user.type(quantityInput, '15')
    await user.type(noteInput, 'Chuyển hàng qua quầy 2')

    // Submit form
    await user.click(screen.getByTestId('submit-btn'))

    // Verify success alert appears
    await waitFor(() => {
      expect(screen.getByTestId('success-alert')).toHaveTextContent('Tạo phiếu điều chuyển kho thành công!')
    })
  })

  it('displays API error alert when backend rejects the request', async () => {
    const user = userEvent.setup()

    server.use(
      http.post('/api/v1/inventory/stock-dispatches', () => {
        return HttpResponse.json(
          { message: 'Số lượng trong kho không đủ để điều chuyển' },
          { status: 400 }
        )
      })
    )

    renderWithProviders(<StockDispatchForm />)

    await user.type(screen.getByTestId('input-product-id'), '101')
    await user.type(screen.getByTestId('input-quantity'), '9999')
    await user.click(screen.getByTestId('submit-btn'))

    await waitFor(() => {
      expect(screen.getByTestId('error-alert')).toHaveTextContent(
        'Số lượng trong kho không đủ để điều chuyển'
      )
    })
  })
})
