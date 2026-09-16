'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { PageShell } from '@/components/shared/page-shell'
import { QueryState } from '@/components/shared/query-state'
import { StatusChip } from '@/components/shared/status-chip'
import { SectionHeader } from '@/components/shared/section-header'
import { Icons } from '@/components/shared/icons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { cn } from '@/lib/utils'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useSchoolSettings } from '../hooks/use-settings'
import {
  getLinkedParentCount,
  getTelegramStatus,
  registerTelegramWebhook,
  updateSchoolSettings,
} from '../actions'
import type { TelegramStatus } from '../types'
import { settingsSchema, type SettingsInput } from '../schemas'

const FIELD_CLASS = 'h-11 rounded-lg bg-background px-3.5'
const CARD_CLASS = 'rounded-xl border bg-card p-4 shadow-card-sm'

export function SettingsScreen() {
  const query = useSchoolSettings()
  const queryClient = useQueryClient()
  const [showToken, setShowToken] = useState(false)
  const [status, setStatus] = useState<TelegramStatus | null>(null)
  const [statusError, setStatusError] = useState<string | null>(null)
  const [busy, setBusy] = useState<'checking' | 'registering' | null>(null)
  // Holds the submission a token change interrupted, so confirming can
  // resume it with exactly the values the admin saw.
  const [pendingSave, setPendingSave] = useState<{
    values: SettingsInput
    linkedCount: number
  } | null>(null)

  const form = useForm<SettingsInput>({
    resolver: zodResolver(settingsSchema),
    defaultValues: { schoolName: '', lateCutoffMinutes: 15, absenceMessageTemplate: '', telegramBotToken: '' },
  })
  const {
    formState: { isDirty, isSubmitting },
  } = form

  useEffect(() => {
    if (query.data) {
      form.reset({
        schoolName: query.data.schoolName,
        lateCutoffMinutes: query.data.lateCutoffMinutes,
        absenceMessageTemplate: query.data.absenceMessageTemplate,
        telegramBotToken: '',
      })
    }
  }, [query.data, form])

  const save = async (values: SettingsInput) => {
    const result = await updateSchoolSettings(values)
    if (result.error) {
      toast.error(result.error)
      return
    }
    toast.success('Settings saved')
    await queryClient.invalidateQueries({ queryKey: ['school-settings'] })
    form.reset({ ...values, telegramBotToken: '' })
    // The bot may have changed, so anything we knew about the old one's
    // webhook is now about a different bot.
    setStatus(null)
    setStatusError(null)
  }

  const onSubmit = async (values: SettingsInput) => {
    // Replacing a working token detaches every parent: a bot cannot message
    // someone who has never messaged it, so the first notification to each
    // parent is rejected and the link is dropped. Say so before it happens.
    const replacingToken = !!values.telegramBotToken?.trim() && query.data?.telegramBotTokenSet
    if (replacingToken) {
      const linkedCount = await getLinkedParentCount()
      if (linkedCount > 0) {
        setPendingSave({ values, linkedCount })
        return
      }
    }
    await save(values)
  }

  const onCheckConnection = async () => {
    setBusy('checking')
    const result = await getTelegramStatus()
    setBusy(null)
    if ('error' in result) {
      setStatus(null)
      setStatusError(result.error)
      return
    }
    setStatusError(null)
    setStatus(result)
  }

  const onRegister = async () => {
    setBusy('registering')
    const result = await registerTelegramWebhook()
    if (result.error) {
      setBusy(null)
      toast.error(result.error)
      return
    }
    toast.success('Bot connected to Telegram')
    const refreshed = await getTelegramStatus()
    setBusy(null)
    if (!('error' in refreshed)) setStatus(refreshed)
  }

  if (query.isPending || query.isError) {
    return (
      <PageShell heading="Settings">
        <QueryState isPending={query.isPending} message="Couldn't load settings." onRetry={() => query.refetch()} />
      </PageShell>
    )
  }

  return (
    <PageShell heading="Settings" description="School details, notifications, and the Telegram bot.">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-3.5 max-w-[640px]">
          <div className={CARD_CLASS}>
            <SectionHeader icon={Icons.user} title="School" subtitle="Your school's name" />
            <FormField
              control={form.control}
              name="schoolName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>School name</FormLabel>
                  <FormControl>
                    <Input {...field} className={FIELD_CLASS} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className={CARD_CLASS}>
            <SectionHeader icon={Icons.clock} title="Notifications" subtitle="Late cutoff & absence messages" />
            <FormField
              control={form.control}
              name="lateCutoffMinutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Late cutoff (minutes after class start)</FormLabel>
                  <FormControl>
                    <Input type="number" className={`${FIELD_CLASS} w-[100px]`} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="absenceMessageTemplate"
              render={({ field }) => (
                <FormItem className="mt-3.5">
                  <FormLabel>Absence message template</FormLabel>
                  <FormControl>
                    <textarea
                      {...field}
                      rows={3}
                      className="w-full resize-none rounded-lg border bg-background px-3.5 py-3 text-sm"
                    />
                  </FormControl>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Use <code>{'{{student_name}}'}</code> to insert the student&apos;s name.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className={CARD_CLASS}>
            <SectionHeader
              icon={Icons.send}
              title="Telegram bot"
              subtitle="Sends attendance notifications to parents"
              right={
                <StatusChip
                  status={query.data.telegramBotTokenSet ? 'linked' : 'unlinked'}
                  label={query.data.telegramBotTokenSet ? 'Connected' : 'Not set'}
                />
              }
            />
            <FormField
              control={form.control}
              name="telegramBotToken"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bot token</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input
                        {...field}
                        type={showToken ? 'text' : 'password'}
                        placeholder={query.data.telegramBotTokenSet ? '••••••••••••' : 'Paste a new token'}
                        className={`${FIELD_CLASS} flex-1 font-mono`}
                      />
                    </FormControl>
                    <Button type="button" variant="outline" size="sm" onClick={() => setShowToken((v) => !v)}>
                      {showToken ? 'Hide' : 'Show'}
                    </Button>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Leave blank to keep the current token. Saving a token also connects it
                    to Telegram, so parents can link.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="mt-3.5 border-t pt-3.5">
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={busy !== null}
                  onClick={onCheckConnection}
                >
                  {busy === 'checking' ? <Icons.loader2 className="animate-spin" /> : <Icons.clipboardCheck />}
                  Test connection
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={busy !== null || !query.data.telegramBotTokenSet}
                  onClick={onRegister}
                >
                  {busy === 'registering' ? <Icons.loader2 className="animate-spin" /> : <Icons.link2 />}
                  Register webhook
                </Button>
              </div>
              <TelegramStatusPanel status={status} error={statusError} />
            </div>
          </div>

          <SaveButton pending={isSubmitting} dirty={isDirty} label="Save settings" />
        </form>
      </Form>

      <AlertDialog
        open={pendingSave !== null}
        onOpenChange={(open) => {
          if (!open) setPendingSave(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Replace the bot token?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingSave?.linkedCount === 1
                ? '1 parent is linked to the current bot.'
                : `${pendingSave?.linkedCount ?? 0} parents are linked to the current bot.`}{' '}
              A new bot cannot message anyone who has not messaged it first, so they will
              stop receiving attendance messages and will need a new linking code.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep the current bot</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const queued = pendingSave
                setPendingSave(null)
                if (queued) void save(queued.values)
              }}
            >
              Replace it
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageShell>
  )
}

const STATUS_COPY: Record<TelegramStatus['status'], { tone: string; title: string }> = {
  ok: { tone: 'text-present', title: 'Connected — Telegram is delivering here' },
  pointed_elsewhere: {
    tone: 'text-absent',
    title: 'Delivering somewhere else — parents cannot link here',
  },
  not_registered: { tone: 'text-absent', title: 'Not connected — parents cannot link' },
  no_token: { tone: 'text-muted-foreground', title: 'No bot token saved yet' },
  unreachable: { tone: 'text-late', title: "Couldn't check with Telegram" },
}

/** Reports what Telegram actually holds, not what we believe we registered.
 *  The two drift — a local tunnel reclaims the webhook, someone re-registers
 *  by hand — and that drift is invisible from every other screen. */
function TelegramStatusPanel({
  status,
  error,
}: {
  status: TelegramStatus | null
  error: string | null
}) {
  if (error) {
    return <p className="mt-2.5 text-xs text-absent">{error}</p>
  }
  if (!status) {
    return (
      <p className="mt-2.5 text-xs text-muted-foreground">
        Checks with Telegram directly — not run automatically.
      </p>
    )
  }

  const copy = STATUS_COPY[status.status]
  return (
    <div className="mt-2.5 flex flex-col gap-1 text-xs">
      <span className={cn('font-bold', copy.tone)}>{copy.title}</span>
      {status.detail && <span className="text-muted-foreground">{status.detail}</span>}
      {status.status === 'pointed_elsewhere' && (
        <div className="mt-1 flex flex-col gap-0.5 font-mono text-[11px] text-muted-foreground">
          <span className="truncate">expected {status.expectedUrl ?? '(none)'}</span>
          <span className="truncate">actual&nbsp;&nbsp; {status.actualUrl ?? '(none)'}</span>
        </div>
      )}
    </div>
  )
}

/** Reads as a status as much as a control: clay while there is something to
 *  save, a quiet "Saved" outline once the form is clean again. */
function SaveButton({ pending, dirty, label }: { pending: boolean; dirty: boolean; label: string }) {
  const active = dirty || pending
  return (
    <button
      type="submit"
      disabled={pending || !dirty}
      className={cn(
        'mt-1 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border text-sm font-bold transition-colors disabled:cursor-default',
        active
          ? 'border-transparent bg-primary text-primary-foreground'
          : 'border-border bg-transparent text-present',
        pending && 'opacity-75'
      )}
    >
      {pending ? <Icons.loader2 size={17} className="animate-spin" /> : <Icons.check size={17} />}
      {pending ? 'Saving…' : dirty ? label : 'Saved'}
    </button>
  )
}
