'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,    // 5 min — data stays fresh, no redundant refetches
            gcTime: 15 * 60 * 1000,      // 15 min — keep cache alive between navigations
            retry: 1,
            refetchOnWindowFocus: false, // preloader handles freshness; tab-focus refetch hurts UX
          },
        },
      }),
  )
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}
