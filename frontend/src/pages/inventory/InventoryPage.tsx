import React, { useState } from 'react'
import {
  DownloadOutlined,
  SearchOutlined,
  EyeOutlined,
  EditOutlined,
  PlusOutlined,
  ArrowDownOutlined,
  ArrowUpOutlined,
} from '@ant-design/icons'
import { formatCurrencyVND } from '../../utils/currency'

interface InventoryItem {
  id: string
  sku: string
  name: string
  category: string
  warehouse: string
  batchNumber: string
  expiryDate: string
  stockQuantity: number
  minStockLevel: number
  costPrice: number
  sellingPrice: number
  status: 'IN_STOCK' | 'LOW_STOCK' | 'NEAR_EXPIRY' | 'OUT_OF_STOCK'
}

const MOCK_INVENTORY: InventoryItem[] = [
  { id: '1', sku: 'RC-CAT-IN2', name: 'Royal Canin Indoor 2kg', category: 'Thức ăn hạt cho mèo', warehouse: 'Kho Bán Lẻ', batchNumber: 'LOT-202610-01', expiryDate: '15/12/2026', stockQuantity: 18, minStockLevel: 10, costPrice: 280000, sellingPrice: 380000, status: 'IN_STOCK' },
  { id: '2', sku: 'WKS-TUNA-85', name: 'Pate Whiskas Cá Biển 85g', category: 'Pate ướt', warehouse: 'Kho Bán Lẻ', batchNumber: 'LOT-202511-09', expiryDate: '15/11/2026', stockQuantity: 3, minStockLevel: 15, costPrice: 12000, sellingPrice: 17000, status: 'NEAR_EXPIRY' },
  { id: '3', sku: 'PDG-PUP-13', name: 'Pedigree Puppy Vị Bò 1.3kg', category: 'Thức ăn hạt cho chó', warehouse: 'Kho Tổng', batchNumber: 'LOT-202604-03', expiryDate: '20/04/2027', stockQuantity: 4, minStockLevel: 8, costPrice: 160000, sellingPrice: 215000, status: 'LOW_STOCK' },
  { id: '4', sku: 'CAT-EYE-15', name: 'Thức ăn hạt Cat Eye 1.5kg', category: 'Thức ăn hạt cho mèo', warehouse: 'Kho Bán Lẻ', batchNumber: 'LOT-202608-11', expiryDate: '30/08/2027', stockQuantity: 24, minStockLevel: 5, costPrice: 115000, sellingPrice: 160000, status: 'IN_STOCK' },
  { id: '5', sku: 'SNK-BOW-50', name: 'Snack Bowwow Que Bò 50g', category: 'Bánh thưởng & Snack', warehouse: 'Kho Bán Lẻ', batchNumber: 'LOT-202609-02', expiryDate: '05/09/2027', stockQuantity: 0, minStockLevel: 5, costPrice: 30000, sellingPrice: 45000, status: 'OUT_OF_STOCK' },
  { id: '6', sku: 'CAT-TFU-06', name: 'Cát Tofu Đậu Nành Cature 6L', category: 'Vệ sinh & Chăm sóc', warehouse: 'Kho Tổng', batchNumber: 'LOT-202601-14', expiryDate: '14/01/2029', stockQuantity: 32, minStockLevel: 10, costPrice: 95000, sellingPrice: 135000, status: 'IN_STOCK' },
  { id: '7', sku: 'SOS-CAT-53', name: 'Sữa Tắm Khử Mùi SOS 530ml', category: 'Mỹ phẩm spa', warehouse: 'Kho Spa', batchNumber: 'LOT-202603-08', expiryDate: '10/03/2028', stockQuantity: 7, minStockLevel: 3, costPrice: 75000, sellingPrice: 110000, status: 'IN_STOCK' },
  { id: '8', sku: 'GEL-NUT-12', name: 'Gel Dinh Dưỡng Nourse 120g', category: 'Thuốc bổ & Dinh dưỡng', warehouse: 'Kho Bán Lẻ', batchNumber: 'LOT-202511-22', expiryDate: '22/11/2026', stockQuantity: 2, minStockLevel: 5, costPrice: 110000, sellingPrice: 155000, status: 'NEAR_EXPIRY' },
  { id: '9', sku: 'ROY-FIT-04', name: 'Royal Canin Fit32 400g', category: 'Thức ăn hạt cho mèo', warehouse: 'Kho Bán Lẻ', batchNumber: 'LOT-202605-18', expiryDate: '18/05/2027', stockQuantity: 1, minStockLevel: 6, costPrice: 65000, sellingPrice: 92000, status: 'LOW_STOCK' },
  { id: '10', sku: 'SMT-PUP-03', name: 'SmartHeart Puppy Thịt Bò 500g', category: 'Thức ăn hạt cho chó', warehouse: 'Kho Bán Lẻ', batchNumber: 'LOT-202607-01', expiryDate: '01/07/2027', stockQuantity: 14, minStockLevel: 4, costPrice: 35000, sellingPrice: 50000, status: 'IN_STOCK' },
  { id: '11', sku: 'VET-CAL-60', name: 'Canxi Phốt-pho Hộp 60 Viên', category: 'Thuốc bổ & Dinh dưỡng', warehouse: 'Kho Bán Lẻ', batchNumber: 'LOT-202611-30', expiryDate: '30/11/2027', stockQuantity: 9, minStockLevel: 2, costPrice: 85000, sellingPrice: 125000, status: 'IN_STOCK' },
  { id: '12', sku: 'YEM-COR-01', name: 'Yếm Ngực Dây Dắt Kèm Còi Size S', category: 'Phụ kiện & Đồ chơi', warehouse: 'Kho Bán Lẻ', batchNumber: 'LOT-N/A', expiryDate: '--', stockQuantity: 5, minStockLevel: 2, costPrice: 50000, sellingPrice: 85000, status: 'IN_STOCK' },
]

export const InventoryPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedWarehouse, setSelectedWarehouse] = useState('ALL')
  const [selectedStatus, setSelectedStatus] = useState('ALL')
  const [selectedBatch, setSelectedBatch] = useState<InventoryItem | null>(null)

  const filteredItems = MOCK_INVENTORY.filter((item) => {
    const matchSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.batchNumber.toLowerCase().includes(searchTerm.toLowerCase())
    const matchWh = selectedWarehouse === 'ALL' || item.warehouse === selectedWarehouse
    const matchStatus = selectedStatus === 'ALL' || item.status === selectedStatus
    return matchSearch && matchWh && matchStatus
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
            Quản Lý Kho & Lô Hạn Sử Dụng
          </h1>
          <span style={{ fontSize: 12, color: '#64748B' }}>
            ({filteredItems.length} mã hàng hiển thị)
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            style={{
              height: 32,
              padding: '0 12px',
              background: '#F97316',
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
            <ArrowDownOutlined /> Nhập kho theo lô
          </button>
          <button
            style={{
              height: 32,
              padding: '0 12px',
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
            <ArrowUpOutlined /> Xuất điều chuyển
          </button>
        </div>
      </div>

      {/* 2. Stat Bar Inline */}
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
          <span style={{ color: '#64748B' }}>Tổng SKU đang quản lý: </span>
          <strong style={{ fontSize: 14, color: '#0F172A' }}>245</strong>
        </div>
        <div style={{ padding: '8px 16px', borderRight: '1px solid #E2E8F0' }}>
          <span style={{ color: '#64748B' }}>Sắp hết hàng (&lt; min): </span>
          <strong style={{ fontSize: 14, color: '#F59E0B' }}>12 SKU</strong>
        </div>
        <div style={{ padding: '8px 16px', borderRight: '1px solid #E2E8F0' }}>
          <span style={{ color: '#64748B' }}>Cận hạn &lt; 30 ngày: </span>
          <strong style={{ fontSize: 14, color: '#EF4444' }}>8 SKU</strong>
        </div>
        <div style={{ padding: '8px 16px' }}>
          <span style={{ color: '#64748B' }}>Hết hàng hoàn toàn: </span>
          <strong style={{ fontSize: 14, color: '#7F1D1D' }}>3 SKU</strong>
        </div>
      </div>

      {/* 3. Filter Bar */}
      <div
        style={{
          padding: '8px 16px',
          background: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          gap: 10,
          alignItems: 'center',
          flexShrink: 0,
          fontSize: 12,
        }}
      >
        <div style={{ position: 'relative', width: 260 }}>
          <SearchOutlined style={{ position: 'absolute', left: 8, top: 9, color: '#94A3B8' }} />
          <input
            type="text"
            placeholder="Tìm theo mã SKU, tên SP, số lô..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              height: 30,
              paddingLeft: 28,
              paddingRight: 8,
              fontSize: 12,
              border: '1px solid #CBD5E1',
              borderRadius: 4,
              outline: 'none',
            }}
          />
        </div>

        <select
          value={selectedWarehouse}
          onChange={(e) => setSelectedWarehouse(e.target.value)}
          style={{ height: 30, padding: '0 8px', fontSize: 12, border: '1px solid #CBD5E1', borderRadius: 4 }}
        >
          <option value="ALL">Tất cả kho lưu trữ</option>
          <option value="Kho Bán Lẻ">Kho Bán Lẻ</option>
          <option value="Kho Tổng">Kho Tổng</option>
          <option value="Kho Spa">Kho Spa</option>
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          style={{ height: 30, padding: '0 8px', fontSize: 12, border: '1px solid #CBD5E1', borderRadius: 4 }}
        >
          <option value="ALL">Tất cả trạng thái tồn</option>
          <option value="IN_STOCK">Đủ hàng</option>
          <option value="LOW_STOCK">Sắp hết</option>
          <option value="NEAR_EXPIRY">Cận hạn &lt; 30 ngày</option>
          <option value="OUT_OF_STOCK">Hết hàng</option>
        </select>

        {(searchTerm || selectedWarehouse !== 'ALL' || selectedStatus !== 'ALL') && (
          <button
            onClick={() => {
              setSearchTerm('')
              setSelectedWarehouse('ALL')
              setSelectedStatus('ALL')
            }}
            style={{ background: 'none', border: 'none', color: '#F97316', cursor: 'pointer', fontSize: 12 }}
          >
            Xóa lọc
          </button>
        )}
      </div>

      {/* 4. Table Area (Data-Dense >= 12 dòng visible) */}
      <div style={{ flex: 1, display: 'flex', minHeight: 0, overflow: 'hidden' }}>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'separate',
              borderSpacing: 0,
              textAlign: 'left',
              fontSize: 12,
              tableLayout: 'fixed',
            }}
          >
            <thead
              style={{
                position: 'sticky',
                top: 0,
                background: '#F8FAFC',
                zIndex: 10,
                color: '#64748B',
                fontSize: 11,
                fontWeight: 600,
                textTransform: 'uppercase',
                borderBottom: '1px solid #CBD5E1',
              }}
            >
              <tr style={{ height: 36 }}>
                <th style={{ width: 110, padding: '0 12px', borderBottom: '1px solid #E2E8F0' }}>Mã SKU</th>
                <th style={{ minWidth: 200, padding: '0 8px', borderBottom: '1px solid #E2E8F0' }}>Tên Sản Phẩm</th>
                <th style={{ width: 140, padding: '0 8px', borderBottom: '1px solid #E2E8F0' }}>Danh Mục</th>
                <th style={{ width: 100, padding: '0 8px', borderBottom: '1px solid #E2E8F0' }}>Kho</th>
                <th style={{ width: 120, padding: '0 8px', borderBottom: '1px solid #E2E8F0', fontFamily: 'monospace' }}>Số Lô</th>
                <th style={{ width: 110, padding: '0 8px', borderBottom: '1px solid #E2E8F0' }}>Hạn Sử Dụng</th>
                <th style={{ width: 80, padding: '0 8px', borderBottom: '1px solid #E2E8F0', textAlign: 'right' }}>Tồn</th>
                <th style={{ width: 70, padding: '0 8px', borderBottom: '1px solid #E2E8F0', textAlign: 'right' }}>Min</th>
                <th style={{ width: 110, padding: '0 8px', borderBottom: '1px solid #E2E8F0', textAlign: 'center' }}>Trạng Thái</th>
                <th style={{ width: 90, padding: '0 12px', borderBottom: '1px solid #E2E8F0', textAlign: 'center' }}>Thao Tác</th>
              </tr>
            </thead>
            <tbody style={{ background: '#FFFFFF' }}>
              {filteredItems.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => setSelectedBatch(item)}
                  style={{
                    height: 40,
                    borderBottom: '1px solid #F1F5F9',
                    cursor: 'pointer',
                    background: selectedBatch?.id === item.id ? '#FFF7ED' : 'transparent',
                  }}
                >
                  <td style={{ padding: '0 12px', fontFamily: 'monospace', fontSize: 11, color: '#64748B' }}>
                    {item.sku}
                  </td>
                  <td style={{ padding: '0 8px', fontWeight: 600, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.name}
                  </td>
                  <td style={{ padding: '0 8px', color: '#475569' }}>{item.category}</td>
                  <td style={{ padding: '0 8px', color: '#475569' }}>{item.warehouse}</td>
                  <td style={{ padding: '0 8px', fontFamily: 'monospace', fontSize: 11, color: '#475569' }}>
                    {item.batchNumber}
                  </td>
                  <td
                    style={{
                      padding: '0 8px',
                      fontWeight: 600,
                      color: item.status === 'NEAR_EXPIRY' ? '#EF4444' : '#0F172A',
                    }}
                  >
                    {item.expiryDate}
                  </td>
                  <td style={{ padding: '0 8px', textAlign: 'right', fontWeight: 700, color: '#0F172A' }}>
                    {item.stockQuantity}
                  </td>
                  <td style={{ padding: '0 8px', textAlign: 'right', color: '#94A3B8' }}>{item.minStockLevel}</td>
                  <td style={{ padding: '0 8px', textAlign: 'center' }}>
                    {item.status === 'IN_STOCK' && (
                      <span style={{ background: '#DCFCE7', color: '#15803D', padding: '2px 8px', borderRadius: 3, fontSize: 11, fontWeight: 600 }}>
                        Đủ hàng
                      </span>
                    )}
                    {item.status === 'LOW_STOCK' && (
                      <span style={{ background: '#FEF3C7', color: '#B45309', padding: '2px 8px', borderRadius: 3, fontSize: 11, fontWeight: 600 }}>
                        Sắp hết
                      </span>
                    )}
                    {item.status === 'NEAR_EXPIRY' && (
                      <span style={{ background: '#FEE2E2', color: '#B91C1C', padding: '2px 8px', borderRadius: 3, fontSize: 11, fontWeight: 600 }}>
                        Cận hạn
                      </span>
                    )}
                    {item.status === 'OUT_OF_STOCK' && (
                      <span style={{ background: '#7F1D1D', color: '#FFFFFF', padding: '2px 8px', borderRadius: 3, fontSize: 11, fontWeight: 600 }}>
                        Hết hàng
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '0 12px', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 6, color: '#64748B' }}>
                      <button title="Xem chi tiết lô" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
                        <EyeOutlined />
                      </button>
                      <button title="Điều chỉnh tồn" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: '#F97316' }}>
                        <EditOutlined />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 5. Side Drawer Chi tiết lô */}
        {selectedBatch && (
          <div
            style={{
              width: 380,
              background: '#FFFFFF',
              borderLeft: '1px solid #E2E8F0',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '-2px 0 6px rgba(0,0,0,0.05)',
              flexShrink: 0,
            }}
          >
            <div style={{ padding: 14, borderBottom: '1px solid #E2E8F0', background: '#F8FAFC', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong style={{ fontSize: 13, color: '#0F172A' }}>Lô: {selectedBatch.batchNumber}</strong>
              <button
                onClick={() => setSelectedBatch(null)}
                style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: 14 }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: 14, flex: 1, overflowY: 'auto', fontSize: 12 }}>
              <div style={{ padding: 10, background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 4, marginBottom: 12 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#0F172A', marginBottom: 4 }}>{selectedBatch.name}</div>
                <div style={{ color: '#64748B' }}>SKU: <span style={{ fontFamily: 'monospace', color: '#0F172A' }}>{selectedBatch.sku}</span></div>
                <div style={{ color: '#64748B' }}>Kho: <span style={{ color: '#0F172A' }}>{selectedBatch.warehouse}</span></div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
                <div style={{ padding: 8, border: '1px solid #E2E8F0', borderRadius: 4 }}>
                  <div style={{ color: '#64748B', fontSize: 11 }}>Giá vốn</div>
                  <div style={{ fontWeight: 600 }}>{formatCurrencyVND(selectedBatch.costPrice)}</div>
                </div>
                <div style={{ padding: 8, border: '1px solid #E2E8F0', borderRadius: 4 }}>
                  <div style={{ color: '#64748B', fontSize: 11 }}>Giá bán lẻ</div>
                  <div style={{ fontWeight: 600, color: '#F97316' }}>{formatCurrencyVND(selectedBatch.sellingPrice)}</div>
                </div>
              </div>

              <div style={{ fontWeight: 600, marginBottom: 6 }}>Biến động gần đây theo lô:</div>
              <div style={{ border: '1px solid #E2E8F0', borderRadius: 4, fontSize: 11 }}>
                <div style={{ padding: 8, borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between' }}>
                  <span>20/10 - Bán lẻ POS #HD-0912</span>
                  <strong style={{ color: '#EF4444' }}>-2 bao</strong>
                </div>
                <div style={{ padding: 8, borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between' }}>
                  <span>15/10 - Bán lẻ POS #HD-0881</span>
                  <strong style={{ color: '#EF4444' }}>-1 bao</strong>
                </div>
                <div style={{ padding: 8, display: 'flex', justifyContent: 'space-between' }}>
                  <span>01/10 - Nhập kho NCC PetFood VN</span>
                  <strong style={{ color: '#22C55E' }}>+20 bao</strong>
                </div>
              </div>
            </div>

            <div style={{ padding: 12, borderTop: '1px solid #E2E8F0', background: '#F8FAFC', display: 'flex', gap: 8 }}>
              <button
                style={{
                  flex: 1,
                  height: 32,
                  background: '#F97316',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 4,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Tạo phiếu xuất kho
              </button>
              <button
                style={{
                  height: 32,
                  padding: '0 12px',
                  background: '#FFFFFF',
                  color: '#0F172A',
                  border: '1px solid #CBD5E1',
                  borderRadius: 4,
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Kiểm kê
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 6. Footer Pagination & Excel */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>Hiển thị 20/50/100 dòng</span>
          <span>•</span>
          <span>Trang 1 / 13</span>
        </div>
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
          <DownloadOutlined /> Xuất Excel (.xlsx)
        </button>
      </div>
    </div>
  )
}
