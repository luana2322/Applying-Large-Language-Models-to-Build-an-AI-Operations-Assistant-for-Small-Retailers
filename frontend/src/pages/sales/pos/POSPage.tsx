import React, { useState } from 'react'
import { Row, Col, Card, Input, Button, Tag, Space, Modal, Typography, message, Select } from 'antd'
import {
  SearchOutlined,
  PlusOutlined,
  MinusOutlined,
  DeleteOutlined,
  CheckCircleFilled,
  PrinterOutlined,
  BarcodeOutlined,
} from '@ant-design/icons'
import { formatCurrencyVND } from '../../../utils/currency'

const { Title, Text } = Typography

interface ProductItem {
  id: number
  sku: string
  name: string
  price: number
  stockQuantity: number
  category: string
  petType: 'DOG' | 'CAT' | 'ALL'
  isGrainFree?: boolean
  expiryDate?: string
}

interface CartItem {
  product: ProductItem
  quantity: number
}

const PET_PRODUCTS: ProductItem[] = [
  { id: 1, sku: 'SKU-ROYAL-CAT-2KG', name: 'Royal Canin Adult Mèo 2kg', price: 345000, stockQuantity: 3, category: 'Thức ăn khô', petType: 'CAT', isGrainFree: false, expiryDate: '15/11/2026' },
  { id: 2, sku: 'SKU-PEDIGREE-DOG-3KG', name: 'Pedigree Adult Chó Bò & Rau 3kg', price: 215000, stockQuantity: 18, category: 'Thức ăn khô', petType: 'DOG', isGrainFree: false },
  { id: 3, sku: 'SKU-WHISKAS-SNACK', name: 'Whiskas Bánh Thưởng Mèo Vị Cá Hồi', price: 45000, stockQuantity: 12, category: 'Snack & Bánh thưởng', petType: 'CAT', isGrainFree: true, expiryDate: '05/11/2026' },
  { id: 4, sku: 'SKU-PATE-MONGE-DOG', name: 'Pate Monge Chó Thịt Gà & Vịt 400g', price: 58000, stockQuantity: 35, category: 'Thức ăn ướt', petType: 'DOG', isGrainFree: true },
  { id: 5, sku: 'SKU-TOY-BALL', name: 'Bóng Cao Su Đồ Chơi Gặm Cho Chó', price: 35000, stockQuantity: 24, category: 'Phụ kiện & Đồ chơi', petType: 'DOG' },
  { id: 6, sku: 'SKU-CAT-LITTER-10L', name: 'Cát Vệ Sinh Đậu Nành Tofu 10L', price: 135000, stockQuantity: 40, category: 'Vệ sinh & Chăm sóc', petType: 'CAT' },
  { id: 7, sku: 'SKU-SHAMPOO-BIO', name: 'Sữa Tắm Trị Ve Rận Nấm Bio 200ml', price: 85000, stockQuantity: 9, category: 'Vệ sinh & Chăm sóc', petType: 'ALL' },
  { id: 8, sku: 'SKU-CALCIUM-DELIGHT', name: 'Viên Nhai Bổ Sung Canxi Nourse 160 viên', price: 175000, stockQuantity: 15, category: 'Thuốc bổ & Dinh dưỡng', petType: 'ALL' },
]

const CATEGORIES = ['Tất cả', 'Thức ăn khô', 'Thức ăn ướt', 'Snack & Bánh thưởng', 'Phụ kiện & Đồ chơi', 'Vệ sinh & Chăm sóc', 'Thuốc bổ & Dinh dưỡng']

const CUSTOMERS = [
  { id: 1, name: 'Khách lẻ / Vãng lai', phone: '0900000000', pet: 'Không chọn' },
  { id: 2, name: 'Hoàng Văn Nam', phone: '0987654321', pet: 'Miu (Mèo Anh lông ngắn - 4.2kg)' },
  { id: 3, name: 'Trần Thị Mai', phone: '0912345678', pet: 'Bông (Poodle trắng - 6.5kg)' },
]

export const POSPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Tất cả')
  const [selectedCustomer, setSelectedCustomer] = useState(2)
  const [cart, setCart] = useState<CartItem[]>([
    { product: PET_PRODUCTS[0], quantity: 1 },
    { product: PET_PRODUCTS[2], quantity: 2 },
  ])
  const [cashGiven, setCashGiven] = useState<number>(500000)
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false)
  const [lastCompletedOrder, setLastCompletedOrder] = useState<any>(null)

  const filteredProducts = PET_PRODUCTS.filter((p) => {
    const matchCategory = selectedCategory === 'Tất cả' || p.category === selectedCategory
    const matchSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase())
    return matchCategory && matchSearch
  })

  const totalAmount = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  const changeAmount = Math.max(0, cashGiven - totalAmount)

  const addToCart = (product: ProductItem) => {
    if (product.stockQuantity <= 0) {
      message.warning(`Sản phẩm "${product.name}" hiện đã hết hàng trong kho!`)
      return
    }

    setCart((prevCart) => {
      const existing = prevCart.find((it) => it.product.id === product.id)
      if (existing) {
        return prevCart.map((it) =>
          it.product.id === product.id ? { ...it, quantity: it.quantity + 1 } : it
        )
      }
      return [...prevCart, { product, quantity: 1 }]
    })
    message.success(`Đã thêm "${product.name}" vào giỏ`)
  }

  const updateQuantity = (productId: number, delta: number) => {
    setCart((prevCart) => {
      return prevCart
        .map((it) => {
          if (it.product.id === productId) {
            const newQty = it.quantity + delta
            return newQty > 0 ? { ...it, quantity: newQty } : null
          }
          return it
        })
        .filter(Boolean) as CartItem[]
    })
  }

  const handleCompleteOrder = () => {
    if (cart.length === 0) {
      message.warning('Chưa có món hàng nào trong giỏ!')
      return
    }

    const orderData = {
      orderCode: 'HD-' + Date.now().toString().slice(-6),
      customer: CUSTOMERS.find((c) => c.id === selectedCustomer),
      items: [...cart],
      totalAmount,
      cashGiven,
      changeAmount,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    }

    setLastCompletedOrder(orderData)
    setIsSuccessModalVisible(true)
    setCart([])
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={2} style={{ margin: 0, color: '#0F172A', fontWeight: 700, fontSize: 24 }}>
            🛒 Quầy Thu Ngân Bán Hàng (POS PetHouse)
          </Title>
          <Text style={{ color: '#64748B', fontSize: 14 }}>
            Thao tác nhanh bằng chuột hoặc phím tắt cảm ứng màn hình
          </Text>
        </div>
        <Tag color="orange" style={{ fontSize: 13, padding: '4px 10px', borderRadius: 8 }}>
          F2: Thanh toán • F3: Quét mã vạch
        </Tag>
      </div>

      <Row gutter={[16, 16]}>
        {/* LEFT COLUMN: Products catalog */}
        <Col xs={24} lg={15}>
          <Card
            style={{
              borderRadius: 16,
              border: '1px solid #E2E8F0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            {/* Search & Barcode Bar */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
              <Input
                size="large"
                placeholder="Nhập tên sản phẩm hoặc mã SKU (F3)..."
                prefix={<SearchOutlined style={{ color: '#F97316' }} />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ borderRadius: 12, height: 44 }}
              />
              <Button
                icon={<BarcodeOutlined />}
                style={{ height: 44, borderRadius: 12, background: '#FFF7ED', color: '#F97316', borderColor: '#FED7AA', fontWeight: 600 }}
              >
                Quét mã
              </Button>
            </div>

            {/* Category filter chips */}
            <Space wrap size={[8, 8]} style={{ marginBottom: 20 }}>
              {CATEGORIES.map((cat) => (
                <Button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    height: 38,
                    borderRadius: 20,
                    fontWeight: 600,
                    fontSize: 13,
                    background: selectedCategory === cat ? '#F97316' : '#F8FAFC',
                    color: selectedCategory === cat ? '#FFFFFF' : '#475569',
                    borderColor: selectedCategory === cat ? '#F97316' : '#E2E8F0',
                  }}
                >
                  {cat}
                </Button>
              ))}
            </Space>

            {/* Product Cards Grid */}
            <Row gutter={[12, 12]}>
              {filteredProducts.map((product) => (
                <Col xs={12} sm={8} key={product.id}>
                  <div
                    onClick={() => addToCart(product)}
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: 14,
                      padding: '14px 12px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#F97316'
                      e.currentTarget.style.boxShadow = '0 4px 10px rgba(249,115,22,0.12)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#E2E8F0'
                      e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.03)'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <Tag color={product.petType === 'DOG' ? 'orange' : product.petType === 'CAT' ? 'cyan' : 'default'} style={{ margin: 0, fontSize: 11 }}>
                          {product.petType === 'DOG' ? '🐕 Chó' : product.petType === 'CAT' ? '🐈 Mèo' : 'Tất cả'}
                        </Tag>
                        {product.isGrainFree && (
                          <Tag color="green" style={{ margin: 0, fontSize: 10 }}>Grain-free</Tag>
                        )}
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 4, lineHeight: 1.3 }}>
                        {product.name}
                      </div>
                      <div style={{ fontSize: 12, color: '#64748B' }}>Mã: {product.sku}</div>
                    </div>

                    <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 16, fontWeight: 700, color: '#F97316' }}>
                        {formatCurrencyVND(product.price)}
                      </span>
                      {product.stockQuantity <= 3 ? (
                        <Tag color="error" style={{ margin: 0, fontWeight: 600, fontSize: 11 }}>
                          Còn {product.stockQuantity}
                        </Tag>
                      ) : product.expiryDate ? (
                        <Tag color="warning" style={{ margin: 0, fontWeight: 600, fontSize: 11 }}>
                          HSD {product.expiryDate}
                        </Tag>
                      ) : (
                        <Tag color="success" style={{ margin: 0, fontWeight: 600, fontSize: 11 }}>
                          Tồn {product.stockQuantity}
                        </Tag>
                      )}
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>

        {/* RIGHT COLUMN: Current Bill & Cashier */}
        <Col xs={24} lg={9}>
          <Card
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: '#0F172A' }}>
                  🧾 Đơn Hàng Hiện Tại
                </span>
                <Button size="small" onClick={() => setCart([])} danger>
                  Xóa hết
                </Button>
              </div>
            }
            style={{
              background: '#FFFFFF',
              borderRadius: 16,
              border: '1px solid #E2E8F0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            {/* Customer & Pet selection */}
            <div style={{ background: '#FFF7ED', padding: 12, borderRadius: 12, marginBottom: 14, border: '1px solid #FED7AA' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#9A3412', marginBottom: 6 }}>
                🐾 CHỌN KHÁCH HÀNG & THÚ CƯNG:
              </div>
              <Select
                value={selectedCustomer}
                onChange={setSelectedCustomer}
                style={{ width: '100%' }}
                options={CUSTOMERS.map((c) => ({
                  value: c.id,
                  label: `${c.name} (${c.pet})`,
                }))}
              />
            </div>

            {/* Cart Items List */}
            <div style={{ minHeight: 200, maxHeight: 300, overflowY: 'auto', marginBottom: 16 }}>
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#94A3B8' }}>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>🧺</div>
                  <div style={{ fontWeight: 500 }}>Chưa có sản phẩm nào trong giỏ</div>
                  <div style={{ fontSize: 12 }}>Chọn từ danh mục thức ăn hoặc phụ kiện bên trái</div>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.product.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 0',
                      borderBottom: '1px solid #F1F5F9',
                    }}
                  >
                    <div style={{ flex: 1, paddingRight: 8 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: '#0F172A' }}>{item.product.name}</div>
                      <div style={{ fontSize: 12, color: '#64748B' }}>{formatCurrencyVND(item.product.price)} / món</div>
                    </div>

                    <Space size={4}>
                      <Button size="small" icon={<MinusOutlined />} onClick={() => updateQuantity(item.product.id, -1)} />
                      <span style={{ fontWeight: 700, minWidth: 24, textAlign: 'center' }}>{item.quantity}</span>
                      <Button size="small" icon={<PlusOutlined />} onClick={() => updateQuantity(item.product.id, 1)} />
                      <Button size="small" type="text" danger icon={<DeleteOutlined />} onClick={() => updateQuantity(item.product.id, -item.quantity)} />
                    </Space>

                    <div style={{ width: 85, textAlign: 'right', fontWeight: 700, fontSize: 14, color: '#0F172A' }}>
                      {formatCurrencyVND(item.product.price * item.quantity)}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Bill Summary */}
            <div style={{ borderTop: '2px dashed #E2E8F0', paddingTop: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14, color: '#475569' }}>
                <span>Tổng tiền hàng:</span>
                <span style={{ fontWeight: 600, color: '#0F172A' }}>{formatCurrencyVND(totalAmount)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: '#0F172A' }}>TỔNG CỘNG:</span>
                <span style={{ fontSize: 24, fontWeight: 800, color: '#F97316' }}>
                  {formatCurrencyVND(totalAmount)}
                </span>
              </div>

              {/* Cash given shortcuts */}
              <div style={{ background: '#F8FAFC', padding: 12, borderRadius: 12, marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: '#64748B', fontWeight: 600, marginBottom: 8 }}>
                  💵 TIỀN KHÁCH ĐƯA:
                </div>
                <Space wrap size={[6, 6]} style={{ marginBottom: 10 }}>
                  {[totalAmount, 100000, 200000, 500000].filter((v) => v > 0).map((amt, idx) => (
                    <Button
                      key={idx}
                      size="small"
                      onClick={() => setCashGiven(amt)}
                      style={{
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 600,
                        background: cashGiven === amt ? '#FFF7ED' : '#FFFFFF',
                        borderColor: cashGiven === amt ? '#F97316' : '#E2E8F0',
                        color: cashGiven === amt ? '#F97316' : '#0F172A',
                      }}
                    >
                      {amt === totalAmount ? 'Vừa đủ' : formatCurrencyVND(amt)}
                    </Button>
                  ))}
                </Space>
                <Input
                  type="number"
                  value={cashGiven || ''}
                  onChange={(e) => setCashGiven(parseFloat(e.target.value) || 0)}
                  placeholder="Nhập số tiền..."
                  style={{ height: 40, fontSize: 15, fontWeight: 600, borderRadius: 10 }}
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 13 }}>
                  <span style={{ color: '#64748B', fontWeight: 500 }}>Tiền thối lại:</span>
                  <span style={{ fontWeight: 700, color: '#22C55E', fontSize: 15 }}>
                    {formatCurrencyVND(changeAmount)}
                  </span>
                </div>
              </div>

              {/* Complete checkout button */}
              <Button
                type="primary"
                onClick={handleCompleteOrder}
                style={{
                  width: '100%',
                  height: 42,
                  borderRadius: 4,
                  fontSize: 14,
                  fontWeight: 700,
                  background: '#F97316',
                  borderColor: '#F97316',
                  boxShadow: 'none',
                }}
              >
                Thanh Toán (F2)
              </Button>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Success Modal */}
      <Modal
        open={isSuccessModalVisible}
        onCancel={() => setIsSuccessModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsSuccessModalVisible(false)} style={{ borderRadius: 8 }}>
            Đóng
          </Button>,
          <Button
            key="print"
            type="primary"
            icon={<PrinterOutlined />}
            onClick={() => {
              message.success('Đang gửi lệnh in hóa đơn PetHouse...')
              setIsSuccessModalVisible(false)
            }}
            style={{ background: '#F97316', borderColor: '#F97316', borderRadius: 8 }}
          >
            In Hóa Đơn
          </Button>,
        ]}
      >
        {lastCompletedOrder && (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <CheckCircleFilled style={{ fontSize: 56, color: '#22C55E', marginBottom: 12 }} />
            <Title level={3} style={{ margin: 0, color: '#0F172A', fontWeight: 700 }}>
              Thanh Toán Thành Công!
            </Title>
            <div style={{ color: '#64748B', marginTop: 4, marginBottom: 16 }}>
              Mã đơn: {lastCompletedOrder.orderCode} • {lastCompletedOrder.timestamp}
            </div>

            <div style={{ background: '#F8FAFC', padding: 14, borderRadius: 12, textAlign: 'left', fontSize: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: '#64748B' }}>Khách hàng:</span>
                <span style={{ fontWeight: 600 }}>{lastCompletedOrder.customer?.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: '#64748B' }}>Bé cưng:</span>
                <span style={{ fontWeight: 600, color: '#F97316' }}>{lastCompletedOrder.customer?.pet}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #E2E8F0', paddingTop: 8, marginTop: 8 }}>
                <span style={{ fontWeight: 700 }}>Tổng tiền:</span>
                <span style={{ fontWeight: 700, color: '#F97316', fontSize: 16 }}>{formatCurrencyVND(lastCompletedOrder.totalAmount)}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
