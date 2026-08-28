'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { login } from '../actions'
import { loginSchema, type LoginInput } from '../types'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

export function LoginScreen() {
  const [showPassword, setShowPassword] = useState(false)

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
    <div className="h-svh flex flex-col items-center justify-center px-4">
      {/* Brand mark */}
      <div className="flex items-center gap-2 mb-8">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: 'var(--hn-clay)' }}
          aria-hidden="true"
        >
          <span
            className="text-white text-sm leading-none"
            style={{ fontWeight: 400 }}
          >
            H
          </span>
        </div>
        <span
          className="text-[17px]"
          style={{ color: 'var(--hn-ink)' }}
        >
          Attendance
        </span>
      </div>

      {/* Card */}
      <div
        className="w-full max-w-sm rounded-[24px] px-7 py-8"
        style={{
          background: 'var(--hn-surface-2)',
          boxShadow: 'var(--hn-elev)',
        }}
      >
        <h1
          className="text-[28px] leading-tight mb-1"
          style={{ color: 'var(--hn-ink)' }}
        >
          Welcome back
        </h1>
        <p
          className="text-[13px] mb-7"
          style={{ color: 'var(--hn-sub)' }}
        >
          Sign in with your admin or teacher account
        </p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel
                    className="text-[12px] font-semibold tracking-[0.06em] uppercase"
                    style={{ color: 'var(--hn-sub)' }}
                  >
                    Email
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      autoComplete="email"
                      className="h-11 rounded-[10px] text-sm"
                      style={{
                        borderColor: 'var(--hn-line)',
                        color: 'var(--hn-ink)',
                      }}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {/* Password */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel
                    className="text-[12px] font-semibold tracking-[0.06em] uppercase"
                    style={{ color: 'var(--hn-sub)' }}
                  >
                    Password
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        autoComplete="current-password"
                        className="h-11 rounded-[10px] text-sm pr-10"
                        style={{
                          borderColor: 'var(--hn-line)',
                          color: 'var(--hn-ink)',
                        }}
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-70"
                        style={{ color: 'var(--hn-sub)' }}
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 rounded-[14px] text-sm font-semibold tracking-[0.04em] transition-opacity hover:opacity-90 disabled:opacity-60 mt-2 flex items-center justify-center gap-2"
              style={{ background: 'var(--hn-ink)', color: 'var(--hn-paper)' }}
            >
              {isSubmitting && <Loader2 size={15} className="animate-spin" />}
              Sign in
            </button>
          </form>
        </Form>
      </div>

      {/* No self-service sign up — admin creates teacher accounts. */}
      <p
        className="text-[13px] mt-6"
        style={{ color: 'var(--hn-sub)' }}
      >
        Accounts are created by your school admin.
      </p>
    </div>
  )
}
