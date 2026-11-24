export function formatInt(value: number): string {
  return Math.round(value).toLocaleString('en-US')
}

export function formatTokens(value: number): string {
  if (value >= 1_000_000) {
    const millions = Math.round(value / 100_000) / 10
    return `${millions.toFixed(1)}M`
  }
  return formatInt(value)
}

export function formatLatency(value: number): string {
  return `${formatInt(value)}ms`
}

export function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`
}
