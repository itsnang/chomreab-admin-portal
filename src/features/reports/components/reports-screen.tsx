'use client'

import { PageShell } from '@/components/shared/page-shell'
import { QueryState } from '@/components/shared/query-state'
import { StatusChip } from '@/components/shared/status-chip'
import { Button } from '@/components/ui/button'
import { useReportsSummary } from '../hooks/use-reports'
import type { StudentReportRow } from '../types'

function escapeCsvField(field: string | number | boolean): string {
  const str = String(field)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function exportCsv(rows: StudentReportRow[]) {
  const header = 'Student,Class,Present,Late,Absent,Attendance %,Chronic\n'
  const body = rows
    .map((r) => [r.studentName, r.classroomName, r.present, r.late, r.absent, r.ratePct, r.chronic ? 'Yes' : 'No'].map(escapeCsvField).join(','))
    .join('\n')
  const blob = new Blob([header + body], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'attendance-report.csv'
  a.click()
  URL.revokeObjectURL(url)
}

export function ReportsScreen() {
  const query = useReportsSummary()

  return (
    <PageShell heading="Reports" description="Attendance over the last 20 days.">
      {query.isPending || query.isError ? (
        <QueryState isPending={query.isPending} message="Couldn't load reports." onRetry={() => query.refetch()} />
      ) : (
        <>
          <div className="flex gap-3">
            <div className="rounded-xl px-5 py-4 min-w-[180px]" style={{ background: 'var(--hn-surface)', border: '1px solid var(--hn-line)' }}>
              <div className="font-mono text-[28px] font-semibold" style={{ color: 'var(--hn-success)' }}>
                {query.data.overallRatePct}%
              </div>
              <div className="text-xs mt-1" style={{ color: 'var(--hn-sub)' }}>
                Attendance rate, last 20 days
              </div>
            </div>
            <div className="rounded-xl px-5 py-4 min-w-[180px]" style={{ background: 'var(--hn-surface)', border: '1px solid var(--hn-line)' }}>
              <div
                className="font-mono text-[28px] font-semibold"
                style={{ color: query.data.chronicCount > 0 ? 'var(--hn-danger)' : 'var(--hn-success)' }}
              >
                {query.data.chronicCount}
              </div>
              <div className="text-xs mt-1" style={{ color: 'var(--hn-sub)' }}>
                Chronic absentees (3+ in window)
              </div>
            </div>
          </div>

          <div className="rounded-xl p-5" style={{ background: 'var(--hn-surface)', border: '1px solid var(--hn-line)' }}>
            <div className="text-base font-extrabold mb-3.5">Today&apos;s summary by class</div>
            {query.data.dailySummary.map((d, i) => (
              <div key={d.classroomId} className="flex items-center gap-4 py-2.5" style={i > 0 ? { borderTop: '1px solid var(--hn-line-2)' } : undefined}>
                <div className="flex-1 text-sm font-bold">{d.classroomName}</div>
                <div className="font-mono text-[13px] w-[60px]" style={{ color: 'var(--hn-success)' }}>
                  {d.present} P
                </div>
                <div className="font-mono text-[13px] w-[60px]" style={{ color: 'var(--hn-neutral)' }}>
                  {d.late} L
                </div>
                <div className="font-mono text-[13px] w-[60px]" style={{ color: 'var(--hn-danger)' }}>
                  {d.absent} A
                </div>
                <div className="font-mono text-[13px] w-[90px]" style={{ color: 'var(--hn-sub)' }}>
                  {d.unmarked} unmarked
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-xl overflow-hidden" style={{ background: 'var(--hn-surface)', border: '1px solid var(--hn-line)' }}>
            <div className="flex items-center gap-4 px-5 py-4" style={{ borderBottom: '1px solid var(--hn-line)' }}>
              <div className="flex-1 text-lg font-extrabold">Per-student attendance</div>
              <Button variant="outline" size="sm" onClick={() => exportCsv(query.data.studentRows)}>
                Export CSV
              </Button>
            </div>
            {query.data.studentRows.map((r, i) => (
              <div key={r.studentId} className="flex items-center gap-3 px-5 py-3" style={i > 0 ? { borderTop: '1px solid var(--hn-line-2)' } : undefined}>
                <span className="flex-1 text-sm font-bold truncate">{r.studentName}</span>
                <span className="text-xs w-[110px]" style={{ color: 'var(--hn-sub)' }}>
                  {r.classroomName}
                </span>
                <span className="font-mono text-[13px] w-[70px]">{r.present}</span>
                <span className="font-mono text-[13px] w-[60px]">{r.late}</span>
                <span className="font-mono text-[13px] w-[70px]">{r.absent}</span>
                <span className="font-mono text-[13px] w-[50px]">{r.ratePct}%</span>
                <span className="w-[90px] flex justify-end">{r.chronic && <StatusChip status="absent" label="Chronic" bare />}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </PageShell>
  )
}
