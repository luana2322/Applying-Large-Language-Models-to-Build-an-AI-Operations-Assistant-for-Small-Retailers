export interface ApiResponse<T> {
  success: boolean
  code?: string
  message?: string
  data: T
}

export interface ToolCallExecution {
  name: string
  status: 'success' | 'failed' | 'error'
  arguments?: Record<string, unknown>
  result?: unknown
  duration_ms?: number
}

export interface ChatMessageRequest {
  request_id: string
  session_id: string
  message: string
  context?: {
    timezone?: string
    locale?: string
    [key: string]: unknown
  }
}

export interface ChatMessageResponse {
  request_id: string
  session_id: string
  intent?: string
  answer: string
  tool_calls?: ToolCallExecution[]
  data?: Record<string, any>
  grounded?: boolean
}

export interface StoreInfo {
  store_id: number
  store_code: string
  name: string
  address?: string
  phone?: string
  status: string
}
