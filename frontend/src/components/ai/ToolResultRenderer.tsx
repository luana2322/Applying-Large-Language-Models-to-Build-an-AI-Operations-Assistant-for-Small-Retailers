import React from 'react'
import { Card, Table, Tag } from 'antd'
import { formatCurrencyVND } from '../../utils/currency'

interface ToolResultRendererProps {
  data: Record<string, any> | null | undefined
}

export const ToolResultRenderer: React.FC<ToolResultRendererProps> = ({ data }) => {
  if (!data) return null

  // If inventory items table
  if (Array.isArray(data.items) && data.items.length > 0) {
    const columns = [
      {
        title: 'Tên Mặt Hàng',
        dataIndex: 'name',
        key: 'name',
        render: (text: string) => <strong style={{ color: '#0F172A', fontSize: 15 }}>{text}</strong>,
      },
      {
        title: 'Tồn Kho Hiện Tại',
        dataIndex: 'stock_quantity',
        key: 'stock_quantity',
        render: (qty: number, record: any) => (
          <Tag
            color={qty === 0 ? 'error' : qty <= (record.min_stock_level || 10) ? 'warning' : 'success'}
            style={{ fontSize: 13, padding: '2px 8px', fontWeight: 600 }}
          >
            {qty === 0 ? 'Hết hàng (0)' : `Còn ${qty}`}
          </Tag>
        ),
      },
      {
        title: 'Ngưỡng Tối Thiểu',
        dataIndex: 'min_stock_level',
        key: 'min_stock_level',
        render: (min: number) => <span style={{ color: '#64748B' }}>≥ {min}</span>,
      },
    ]

    return (
      <div style={{ marginTop: 12 }}>
        <Table
          size="small"
          dataSource={data.items.map((it: any, idx: number) => ({ ...it, key: idx }))}
          columns={columns}
          pagination={false}
          style={{ background: '#FFFFFF', borderRadius: 8, border: '1px solid #E2E8F0', overflow: 'hidden' }}
        />
      </div>
    )
  }

  // If revenue or profit metrics summary
  if (data.total_revenue !== undefined || data.gross_profit !== undefined || data.net_revenue !== undefined) {
    return (
      <Card
        size="small"
        style={{
          marginTop: 12,
          background: '#F8FAFC',
          borderColor: '#E2E8F0',
          borderRadius: 8,
        }}
      >
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          {data.total_revenue !== undefined && (
            <div>
              <div style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>Tiền Bán Hàng:</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#2563EB' }}>
                {formatCurrencyVND(data.total_revenue)}
              </div>
            </div>
          )}
          {data.gross_profit !== undefined && (
            <div>
              <div style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>Tiền Lời Thực Tế:</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#059669' }}>
                +{formatCurrencyVND(data.gross_profit)}
              </div>
            </div>
          )}
          {data.total_orders !== undefined && (
            <div>
              <div style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>Số Lượt Khách:</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#0F172A' }}>
                {data.total_orders} đơn
              </div>
            </div>
          )}
        </div>
      </Card>
    )
  }

  return null
}
