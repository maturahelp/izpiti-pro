import type { MetadataRoute } from 'next'

const BASE = 'https://www.maturahelp.com'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${BASE}/`, lastModified: new Date('2026-04-27'), changeFrequency: 'weekly', priority: 1.0 },
    { url: `${BASE}/nvo`, lastModified: new Date('2026-05-06'), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/dzi`, lastModified: new Date('2026-05-06'), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/privacy`, lastModified: new Date('2026-01-01'), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE}/terms`, lastModified: new Date('2026-01-01'), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE}/cookies`, lastModified: new Date('2026-01-01'), changeFrequency: 'yearly', priority: 0.3 },
  ]
}
