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
import { useSchoolSettings } from '../hooks/use-settings'
import { updateSchoolSettings } from '../actions'
import { settingsSchema, type SettingsInput } from '../schemas'

const FIELD_CLASS = 'h-11 rounded-lg bg-background px-3.5'
const CARD_CLASS = 'rounded-xl border bg-card p-4 shadow-card-sm'

export function SettingsScreen() {
  const query = useSchoolSettings()
  const queryClient = useQueryClient()
  const [showToken, setShowToken] = useState(false)

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

  const onSubmit = async (values: SettingsInput) => {
    const result = await updateSchoolSettings(values)
    if (result.error) {
      toast.error(result.error)
      return
    }
    toast.success('Settings saved')
    await queryClient.invalidateQueries({ queryKey: ['school-settings'] })
    form.reset({ ...values, telegramBotToken: '' })
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
                    Leave blank to keep the current token.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <SaveButton pending={isSubmitting} dirty={isDirty} label="Save settings" />
        </form>
      </Form>
    </PageShell>
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
