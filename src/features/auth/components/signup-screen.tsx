'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Building2, Mail, MailCheck, Sparkles, User } from 'lucide-react'
import { toast } from 'sonner'
import { Logo } from '@/components/shared/logo'
import { signup } from '../actions'
import { signupSchema, type SignupInput } from '../schemas'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { AuthHeading, PasswordField, SubmitButton, TextField } from './auth-form-controls'
import { AuthStepper } from './auth-stepper'

/** Fields collected on each step, in order — school details before the
 *  admin's own account, same shape as the sign-in/sign-up split elsewhere
 *  in this app's auth flow. */
const STEP_FIELDS = [['schoolName'], ['adminName', 'adminEmail', 'password', 'confirmPassword']] as const
const STEP_LABELS = ['School details', 'Your account'] as const

export function SignupScreen() {
  const [step, setStep] = useState<0 | 1>(0)
  const [sentTo, setSentTo] = useState<string | null>(null)

  const form = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: { schoolName: '', adminName: '', adminEmail: '', password: '', confirmPassword: '' },
  })

  const { isSubmitting } = form.formState

  const goNext = async () => {
    const valid = await form.trigger(STEP_FIELDS[0])
    if (valid) setStep(1)
  }

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
        {step === 0 ? (
          <AuthHeading title="Start your trial" subtitle="Let's start with your school" />
        ) : (
          <>
            <button
              type="button"
              onClick={() => setStep(0)}
              className="mb-4 flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground transition-opacity hover:opacity-70"
            >
              <ArrowLeft size={14} />
              Back
            </button>
            <AuthHeading title="Almost there" subtitle="Now, your account details" />
          </>
        )}

        <AuthStepper steps={STEP_LABELS} current={step} />

        {step === 0 && <TrialBadge />}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {step === 0 && (
              <>
                <TextField
                  control={form.control}
                  name="schoolName"
                  label="School or centre name"
                  placeholder="Rise Tutoring Center"
                  autoComplete="organization"
                  icon={Building2}
                />

                <button
                  type="button"
                  onClick={goNext}
                  className="mt-2 flex h-12 w-full items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground shadow-[var(--shadow-primary)] transition-all hover:opacity-90 active:scale-[0.99]"
                >
                  Continue
                </button>
              </>
            )}

            {step === 1 && (
              <>
                <TextField
                  control={form.control}
                  name="adminName"
                  label="Your name"
                  placeholder="Sochua Ly"
                  autoComplete="name"
                  icon={User}
                />

                <TextField
                  control={form.control}
                  name="adminEmail"
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
                  autoComplete="new-password"
                />

                <PasswordField
                  control={form.control}
                  name="confirmPassword"
                  label="Confirm password"
                  autoComplete="new-password"
                />

                <SubmitButton pending={isSubmitting}>Start free trial</SubmitButton>
              </>
            )}
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

/** States the trial terms explicitly — "free" alone on a signup screen reads
 *  as a claim worth double-checking; "no card required" is what actually
 *  removes the hesitation to start. Matches the copy in CONTEXT.md's Trial
 *  entry (attendance-api) and the confirmation screen below. */
function TrialBadge() {
  return (
    <div className="mb-6 flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2.5 text-[12.5px] font-medium text-primary">
      <Sparkles size={14} className="shrink-0" />
      <span>
        <span className="font-semibold">30-day free trial</span> · No card required
      </span>
    </div>
  )
}
