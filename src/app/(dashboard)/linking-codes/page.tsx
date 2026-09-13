import type { Metadata } from 'next'
import { LinkingCodesScreen } from '@/features/students/components/linking-codes-screen'

export const metadata: Metadata = { title: 'Linking codes — Chomreab' }

export default function LinkingCodesPage() {
  return <LinkingCodesScreen />
}
