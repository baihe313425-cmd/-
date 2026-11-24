import { useMemo, useState } from 'react'
import { CallTable } from './components/CallTable'
import { MetricCard } from './components/MetricCard'
import { ShareChart } from './components/ShareChart'
import { TrendChart } from './components/TrendChart'
import {
  BIZ_OPTIONS,
  ENV_OPTIONS,
  MODEL_OPTIONS,
  TIME_RANGE_OPTIONS,
  buildMetrics,
  buildShares,
  buildTrend,
  defaultFilters,
  filterCalls,
  type Filters,
} from './data'
import { formatInt, formatLatency, formatPercent, formatTokens } from './format'

export default function App() {
  const [draft, setDraft] = useState<Filters>(defaultFilters)
  const [applied, setApplied] = useState<Filters>(defaultFilters)

  const metrics = useMemo(() => buildMetrics(applied), [applied])
  const trend = useMemo(() => buildTrend(applied), [applied])
  const shares = useMemo(() => buildShares(applied), [applied])
  const rows = useMemo(() => filterCalls(applied), [applied])

  function update<K extends keyof Filters>(key: K, value: Filters[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }))
  }

  function onSearch() {
    setApplied(draft)
  }

  function onReset() {
    setDraft(defaultFilters)
    setApplied(defaultFilters)
  }

  return (
    <div className="page">
      <header className="topbar">
        <div className="topbar-inner">
          <span className="brand-mark" aria-hidden="true" />
          <h1>大模型数据平台</h1>
        </div>
      </header>
      <main className="content">
        <form
          className="card filters"
          onSubmit={(event) => {
            event.preventDefault()
            onSearch()
          }}
        >
          <label className="field">
            <span>时间范围</span>
            <select
              id="time-range"
              value={draft.timeRange}
              onChange={(event) => update('timeRange', event.target.value as Filters['timeRange'])}
            >
              {TIME_RANGE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>模型</span>
            <select
              id="model"
              value={draft.model}
              onChange={(event) => update('model', event.target.value as Filters['model'])}
            >
              {MODEL_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>业务线</span>
            <select
              id="biz"
              value={draft.biz}
              onChange={(event) => update('biz', event.target.value as Filters['biz'])}
            >
              {BIZ_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>环境</span>
            <select
              id="env"
              value={draft.env}
              onChange={(event) => update('env', event.target.value as Filters['env'])}
            >
              {ENV_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <div className="actions">
            <button className="btn btn-primary" type="submit" data-testid="query-button">
              查询
            </button>
            <button className="btn btn-secondary" type="button" data-testid="reset-button" onClick={onReset}>
              重置
            </button>
          </div>
        </form>

        <section className="metrics" aria-label="核心指标">
          <MetricCard
            testId="metric-calls"
            title="总调用次数"
            value={formatInt(metrics.calls)}
            delta="12.5%"
            direction="up"
          />
          <MetricCard
            testId="metric-tokens"
            title="总 Token 消耗"
            value={formatTokens(metrics.tokens)}
            delta="8.3%"
            direction="up"
          />
          <MetricCard
            testId="metric-latency"
            title="平均响应时间"
            value={formatLatency(metrics.latencyMs)}
            delta="5.1%"
            direction="down"
          />
          <MetricCard
            testId="metric-error"
            title="错误率"
            value={formatPercent(metrics.errorRate)}
            delta="0.08pp"
            direction="up"
          />
        </section>

        <section className="charts">
          <article className="card chart-card">
            <h2>调用趋势</h2>
            <TrendChart data={trend} />
          </article>
          <article className="card chart-card">
            <h2>模型调用占比</h2>
            <ShareChart data={shares} />
          </article>
        </section>

        <section className="card table-card">
          <h2>调用明细</h2>
          <CallTable rows={rows} />
        </section>
      </main>
    </div>
  )
}
