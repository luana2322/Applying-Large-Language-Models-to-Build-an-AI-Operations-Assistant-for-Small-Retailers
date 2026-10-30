import React from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import { AiAssistantPage } from '../pages/ai-assistant/AiAssistantPage'
import { DashboardPage } from '../pages/dashboard/DashboardPage'
import { StockDispatchForm } from '../pages/inventory/dispatch/StockDispatchForm'
import { POSPage } from '../pages/sales/pos/POSPage'
import { PetsPage } from '../pages/pets/PetsPage'
import { GroomingServicesPage } from '../pages/services/GroomingServicesPage'
import { InventoryPage } from '../pages/inventory/InventoryPage'
import { FinancePage } from '../pages/finance/FinancePage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <AiAssistantPage />,
      },
      {
        path: 'sales/pos',
        element: <POSPage />,
      },
      {
        path: 'pos',
        element: <Navigate to="/sales/pos" replace />,
      },
      {
        path: 'pets',
        element: <PetsPage />,
      },
      {
        path: 'services',
        element: <GroomingServicesPage />,
      },
      {
        path: 'inventory',
        element: <InventoryPage />,
      },
      {
        path: 'finance',
        element: <FinancePage />,
      },
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'inventory/dispatch',
        element: <StockDispatchForm />,
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
])
