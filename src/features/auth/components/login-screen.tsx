'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail } from 'lucide-react'
import { toast } from 'sonner'
import { Logo } from '@/components/shared/logo'
import { login } from '../actions'
import { loginSchema, type LoginInput } from '../schemas'
import { Form } from '@/components/ui/form'
import { AuthHeading, PasswordField, SubmitButton, TextField } from './auth-form-controls'

export function LoginScreen() {
  // changePassword revokes the session and sends the user back here, so say so
  // rather than leaving them wondering why they were signed out.
  const searchParams = useSearchParams()
  const justChangedPassword = searchParams.get('changed') === '1'
  const justVerified = searchParams.get('verified') === '1'

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const { isSubmitting } = form.formState

  const onSubmit = async (values: LoginInput) => {
    const result = await login(values)
    if (result.error) {
      toast.error(result.error)
    }
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-4 py-10">
      <div className="mb-8 flex items-center gap-2.5">
        <Logo className="size-8 flex-none text-primary" />
        <span className="text-[17px] font-bold">Chomreab</span>
      </div>

      <div className="w-full max-w-sm rounded-xl border bg-card px-7 py-8 shadow-card">
        <AuthHeading
          title="Welcome back"
          subtitle={
            justChangedPassword
              ? 'Password changed. Sign in with your new one.'
              : justVerified
                ? 'Email confirmed. Sign in to get started.'
                : 'Sign in with your admin or teacher account'
          }
        />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <TextField
              control={form.control}
              name="email"
              label="Email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              icon={Mail}
            />

            <PasswordField
              control={form.control}
              name="password"
              label="Password"
              autoComplete="current-password"
            />

            <SubmitButton pending={isSubmitting}>Sign in</SubmitButton>
          </form>
        </Form>
      </div>

      <p className="mt-6 text-[13px] text-muted-foreground">
        New school or centre?{' '}
        <Link href="/signup" className="font-medium text-foreground hover:underline">
          Start a free trial
        </Link>
      </p>
    </div>
  )
}
