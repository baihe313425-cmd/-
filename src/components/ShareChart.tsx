import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import type { ShareSlice } from '../data'

interface ShareChartProps {
  data: ShareSlice[]
}

export function ShareChart({ data }: ShareChartProps) {
  return (
    <div className="share-body" data-testid="share-chart">
      <div className="share-plot">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={62}
              outerRadius={88}
              paddingAngle={data.length > 1 ? 2 : 0}
              stroke={data.length > 1 ? '#fff' : 'none'}
              strokeWidth={data.length > 1 ? 2 : 0}
              isAnimationActive={false}
            >
              {data.map((slice) => (
                <Cell key={slice.name} fill={slice.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [`${Number(value)}%`, String(name)]}
              contentStyle={{
                borderRadius: 8,
                border: '1px solid #e5e6eb',
                boxShadow: '0 6px 16px rgba(29, 33, 41, 0.08)',
                fontSize: 13,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="legend">
        {data.map((slice) => (
          <li key={slice.name}>
            <span className="legend-dot" style={{ background: slice.color }} />
            <span className="legend-name">{slice.name}</span>
            <span className="legend-pct">{slice.value}%</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
