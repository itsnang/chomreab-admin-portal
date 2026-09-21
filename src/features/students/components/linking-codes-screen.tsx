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
// Cross-slice import: the invite links below are built from the bot's
// username, which `settings` owns. Documented in CLAUDE.md's exceptions.
import { useSchoolSettings } from '@/features/settings/hooks/use-settings'
import { useStudents, useLinkingStatus } from '../hooks/use-students'
import { generateLinkingCode } from '../actions'

type CopyKind = 'code' | 'private' | 'group'

export function LinkingCodesScreen() {
  const classroomsQuery = useClassrooms()
  const studentsQuery = useStudents()
  const linkingQuery = useLinkingStatus()
  const settingsQuery = useSchoolSettings()
  const queryClient = useQueryClient()
  const [unlinkedOnly, setUnlinkedOnly] = useState(false)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const botUsername = settingsQuery.data?.botUsername ?? null

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

  const isCopied = (studentId: string, kind: CopyKind) => copiedKey === `${studentId}:${kind}`

  const onCopy = async (studentId: string, kind: CopyKind, text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      // Clipboard access can be denied by the browser. The code itself stays
      // visible on the card for the admin to copy by hand; a link has no such
      // fallback, but this is rare enough not to build one for.
    }
    const key = `${studentId}:${kind}`
    setCopiedKey(key)
    setTimeout(() => setCopiedKey((k) => (k === key ? null : k)), 1800)
  }

  const isPending = studentsQuery.isPending || linkingQuery.isPending
  const isError = studentsQuery.isError || linkingQuery.isError

  const cards = (studentsQuery.data ?? [])
    .map((s) => ({ student: s, linking: linkingByStudent.get(s.id) }))
    .filter(({ linking }) => (unlinkedOnly ? !linking?.linked : true))

  return (
    <PageShell
      heading="Parent linking codes"
      description="Give a parent their child's code. They can tap an invite link below, or message the school's Telegram bot with /link CODE by hand."
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
          {cards.map(({ student, linking }) => {
            const code = linking?.activeCode ?? null
            // Both links carry the same code — only the entry point differs:
            // ?start= opens a private chat with the code pre-filled, ?startgroup=
            // prompts the parent to pick a group to add the bot to.
            const privateLink = code && botUsername ? `https://t.me/${botUsername}?start=${code}` : null
            const groupLink = code && botUsername ? `https://t.me/${botUsername}?startgroup=${code}` : null

            return (
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
                {code ? (
                  <div className="rounded-lg border border-dashed bg-muted/50 py-3 text-center font-mono text-[22px] font-semibold tracking-[0.12em]">
                    {code}
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground">
                    {linking?.linked
                      ? 'Already linked — generate a new code to re-link elsewhere.'
                      : 'No active code.'}
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  {/* The tap-once path is the default; typing /link CODE by
                      hand and a bare code copy stay available below it. */}
                  {privateLink && (
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => onCopy(student.id, 'private', privateLink)}
                    >
                      <Icons.link2 />
                      {isCopied(student.id, 'private') ? 'Copied' : 'Copy invite link'}
                    </Button>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {groupLink && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => onCopy(student.id, 'group', groupLink)}
                      >
                        <Icons.users />
                        {isCopied(student.id, 'group') ? 'Copied' : 'Add to group'}
                      </Button>
                    )}
                    {code && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => onCopy(student.id, 'code', code)}
                      >
                        {isCopied(student.id, 'code') ? 'Copied' : 'Copy code'}
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={() => onRegenerate(student.id)}>
                      New code
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </PageShell>
  )
}
