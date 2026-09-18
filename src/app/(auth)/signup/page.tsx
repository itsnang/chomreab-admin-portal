import type { Metadata } from 'next'
import { SignupScreen } from '@/features/auth/components/signup-screen'

export const metadata: Metadata = {
  title: 'Start your trial — Chomreab',
  description: 'Create your school or tutoring centre account.',
}

export default function SignupPage() {
  return <SignupScreen />
}
