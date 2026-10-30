import { create } from 'zustand'

export interface UserProfile {
  id: number
  username: string
  fullName: string
  role: 'OWNER' | 'MANAGER' | 'CASHIER' | 'VIEWER'
}

interface AuthState {
  user: UserProfile | null
  token: string | null
  isAuthenticated: boolean
  login: (user: UserProfile, token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: {
    id: 1,
    username: 'owner_anbinh',
    fullName: 'Nguyễn Văn An (Chủ cửa hàng)',
    role: 'OWNER',
  },
  token: 'mock-jwt-token-retail-v1',
  isAuthenticated: true,
  login: (user, token) => set({ user, token, isAuthenticated: true }),
  logout: () => set({ user: null, token: null, isAuthenticated: false }),
}))
