import React from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface TopProductItem {
  name: string
  quantity: number
}

interface TopProductsChartProps {
  data?: TopProductItem[]
}

const defaultData: TopProductItem[] = [
  { name: 'Mì Hảo Hảo', quantity: 240 },
  { name: 'Sữa tươi Vinamilk', quantity: 180 },
  { name: 'Nước ngọt Coca-Cola', quantity: 155 },
  { name: 'Bánh gạo One One', quantity: 120 },
  { name: 'Cà phê G7 3in1', quantity: 95 },
]

const COLORS = ['#2563EB', '#3B82F6', '#60A5FA', '#059669', '#10B981']

export const TopProductsChart: React.FC<TopProductsChartProps> = ({ data = defaultData }) => {
  return (
    <div style={{ width: '100%', height: 280 }}>
      <ResponsiveContainer>
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 10, right: 20, left: 20, bottom: 0 }}
        >
          <XAxis type="number" stroke="#64748B" fontSize={12} tickLine={false} />
          <YAxis
            type="category"
            dataKey="name"
            stroke="#0F172A"
            fontSize={13}
            fontWeight={500}
            tickLine={false}
            width={130}
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
            formatter={(value: any) => [`${value} sản phẩm`, 'Số lượng bán']}
          />
          <Bar dataKey="quantity" radius={[0, 6, 6, 0]}>
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
