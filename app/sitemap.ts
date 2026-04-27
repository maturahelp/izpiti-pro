import type { MetadataRoute } from 'next'

const BASE = 'https://www.maturahelp.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  return [
    { url: `${BASE}/`, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${BASE}/login`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/register`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/english-preview`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/english-mock`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/english-generated`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${BASE}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE}/cookies`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ]
}
