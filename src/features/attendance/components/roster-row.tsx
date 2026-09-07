'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { SegmentedControl, type Segment } from '@/components/shared/segmented-control'
import { InitialAvatar } from '@/components/shared/initial-avatar'
import { cn } from '@/lib/utils'
import type { AttendanceStatus, RosterEntry, StagedMark } from '../types'

const SEGMENTS: Segment<AttendanceStatus>[] = [
  { value: 'present', label: 'Present', tone: 'present' },
  { value: 'late', label: 'Late', tone: 'late' },
  { value: 'absent', label: 'Absent', tone: 'absent' },
]

interface RosterRowProps {
  entry: RosterEntry
  /** The teacher's unsaved change for this student, if any. */
  staged: StagedMark | undefined
  onStage: (status: AttendanceStatus, note: string | null) => void
  disabled: boolean
}

export function RosterRow({ entry, staged, onStage, disabled }: RosterRowProps) {
  const status = staged?.status ?? entry.status
  const note = staged ? staged.note : entry.note
  const [noteOpen, setNoteOpen] = useState(false)
  const [noteDraft, setNoteDraft] = useState(note ?? '')

  const dirty = staged !== undefined

  const commitNote = () => {
    setNoteOpen(false)
    if (!status) return
    const trimmed = noteDraft.trim()
    if ((note ?? '') === trimmed) return
    onStage(status, trimmed || null)
  }

  return (
    <div className={cn('border-b px-5 py-3 last:border-b-0', dirty && 'bg-primary/[0.04]')}>
      <div className="flex flex-wrap items-center gap-3">
        <InitialAvatar id={entry.studentId} name={entry.studentName} size="sm" />
        <div className="min-w-[150px] flex-1">
          <div className="truncate text-[15px] font-bold">{entry.studentName}</div>
          <div className="text-xs text-muted-foreground">
            {dirty ? 'Unsaved' : status ? 'Saved' : 'Not marked yet'}
          </div>
        </div>
        <SegmentedControl
          aria-label={`Attendance for ${entry.studentName}`}
          segments={SEGMENTS}
          value={status}
          onChange={(next) => onStage(next, note)}
          disabled={disabled}
          stretch
          className="min-w-[180px] flex-1"
        />
        <div className="flex-none">
          <Button
            variant="outline"
            size="sm"
            disabled={disabled || !status}
            title={status ? undefined : 'Mark the student before adding a note'}
            onClick={() => {
              setNoteDraft(note ?? '')
              setNoteOpen((v) => !v)
            }}
          >
            {note ? 'Edit note' : 'Note'}
          </Button>
        </div>
      </div>

      {noteOpen && (
        <div className="mt-2.5 flex gap-2 pl-[46px]">
          <input
            autoFocus
            value={noteDraft}
            onChange={(e) => setNoteDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitNote()
              if (e.key === 'Escape') setNoteOpen(false)
            }}
            placeholder="e.g. picked up early by uncle"
            aria-label={`Note for ${entry.studentName}`}
            className="flex-1 rounded-md border bg-background px-3 py-2 text-[13px]"
          />
          <Button size="sm" onClick={commitNote}>
            Done
          </Button>
        </div>
      )}

      {!noteOpen && note && (
        <div className="mt-2 pl-[46px] text-xs text-muted-foreground italic">
          &ldquo;{note}&rdquo;
        </div>
      )}
    </div>
  )
}
