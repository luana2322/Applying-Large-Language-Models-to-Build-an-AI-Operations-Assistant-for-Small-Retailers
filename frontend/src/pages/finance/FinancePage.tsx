import React, { useState } from 'react'
import {
  DownloadOutlined,
  PlusOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  WalletOutlined,
} from '@ant-design/icons'
import { formatCurrencyVND } from '../../utils/currency'

interface TransactionItem {
  id: string
  date: string
  type: 'IN' | 'OUT'
  amount: number
  fund: string
  category: string
  description: string
  status: 'COMPLETED'
}

const MOCK_TRANSACTIONS: TransactionItem[] = [
  { id: 'PT-081', date: '23/10/2026 11:30', type: 'IN', amount: 397000, fund: 'Tiền mặt', category: 'Thu tiền bán hàng POS', description: 'Đơn hàng #HD-0912 (Khách: Hoàng Văn Nam)', status: 'COMPLETED' },
  { id: 'PT-080', date: '23/10/2026 10:15', type: 'IN', amount: 150000, fund: 'Vietcombank', category: 'Thu tiền dịch vụ Spa', description: 'Lịch grooming bé Miu (Tắm & vệ sinh tai)', status: 'COMPLETED' },
  { id: 'PC-042', date: '22/10/2026 16:40', type: 'OUT', amount: 4800000, fund: 'Vietcombank', category: 'Chi trả nợ NCC', description: 'Nhập lô hạt Royal Canin từ NCC PetFood VN', status: 'COMPLETED' },
  { id: 'PC-041', date: '22/10/2026 09:00', type: 'OUT', amount: 250000, fund: 'Tiền mặt', category: 'Chi phí hoạt động', description: 'Mua túi bóng quầy & nước lau sàn sát khuẩn', status: 'COMPLETED' },
  { id: 'PT-079', date: '21/10/2026 17:20', type: 'IN', amount: 820000, fund: 'Tiền mặt', category: 'Thu tiền bán hàng POS', description: 'Đơn hàng #HD-0899 (Khách: Trần Thị Mai)', status: 'COMPLETED' },
  { id: 'PC-040', date: '20/10/2026 14:00', type: 'OUT', amount: 1200000, fund: 'Vietcombank', category: 'Tiền điện nước & mạng', description: 'Thanh toán hóa đơn điện tháng 10/2026', status: 'COMPLETED' },
]

export const FinancePage: React.FC = () => {
  const [filterType, setFilterType] = useState('ALL')

  const filtered = MOCK_TRANSACTIONS.filter((t) => {
    if (filterType === 'ALL') return true
    return t.type === filterType
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 84px)', overflow: 'hidden' }}>
      {/* 1. Header Bar */}
      <div
        style={{
          height: 48,
          background: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          padding: '0 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h1 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', margin: 0 }}>
            Sổ Quỹ & Quản Lý Thu Chi
          </h1>
          <span style={{ fontSize: 12, color: '#64748B' }}>Dòng tiền thực tế cửa hàng</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            style={{
              height: 32,
              padding: '0 12px',
              background: '#22C55E',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 4,
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <PlusOutlined /> Tạo phiếu thu
          </button>
          <button
            style={{
              height: 32,
              padding: '0 12px',
              background: '#EF4444',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 4,
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <PlusOutlined /> Tạo phiếu chi
          </button>
        </div>
      </div>

      {/* 2. 4 Stat Inline */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          background: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          fontSize: 12,
          flexShrink: 0,
        }}
      >
        <div style={{ padding: '8px 16px', borderRight: '1px solid #E2E8F0' }}>
          <span style={{ color: '#64748B' }}>Tổng thu tháng này: </span>
          <strong style={{ fontSize: 14, color: '#22C55E' }}>45.200.000đ</strong>
        </div>
        <div style={{ padding: '8px 16px', borderRight: '1px solid #E2E8F0' }}>
          <span style={{ color: '#64748B' }}>Tổng chi tháng này: </span>
          <strong style={{ fontSize: 14, color: '#EF4444' }}>28.500.000đ</strong>
        </div>
        <div style={{ padding: '8px 16px', borderRight: '1px solid #E2E8F0' }}>
          <span style={{ color: '#64748B' }}>Lợi nhuận ròng: </span>
          <strong style={{ fontSize: 14, color: '#F97316' }}>16.700.000đ</strong>
        </div>
        <div style={{ padding: '8px 16px' }}>
          <span style={{ color: '#64748B' }}>Tổng quỹ hiện có: </span>
          <strong style={{ fontSize: 14, color: '#14B8A6' }}>55.000.000đ</strong>
        </div>
      </div>

      {/* 3. Thẻ 2 nguồn quỹ */}
      <div style={{ padding: '12px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, flexShrink: 0 }}>
        <div style={{ padding: 12, background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 11, color: '#64748B' }}>Tiền mặt tại két cửa hàng</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#0F172A' }}>5.000.000đ</div>
          </div>
          <WalletOutlined style={{ fontSize: 22, color: '#64748B' }} />
        </div>
        <div style={{ padding: 12, background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 11, color: '#64748B' }}>Tài khoản Vietcombank (Chi nhánh Cầu Giấy)</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#0F172A' }}>50.000.000đ</div>
          </div>
          <WalletOutlined style={{ fontSize: 22, color: '#14B8A6' }} />
        </div>
      </div>

      {/* 4. Filter bar */}
      <div style={{ padding: '0 16px 8px 16px', display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0, fontSize: 12 }}>
        <button
          onClick={() => setFilterType('ALL')}
          style={{
            padding: '4px 10px',
            borderRadius: 4,
            border: '1px solid #CBD5E1',
            background: filterType === 'ALL' ? '#0F172A' : '#FFFFFF',
            color: filterType === 'ALL' ? '#FFFFFF' : '#475569',
            fontSize: 12,
            cursor: 'pointer',
            fontWeight: 500,
          }}
        >
          Tất cả giao dịch
        </button>
        <button
          onClick={() => setFilterType('IN')}
          style={{
            padding: '4px 10px',
            borderRadius: 4,
            border: '1px solid #CBD5E1',
            background: filterType === 'IN' ? '#22C55E' : '#FFFFFF',
            color: filterType === 'IN' ? '#FFFFFF' : '#475569',
            fontSize: 12,
            cursor: 'pointer',
            fontWeight: 500,
          }}
        >
          Chỉ tiền thu (IN)
        </button>
        <button
          onClick={() => setFilterType('OUT')}
          style={{
            padding: '4px 10px',
            borderRadius: 4,
            border: '1px solid #CBD5E1',
            background: filterType === 'OUT' ? '#EF4444' : '#FFFFFF',
            color: filterType === 'OUT' ? '#FFFFFF' : '#475569',
            fontSize: 12,
            cursor: 'pointer',
            fontWeight: 500,
          }}
        >
          Chỉ tiền chi (OUT)
        </button>
      </div>

      {/* 5. Table Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 12px 16px' }}>
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 6, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 12 }}>
            <thead style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B', fontSize: 11, fontWeight: 600, textTransform: 'uppercase' }}>
              <tr style={{ height: 36 }}>
                <th style={{ padding: '0 12px' }}>Mã Phiếu</th>
                <th style={{ padding: '0 8px' }}>Ngày Giờ</th>
                <th style={{ padding: '0 8px' }}>Loại</th>
                <th style={{ padding: '0 8px', textAlign: 'right' }}>Số Tiền</th>
                <th style={{ padding: '0 8px' }}>Quỹ</th>
                <th style={{ padding: '0 12px' }}>Hạng Mục & Diễn Giải</th>
                <th style={{ padding: '0 12px', textAlign: 'center' }}>Trạng Thái</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} style={{ height: 40, borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '0 12px', fontFamily: 'monospace', color: '#64748B' }}>{item.id}</td>
                  <td style={{ padding: '0 8px', color: '#475569' }}>{item.date}</td>
                  <td style={{ padding: '0 8px' }}>
                    {item.type === 'IN' ? (
                      <span style={{ color: '#22C55E', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <ArrowDownOutlined /> Thu
                      </span>
                    ) : (
                      <span style={{ color: '#EF4444', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <ArrowUpOutlined /> Chi
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '0 8px', textAlign: 'right', fontWeight: 700, color: item.type === 'IN' ? '#22C55E' : '#EF4444' }}>
                    {item.type === 'IN' ? '+' : '-'}{formatCurrencyVND(item.amount)}
                  </td>
                  <td style={{ padding: '0 8px', color: '#475569' }}>{item.fund}</td>
                  <td style={{ padding: '0 12px' }}>
                    <div style={{ fontWeight: 600, color: '#0F172A' }}>{item.category}</div>
                    <div style={{ fontSize: 11, color: '#64748B' }}>{item.description}</div>
                  </td>
                  <td style={{ padding: '0 12px', textAlign: 'center' }}>
                    <span style={{ background: '#DCFCE7', color: '#15803D', padding: '2px 8px', borderRadius: 3, fontSize: 11, fontWeight: 600 }}>
                      Hoàn tất
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. Footer */}
      <div
        style={{
          height: 40,
          background: '#FFFFFF',
          borderTop: '1px solid #E2E8F0',
          padding: '0 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: 12,
          color: '#64748B',
          flexShrink: 0,
        }}
      >
        <span>Hiển thị {filtered.length} giao dịch gần nhất</span>
        <button
          style={{
            height: 28,
            padding: '0 10px',
            background: '#FFFFFF',
            color: '#0F172A',
            border: '1px solid #CBD5E1',
            borderRadius: 4,
            fontSize: 12,
            fontWeight: 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <DownloadOutlined /> Xuất sổ quỹ Excel
        </button>
      </div>
    </div>
  )
}
