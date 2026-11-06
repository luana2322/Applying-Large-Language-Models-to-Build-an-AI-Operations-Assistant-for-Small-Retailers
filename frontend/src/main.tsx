import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.tsx'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0, // Dữ liệu luôn đồng bộ real-time giữa các trang/tab, không bị cache cũ
      retry: 1,
      refetchOnWindowFocus: true, // Tự động làm mới khi người dùng quay lại tab trình duyệt
      refetchOnMount: true, // Tự động tải lại dữ liệu mới nhất khi chuyển trang
      refetchOnReconnect: true,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)
