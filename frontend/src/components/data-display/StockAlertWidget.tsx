import React from 'react'
import { Card, Table, Tag } from 'antd'
import { AlertOutlined } from '@ant-design/icons'

interface StockAlertItem {
  id: number
  name: string
  stockQuantity: number
  minStockLevel: number
  status: 'OUT_OF_STOCK' | 'LOW_STOCK'
}

interface StockAlertWidgetProps {
  items?: StockAlertItem[]
  loading?: boolean
}

const defaultItems: StockAlertItem[] = [
  { id: 1, name: 'Sữa tươi Vinamilk 1L', stockQuantity: 3, minStockLevel: 10, status: 'LOW_STOCK' },
  { id: 2, name: 'Mì gói Hảo Hảo tôm chua cay', stockQuantity: 0, minStockLevel: 25, status: 'OUT_OF_STOCK' },
  { id: 3, name: 'Dầu ăn Simply 1L', stockQuantity: 4, minStockLevel: 12, status: 'LOW_STOCK' },
  { id: 4, name: 'Nước mắm Nam Ngư 500ml', stockQuantity: 2, minStockLevel: 8, status: 'LOW_STOCK' },
]

export const StockAlertWidget: React.FC<StockAlertWidgetProps> = ({
  items = defaultItems,
  loading,
}) => {
  const columns = [
    {
      title: 'Tên Mặt Hàng',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <strong style={{ color: '#0F172A' }}>{text}</strong>,
    },
    {
      title: 'Tồn Kho',
      dataIndex: 'stockQuantity',
      key: 'stockQuantity',
      render: (qty: number, record: StockAlertItem) => (
        <Tag
          color={record.status === 'OUT_OF_STOCK' ? 'error' : 'warning'}
          style={{ fontWeight: 600, fontSize: 13, padding: '2px 8px' }}
        >
          {record.status === 'OUT_OF_STOCK' ? 'Hết hàng (0)' : `Còn ${qty}`}
        </Tag>
      ),
    },
    {
      title: 'Ngưỡng An Toàn',
      dataIndex: 'minStockLevel',
      key: 'minStockLevel',
      render: (min: number) => <span style={{ color: '#64748B', fontWeight: 500 }}>≥ {min}</span>,
    },
  ]

  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#D97706', fontSize: 16 }}>
          <AlertOutlined />
          <span style={{ fontWeight: 700 }}>Cảnh Báo Hàng Sắp Hết</span>
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
