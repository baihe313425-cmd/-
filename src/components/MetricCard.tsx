interface MetricCardProps {
  testId: string
  title: string
  value: string
  delta: string
  direction: 'up' | 'down'
}

export function MetricCard({ testId, title, value, delta, direction }: MetricCardProps) {
  const arrow = direction === 'up' ? '↑' : '↓'
  return (
    <article className="card metric-card" data-testid={testId}>
      <h2 className="metric-title">{title}</h2>
      <p className="metric-value">{value}</p>
      <p className="metric-delta">
        <span className="delta-label">较上期</span>
        <span className={direction === 'up' ? 'delta-up' : 'delta-down'}>
          {arrow}
          {delta}
        </span>
      </p>
    </article>
  )
}
