'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { PageShell } from '@/components/shared/page-shell'
import { QueryState } from '@/components/shared/query-state'
import { StatusChip } from '@/components/shared/status-chip'
import { EmptyState } from '@/components/shared/empty-state'
import { Icons } from '@/components/shared/icons'
import { Button } from '@/components/ui/button'
import { useClassrooms } from '@/features/classrooms/hooks/use-classrooms'
import { useStudents, useLinkingStatus } from '../hooks/use-students'
import { generateLinkingCode } from '../actions'

export function LinkingCodesScreen() {
  const classroomsQuery = useClassrooms()
  const studentsQuery = useStudents()
  const linkingQuery = useLinkingStatus()
  const queryClient = useQueryClient()
  const [unlinkedOnly, setUnlinkedOnly] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const classroomName = (id: string) => classroomsQuery.data?.find((c) => c.id === id)?.name ?? id
  const linkingByStudent = new Map((linkingQuery.data ?? []).map((l) => [l.studentId, l]))

  const onRegenerate = async (studentId: string) => {
    const result = await generateLinkingCode(studentId)
    if (result.error) {
      toast.error(result.error)
      return
    }
    toast.success(`New code: ${result.code}`)
    await queryClient.invalidateQueries({ queryKey: ['linking-status'] })
  }

  const onCopy = async (studentId: string, code: string) => {
    try {
      await navigator.clipboard.writeText(code)
    } catch {
      // Clipboard access can be denied by the browser; the code is still
      // visible on screen for the admin to copy by hand.
    }
    setCopiedId(studentId)
    setTimeout(() => setCopiedId((id) => (id === studentId ? null : id)), 1800)
  }

  const isPending = studentsQuery.isPending || linkingQuery.isPending
  const isError = studentsQuery.isError || linkingQuery.isError

  const cards = (studentsQuery.data ?? [])
    .map((s) => ({ student: s, linking: linkingByStudent.get(s.id) }))
    .filter(({ linking }) => (unlinkedOnly ? !linking?.linked : true))

  return (
    <PageShell
      heading="Parent linking codes"
      description="Give a parent their child's code — they message the school's Telegram bot with /link CODE."
    >
      <div className="flex items-center gap-2">
        <Button variant={unlinkedOnly ? 'default' : 'outline'} size="sm" onClick={() => setUnlinkedOnly((v) => !v)}>
          Unlinked only
        </Button>
        <Button variant="outline" size="sm" onClick={() => window.print()}>
          Print sheet
        </Button>
      </div>

      {isPending || isError ? (
        <QueryState
          isPending={isPending}
          message="Couldn't load linking codes."
          onRetry={() => {
            studentsQuery.refetch()
            linkingQuery.refetch()
          }}
        />
      ) : cards.length === 0 ? (
        <div className="rounded-xl border bg-card shadow-card-sm">
          <EmptyState
            icon={<Icons.qrCode />}
            title={unlinkedOnly ? 'Every parent is linked' : 'No students to show'}
            description={
              unlinkedOnly
                ? 'Nobody is waiting for a code right now.'
                : 'Add students before generating linking codes.'
            }
          />
        </div>
      ) : (
        <div className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(260px,1fr))]">
          {cards.map(({ student, linking }) => (
            <div
              key={student.id}
              className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-card-sm"
            >
              <div className="flex items-start gap-2.5">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold truncate">{student.name}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {classroomName(student.classroomId)}
                  </div>
                </div>
                <StatusChip status={linking?.linked ? 'linked' : 'unlinked'} bare />
              </div>
              {linking?.activeCode ? (
                <div className="rounded-lg border border-dashed bg-muted/50 py-3 text-center font-mono text-[22px] font-semibold tracking-[0.12em]">
                  {linking.activeCode}
                </div>
              ) : (
                <div className="text-xs text-muted-foreground">
                  {linking?.linked
                    ? 'Already linked — generate a new code to re-link elsewhere.'
                    : 'No active code.'}
                </div>
              )}
              <div className="flex gap-2">
                {linking?.activeCode && (
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => onCopy(student.id, linking.activeCode!)}>
                    {copiedId === student.id ? 'Copied' : 'Copy code'}
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => onRegenerate(student.id)}>
                  New code
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  )
}
