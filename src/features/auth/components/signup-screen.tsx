'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Loader2, MailCheck } from 'lucide-react'
import { toast } from 'sonner'
import { Logo } from '@/components/shared/logo'
import { signup } from '../actions'
import { signupSchema, type SignupInput } from '../schemas'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function SignupScreen() {
  const [showPassword, setShowPassword] = useState(false)
  const [sentTo, setSentTo] = useState<string | null>(null)

  const form = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: { schoolName: '', adminName: '', adminEmail: '', password: '', confirmPassword: '' },
  })

  const { isSubmitting } = form.formState

  const onSubmit = async (values: SignupInput) => {
    const result = await signup(values)
    if (result.error) {
      toast.error(result.error)
      return
    }
    setSentTo(result.email ?? values.adminEmail)
  }

  if (sentTo) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm rounded-xl border bg-card px-7 py-8 text-center shadow-card">
          <MailCheck className="mx-auto size-9 text-primary" />
          <h1 className="mt-4 text-xl font-extrabold tracking-tight">Check your email</h1>
          <p className="mt-2 text-[13px] text-muted-foreground">
            We sent a confirmation link to <span className="font-medium text-foreground">{sentTo}</span>. Your
            30-day trial has started — confirm your email to sign in.
          </p>
          <Button asChild size="lg" className="mt-6 h-11 w-full">
            <Link href="/login">Back to sign in</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-4 py-10">
      <div className="mb-8 flex items-center gap-2.5">
        <Logo className="size-8 flex-none text-primary" />
        <span className="text-[17px] font-bold">Chomreab</span>
      </div>

      <div className="w-full max-w-sm rounded-xl border bg-card px-7 py-8 shadow-card">
        <h1 className="text-2xl font-extrabold tracking-tight">Start your trial</h1>
        <p className="mt-1 mb-7 text-[13px] text-muted-foreground">
          30 days free, no card required. Create your school&apos;s account below.
        </p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <FormField
              control={form.control}
              name="schoolName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold tracking-[0.06em] text-muted-foreground uppercase">
                    School or centre name
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Rise Tutoring Center" autoComplete="organization" className="h-11" {...field} />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="adminName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold tracking-[0.06em] text-muted-foreground uppercase">
                    Your name
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Sochua Ly" autoComplete="name" className="h-11" {...field} />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="adminEmail"
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
                        autoComplete="new-password"
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

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold tracking-[0.06em] text-muted-foreground uppercase">
                    Confirm password
                  </FormLabel>
                  <FormControl>
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      className="h-11"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <Button type="submit" size="lg" disabled={isSubmitting} className="mt-2 h-12 w-full">
              {isSubmitting && <Loader2 className="animate-spin" />}
              Start free trial
            </Button>
          </form>
        </Form>
      </div>

      <p className="mt-6 text-[13px] text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-foreground hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
