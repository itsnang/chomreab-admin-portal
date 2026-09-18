import { Suspense } from 'react'
import type { Metadata } from 'next'
import { VerifyEmailScreen } from '@/features/auth/components/verify-email-screen'

export const metadata: Metadata = {
  title: 'Verify your email — Chomreab',
  description: 'Confirm your email to activate your Chomreab account.',
}

export default function VerifyEmailPage() {
  // VerifyEmailScreen reads the `token` search param, which opts a component
  // out of prerendering unless it sits behind a boundary.
  return (
    <Suspense fallback={null}>
      <VerifyEmailScreen />
    </Suspense>
  )
}
