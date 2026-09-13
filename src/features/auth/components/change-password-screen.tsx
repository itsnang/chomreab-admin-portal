'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { changePassword } from '../actions'
import { changePasswordSchema, type ChangePasswordInput } from '../types'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface ChangePasswordScreenProps {
  /** Set when the account still carries an admin-generated temporary password:
   *  the copy explains why, and there is no way back into the app. */
  forced: boolean
}

const FIELDS = [
  { name: 'currentPassword', label: 'Current password', autoComplete: 'current-password' },
  { name: 'newPassword', label: 'New password', autoComplete: 'new-password' },
  { name: 'confirmPassword', label: 'Repeat new password', autoComplete: 'new-password' },
] as const

export function ChangePasswordScreen({ forced }: ChangePasswordScreenProps) {
  const [shown, setShown] = useState<Record<string, boolean>>({})

  const form = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  })

  const { isSubmitting } = form.formState

  const onSubmit = async (values: ChangePasswordInput) => {
    const result = await changePassword(values)
    // On success the action redirects and never returns.
    if (result.error) toast.error(result.error)
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-4 py-10">
      <div className="mb-8 flex items-center gap-2.5">
        <div
          className="grid size-8 flex-none place-items-center rounded-lg bg-primary text-base font-extrabold text-primary-foreground"
          aria-hidden="true"
        >
          C
        </div>
        <span className="text-[17px] font-bold">Chomreab</span>
      </div>

      <div className="w-full max-w-sm rounded-xl border bg-card px-7 py-8 shadow-card">
        <h1 className="text-2xl font-extrabold tracking-tight">
          {forced ? 'Choose a password' : 'Change password'}
        </h1>
        <p className="mt-1 mb-7 text-[13px] text-muted-foreground">
          {forced
            ? 'Your account still uses the temporary password your admin gave you. Pick your own before you carry on.'
            : "You'll be signed out and can sign back in with the new password."}
        </p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {FIELDS.map((f) => (
              <FormField
                key={f.name}
                control={form.control}
                name={f.name}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold tracking-[0.06em] text-muted-foreground uppercase">
                      {f.label}
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={shown[f.name] ? 'text' : 'password'}
                          placeholder="••••••••"
                          autoComplete={f.autoComplete}
                          className="h-11 pr-10"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShown((s) => ({ ...s, [f.name]: !s[f.name] }))}
                          aria-label={shown[f.name] ? `Hide ${f.label}` : `Show ${f.label}`}
                          className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-opacity hover:opacity-70"
                        >
                          {shown[f.name] ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            ))}

            <Button type="submit" size="lg" disabled={isSubmitting} className="mt-2 h-12 w-full">
              {isSubmitting && <Loader2 className="animate-spin" />}
              Change password
            </Button>
          </form>
        </Form>
      </div>

      {forced ? (
        <p className="mt-6 max-w-sm text-center text-[13px] text-muted-foreground">
          Signing out won&apos;t skip this — the temporary password stays until you replace it.
        </p>
      ) : (
        <Button asChild variant="link" size="sm" className="mt-4">
          <Link href="/dashboard">Back to the app</Link>
        </Button>
      )}
    </div>
  )
}
