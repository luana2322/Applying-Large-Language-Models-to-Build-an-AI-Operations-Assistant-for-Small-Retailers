import React from 'react'
import { Layout } from 'antd'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { ShopOutlined, BarChartOutlined, MessageOutlined, InboxOutlined, HeartOutlined, ScissorOutlined } from '@ant-design/icons'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

const { Content } = Layout

export const AppLayout: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <Layout style={{ minHeight: '100vh', background: '#FFFBF5' }}>
      {/* Desktop Sidebar */}
      <div className="desktop-sidebar">
        <Sidebar />
      </div>

      <Layout style={{ marginLeft: 260, background: '#FFFBF5', paddingBottom: 60 }} className="main-layout">
        <Topbar />
        <Content
          style={{
            padding: '24px',
            background: '#FFFBF5',
            minHeight: 'calc(100vh - 64px)',
          }}
        >
          <Outlet />
        </Content>
      </Layout>

      {/* Mobile Bottom Navigation Bar */}
      <div
        className="mobile-bottom-nav"
        style={{
          display: 'none',
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: 60,
          background: '#FFFFFF',
          borderTop: '1px solid #E2E8F0',
          zIndex: 1000,
          justifyContent: 'space-around',
          alignItems: 'center',
        }}
      >
        <button
          onClick={() => navigate('/sales/pos')}
          style={{
            background: 'none',
            border: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            color: location.pathname === '/sales/pos' ? '#F97316' : '#64748B',
            fontSize: 11,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <ShopOutlined style={{ fontSize: 20, marginBottom: 2 }} />
          Bán Hàng
        </button>

        <button
          onClick={() => navigate('/pets')}
          style={{
            background: 'none',
            border: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            color: location.pathname === '/pets' ? '#EC4899' : '#64748B',
            fontSize: 11,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <HeartOutlined style={{ fontSize: 20, marginBottom: 2 }} />
          Thú Cưng
        </button>

        <button
          onClick={() => navigate('/services')}
          style={{
            background: 'none',
            border: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            color: location.pathname === '/services' ? '#0D9488' : '#64748B',
            fontSize: 11,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <ScissorOutlined style={{ fontSize: 20, marginBottom: 2 }} />
          Grooming
        </button>

        <button
          onClick={() => navigate('/')}
          style={{
            background: 'none',
            border: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            color: location.pathname === '/' ? '#F97316' : '#64748B',
            fontSize: 11,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <MessageOutlined style={{ fontSize: 20, marginBottom: 2 }} />
          Trợ Lý AI
        </button>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .desktop-sidebar { display: none; }
          .main-layout { margin-left: 0 !important; }
          .mobile-bottom-nav { display: flex !important; }
        }
      `}</style>
    </Layout>
  )
}
