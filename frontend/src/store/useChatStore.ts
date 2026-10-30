import { create } from 'zustand'
import { ChatMessageResponse } from '../types/api'

export interface ChatMessageItem {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
  responseMetadata?: ChatMessageResponse
}

interface ChatState {
  sessionId: string
  messages: ChatMessageItem[]
  isLoading: boolean
  activeInspector: ChatMessageResponse | null
  initNewSession: () => void
  addMessage: (msg: ChatMessageItem) => void
  setLoading: (loading: boolean) => void
  setActiveInspector: (data: ChatMessageResponse | null) => void
  clearMessages: () => void
}

const generateSessionId = () => 'session-' + Math.random().toString(36).substring(2, 10)

export const useChatStore = create<ChatState>((set) => ({
  sessionId: generateSessionId(),
  messages: [
    {
      id: 'welcome-1',
      role: 'assistant',
      content:
        'Xin chào Chủ cửa hàng! Tôi là Trợ lý Vận hành PetHouse 🐾\n\nTôi có thể giúp bạn kiểm tra doanh thu, cảnh báo hàng sắp hết hoặc cận hạn, xem lịch hẹn grooming/spa hôm nay, hoặc tra cứu sản phẩm theo đặc tính (grain-free, độ tuổi, giống loài).',
      timestamp: Date.now(),
    },
  ],
  isLoading: false,
  activeInspector: null,
  initNewSession: () =>
    set({
      sessionId: generateSessionId(),
      messages: [
        {
          id: 'welcome-' + Date.now(),
          role: 'assistant',
          content: 'Phiên làm việc mới đã bắt đầu! Bạn muốn xem số liệu nào hôm nay?',
          timestamp: Date.now(),
        },
      ],
      activeInspector: null,
    }),
  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
  setLoading: (loading) => set({ isLoading: loading }),
  setActiveInspector: (data) => set({ activeInspector: data }),
  clearMessages: () => set({ messages: [], activeInspector: null }),
}))
