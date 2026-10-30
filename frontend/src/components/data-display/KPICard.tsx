import React from 'react'
import { Card, Typography } from 'antd'
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons'

const { Text, Title } = Typography

interface KPICardProps {
  title: string
  value: string | number
  subtext?: string
  icon?: string
  trend?: {
    direction: 'up' | 'down'
    percentage: string
  }
  colorAccent?: string
  loading?: boolean
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  subtext,
  icon,
  trend,
  colorAccent = '#2563EB',
  loading,
}) => {
  return (
    <Card
      loading={loading}
      style={{
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: 8,
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
      }}
      bodyStyle={{ padding: '20px' }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: colorAccent,
        }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Text style={{ fontSize: 14, color: '#64748B', fontWeight: 600 }}>{title}</Text>
          <Title
            level={3}
            style={{
              margin: '8px 0 4px',
              color: '#0F172A',
              fontWeight: 700,
              fontSize: 26,
            }}
          >
            {value}
          </Title>
        </div>
        {icon && (
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 8,
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
            }}
          >
            {icon}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
        {trend && (
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: trend.direction === 'up' ? '#059669' : '#DC2626',
              display: 'flex',
              alignItems: 'center',
              gap: 3,
            }}
          >
            {trend.direction === 'up' ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
            {trend.percentage}
          </span>
        )}
        {subtext && <Text style={{ fontSize: 13, color: '#64748B' }}>{subtext}</Text>}
      </div>
    </Card>
  )
}

