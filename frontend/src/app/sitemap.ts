import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://www.don-good.xyz',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://www.don-good.xyz/login',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: 'https://www.don-good.xyz/dashboard',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ]
} 