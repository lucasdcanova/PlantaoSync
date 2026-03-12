'use client'

import { usePreloadDashboardData } from '@/hooks/use-preload-dashboard'

/**
 * Thin wrapper that kicks off the parallel dashboard preload.
 * Renders nothing — placed once inside the dashboard layout so all
 * critical API calls start immediately when the user is authenticated,
 * not only when they navigate to a specific page.
 */
export function DashboardPreloader() {
  usePreloadDashboardData()
  return null
}
