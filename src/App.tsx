import { useMemo, useState } from 'react'
import { LINES, reviewPlaza, suggestFloor, type LineMap, type LineName, type PlazaInput } from './model'
import { clonePlaza, samplePlaza } from './sample'

function num(value: string): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function Field({
  label,
  value,
  onChange,
  step = '1',
}: {
  label: string
  value: number
  onChange: (value: number) => void
  step?: string
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <input value={Number.isFinite(value) ? value : 0} step={step} type="number" onChange={(event) => onChange(num(event.target.value))} />
    </label>
  )
}

function LineEditor({
  title,
  lines,
  onChange,
}: {
  title: string
  lines: LineMap
  onChange: (line: LineName, value: number) => void
}) {
  return (
    <fieldset className="lines">
      <legend>{title}</legend>
      <div className="line-grid">
        {LINES.map((line) => (
          <label key={line}>
            <span>{line}</span>
            <input type="number" value={lines[line]} onChange={(event) => onChange(line, num(event.target.value))} />
          </label>
        ))}
      </div>
    </fieldset>
  )
}

function money(value: number | null, digits = 1): string {
  if (value == null || !Number.isFinite(value)) return '—'
  return value.toLocaleString('zh-CN', { maximumFractionDigits: digits, minimumFractionDigits: digits })
}

function people(value: number | null): string {
  if (value == null || !Number.isFinite(value)) return '—'
  const rounded = Math.round(value * 10) / 10
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1)
}

export default function App() {
  const [plaza, setPlaza] = useState<PlazaInput>(() => clonePlaza(samplePlaza))
  const review = useMemo(() => reviewPlaza(plaza), [plaza])

  function patch(partial: Partial<PlazaInput>) {
    setPlaza((current) => ({ ...current, ...partial }))
  }

  function patchLines(key: 'lines2027' | 'norm' | 'floorLines', line: LineName, value: number) {
    setPlaza((current) => ({ ...current, [key]: { ...current[key], [line]: value } }))
  }

  function refillFloor() {
    const next = suggestFloor(plaza.areaWan, plaza.floors, plaza.tenants)
    patch({ floorLines: next.lines, floorOutsource: next.outsource })
  }

  return (
    <div className="page">
      <header className="topbar">
        <div className="topbar-inner">
          <h1>广场人工预算审核</h1>
          <p>收入锁定。审核人数、人效、元效和人工成本占比。</p>
        </div>
      </header>
      <main className="layout">
        <section className="result" data-testid="review">
          <p className={`verdict verdict-${review.verdict}`} data-testid="verdict">
            {review.title}
          </p>
          <p className="plaza-name">
            {plaza.name || '未命名广场'} · {plaza.grade} · {plaza.clusterName || '未命名族群'}
            {plaza.lowYield ? ' · 低收益' : ''}
          </p>
          <div className="compare">
            <article>
              <h2>2027 预算</h2>
              <dl>
                <div>
                  <dt>自有人数</dt>
                  <dd>{people(review.ownHeadcount)} 人</dd>
                </div>
                <div>
                  <dt>人效</dt>
                  <dd>{money(review.efficiency, 1)} 万元/人</dd>
                </div>
                <div>
                  <dt>元效</dt>
                  <dd>{money(review.yuanEfficiency, 1)}</dd>
                </div>
                <div>
                  <dt>人工成本占比</dt>
                  <dd>{review.laborRatio == null ? '—' : `${(review.laborRatio * 100).toFixed(1)}%`}</dd>
                </div>
              </dl>
            </article>
            <article>
              <h2>模型建议</h2>
              <dl>
                <div>
                  <dt>自有人数</dt>
                  <dd>{people(review.suggestedTotal)} 人</dd>
                </div>
                <div>
                  <dt>族群反推</dt>
                  <dd>{people(review.peerHeadcount)} 人</dd>
                </div>
                <div>
                  <dt>对应人工成本</dt>
                  <dd>{money(review.impliedLabor, 0)} 万元</dd>
                </div>
                <div>
                  <dt>对应成本占比</dt>
                  <dd>{review.impliedRatio == null ? '—' : `${(review.impliedRatio * 100).toFixed(1)}%`}</dd>
                </div>
              </dl>
            </article>
          </div>
          <div className="analysis">
            {review.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <div className="table-wrap">
            <table data-testid="line-table">
              <thead>
                <tr>
                  <th>条线</th>
                  <th>预算</th>
                  <th>底线</th>
                  <th>常模</th>
                  <th>建议</th>
                  <th>判断</th>
                </tr>
              </thead>
              <tbody>
                {review.lines.map((line) => (
                  <tr key={line.line} data-below={line.budget < line.floor ? 'yes' : 'no'}>
                    <td>{line.line}</td>
                    <td>{line.budget}</td>
                    <td>{line.floor}</td>
                    <td>{line.norm}</td>
                    <td>{line.suggested}</td>
                    <td>{line.note}</td>
                  </tr>
                ))}
                <tr>
                  <td>合计</td>
                  <td>{review.ownHeadcount}</td>
                  <td>{review.floorTotal}</td>
                  <td>{review.normTotal}</td>
                  <td>{review.suggestedTotal}</td>
                  <td>外包 {plaza.outsource2027} / 底线 {plaza.floorOutsource}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="sources">
            口径按你的说明：全口径收入和 NOI 是不变量，人数是可变量。人效 = 全口径收入 / 自有人数，人工成本占比 = 人工成本 / 全口径收入，元效 = 全口径收入 / 人工成本。人均成本不单独给出时，沿用 2026 年实际人均。族群人效、G1–G5 常模、经营底线都要换成你们自己的数，页面上的默认值只为把示例广场算通。公开参考：中国百货商业协会 T/CCAGM 004—2021 的人均营业收入和人工费用率；国信证券 2022《购物中心单体项目盈利模型》对万达商管员工成本结构的拆解；平安证券 2024 转引《中国购物中心对经济社会发展贡献力报告（2021）》里 10 万㎡商场的运营和物业岗位量级。G1–G5 没有公开的统一国家标准。
          </p>
        </section>

        <form
          className="inputs"
          onSubmit={(event) => {
            event.preventDefault()
          }}
        >
          <div className="form-head">
            <h2>广场输入</h2>
            <button type="button" onClick={() => setPlaza(clonePlaza(samplePlaza))}>
              恢复示例
            </button>
          </div>
          <p className="hint">示例·城南广场不是真实项目。换上一个广场的 27 年预算后，上面的结论会跟着变。</p>
          <label className="field">
            <span>广场名称</span>
            <input value={plaza.name} onChange={(event) => patch({ name: event.target.value })} />
          </label>
          <div className="split">
            <label className="field">
              <span>等级</span>
              <select value={plaza.grade} onChange={(event) => patch({ grade: event.target.value as PlazaInput['grade'] })}>
                {(['G1', 'G2', 'G3', 'G4', 'G5'] as const).map((grade) => (
                  <option key={grade}>{grade}</option>
                ))}
              </select>
            </label>
            <label className="check">
              <input type="checkbox" checked={plaza.lowYield} onChange={(event) => patch({ lowYield: event.target.checked })} />
              低收益广场
            </label>
          </div>
          <label className="field">
            <span>族群名称</span>
            <input value={plaza.clusterName} onChange={(event) => patch({ clusterName: event.target.value })} />
          </label>
          <div className="split">
            <Field label="商业面积（万㎡）" value={plaza.areaWan} step="0.1" onChange={(areaWan) => patch({ areaWan })} />
            <Field label="楼层数" value={plaza.floors} onChange={(floors) => patch({ floors })} />
            <Field label="商户数" value={plaza.tenants} onChange={(tenants) => patch({ tenants })} />
          </div>
          <h3>收入，不变量</h3>
          <div className="split">
            <Field label="2027 全口径收入（万元）" value={plaza.revenue2027} onChange={(revenue2027) => patch({ revenue2027 })} />
            <Field label="2027 NOI（万元）" value={plaza.noi2027} onChange={(noi2027) => patch({ noi2027 })} />
            <Field label="2026 全口径收入（万元）" value={plaza.revenue2026} onChange={(revenue2026) => patch({ revenue2026 })} />
            <Field label="2025 全口径收入（万元）" value={plaza.revenue2025} onChange={(revenue2025) => patch({ revenue2025 })} />
          </div>
          <h3>2027 预算人数</h3>
          <LineEditor title="自有编制" lines={plaza.lines2027} onChange={(line, value) => patchLines('lines2027', line, value)} />
          <div className="split">
            <Field label="2027 外包人数" value={plaza.outsource2027} onChange={(outsource2027) => patch({ outsource2027 })} />
            <Field label="2027 人工成本（万元）" value={plaza.labor2027} onChange={(labor2027) => patch({ labor2027 })} />
          </div>
          <h3>25、26 年实际</h3>
          <div className="split">
            <Field label="2026 自有人数" value={plaza.headcount2026} onChange={(headcount2026) => patch({ headcount2026 })} />
            <Field label="2026 人工成本（万元）" value={plaza.labor2026} onChange={(labor2026) => patch({ labor2026 })} />
            <Field label="2025 自有人数" value={plaza.headcount2025} onChange={(headcount2025) => patch({ headcount2025 })} />
            <Field label="2025 人工成本（万元）" value={plaza.labor2025} onChange={(labor2025) => patch({ labor2025 })} />
          </div>
          <h3>族群人效（万元/人）</h3>
          <div className="split">
            <Field label="P25，人效较低" value={plaza.peerP25} onChange={(peerP25) => patch({ peerP25 })} />
            <Field label="中位数" value={plaza.peerP50} onChange={(peerP50) => patch({ peerP50 })} />
            <Field label="P75，人效较高" value={plaza.peerP75} onChange={(peerP75) => patch({ peerP75 })} />
          </div>
          <LineEditor title="该等级常模" lines={plaza.norm} onChange={(line, value) => patchLines('norm', line, value)} />
          <div className="form-head">
            <h3>经营底线</h3>
            <button type="button" onClick={refillFloor}>
              按面积和商户重算
            </button>
          </div>
          <LineEditor title="自有底线" lines={plaza.floorLines} onChange={(line, value) => patchLines('floorLines', line, value)} />
          <Field label="外包底线" value={plaza.floorOutsource} onChange={(floorOutsource) => patch({ floorOutsource })} />
        </form>
      </main>
    </div>
  )
}
