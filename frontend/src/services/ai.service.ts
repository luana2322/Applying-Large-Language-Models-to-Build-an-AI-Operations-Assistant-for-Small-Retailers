import { apiClient } from './api'
import { ChatMessageRequest, ChatMessageResponse, StoreInfo } from '../types/api'

export const aiService = {
  async sendMessage(payload: ChatMessageRequest): Promise<ChatMessageResponse> {
    const res = await apiClient.post<ChatMessageResponse>('/api/v1/chat', payload)
    return res.data
  },

  async getCurrentStoreInfo(): Promise<StoreInfo> {
    const res = await apiClient.get<StoreInfo>('/api/v1/store/current')
    return res.data
  },
}
