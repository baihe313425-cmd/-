import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { DayPoint } from '../data'
import { formatInt } from '../format'

interface TrendChartProps {
  data: DayPoint[]
}

export function TrendChart({ data }: TrendChartProps) {
  const crowded = data.length > 10
  return (
    <div className="trend-body" data-testid="trend-chart">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 16, right: 18, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#eef0f3" strokeDasharray="4 4" vertical={false} />
          <XAxis
            dataKey="day"
            tick={{ fill: '#86909c', fontSize: 12 }}
            axisLine={{ stroke: '#e5e6eb' }}
            tickLine={false}
            tickMargin={14}
            padding={{ left: 18, right: 18 }}
            interval={crowded ? 2 : 0}
            angle={crowded ? -40 : 0}
            textAnchor={crowded ? 'end' : 'middle'}
            height={crowded ? 56 : 40}
          />
          <YAxis
            domain={[0, 25000]}
            ticks={[0, 5000, 10000, 15000, 20000, 25000]}
            tickFormatter={(value: number) => formatInt(value)}
            tick={{ fill: '#86909c', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={72}
          />
          <Tooltip
            formatter={(value) => [formatInt(Number(value)), '调用次数']}
            labelFormatter={(label) => String(label)}
            contentStyle={{
              borderRadius: 8,
              border: '1px solid #e5e6eb',
              boxShadow: '0 6px 16px rgba(29, 33, 41, 0.08)',
              fontSize: 13,
            }}
          />
          <Line
            type="monotone"
            dataKey="calls"
            name="调用次数"
            stroke="#1677ff"
            strokeWidth={2.5}
            dot={{ r: 3.5, fill: '#1677ff', stroke: '#fff', strokeWidth: 1.5 }}
            activeDot={{ r: 5, fill: '#1677ff', stroke: '#fff', strokeWidth: 2 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
