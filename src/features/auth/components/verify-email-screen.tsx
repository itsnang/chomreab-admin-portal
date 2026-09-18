'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { CircleAlert, Loader2 } from 'lucide-react'
import { Logo } from '@/components/shared/logo'
import { verifyEmail } from '../actions'
import { Button } from '@/components/ui/button'

type Status = 'verifying' | 'error'

const MISSING_TOKEN_ERROR = 'This verification link is missing its token.'

export function VerifyEmailScreen() {
  const router = useRouter()
  const token = useSearchParams().get('token')
  const [status, setStatus] = useState<Status>(token ? 'verifying' : 'error')
  const [error, setError] = useState<string | null>(token ? null : MISSING_TOKEN_ERROR)

  useEffect(() => {
    if (!token) return
    void verifyEmail(token).then((result) => {
      if (result.error) {
        setStatus('error')
        setError(result.error)
        return
      }
      router.replace('/login?verified=1')
    })
    // Runs once for the token this page loaded with.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-4 py-10">
      <div className="mb-8 flex items-center gap-2.5">
        <Logo className="size-8 flex-none text-primary" />
        <span className="text-[17px] font-bold">Chomreab</span>
      </div>

      <div className="w-full max-w-sm rounded-xl border bg-card px-7 py-8 text-center shadow-card">
        {status === 'verifying' ? (
          <>
            <Loader2 className="mx-auto size-9 animate-spin text-primary" />
            <h1 className="mt-4 text-xl font-extrabold tracking-tight">Confirming your email…</h1>
          </>
        ) : (
          <>
            <CircleAlert className="mx-auto size-9 text-destructive" />
            <h1 className="mt-4 text-xl font-extrabold tracking-tight">Couldn&apos;t verify your email</h1>
            <p className="mt-2 text-[13px] text-muted-foreground">{error}</p>
            <Button asChild size="lg" className="mt-6 h-11 w-full">
              <Link href="/signup">Back to sign up</Link>
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
