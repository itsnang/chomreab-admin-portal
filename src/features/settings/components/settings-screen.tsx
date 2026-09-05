'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { PageShell } from '@/components/shared/page-shell'
import { QueryState } from '@/components/shared/query-state'
import { StatusChip } from '@/components/shared/status-chip'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useSchoolSettings } from '../hooks/use-settings'
import { updateSchoolSettings } from '../actions'
import { settingsSchema, type SettingsInput } from '../schemas'

export function SettingsScreen() {
  const query = useSchoolSettings()
  const queryClient = useQueryClient()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showToken, setShowToken] = useState(false)

  const form = useForm<SettingsInput>({
    resolver: zodResolver(settingsSchema),
    defaultValues: { schoolName: '', lateCutoffMinutes: 15, absenceMessageTemplate: '', telegramBotToken: '' },
  })

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
    setIsSubmitting(true)
    const result = await updateSchoolSettings(values)
    setIsSubmitting(false)
    if (result.error) {
      toast.error(result.error)
      return
    }
    toast.success('Settings saved')
    form.setValue('telegramBotToken', '')
    await queryClient.invalidateQueries({ queryKey: ['school-settings'] })
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
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 max-w-[640px]">
          <div className="rounded-xl p-5" style={{ background: 'var(--hn-surface)', border: '1px solid var(--hn-line)' }}>
            <div className="text-base font-extrabold mb-3.5">School</div>
            <FormField
              control={form.control}
              name="schoolName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>School name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="rounded-xl p-5" style={{ background: 'var(--hn-surface)', border: '1px solid var(--hn-line)' }}>
            <div className="text-base font-extrabold mb-3.5">Notifications</div>
            <FormField
              control={form.control}
              name="lateCutoffMinutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Late cutoff (minutes after class start)</FormLabel>
                  <FormControl>
                    <Input type="number" className="w-[100px]" {...field} />
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
                      className="w-full rounded-md border px-3 py-2 text-sm resize-none"
                      style={{ borderColor: 'var(--hn-line)', background: 'var(--hn-surface-2)' }}
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

          <div className="rounded-xl p-5" style={{ background: 'var(--hn-surface)', border: '1px solid var(--hn-line)' }}>
            <div className="flex items-center gap-2.5 mb-3.5">
              <div className="text-base font-extrabold flex-1">Telegram bot</div>
              <StatusChip
                status={query.data.telegramBotTokenSet ? 'linked' : 'unlinked'}
                label={query.data.telegramBotTokenSet ? 'Connected' : 'Not set'}
              />
            </div>
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
                        className="flex-1 font-mono"
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

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              Save settings
            </Button>
          </div>
        </form>
      </Form>
    </PageShell>
  )
}
