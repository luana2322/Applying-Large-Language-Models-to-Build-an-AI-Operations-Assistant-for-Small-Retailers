import React from 'react'
import { Layout, Menu, Select, Typography, Badge } from 'antd'
import {
  ShopOutlined,
  BarChartOutlined,
  MessageOutlined,
  InboxOutlined,
  HeartOutlined,
  ScissorOutlined,
} from '@ant-design/icons'
import { useLocation, useNavigate } from 'react-router-dom'
import { useStoreStore, STORES } from '../../store/useStoreStore'
import { useChatStore } from '../../store/useChatStore'

const { Sider } = Layout
const { Text } = Typography

export const Sidebar: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { currentStoreCode, setStore } = useStoreStore()
  const { initNewSession } = useChatStore()

  const handleStoreChange = (value: string) => {
    setStore(value)
    initNewSession()
  }

  const menuItems = [
    {
      key: '/sales/pos',
      icon: <ShopOutlined style={{ fontSize: 18, color: '#F97316' }} />,
      label: <span style={{ fontWeight: 600 }}>Quầy Bán Hàng (POS)</span>,
    },
    {
      key: '/pets',
      icon: <HeartOutlined style={{ fontSize: 18, color: '#EC4899' }} />,
      label: <span style={{ fontWeight: 600 }}>Hồ Sơ Thú Cưng (Pets)</span>,
    },
    {
      key: '/services',
      icon: <ScissorOutlined style={{ fontSize: 18, color: '#0D9488' }} />,
      label: <span style={{ fontWeight: 600 }}>Dịch Vụ & Lịch Grooming</span>,
    },
    {
      key: '/inventory',
      icon: <InboxOutlined style={{ fontSize: 18, color: '#D97706' }} />,
      label: <span style={{ fontWeight: 600 }}>Kho Hàng & Lô HSD</span>,
    },
    {
      key: '/finance',
      icon: <BarChartOutlined style={{ fontSize: 18, color: '#22C55E' }} />,
      label: <span style={{ fontWeight: 600 }}>Sổ Quỹ & Thu Chi</span>,
    },
    {
      key: '/dashboard',
      icon: <BarChartOutlined style={{ fontSize: 18, color: '#14B8A6' }} />,
      label: <span style={{ fontWeight: 600 }}>Dashboard Doanh Thu</span>,
    },
    {
      key: '/',
      icon: <MessageOutlined style={{ fontSize: 18, color: '#F97316' }} />,
      label: <span style={{ fontWeight: 600 }}>Trợ Lý PetHouse AI</span>,
    },
  ]

  return (
    <Sider
      width={260}
      style={{
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        background: '#FFFFFF',
        borderRight: '1px solid #E2E8F0',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          padding: '20px 16px',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 22,
            boxShadow: '0 4px 10px rgba(249,115,22,0.3)',
          }}
        >
          🐾
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 16, color: '#0F172A', lineHeight: 1.2 }}>
            PetHouse
          </div>
          <Text style={{ fontSize: 12, color: '#64748B' }}>
            Trợ lý Vận hành & Spa
          </Text>
        </div>
      </div>

      {/* Store Selector */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #E2E8F0', background: '#FFFBF5' }}>
        <Text style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Cửa hàng hoạt động
        </Text>
        <Select
          value={currentStoreCode}
          onChange={handleStoreChange}
          style={{ width: '100%', marginTop: 6 }}
          options={STORES.map((s) => ({
            value: s.code,
            label: (
              <span style={{ fontWeight: 600, color: '#0F172A' }}>
                {s.name}
              </span>
            ),
          }))}
        />
      </div>

      {/* Main Navigation Menu */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 8px' }}>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          onClick={({ key }) => navigate(key)}
          style={{ borderRight: 0 }}
          items={menuItems}
        />
      </div>

      {/* Footer Info */}
      <div
        style={{
          padding: '16px',
          borderTop: '1px solid #E2E8F0',
          background: '#FFFBF5',
          fontSize: 12,
          color: '#64748B',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span>Phiên bản:</span>
          <span style={{ fontWeight: 600, color: '#0F172A' }}>v2.0 (PetHouse)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Badge status="processing" color="#14B8A6" />
          <span style={{ color: '#0F172A', fontWeight: 500 }}>AI Core: Đang trực tuyến</span>
        </div>
      </div>
    </Sider>
  )
}
