export type ModelName = 'GPT-4o' | 'Claude 3.5' | 'Gemini 1.5' | '其他'
export type BizLine = '客服' | '营销' | '研发' | '风控'
export type EnvName = '生产' | '预发' | '测试'
export type TimeRange = '24h' | '7d' | '30d'
export type Status = '成功' | '失败'

export interface Filters {
  timeRange: TimeRange
  model: ModelName | 'all'
  biz: BizLine | 'all'
  env: EnvName | 'all'
}

export const defaultFilters: Filters = {
  timeRange: '7d',
  model: 'all',
  biz: 'all',
  env: 'all',
}

export const TIME_RANGE_OPTIONS: { value: TimeRange; label: string }[] = [
  { value: '24h', label: '近24小时' },
  { value: '7d', label: '近7天' },
  { value: '30d', label: '近30天' },
]

export const MODEL_OPTIONS: { value: Filters['model']; label: string }[] = [
  { value: 'all', label: '全部模型' },
  { value: 'GPT-4o', label: 'GPT-4o' },
  { value: 'Claude 3.5', label: 'Claude 3.5' },
  { value: 'Gemini 1.5', label: 'Gemini 1.5' },
  { value: '其他', label: '其他' },
]

export const BIZ_OPTIONS: { value: Filters['biz']; label: string }[] = [
  { value: 'all', label: '全部业务线' },
  { value: '客服', label: '客服' },
  { value: '营销', label: '营销' },
  { value: '研发', label: '研发' },
  { value: '风控', label: '风控' },
]

export const ENV_OPTIONS: { value: Filters['env']; label: string }[] = [
  { value: 'all', label: '全部环境' },
  { value: '生产', label: '生产' },
  { value: '预发', label: '预发' },
  { value: '测试', label: '测试' },
]

export interface ModelMeta {
  name: ModelName
  share: number
  color: string
  latencyMs: number
  errorRate: number
}

export const MODELS: ModelMeta[] = [
  { name: 'GPT-4o', share: 0.35, color: '#1677ff', latencyMs: 960, errorRate: 0.55 },
  { name: 'Claude 3.5', share: 0.28, color: '#722ed1', latencyMs: 860, errorRate: 0.32 },
  { name: 'Gemini 1.5', share: 0.22, color: '#13c2c2', latencyMs: 700, errorRate: 0.28 },
  { name: '其他', share: 0.15, color: '#bfbfbf', latencyMs: 740, errorRate: 0.48 },
]

const BIZ_SHARE: Record<BizLine, number> = {
  客服: 0.4,
  营销: 0.25,
  研发: 0.2,
  风控: 0.15,
}

const ENV_SHARE: Record<EnvName, number> = {
  生产: 0.7,
  预发: 0.2,
  测试: 0.1,
}

export const BASE_CALLS = 128_450
export const BASE_TOKENS = 86_200_000

export interface DayPoint {
  day: string
  calls: number
}

const EARLIER_DAYS: DayPoint[] = [
  { day: '10-26', calls: 14120 },
  { day: '10-27', calls: 13880 },
  { day: '10-28', calls: 15240 },
  { day: '10-29', calls: 14960 },
  { day: '10-30', calls: 16110 },
  { day: '10-31', calls: 15840 },
  { day: '11-01', calls: 14620 },
  { day: '11-02', calls: 13990 },
  { day: '11-03', calls: 15440 },
  { day: '11-04', calls: 16280 },
  { day: '11-05', calls: 17120 },
  { day: '11-06', calls: 16840 },
  { day: '11-07', calls: 15960 },
  { day: '11-08', calls: 14880 },
  { day: '11-09', calls: 16330 },
  { day: '11-10', calls: 17550 },
  { day: '11-11', calls: 18220 },
  { day: '11-12', calls: 17640 },
  { day: '11-13', calls: 16910 },
  { day: '11-14', calls: 15870 },
  { day: '11-15', calls: 16640 },
  { day: '11-16', calls: 17980 },
  { day: '11-17', calls: 18860 },
]

const LAST_7_DAYS: DayPoint[] = [
  { day: '11-18', calls: 15200 },
  { day: '11-19', calls: 16800 },
  { day: '11-20', calls: 17500 },
  { day: '11-21', calls: 19200 },
  { day: '11-22', calls: 18400 },
  { day: '11-23', calls: 20100 },
  { day: '11-24', calls: 21250 },
]

export interface CallRecord {
  time: string
  day: string
  model: ModelName
  biz: BizLine
  env: EnvName
  inputTokens: number
  outputTokens: number
  latencyMs: number
  status: Status
}

export const CALLS: CallRecord[] = [
  {
    time: '11-24 14:32',
    day: '11-24',
    model: 'GPT-4o',
    biz: '客服',
    env: '生产',
    inputTokens: 1240,
    outputTokens: 860,
    latencyMs: 920,
    status: '成功',
  },
  {
    time: '11-24 14:28',
    day: '11-24',
    model: 'Claude 3.5',
    biz: '营销',
    env: '生产',
    inputTokens: 2100,
    outputTokens: 1540,
    latencyMs: 1180,
    status: '成功',
  },
  {
    time: '11-24 14:21',
    day: '11-24',
    model: 'Gemini 1.5',
    biz: '研发',
    env: '测试',
    inputTokens: 680,
    outputTokens: 420,
    latencyMs: 640,
    status: '成功',
  },
  {
    time: '11-24 14:15',
    day: '11-24',
    model: 'GPT-4o',
    biz: '客服',
    env: '生产',
    inputTokens: 3400,
    outputTokens: 210,
    latencyMs: 2450,
    status: '失败',
  },
  {
    time: '11-24 14:02',
    day: '11-24',
    model: 'Claude 3.5',
    biz: '风控',
    env: '预发',
    inputTokens: 1560,
    outputTokens: 980,
    latencyMs: 870,
    status: '成功',
  },
]

function daysFor(range: TimeRange): DayPoint[] {
  if (range === '24h') return LAST_7_DAYS.filter((d) => d.day === '11-24')
  if (range === '7d') return LAST_7_DAYS
  return [...EARLIER_DAYS, ...LAST_7_DAYS]
}

function shareFactor(filters: Filters): number {
  const model = filters.model === 'all' ? 1 : MODELS.find((m) => m.name === filters.model)!.share
  const biz = filters.biz === 'all' ? 1 : BIZ_SHARE[filters.biz]
  const env = filters.env === 'all' ? 1 : ENV_SHARE[filters.env]
  return model * biz * env
}

function scaleDays(days: DayPoint[], factor: number): DayPoint[] {
  if (factor === 1) return days.map((d) => ({ ...d }))
  const raw = days.map((d) => d.calls * factor)
  const target = Math.round(raw.reduce((sum, n) => sum + n, 0))
  const values = raw.map((n) => Math.floor(n))
  let leftover = target - values.reduce((sum, n) => sum + n, 0)
  const order = raw
    .map((n, i) => ({ i, frac: n - Math.floor(n) }))
    .sort((a, b) => b.frac - a.frac || a.i - b.i)
  let cursor = 0
  while (leftover > 0) {
    values[order[cursor % order.length].i] += 1
    leftover -= 1
    cursor += 1
  }
  return days.map((d, i) => ({ day: d.day, calls: values[i] }))
}

export function buildTrend(filters: Filters): DayPoint[] {
  return scaleDays(daysFor(filters.timeRange), shareFactor(filters))
}

export interface Metrics {
  calls: number
  tokens: number
  latencyMs: number
  errorRate: number
}

export function buildMetrics(filters: Filters): Metrics {
  const calls = buildTrend(filters).reduce((sum, d) => sum + d.calls, 0)
  const tokens = calls === BASE_CALLS ? BASE_TOKENS : Math.round((calls * BASE_TOKENS) / BASE_CALLS)
  const model = filters.model === 'all' ? undefined : MODELS.find((m) => m.name === filters.model)
  return {
    calls,
    tokens,
    latencyMs: model ? model.latencyMs : 842,
    errorRate: model ? model.errorRate : 0.42,
  }
}

export interface ShareSlice {
  name: ModelName
  value: number
  color: string
}

export function buildShares(filters: Filters): ShareSlice[] {
  if (filters.model !== 'all') {
    const model = MODELS.find((m) => m.name === filters.model)!
    return [{ name: model.name, value: 100, color: model.color }]
  }
  return MODELS.map((model) => ({
    name: model.name,
    value: Math.round(model.share * 100),
    color: model.color,
  }))
}

export function filterCalls(filters: Filters): CallRecord[] {
  const allowedDays = new Set(daysFor(filters.timeRange).map((d) => d.day))
  return CALLS.filter(
    (row) =>
      allowedDays.has(row.day) &&
      (filters.model === 'all' || row.model === filters.model) &&
      (filters.biz === 'all' || row.biz === filters.biz) &&
      (filters.env === 'all' || row.env === filters.env),
  )
}
