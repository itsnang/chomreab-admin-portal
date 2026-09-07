'use client'

import { PageShell } from '@/components/shared/page-shell'
import { QueryState } from '@/components/shared/query-state'
import { StatusChip } from '@/components/shared/status-chip'
import { StatTile } from '@/components/shared/stat-tile'
import { Icons } from '@/components/shared/icons'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useReportsSummary } from '../hooks/use-reports'
import type { StudentReportRow } from '../types'

function escapeCsvField(field: string | number | boolean): string {
  let str = String(field)
  if (/^[=+\-@]/.test(str)) {
    str = `'${str}`
  }
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
  const blob = new Blob(['﻿' + header + body], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'attendance-report.csv'
  document.body.appendChild(a)
  a.click()
  setTimeout(() => {
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, 0)
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
            <div className="min-w-[180px] rounded-xl border bg-card shadow-card-sm px-5 py-4">
              <StatTile
                icon={Icons.check}
                tone="present"
                value={`${query.data.overallRatePct}%`}
                label="Attendance rate, last 20 days"
              />
            </div>
            <div className="min-w-[180px] rounded-xl border bg-card shadow-card-sm px-5 py-4">
              <StatTile
                icon={Icons.user}
                tone={query.data.chronicCount > 0 ? 'absent' : 'present'}
                value={query.data.chronicCount}
                label="Chronic absentees (3+ in window)"
              />
            </div>
          </div>

          <div className="rounded-xl border bg-card shadow-card-sm p-4">
            <div className="text-base font-extrabold mb-3.5">Today&apos;s summary by class</div>
            {query.data.dailySummary.length === 0 ? (
              <p className="text-sm text-muted-foreground">No classes yet.</p>
            ) : (
              query.data.dailySummary.map((d, i) => (
                <div
                  key={d.classroomId}
                  className={cn('flex items-center gap-4 py-2.5', i > 0 && 'border-t')}
                >
                  <div className="flex-1 text-sm font-bold">{d.classroomName}</div>
                  <div className="w-[60px] font-mono text-[13px] text-present">{d.present} P</div>
                  <div className="w-[60px] font-mono text-[13px] text-late">{d.late} L</div>
                  <div className="w-[60px] font-mono text-[13px] text-absent">{d.absent} A</div>
                  <div className="w-[90px] font-mono text-[13px] text-muted-foreground">
                    {d.unmarked} unmarked
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="overflow-hidden rounded-xl border bg-card shadow-card-sm">
            <div className="flex items-center gap-4 border-b px-5 py-4">
              <div className="flex-1 text-lg font-extrabold">Per-student attendance</div>
              <Button variant="outline" size="sm" onClick={() => exportCsv(query.data.studentRows)}>
                Export CSV
              </Button>
            </div>
            {query.data.studentRows.length === 0 ? (
              <p className="p-5 text-sm text-muted-foreground">No students yet.</p>
            ) : (
              query.data.studentRows.map((r, i) => (
                <div
                  key={r.studentId}
                  className={cn('flex items-center gap-3 px-5 py-3', i > 0 && 'border-t')}
                >
                  <span className="flex-1 truncate text-sm font-bold">{r.studentName}</span>
                  <span className="w-[110px] text-xs text-muted-foreground">{r.classroomName}</span>
                  <span className="font-mono text-[13px] w-[70px]">{r.present}</span>
                  <span className="font-mono text-[13px] w-[60px]">{r.late}</span>
                  <span className="font-mono text-[13px] w-[70px]">{r.absent}</span>
                  <span className="font-mono text-[13px] w-[50px]">{r.ratePct}%</span>
                  <span className="w-[90px] flex justify-end">{r.chronic && <StatusChip status="absent" label="Chronic" bare />}</span>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </PageShell>
  )
}
