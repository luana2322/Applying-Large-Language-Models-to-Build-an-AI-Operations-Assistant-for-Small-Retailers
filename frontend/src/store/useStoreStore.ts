import { create } from 'zustand'

export interface StoreOption {
  code: string
  id: number
  name: string
}

export const STORES: StoreOption[] = [
  { code: 'STORE-001', id: 1, name: 'Tạp hóa An Bình (Quận 5, TP.HCM)' },
  { code: 'STORE-002', id: 2, name: 'Cửa hàng Tiện lợi Phúc Khang (Hà Nội)' },
]

interface StoreState {
  currentStoreCode: string
  currentStoreId: number
  currentStoreName: string
  setStore: (code: string) => void
}

export const useStoreStore = create<StoreState>((set) => ({
  currentStoreCode: 'STORE-001',
  currentStoreId: 1,
  currentStoreName: 'Tạp hóa An Bình (Quận 5, TP.HCM)',
  setStore: (code: string) => {
    const found = STORES.find((s) => s.code === code) || STORES[0]
    set({
      currentStoreCode: found.code,
      currentStoreId: found.id,
      currentStoreName: found.name,
    })
  },
}))
