import React from 'react'
import { ChatInterface } from '../../components/ai/ChatInterface'

export const AiAssistantPage: React.FC = () => {
  return (
    <div
      style={{
        maxWidth: 960,
        margin: '0 auto',
        background: '#FFFFFF',
        borderRadius: 8,
        border: '1px solid #E2E8F0',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }}
    >
      <ChatInterface />
    </div>
  )
}
