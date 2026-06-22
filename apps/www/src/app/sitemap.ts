import type { MetadataRoute } from 'next'
import { ROUTES } from '@/lib/site-config'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()
  return Object.values(ROUTES).map((route) => ({
    url: `${baseUrl}${route.href}`,
    lastModified,
  }))
}
