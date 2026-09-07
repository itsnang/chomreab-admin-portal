'use client'

import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SaveBarProps {
  pendingCount: number
  isSaving: boolean
  onSave: () => void
}

/** Nothing reaches a parent until this is pressed — the reason marks are staged
 *  rather than written on every tap. */
export function SaveBar({ pendingCount, isSaving, onSave }: SaveBarProps) {
  const clean = pendingCount === 0
  return (
    <div className="flex flex-wrap items-center gap-4 border-t bg-muted/50 px-5 py-4">
      <p className="min-w-[200px] flex-1 text-[13px] text-muted-foreground">
        {clean
          ? 'All changes saved. Parents were notified on Telegram for every student marked; unlinked parents are skipped.'
          : `${pendingCount} unsaved change${pendingCount === 1 ? '' : 's'} · parents are notified when you save`}
      </p>
      <Button size="lg" disabled={clean || isSaving} onClick={onSave}>
        {isSaving && <Loader2 className="animate-spin" />}
        {clean ? 'Saved' : `Save ${pendingCount} change${pendingCount === 1 ? '' : 's'}`}
      </Button>
    </div>
  )
}
