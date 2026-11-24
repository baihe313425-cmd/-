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
          <p>先看模型，再套一个广场的 27 年预算。</p>
        </div>
      </header>
      <section className="model" id="model" data-testid="model">
        <h2>模型</h2>
        <p className="model-lead">审的是一个广场的 27 年人工预算。收入不能拿来凑数，人数才是要定的量。</p>
        <div className="model-grid">
          <article>
            <h3>1. 锁定和可动</h3>
            <ul>
              <li>不变量：全口径收入 R，NOI。</li>
              <li>可变量：自有人数 N，按条线拆开；外包人数；人工成本 C。</li>
              <li>条线：招商、营运、推广、客服、物业工程、财务、人事行政。</li>
            </ul>
          </article>
          <article>
            <h3>2. 四个数怎么互推</h3>
            <ul>
              <li>人效 = R / N，所以 N = R / 人效。</li>
              <li>人工成本占比 = C / R。</li>
              <li>元效 = R / C。</li>
              <li>人均成本 = C / N。只定人数或人效，还得不出元效。人均成本没有单列时，用 2026 年实际的 C / N。</li>
            </ul>
          </article>
          <article>
            <h3>3. 三条标尺</h3>
            <ul>
              <li>族群人效，定总人数。建议人数 = R / 族群人效中位数。人效 P75 对应人数下沿，人效 P25 对应人数上沿。</li>
              <li>G1–G5 常模，定各条线结构。它是终极目标，不是今年必须一步砍到的数。</li>
              <li>经营底线，是硬下限。某一条线、自有合计或外包低于底线，就是压降过度。低收益广场也守这条，收入低不等于可以把人减到开不了业。</li>
            </ul>
          </article>
          <article>
            <h3>4. 建议值怎么落</h3>
            <ul>
              <li>建议总人数 = max(经营底线合计, R / 族群人效中位数)。</li>
              <li>再按该等级常模的比例分到各条线，每一条不低于自己的底线。</li>
              <li>建议人工成本 = 建议人数 × 2026 年人均成本。占比和元效跟着这组人数和成本出来。</li>
            </ul>
          </article>
        </div>
        <h3>5. 结论按这个顺序下</h3>
        <ol className="rules">
          <li>没有 2027 全口径收入，或没有族群人效中位数：信息不足。</li>
          <li>任一条线、自有合计或外包低于底线：压降过度，支撑不了 27 年经营。</li>
          <li>人数高于族群区间上沿：人数偏高。</li>
          <li>人数在族群区间内，但条线偏离常模：总数可留，结构要调整。</li>
          <li>人数低于族群下沿，但仍不低于底线：偏紧，不要再压。</li>
          <li>其余：落在合理区间。</li>
        </ol>
        <p className="sources">
          25 年、26 年的实际人数、收入和人工成本用来对照。收入没有大幅下跌时，人数不应腰斩。族群人效、常模和底线都用你们自己的数。公开口径只用来对齐定义：中国百货商业协会 T/CCAGM 004—2021 的人均营业收入和人工费用率。G1–G5 没有公开的统一国家标准。
        </p>
      </section>
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
          <p className="hint">示例·城南广场不是真实项目。模型在上面。换上一个广场的 27 年预算后，左边的结论会跟着变。</p>
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
