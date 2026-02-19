import type { MetadataRoute } from 'next'
import { getSiteUrl } from '@/lib/site'

const baseUrl = getSiteUrl()

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/overview',
          '/schedules',
          '/professionals',
          '/locations',
          '/reports',
          '/finances',
          '/settings',
          '/subscription',
          '/login',
          '/register',
          '/forgot-password',
          '/api/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}
