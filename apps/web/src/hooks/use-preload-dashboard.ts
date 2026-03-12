'use client'

/**
 * usePreloadDashboardData
 *
 * Fires all critical API calls in parallel as soon as the dashboard is
 * accessible (auth ready). This populates the Zustand stores BEFORE the user
 * navigates to any page, eliminating the ~4 s first-render delay.
 *
 * - Schedules, Locations and Professionals are written directly into their
 *   Zustand stores (which also sets `hasFetched = true`).
 * - Overview stats and notifications are seeded into the TanStack Query cache
 *   via `prefetchQuery`, so the overview page renders without a loading state.
 *
 * A ref guards against duplicate fetches within the same session.
 */

import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { getApiClient } from '@/lib/api'
import {
  mapApiLocationToManager,
  mapApiProfessionalToProfessional,
  mapApiScheduleToManager,
} from '@/lib/backend-mappers'
import { useAuthStore } from '@/store/auth.store'
import { useLocationsStore } from '@/store/locations.store'
import { useProfessionalsStore } from '@/store/professionals.store'
import { useSchedulesStore } from '@/store/schedules.store'

// How long the prefetched TanStack Query data stays "fresh" (won't refetch).
const STATS_STALE_MS = 5 * 60 * 1000 // 5 min
const NOTIFICATIONS_STALE_MS = 2 * 60 * 1000 // 2 min

export function usePreloadDashboardData() {
  const { isAuthenticated, accessToken } = useAuthStore()
  const setSchedules = useSchedulesStore((state) => state.setSchedules)
  const setLocations = useLocationsStore((state) => state.setLocations)
  const setProfessionals = useProfessionalsStore((state) => state.setProfessionals)
  const queryClient = useQueryClient()

  // Prevent duplicate preloads for the same access token in this session.
  const lastTokenRef = useRef<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated || !accessToken) return
    if (lastTokenRef.current === accessToken) return

    lastTokenRef.current = accessToken

    const api = getApiClient()

    void Promise.allSettled([
      // ── Schedules ───────────────────────────────────────────────────────
      api
        .get('schedules', { searchParams: { limit: 100 } })
        .json<{ data: unknown[] }>()
        .then((response) => {
          const mapped = response.data.map((item) =>
            mapApiScheduleToManager(item as Parameters<typeof mapApiScheduleToManager>[0]),
          )
          setSchedules(mapped)
        }),

      // ── Locations ───────────────────────────────────────────────────────
      api
        .get('locations')
        .json<Parameters<typeof mapApiLocationToManager>[0][]>()
        .then((response) => {
          setLocations(response.map((location) => mapApiLocationToManager(location)))
        }),

      // ── Professionals ────────────────────────────────────────────────────
      api
        .get('users', { searchParams: { role: 'PROFESSIONAL', limit: 100 } })
        .json<{ data: Parameters<typeof mapApiProfessionalToProfessional>[0][] }>()
        .then((response) => {
          setProfessionals(response.data.map((p) => mapApiProfessionalToProfessional(p)))
        }),

      // ── Overview stats (TanStack Query cache) ────────────────────────────
      queryClient.prefetchQuery({
        queryKey: ['overview-stats'],
        staleTime: STATS_STALE_MS,
        queryFn: async () => {
          const [tenantStats, occupancy] = await Promise.all([
            api.get('tenants/me/stats').json<Record<string, unknown>>(),
            api.get('reports/occupancy').json<Record<string, unknown>>(),
          ])
          return { ...tenantStats, ...occupancy }
        },
      }),

      // ── Recent notifications (TanStack Query cache) ──────────────────────
      queryClient.prefetchQuery({
        queryKey: ['overview-notifications'],
        staleTime: NOTIFICATIONS_STALE_MS,
        queryFn: () =>
          api
            .get('notifications', { searchParams: { limit: 8 } })
            .json<{ data: unknown[] }>()
            .then((r) => r.data),
      }),
    ])
  }, [isAuthenticated, accessToken, setSchedules, setLocations, setProfessionals, queryClient])
}
