import React from 'react'
import { Typography, Tag, Space } from 'antd'
import { ChatMessageItem } from '../../store/useChatStore'
import { ToolResultRenderer } from './ToolResultRenderer'
import { SuggestionChips } from './SuggestionChips'

const { Text } = Typography

interface MessageBubbleProps {
  message: ChatMessageItem
  onSelectPrompt?: (prompt: string) => void
  onInspectTool?: (meta: any) => void
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  onSelectPrompt,
  onInspectTool,
}) => {
  const isUser = message.role === 'user'
  const meta = message.responseMetadata

  const formatText = (text: string) => {
    return text.split('\n').map((line, i) => {
      const trimmed = line.trim()
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        return (
          <li key={i} style={{ marginLeft: 20, color: '#1E293B', marginBottom: 6, fontSize: 16 }}>
            {trimmed.substring(2)}
          </li>
        )
      }
      return (
        <p key={i} style={{ margin: '0 0 8px 0', lineHeight: 1.6, color: '#1E293B', fontSize: 16 }}>
          {line}
        </p>
      )
    })
  }

  return (
    <div
      style={{
        display: 'flex',
        gap: 12,
        marginBottom: 20,
        flexDirection: isUser ? 'row-reverse' : 'row',
        alignItems: 'flex-start',
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: 12,
          background: isUser ? '#FFF7ED' : '#F0FDFA',
          border: isUser ? '1px solid #FFEDD5' : '1px solid #CCFBF1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 18,
          flexShrink: 0,
        }}
      >
        {isUser ? '👤' : '🐾'}
      </div>

      {/* Bubble Content */}
      <div style={{ maxWidth: '84%' }}>
        {/* Medical Intent Guardrail Banner */}
        {!isUser && (message.content.includes('bác sĩ thú y') || meta?.intent === 'BLOCKED_MEDICAL_INTENT') && (
          <div
            style={{
              background: '#FEF3C7',
              border: '1px solid #FDE68A',
              color: '#92400E',
              padding: '6px 12px',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 600,
              marginBottom: 8,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            ⚠️ <span>Cảnh báo quy chế: AI không được tư vấn điều trị y tế hoặc kê đơn thuốc thú y.</span>
          </div>
        )}

        {/* Friendly grounding indicator instead of technical tool call */}
        {!isUser && meta?.tool_calls && meta.tool_calls.length > 0 && (
          <Space wrap size={[6, 6]} style={{ marginBottom: 6 }}>
            <Tag
              color="cyan"
              onClick={() => onInspectTool?.(meta)}
              style={{ cursor: 'pointer', fontSize: 12, padding: '2px 8px', borderRadius: 12, fontWeight: 500, borderColor: '#5EEAD4' }}
            >
              🐾 Đã đối chiếu dữ liệu cửa hàng thú cưng
            </Tag>
          </Space>
        )}

        <div
          style={{
            background: isUser ? '#FFF7ED' : '#FFFFFF',
            border: isUser ? '1px solid #FED7AA' : '1px solid #E2E8F0',
            padding: '14px 18px',
            borderRadius: 14,
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}
        >
          {formatText(message.content)}

          {/* Render Grounded Data Component if any */}
          {!isUser && meta?.data && <ToolResultRenderer data={meta.data} />}

          {/* Initial Suggestion Chips on Welcome Message */}
          {!isUser && message.id.startsWith('welcome') && onSelectPrompt && (
            <SuggestionChips onSelectPrompt={onSelectPrompt} />
          )}
        </div>

        <div
          style={{
            fontSize: 12,
            color: '#94A3B8',
            marginTop: 4,
            textAlign: isUser ? 'right' : 'left',
          }}
        >
          {new Date(message.timestamp).toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      </div>
    </div>
  )
}
