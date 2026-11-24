import type { CallRecord } from '../data'
import { formatInt, formatLatency } from '../format'

interface CallTableProps {
  rows: CallRecord[]
}

export function CallTable({ rows }: CallTableProps) {
  return (
    <div className="table-wrap">
      <table className="call-table" data-testid="call-table">
        <thead>
          <tr>
            <th>时间</th>
            <th>模型</th>
            <th>业务线</th>
            <th className="num">输入Token</th>
            <th className="num">输出Token</th>
            <th className="num">耗时</th>
            <th className="status-col">状态</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td className="empty" colSpan={7}>
                暂无数据
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={`${row.time}-${row.model}-${row.biz}`} data-testid="call-row">
                <td>{row.time}</td>
                <td>{row.model}</td>
                <td>{row.biz}</td>
                <td className="num">{formatInt(row.inputTokens)}</td>
                <td className="num">{formatInt(row.outputTokens)}</td>
                <td className="num">{formatLatency(row.latencyMs)}</td>
                <td className="status-col">
                  <span className={row.status === '成功' ? 'tag tag-ok' : 'tag tag-fail'}>{row.status}</span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
