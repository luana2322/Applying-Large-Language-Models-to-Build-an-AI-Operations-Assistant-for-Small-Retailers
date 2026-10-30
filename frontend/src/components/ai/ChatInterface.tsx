import React, { useState, useRef, useEffect } from 'react'
import { Input, Button, Spin, Alert } from 'antd'
import { SendOutlined } from '@ant-design/icons'
import { useChatStore } from '../../store/useChatStore'
import { useStoreStore } from '../../store/useStoreStore'
import { aiService } from '../../services/ai.service'
import { MessageBubble } from './MessageBubble'

export const ChatInterface: React.FC = () => {
  const [inputText, setInputText] = useState('')
  const [errorText, setErrorText] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const {
    sessionId,
    messages,
    isLoading,
    addMessage,
    setLoading,
    setActiveInspector,
  } = useChatStore()

  const { currentStoreCode } = useStoreStore()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  const handleSend = async (queryText?: string) => {
    const text = (queryText || inputText).trim()
    if (!text || isLoading) return

    setInputText('')
    setErrorText(null)

    // Add user message to state
    addMessage({
      id: 'user-' + Date.now(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    })

    setLoading(true)

    try {
      const response = await aiService.sendMessage({
        request_id: 'req-' + Math.random().toString(36).substring(2, 10),
        session_id: sessionId,
        message: text,
        context: {
          timezone: 'Asia/Ho_Chi_Minh',
          locale: 'vi-VN',
          store_code: currentStoreCode,
        },
      })

      // Add assistant message
      addMessage({
        id: 'assistant-' + Date.now(),
        role: 'assistant',
        content: response.answer,
        timestamp: Date.now(),
        responseMetadata: response,
      })

      setActiveInspector(response)
    } catch (err: any) {
      const message =
        err?.response?.data?.answer ||
        err?.response?.data?.message ||
        'Không thể kết nối đến máy chủ trợ lý. Bác vui lòng thử lại sau giây lát.'
      setErrorText(message)

      addMessage({
        id: 'error-' + Date.now(),
        role: 'system',
        content: `⚠️ Thông báo: ${message}`,
        timestamp: Date.now(),
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 120px)',
        position: 'relative',
        background: '#F8FAFC',
      }}
    >
      {/* Messages Scroll Area */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px 24px',
        }}
      >
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            onSelectPrompt={(prompt) => handleSend(prompt)}
            onInspectTool={(meta) => setActiveInspector(meta)}
          />
        ))}

        {isLoading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '16px 0', padding: '12px 16px', background: '#FFFFFF', borderRadius: 8, border: '1px solid #E2E8F0', width: 'fit-content' }}>
            <Spin size="small" />
            <span style={{ fontSize: 15, color: '#475569', fontWeight: 500 }}>
              ⏳ Đang mở sổ bán hàng và đối chiếu dữ liệu kho...
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Container */}
      <div
        style={{
          padding: '16px 24px',
          background: '#FFFFFF',
          borderTop: '1px solid #E2E8F0',
          boxShadow: '0 -2px 10px rgba(0,0,0,0.02)',
        }}
      >
        {errorText && (
          <Alert
            message={errorText}
            type="warning"
            showIcon
            closable
            style={{ marginBottom: 12 }}
            onClose={() => setErrorText(null)}
          />
        )}

        <div style={{ display: 'flex', gap: 12 }}>
          <Input.TextArea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onPressEnter={(e) => {
              if (!e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            placeholder="Gõ câu hỏi của cô/chú vào đây (Ví dụ: 'Hôm nay bán được bao nhiêu tiền?', 'Có món nào sắp hết không?')..."
            autoSize={{ minRows: 1, maxRows: 3 }}
            style={{
              background: '#FFFFFF',
              borderColor: '#CBD5E1',
              color: '#0F172A',
              borderRadius: 8,
              fontSize: 16,
              padding: '10px 14px',
            }}
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            loading={isLoading}
            onClick={() => handleSend()}
            style={{
              height: 48,
              borderRadius: 8,
              padding: '0 24px',
              fontSize: 16,
              fontWeight: 600,
              background: '#2563EB',
            }}
          >
            Gửi
          </Button>
        </div>

        <div style={{ fontSize: 13, color: '#64748B', marginTop: 8 }}>
          💡 Trợ lý chỉ trả lời dựa trên hóa đơn và sổ sách thực tế của cửa hàng.
        </div>
      </div>
    </div>
  )
}
