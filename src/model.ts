export const LINES = ['招商', '营运', '推广', '客服', '物业工程', '财务', '人事行政'] as const

export type LineName = (typeof LINES)[number]
export type LineMap = Record<LineName, number>
export type Grade = 'G1' | 'G2' | 'G3' | 'G4' | 'G5'

export interface PlazaInput {
  name: string
  grade: Grade
  clusterName: string
  lowYield: boolean
  areaWan: number
  floors: number
  tenants: number
  revenue2027: number
  noi2027: number
  revenue2026: number
  revenue2025: number
  labor2027: number
  lines2027: LineMap
  outsource2027: number
  headcount2026: number
  labor2026: number
  headcount2025: number
  labor2025: number
  peerP25: number
  peerP50: number
  peerP75: number
  norm: LineMap
  floorLines: LineMap
  floorOutsource: number
}

export type VerdictId = 'insufficient' | 'overcut' | 'overstaffed' | 'structure' | 'lean' | 'pass'

export interface LineReview {
  line: LineName
  budget: number
  floor: number
  norm: number
  suggested: number
  note: string
}

export interface Review {
  verdict: VerdictId
  title: string
  ownHeadcount: number
  normTotal: number
  floorTotal: number
  suggestedTotal: number
  suggestedLines: LineMap
  efficiency: number | null
  yuanEfficiency: number | null
  laborRatio: number | null
  noiEfficiency: number | null
  peerHeadcount: number | null
  peerHeadcountLow: number | null
  peerHeadcountHigh: number | null
  perCapita2026: number | null
  impliedLabor: number | null
  impliedRatio: number | null
  impliedYuan: number | null
  efficiency2026: number | null
  ratio2026: number | null
  efficiency2025: number | null
  ratio2025: number | null
  lines: LineReview[]
  belowFloor: LineName[]
  paragraphs: string[]
}

export function emptyLines(value = 0): LineMap {
  return {
    招商: value,
    营运: value,
    推广: value,
    客服: value,
    物业工程: value,
    财务: value,
    人事行政: value,
  }
}

export function sumLines(lines: LineMap): number {
  return LINES.reduce((total, line) => total + (Number.isFinite(lines[line]) ? lines[line] : 0), 0)
}

export function suggestFloor(areaWan: number, floors: number, tenants: number): { lines: LineMap; outsource: number } {
  const area = Math.max(0, areaWan)
  const level = Math.max(0, floors)
  const shops = Math.max(0, tenants)
  return {
    lines: {
      招商: Math.max(2, Math.ceil(shops / 80)),
      营运: Math.max(4, Math.ceil(shops / 30)),
      推广: area >= 10 ? 3 : 2,
      客服: Math.max(4, Math.ceil(level * 1.2)),
      物业工程: Math.max(4, Math.ceil(area * 0.8)),
      财务: area >= 5 ? 3 : 2,
      人事行政: 2,
    },
    outsource: Math.max(10, Math.ceil(area * 5)),
  }
}

function ratio(numerator: number, denominator: number): number | null {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator <= 0) return null
  return numerator / denominator
}

function round1(value: number): number {
  return Math.round(value * 10) / 10
}

function people(value: number): string {
  return Number.isInteger(value) ? `${value} 人` : `${round1(value)} 人`
}

function wan(value: number | null, digits = 1): string {
  if (value == null || !Number.isFinite(value)) return '—'
  return `${value.toLocaleString('zh-CN', { maximumFractionDigits: digits, minimumFractionDigits: digits })} 万元`
}

function pct(value: number | null): string {
  if (value == null || !Number.isFinite(value)) return '—'
  return `${(value * 100).toFixed(1)}%`
}

function perPerson(value: number | null): string {
  if (value == null || !Number.isFinite(value)) return '—'
  return `${round1(value).toLocaleString('zh-CN')} 万元/人`
}

function allocate(total: number, norm: LineMap, floorLines: LineMap): LineMap {
  const normTotal = sumLines(norm)
  const suggested = emptyLines()
  if (total <= 0) return suggested
  if (normTotal <= 0) {
    const even = total / LINES.length
    for (const line of LINES) suggested[line] = Math.max(floorLines[line] || 0, Math.round(even))
    return suggested
  }
  for (const line of LINES) {
    const raw = (total * norm[line]) / normTotal
    suggested[line] = Math.max(floorLines[line] || 0, Math.round(raw))
  }
  return suggested
}

export function reviewPlaza(input: PlazaInput): Review {
  const ownHeadcount = sumLines(input.lines2027)
  const normTotal = sumLines(input.norm)
  const floorTotal = sumLines(input.floorLines)
  const efficiency = ratio(input.revenue2027, ownHeadcount)
  const yuanEfficiency = ratio(input.revenue2027, input.labor2027)
  const laborRatio = ratio(input.labor2027, input.revenue2027)
  const noiEfficiency = ratio(input.noi2027, ownHeadcount)
  const peerHeadcount = ratio(input.revenue2027, input.peerP50)
  const peerHeadcountLow = ratio(input.revenue2027, input.peerP75)
  const peerHeadcountHigh = ratio(input.revenue2027, input.peerP25)
  const perCapita2026 = ratio(input.labor2026, input.headcount2026)
  const efficiency2026 = ratio(input.revenue2026, input.headcount2026)
  const ratio2026 = ratio(input.labor2026, input.revenue2026)
  const efficiency2025 = ratio(input.revenue2025, input.headcount2025)
  const ratio2025 = ratio(input.labor2025, input.revenue2025)

  const targetTotal =
    peerHeadcount == null ? floorTotal : Math.max(floorTotal, peerHeadcount)
  const suggestedLines = allocate(targetTotal, input.norm, input.floorLines)
  const suggestedTotal = sumLines(suggestedLines)
  const impliedLabor = perCapita2026 == null ? null : suggestedTotal * perCapita2026
  const impliedRatio = ratio(impliedLabor ?? NaN, input.revenue2027)
  const impliedYuan = ratio(input.revenue2027, impliedLabor ?? NaN)

  const lines: LineReview[] = LINES.map((line) => {
    const budget = input.lines2027[line] || 0
    const floor = input.floorLines[line] || 0
    const norm = input.norm[line] || 0
    const suggested = suggestedLines[line]
    let note = '在底线和常模之间'
    if (budget < floor) note = '低于经营底线'
    else if (norm > 0 && budget > norm * 1.2) note = '高于常模'
    else if (norm > 0 && budget < norm * 0.8) note = '低于常模，但还在底线之上'
    return { line, budget, floor, norm, suggested, note }
  })
  const belowFloor = lines.filter((line) => line.budget < line.floor).map((line) => line.line)
  const outsourceCut = input.outsource2027 < input.floorOutsource
  const abovePeer = peerHeadcountHigh != null && ownHeadcount > peerHeadcountHigh
  const insidePeer =
    peerHeadcountLow != null &&
    peerHeadcountHigh != null &&
    ownHeadcount >= peerHeadcountLow &&
    ownHeadcount <= peerHeadcountHigh
  const structureOff = lines.some((line) => line.note === '高于常模' || line.note.startsWith('低于常模'))

  let verdict: VerdictId = 'pass'
  if (input.revenue2027 <= 0 || input.peerP50 <= 0) verdict = 'insufficient'
  else if (belowFloor.length > 0 || ownHeadcount < floorTotal || outsourceCut) verdict = 'overcut'
  else if (abovePeer) verdict = 'overstaffed'
  else if (insidePeer && structureOff) verdict = 'structure'
  else if (peerHeadcountLow != null && ownHeadcount < peerHeadcountLow) verdict = 'lean'
  else verdict = 'pass'

  const titles: Record<VerdictId, string> = {
    insufficient: '信息不足，还不能下结论',
    overcut: '压降过度，支撑不了 27 年经营',
    overstaffed: '人数偏高，人工预算偏松',
    structure: '总人数可以接受，条线结构要调整',
    lean: '人数低于同类广场，但还没击穿底线',
    pass: '预算落在合理区间',
  }

  const cluster = input.clusterName || '同类广场'
  const yieldNote = input.lowYield ? '这个广场按低收益广场看。低收益只说明收入低，不说明可以把人减到开不了业。' : '这个广场不按低收益特殊类型处理。'
  const paragraphs: string[] = []

  if (verdict === 'insufficient') {
    paragraphs.push('2027 年全口径收入和族群人效中位数都要有数。收入是不变量，没有收入就反推不出人数；没有族群人效，就没有同类广场的标尺。')
  } else {
    paragraphs.push(
      `收入按不变量锁定：2027 年全口径收入 ${wan(input.revenue2027, 0)}，NOI ${wan(input.noi2027, 0)}。人数是可变量。预算自有 ${people(ownHeadcount)}，人效 ${perPerson(efficiency)}，人工成本 ${wan(input.labor2027, 0)}，人工成本占比 ${pct(laborRatio)}，元效 ${yuanEfficiency == null ? '—' : round1(yuanEfficiency).toLocaleString('zh-CN')}。`,
    )
    paragraphs.push(
      `思路 2 用族群标尺。${cluster}的人效中位数是 ${perPerson(input.peerP50)}，收入除以这个人效，总人数约 ${people(peerHeadcount ?? 0)}。人效较低的 ${perPerson(input.peerP25)} 对应大约 ${people(peerHeadcountHigh ?? 0)}，人效较高的 ${perPerson(input.peerP75)} 对应大约 ${people(peerHeadcountLow ?? 0)}。`,
    )
    paragraphs.push(
      `G${input.grade.slice(1)} 常模合计 ${people(normTotal)}，这是终极目标，不是今年必须一步砍到的数。经营底线合计 ${people(floorTotal)}，外包底线 ${people(input.floorOutsource)}。两个维度一起看：总数向族群人效靠，条线向常模靠，任何一条都不能低于底线。按这个规则，建议自有 ${people(suggestedTotal)}。`,
    )
    if (perCapita2026 != null && impliedLabor != null) {
      paragraphs.push(
        `人数和人效可以互推。元效和人工成本占比还要一个人均成本。这里沿用 2026 年实际人均 ${perPerson(perCapita2026)}。建议人数对应人工成本约 ${wan(impliedLabor, 0)}，占比 ${pct(impliedRatio)}，元效 ${impliedYuan == null ? '—' : round1(impliedYuan).toLocaleString('zh-CN')}。只定人数、不看人均成本，得不出元效。`,
      )
    }
    paragraphs.push(yieldNote)
    if (efficiency2026 != null || efficiency2025 != null) {
      paragraphs.push(
        `对照历史：2026 年 ${people(input.headcount2026)}、人效 ${perPerson(efficiency2026)}、人工成本占比 ${pct(ratio2026)}；2025 年 ${people(input.headcount2025)}、人效 ${perPerson(efficiency2025)}、人工成本占比 ${pct(ratio2025)}。收入没有大幅下跌时，人数不应腰斩。`,
      )
    }
    if (verdict === 'overcut') {
      const lineText = belowFloor.length ? `${belowFloor.join('、')}低于经营底线。` : '自有合计或外包人数低于底线。'
      paragraphs.push(
        `结论是压降过度。${lineText}预算外包 ${people(input.outsource2027)}。人工成本占比看起来更好，是因为人被砍掉了，不是因为同样的人做出了更高收入。这样的占比不能当合理值，27 年经营接不住。`,
      )
    } else if (verdict === 'overstaffed') {
      paragraphs.push('结论是人数偏高。预算人数高于族群人效区间的上沿，人工预算偏松。总数先收到族群区间里，条线再按常模重排，不要只砍某一条线。')
    } else if (verdict === 'structure') {
      paragraphs.push('结论是总数可以留在族群区间里，但条线和常模不一致。按常模比例重排，并保证每条线不低于底线。')
    } else if (verdict === 'lean') {
      paragraphs.push('结论是人数已经比同类广场更瘦，但还没有击穿经营底线。可以接受，不要再往下压。低收益广场尤其不要再拿成本占比继续压人。')
    } else {
      paragraphs.push('结论是预算落在族群区间内，条线没有击穿底线，也没有明显脱离常模。可以进入下一轮审核，仍要核对 25 年、26 年的实际完成和这个广场的面积、楼层、商户数。')
    }
  }

  return {
    verdict,
    title: titles[verdict],
    ownHeadcount,
    normTotal,
    floorTotal,
    suggestedTotal,
    suggestedLines,
    efficiency,
    yuanEfficiency,
    laborRatio,
    noiEfficiency,
    peerHeadcount,
    peerHeadcountLow,
    peerHeadcountHigh,
    perCapita2026,
    impliedLabor,
    impliedRatio,
    impliedYuan,
    efficiency2026,
    ratio2026,
    efficiency2025,
    ratio2025,
    lines,
    belowFloor,
    paragraphs,
  }
}
