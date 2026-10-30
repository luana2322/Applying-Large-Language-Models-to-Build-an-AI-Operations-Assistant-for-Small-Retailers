import type { ThemeConfig } from 'antd'

export const lightRetailerTheme: ThemeConfig = {
  token: {
    // 1. Primary & Accents
    colorPrimary: '#F97316',      // Cam ấm PetHouse
    colorInfo: '#14B8A6',         // Teal hỗ trợ & AI accent
    colorSuccess: '#22C55E',      // Xanh lá tích cực
    colorWarning: '#F59E0B',      // Vàng cảnh báo
    colorError: '#EF4444',        // Đỏ nguy hiểm / cận hạn / hết hàng

    // 2. Backgrounds
    colorBgBase: '#FFFFFF',
    colorBgContainer: '#FFFFFF',
    colorBgElevated: '#FFFFFF',
    colorBgLayout: '#F8FAFC',     // Chuẩn ERP KiotViet/Sapo

    // 3. Text & Borders
    colorText: '#0F172A',         // Slate 900
    colorTextSecondary: '#475569',// Slate 600
    colorTextTertiary: '#94A3B8', // Slate 400
    colorBorder: '#E2E8F0',       // Slate 200
    colorBorderSecondary: '#F1F5F9',

    // 4. Geometry & Typography (Chuẩn ERP: bo góc 4-6px, font 13px)
    borderRadius: 4,              // Bo góc 4px cho button/input/tag
    fontSize: 13,
    controlHeight: 34,
    fontFamily: "'Be Vietnam Pro', 'Inter', system-ui, -apple-system, sans-serif",
  },
  components: {
    Layout: {
      siderBg: '#FFFFFF',
      headerBg: '#FFFFFF',
      bodyBg: '#F8FAFC',
    },
    Card: {
      colorBgContainer: '#FFFFFF',
      colorBorderSecondary: '#E2E8F0',
      borderRadiusLG: 6,
      boxShadowTertiary: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    },
    Button: {
      controlHeight: 34,
      fontWeight: 600,
      borderRadius: 4,
    },
    Input: {
      controlHeight: 34,
      fontSize: 13,
      borderRadius: 4,
      colorBorder: '#CBD5E1',
    },
    Select: {
      controlHeight: 34,
      fontSize: 13,
      borderRadius: 4,
    },
    Table: {
      colorBgContainer: '#FFFFFF',
      headerBg: '#F8FAFC',
      headerColor: '#64748B',
      rowHoverBg: '#FFF7ED',      // Hover cam nhạt
      fontSize: 12,
    },
    Menu: {
      itemColor: '#475569',
      itemSelectedColor: '#F97316',
      itemSelectedBg: '#FFF7ED',
      fontSize: 13,
      itemHeight: 38,
      itemBorderRadius: 4,
    },
  },
}
