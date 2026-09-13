import { Suspense } from 'react'
import type { Metadata } from 'next'
import { LoginScreen } from '@/features/auth/components/login-screen'

export const metadata: Metadata = {
  title: 'Sign in — Chomreab',
  description: 'Sign in to your Attendance admin/teacher account.',
}

export default function LoginPage() {
  // LoginScreen reads the `changed` search param, which opts a component out of
  // prerendering unless it sits behind a boundary. The fallback is null because
  // the form is the whole page — a skeleton would only flash.
  return (
    <Suspense fallback={null}>
      <LoginScreen />
    </Suspense>
  )
}
