'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { login } from '../actions'
import { loginSchema, type LoginInput } from '../types'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function LoginScreen() {
  const [showPassword, setShowPassword] = useState(false)
  // changePassword revokes the session and sends the user back here, so say so
  // rather than leaving them wondering why they were signed out.
  const justChangedPassword = useSearchParams().get('changed') === '1'

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
        <div
          className="grid size-8 flex-none place-items-center rounded-lg bg-primary text-base font-extrabold text-primary-foreground"
          aria-hidden="true"
        >
          R
        </div>
        <span className="text-[17px] font-bold">Rollcall</span>
      </div>

      <div className="w-full max-w-sm rounded-xl border bg-card px-7 py-8 shadow-card">
        <h1 className="text-2xl font-extrabold tracking-tight">Welcome back</h1>
        <p className="mt-1 mb-7 text-[13px] text-muted-foreground">
          {justChangedPassword
            ? 'Password changed. Sign in with your new one.'
            : 'Sign in with your admin or teacher account'}
        </p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold tracking-[0.06em] text-muted-foreground uppercase">
                    Email
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      autoComplete="email"
                      className="h-11"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold tracking-[0.06em] text-muted-foreground uppercase">
                    Password
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        autoComplete="current-password"
                        className="h-11 pr-10"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-opacity hover:opacity-70"
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <Button type="submit" size="lg" disabled={isSubmitting} className="mt-2 h-12 w-full">
              {isSubmitting && <Loader2 className="animate-spin" />}
              Sign in
            </Button>
          </form>
        </Form>
      </div>

      {/* No self-service sign up — admins create teacher accounts. */}
      <p className="mt-6 text-[13px] text-muted-foreground">
        Accounts are created by your school admin.
      </p>
    </div>
  )
}
