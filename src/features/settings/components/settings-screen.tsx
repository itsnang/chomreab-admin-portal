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
import { useSchoolSettings } from '../hooks/use-settings'
import { updateSchoolSettings } from '../actions'
import { settingsSchema, type SettingsInput } from '../schemas'

const FIELD_CLASS = 'rounded-xl h-11 px-3.5'
const FIELD_STYLE = { background: 'var(--hn-paper)', borderColor: 'var(--hn-line)' } as const
const CARD_CLASS = 'rounded-[18px] p-[15px]'
const CARD_STYLE = { background: 'var(--hn-surface)', border: '1px solid var(--hn-line)' } as const

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
          <div className={CARD_CLASS} style={CARD_STYLE}>
            <SectionHeader icon={Icons.user} title="School" subtitle="Your school's name" />
            <FormField
              control={form.control}
              name="schoolName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>School name</FormLabel>
                  <FormControl>
                    <Input {...field} className={FIELD_CLASS} style={FIELD_STYLE} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className={CARD_CLASS} style={CARD_STYLE}>
            <SectionHeader icon={Icons.clock} title="Notifications" subtitle="Late cutoff & absence messages" />
            <FormField
              control={form.control}
              name="lateCutoffMinutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Late cutoff (minutes after class start)</FormLabel>
                  <FormControl>
                    <Input type="number" className={`${FIELD_CLASS} w-[100px]`} style={FIELD_STYLE} {...field} />
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
                      className="w-full rounded-xl border px-3.5 py-3 text-sm resize-none"
                      style={FIELD_STYLE}
                    />
                  </FormControl>
                  <p className="text-xs mt-1" style={{ color: 'var(--hn-sub)' }}>
                    Use <code>{'{{student_name}}'}</code> to insert the student&apos;s name.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className={CARD_CLASS} style={CARD_STYLE}>
            <SectionHeader
              icon={Icons.phone}
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
                        style={FIELD_STYLE}
                      />
                    </FormControl>
                    <Button type="button" variant="outline" size="sm" onClick={() => setShowToken((v) => !v)}>
                      {showToken ? 'Hide' : 'Show'}
                    </Button>
                  </div>
                  <p className="text-xs mt-1" style={{ color: 'var(--hn-sub)' }}>
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

function SaveButton({ pending, dirty, label }: { pending: boolean; dirty: boolean; label: string }) {
  const active = dirty || pending
  return (
    <button
      type="submit"
      disabled={pending || !dirty}
      className="w-full h-11 mt-1 rounded-[13px] text-[14px] font-bold inline-flex items-center justify-center gap-2 border transition-[background-color,border-color,color] disabled:cursor-default"
      style={
        active
          ? { background: 'var(--hn-clay)', borderColor: 'transparent', color: '#fff', opacity: pending ? 0.75 : 1 }
          : { background: 'transparent', borderColor: 'var(--hn-line)', color: 'var(--hn-success)' }
      }
    >
      {pending ? <Icons.loader2 size={17} className="animate-spin" /> : <Icons.check size={17} />}
      {pending ? 'Saving…' : dirty ? label : 'Saved'}
    </button>
  )
}
