import React from 'react'
import { Card, Tag, Typography, Empty } from 'antd'
import { ChatMessageResponse } from '../../types/api'

const { Title, Text } = Typography

interface ToolInspectorProps {
  data: ChatMessageResponse | null
}

export const ToolInspector: React.FC<ToolInspectorProps> = ({ data }) => {
  if (!data || !data.tool_calls || data.tool_calls.length === 0) {
    return (
      <div
        style={{
          width: 340,
          background: '#F8FAFC',
          borderLeft: '1px solid #E2E8F0',
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          color: '#64748B',
        }}
      >
        <div style={{ fontSize: 32, marginBottom: 12 }}>📖</div>
        <Title level={5} style={{ color: '#0F172A', margin: '0 0 6px 0' }}>
          Nhật Ký Tra Cứu Số Liệu
        </Title>
        <Text style={{ fontSize: 13, color: '#64748B' }}>
          {data?.intent
            ? `Chủ đề hỏi: ${data.intent}. Trả lời trực tiếp từ kiến thức nghiệp vụ bán hàng.`
            : 'Khi bạn hỏi về tiền bán, tiền lời hay hàng tồn, các thao tác tra sổ sẽ hiện tại đây để bạn kiểm tra minh bạch.'}
        </Text>
      </div>
    )
  }

  return (
    <div
      style={{
        width: 340,
        background: '#FFFFFF',
        borderLeft: '1px solid #E2E8F0',
        padding: 20,
        overflowY: 'auto',
      }}
    >
      <div style={{ marginBottom: 16 }}>
        <Title level={5} style={{ color: '#0F172A', margin: '0 0 4px 0', fontSize: 15 }}>
          📖 Nhật Ký Tra Sổ Bán Hàng
        </Title>
        <Text style={{ fontSize: 12, color: '#64748B' }}>
          Đã đối chiếu qua {data.tool_calls.length} mục sổ sách
        </Text>
      </div>

      {data.tool_calls.map((tc, idx) => (
        <Card
          key={idx}
          size="small"
          style={{
            marginBottom: 12,
            background: '#F8FAFC',
            borderColor: '#E2E8F0',
            borderRadius: 8,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <Text strong style={{ color: '#1E293B', fontSize: 13 }}>
              {tc.name}
            </Text>
            <Tag color={tc.status === 'success' ? 'green' : 'red'}>
              {tc.status === 'success' ? 'Hoàn tất' : 'Chưa xong'}
            </Tag>
          </div>

          <div style={{ fontSize: 12, color: '#64748B', marginBottom: 4 }}>
            Thông tin tìm kiếm:
          </div>
          <pre
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              padding: 8,
              borderRadius: 6,
              fontSize: 12,
              color: '#334155',
              overflowX: 'auto',
            }}
          >
            {JSON.stringify(tc.arguments || {}, null, 2)}
          </pre>
        </Card>
      ))}

      {data.data && (
        <Card
          size="small"
          style={{
            background: '#F0FDF4',
            borderColor: '#BBF7D0',
            borderRadius: 8,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <Text strong style={{ color: '#059669', fontSize: 13 }}>
              Số Liệu Thực Tế Khớp Sổ Quầy
            </Text>
            <Tag color="success">ĐÃ XÁC THỰC</Tag>
          </div>
          <pre
            style={{
              background: '#FFFFFF',
              border: '1px solid #BBF7D0',
              padding: 8,
              borderRadius: 6,
              fontSize: 12,
              color: '#15803D',
              overflowX: 'auto',
            }}
          >
            {JSON.stringify(data.data, null, 2)}
          </pre>
        </Card>
      )}
    </div>
  )
}
