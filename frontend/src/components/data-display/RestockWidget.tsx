import React from 'react'
import { Card, Table, Tag } from 'antd'
import { ShoppingCartOutlined } from '@ant-design/icons'

interface RestockItem {
  id: number
  name: string
  suggestedQuantity: number
  supplierName: string
  urgency: 'HIGH' | 'MEDIUM' | 'LOW'
}

interface RestockWidgetProps {
  items?: RestockItem[]
  loading?: boolean
}

const defaultItems: RestockItem[] = [
  { id: 1, name: 'Mì gói Hảo Hảo tôm chua cay', suggestedQuantity: 100, supplierName: 'Acecook VN', urgency: 'HIGH' },
  { id: 2, name: 'Sữa tươi Vinamilk 1L', suggestedQuantity: 50, supplierName: 'Vinamilk', urgency: 'HIGH' },
  { id: 3, name: 'Nước mắm Nam Ngư 500ml', suggestedQuantity: 30, supplierName: 'Masan Consumer', urgency: 'MEDIUM' },
  { id: 4, name: 'Dầu ăn Simply 1L', suggestedQuantity: 40, supplierName: 'Cali Agri Tech', urgency: 'MEDIUM' },
]

export const RestockWidget: React.FC<RestockWidgetProps> = ({
  items = defaultItems,
  loading,
}) => {
  const columns = [
    {
      title: 'Mặt Hàng Gợi Ý',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <strong style={{ color: '#0F172A' }}>{text}</strong>,
    },
    {
      title: 'Số Lượng Nhập',
      dataIndex: 'suggestedQuantity',
      key: 'suggestedQuantity',
      render: (qty: number) => (
        <Tag color="blue" style={{ fontWeight: 600, fontSize: 13, padding: '2px 8px' }}>
          +{qty}
        </Tag>
      ),
    },
    {
      title: 'Nhà Cung Cấp',
      dataIndex: 'supplierName',
      key: 'supplierName',
      render: (sup: string) => <span style={{ color: '#475569' }}>{sup}</span>,
    },
    {
      title: 'Mức Độ Cần',
      dataIndex: 'urgency',
      key: 'urgency',
      render: (urgency: string) => (
        <Tag
          color={urgency === 'HIGH' ? 'error' : 'warning'}
          style={{ fontWeight: 600, fontSize: 13, padding: '2px 8px' }}
        >
          {urgency === 'HIGH' ? 'Nhập Gấp' : 'Bình thường'}
        </Tag>
      ),
    },
  ]

  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#2563EB', fontSize: 16 }}>
          <ShoppingCartOutlined />
          <span style={{ fontWeight: 700 }}>Gợi Ý Hàng Cần Nhập Thêm</span>
        </div>
      }
      loading={loading}
      style={{
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: 8,
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
      }}
      bodyStyle={{ padding: 0 }}
    >
      <Table
        size="middle"
        dataSource={items.map((it) => ({ ...it, key: it.id }))}
        columns={columns}
        pagination={false}
        style={{ background: '#FFFFFF' }}
      />
    </Card>
  )
}
