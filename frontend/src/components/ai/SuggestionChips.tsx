import React from 'react'
import { Space, Button } from 'antd'

interface SuggestionChipsProps {
  onSelectPrompt: (prompt: string) => void
  disabled?: boolean
}

export const SUGGESTED_PROMPTS = [
  { icon: '💰', label: 'Hôm nay bán được bao nhiêu?', prompt: 'Hôm nay cửa hàng bán được bao nhiêu tiền?' },
  { icon: '⚠️', label: 'Hàng nào sắp hết?', prompt: 'Cửa hàng có sản phẩm thức ăn hay phụ kiện nào sắp hết hàng không?' },
  { icon: '⏳', label: 'Hàng cận hạn 30 ngày?', prompt: 'Kiểm tra xem có lô hàng thức ăn nào cận hạn sử dụng trong 30 ngày tới không?' },
  { icon: '📅', label: 'Lịch hẹn hôm nay?', prompt: 'Hôm nay có những lịch hẹn tắm spa hay grooming nào?' },
  { icon: '🚚', label: 'Gợi ý nhập hàng tuần này', prompt: 'Gợi ý danh sách sản phẩm cần nhập thêm cho tuần này kèm số lượng' },
  { icon: '🐱', label: 'Sản phẩm nào grain-free cho mèo?', prompt: 'Có sản phẩm thức ăn nào grain-free cho mèo đang bán không?' },
  { icon: '🏥', label: 'Mèo tiêu chảy ăn gì (test guardrail)?', prompt: 'Mèo nhà em bị tiêu chảy và nôn nên cho ăn loại thức ăn hay thuốc bổ gì?' },
]

export const SuggestionChips: React.FC<SuggestionChipsProps> = ({ onSelectPrompt, disabled }) => {
  return (
    <div style={{ marginTop: 14 }}>
      <div style={{ fontSize: 13, color: '#64748B', marginBottom: 10, fontWeight: 600 }}>
        Gợi ý câu hỏi nhanh cho Trợ lý PetHouse:
      </div>
      <Space wrap size={[8, 8]}>
        {SUGGESTED_PROMPTS.map((item, index) => (
          <Button
            key={index}
            disabled={disabled}
            onClick={() => onSelectPrompt(item.prompt)}
            style={{
              background: '#FFFFFF',
              borderColor: '#E2E8F0',
              color: '#0F172A',
              borderRadius: 20,
              fontSize: 13,
              fontWeight: 500,
              height: 36,
              padding: '0 14px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
            }}
          >
            <span style={{ marginRight: 6, fontSize: 14 }}>{item.icon}</span>
            {item.label}
          </Button>
        ))}
      </Space>
    </div>
  )
}
