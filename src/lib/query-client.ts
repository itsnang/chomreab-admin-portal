import { QueryClient } from '@tanstack/react-query'

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute — prevents refetch on RSC hydration
        // Read actions throw across the server-action boundary, where the
        // original ApiError is flattened into a plain Error — the status code
        // isn't available here to tell a retryable 5xx from a settled 4xx. One
        // retry covers a dropped connection without leaving a screen spinning
        // for seconds on a permission error that will never succeed.
        retry: 1,
      },
    },
  })
}
