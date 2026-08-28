'use client'

import { useState } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ThemeProvider } from 'next-themes'
import { NavigationProgress } from '@/components/shared/navigation-progress'
import { Toaster } from '@/components/ui/sonner'
import { makeQueryClient } from '@/lib/query-client'

export function Providers({ children }: { children: React.ReactNode }) {
  // useState so each request gets its own QueryClient on the server,
  // but the client reuses the same instance across navigations.
  const [queryClient] = useState(() => makeQueryClient())

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <QueryClientProvider client={queryClient}>
        {children}
        {process.env.NODE_ENV !== 'production' && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
        <NavigationProgress />
        <Toaster />
      </QueryClientProvider>
    </ThemeProvider>
  )
}
