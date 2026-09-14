'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Icons } from '@/components/shared/icons'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export interface CreatedTeacherCredentials {
  name: string
  password: string
  /** Set when the account was created but the classroom assignment failed. */
  classroomAssignmentFailed: boolean
}

interface TempPasswordPanelProps {
  credentials: CreatedTeacherCredentials | null
  onDismiss: () => void
}

/**
 * The temporary password is shown exactly once — the API stores only its hash,
 * and there is no reset-by-email path yet. It used to appear in a toast, which
 * a stray click or a page change destroyed for good; a dialog that must be
 * acknowledged, with the password selectable and copyable, does not.
 */
export function TempPasswordPanel({ credentials, onDismiss }: TempPasswordPanelProps) {
  const [copied, setCopied] = useState(false)

  const copy = async (password: string) => {
    try {
      await navigator.clipboard.writeText(password)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      toast.error('Copying is blocked in this browser. Select the password and copy it manually.')
    }
  }

  return (
    <AlertDialog open={credentials !== null}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{credentials?.name} can now sign in</AlertDialogTitle>
          <AlertDialogDescription>
            Give them this temporary password. It is shown only this once, and they will be
            asked to replace it the first time they sign in.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex items-center gap-2 rounded-lg border border-dashed bg-muted/50 px-4 py-3">
          <code className="flex-1 font-mono text-lg font-semibold tracking-[0.12em] select-all">
            {credentials?.password}
          </code>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => credentials && void copy(credentials.password)}
          >
            {copied ? <Icons.check /> : <Icons.copy />}
            {copied ? 'Copied' : 'Copy'}
          </Button>
        </div>

        {credentials?.classroomAssignmentFailed && (
          <p className="text-[13px] text-absent">
            The account was created, but assigning it to a classroom failed. Set the teacher on
            the classroom once you have noted this password down.
          </p>
        )}

        <AlertDialogFooter>
          <AlertDialogAction onClick={onDismiss}>I&apos;ve saved it</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
