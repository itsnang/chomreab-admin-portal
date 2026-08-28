import type { Metadata } from 'next'
import { LoginScreen } from '@/features/auth/components/login-screen'

export const metadata: Metadata = {
  title: 'Sign in — Attendance',
  description: 'Sign in to your Attendance admin/teacher account.',
}

export default function LoginPage() {
  return <LoginScreen />
}
