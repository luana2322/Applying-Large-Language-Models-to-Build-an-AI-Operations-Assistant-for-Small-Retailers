import React from 'react'
import { Layout, Typography, Button, Space, Avatar, Tag } from 'antd'
import { ReloadOutlined, UserOutlined } from '@ant-design/icons'
import { useAuthStore } from '../../store/useAuthStore'
import { useChatStore } from '../../store/useChatStore'
import { useStoreStore } from '../../store/useStoreStore'

const { Header } = Layout
const { Title, Text } = Typography

export const Topbar: React.FC = () => {
  const { user } = useAuthStore()
  const { initNewSession } = useChatStore()
  const { currentStoreName } = useStoreStore()

  return (
    <Header
      style={{
        background: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 64,
        position: 'sticky',
        top: 0,
        zIndex: 90,
      }}
    >
      <div>
        <Title level={4} style={{ margin: 0, color: '#0F172A', fontSize: 17, fontWeight: 700 }}>
          {currentStoreName}
        </Title>
        <Text style={{ fontSize: 13, color: '#64748B' }}>
          Số liệu đối chiếu trực tiếp từ cơ sở dữ liệu bán hàng
        </Text>
      </div>

      <Space size="middle">
        <Button
          icon={<ReloadOutlined />}
          onClick={initNewSession}
          style={{
            background: '#F8FAFC',
            borderColor: '#CBD5E1',
            color: '#1E293B',
            fontWeight: 500,
          }}
        >
          Làm mới phiên hỏi đáp
        </Button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar
            style={{ backgroundColor: '#2563EB', color: '#FFFFFF' }}
            icon={<UserOutlined />}
          />
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
            <Text style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>
              {user?.fullName || 'Chủ Cửa Hàng'}
            </Text>
            <Tag color="blue" style={{ margin: 0, width: 'fit-content', fontSize: 11, padding: '0 4px', fontWeight: 600 }}>
              Chủ Hộ Kinh Doanh
            </Tag>
          </div>
        </div>
      </Space>
    </Header>
  )
}
