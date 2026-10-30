import React from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { formatCurrencyVND } from '../../utils/currency'

interface SalesDataPoint {
  date: string
  revenue: number
  cost?: number
  profit?: number
}

interface SalesChartProps {
  data?: SalesDataPoint[]
}

const defaultData: SalesDataPoint[] = [
  { date: '11/10', revenue: 12500000, profit: 3200000 },
  { date: '12/10', revenue: 14200000, profit: 3900000 },
  { date: '13/10', revenue: 11800000, profit: 2800000 },
  { date: '14/10', revenue: 16900000, profit: 4500000 },
  { date: '15/10', revenue: 15400000, profit: 4100000 },
  { date: '16/10', revenue: 18200000, profit: 5200000 },
  { date: '17/10', revenue: 14850000, profit: 3850000 },
]

export const SalesChart: React.FC<SalesChartProps> = ({ data = defaultData }) => {
  return (
    <div style={{ width: '100%', height: 280 }}>
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#059669" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
          <XAxis dataKey="date" stroke="#64748B" fontSize={12} tickLine={false} />
          <YAxis
            stroke="#64748B"
            fontSize={12}
            tickLine={false}
            tickFormatter={(v) => `${(v / 1000000).toFixed(0)}Tr`}
          />
          <Tooltip
            contentStyle={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: 8,
              fontSize: 13,
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              color: '#0F172A',
            }}
            formatter={(value: any, name: any) => [
              formatCurrencyVND(value),
              name === 'revenue' ? 'Doanh thu' : 'Lợi nhuận gộp',
            ]}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#2563EB"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#colorRevenue)"
          />
          <Area
            type="monotone"
            dataKey="profit"
            stroke="#059669"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#colorProfit)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
