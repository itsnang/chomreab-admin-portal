'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { avatarColor, initials } from '@/lib/avatar'
import type { AttendanceStatus, RosterEntry } from '../types'

const STATUS_LABEL: Record<AttendanceStatus, string> = {
  present: 'Present',
  absent: 'Absent',
  late: 'Late',
}

interface RosterRowProps {
  entry: RosterEntry
  pending: boolean
  onMark: (status: AttendanceStatus, note?: string) => void
}

export function RosterRow({ entry, pending, onMark }: RosterRowProps) {
  const [noteOpen, setNoteOpen] = useState(false)
  const [noteDraft, setNoteDraft] = useState(entry.note ?? '')

  const hasNote = !!entry.note
  const canNote = entry.status !== null

  return (
    <div className="border-b last:border-b-0 px-5 py-3" style={{ borderColor: 'var(--hn-line-2)' }}>
      <div className="flex items-center gap-3 flex-wrap">
        <div
          className="w-[34px] h-[34px] rounded-full flex-none flex items-center justify-center text-[13px] font-bold text-white"
          style={{ background: avatarColor(entry.studentId) }}
        >
          {initials(entry.studentName)}
        </div>
        <div className="flex-1 min-w-[150px]">
          <div className="text-[15px] font-bold truncate">{entry.studentName}</div>
        </div>
        <div className="flex gap-1.5 min-w-[180px]">
          {(['present', 'late', 'absent'] as const).map((status) => {
            const active = entry.status === status
            return (
              <button
                key={status}
                type="button"
                disabled={pending}
                onClick={() => onMark(status, entry.note ?? undefined)}
                className="flex-1 text-[13px] font-bold rounded-[9px] py-2 border disabled:opacity-60"
                style={
                  active
                    ? { background: 'var(--hn-clay)', color: '#fff', borderColor: 'var(--hn-clay)' }
                    : { background: 'var(--hn-surface)', color: 'var(--hn-sub)', borderColor: 'var(--hn-line)' }
                }
              >
                {STATUS_LABEL[status]}
              </button>
            )
          })}
        </div>
        <div className="flex-none">
          <Button variant="outline" size="sm" disabled={!canNote} onClick={() => setNoteOpen((v) => !v)}>
            {hasNote ? 'Edit note' : 'Note'}
          </Button>
        </div>
      </div>
      {noteOpen && (
        <div className="flex gap-2 mt-2.5 pl-[46px]">
          <input
            value={noteDraft}
            onChange={(e) => setNoteDraft(e.target.value)}
            placeholder="e.g. picked up early by uncle"
            className="flex-1 text-[13px] rounded-[9px] px-3 py-2 border"
            style={{ borderColor: 'var(--hn-line)', background: 'var(--hn-surface-2)' }}
          />
          <Button
            size="sm"
            disabled={pending || !entry.status}
            onClick={() => {
              if (entry.status) onMark(entry.status, noteDraft)
              setNoteOpen(false)
            }}
          >
            Done
          </Button>
        </div>
      )}
      {!noteOpen && hasNote && (
        <div className="mt-2 pl-[46px] text-xs italic" style={{ color: 'var(--hn-sub)' }}>
          &ldquo;{entry.note}&rdquo;
        </div>
      )}
    </div>
  )
}
